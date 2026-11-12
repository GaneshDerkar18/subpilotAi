"use client";

import { useState } from "react";
import { ShieldCheck, User } from "lucide-react";
import { Subscription, Message } from "../types";
import SubscriptionGrid from "../components/SubscriptionGrid";
import ChatInterface from "../components/ChatInterface";

const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  { id: "I-1234567890", merchant: "Adobe Creative Cloud", cost: 45.00, billing: "Monthly", status: "Active" },
  { id: "I-0987654321", merchant: "Gold's Gym", cost: 60.00, billing: "Monthly", status: "Active" },
  { id: "I-4567890123", merchant: "Netflix Premium", cost: 22.99, billing: "Monthly", status: "Active" },
  { id: "I-CRITICAL01", merchant: "Health Insurance", cost: 250.00, billing: "Monthly", status: "Active" },
];

export default function Dashboard() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(INITIAL_SUBSCRIPTIONS);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "I am SubPilot, your autonomous financial agent. Which subscription would you like to manage?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (userText: string) => {
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setIsLoading(true);

    const targetSub = subscriptions.find((sub) =>
      userText.toLowerCase().includes(sub.merchant.split(" ")[0].toLowerCase())
    );

    try {
      const res = await fetch("http://localhost:8000/api/v1/agent/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_prompt: userText,
          merchant_name: targetSub?.merchant || "",
          monthly_cost: targetSub?.cost || 0.0,
          subscription_id: targetSub?.id || "",
          active_subscriptions: subscriptions
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setMessages((prev) => [...prev, { role: "assistant", content: "Here is my analysis:", decisionData: data }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "assistant", content: `System Error: ${error}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecute = async (msgIndex: number, action: string, subId: string) => {
    // 1. Mark the specific subscription as executing
    setMessages((prev) => {
      const newMsgs = [...prev];
      newMsgs[msgIndex].executingSub = subId;
      return newMsgs;
    });

    try {
      const targetMessage = messages[msgIndex];
      const aiReasoning = targetMessage.decisionData?.ai_proposed_action?.reasoning || "Authorized via UI";

      const res = await fetch("http://localhost:8000/api/v1/agent/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          subscription_id: subId,
          action: action,
          reason: aiReasoning 
        }),
      });
      const data = await res.json();

      if (!data.success) throw new Error(data.error);

      setSubscriptions((prev) =>
        prev.map((sub) => (sub.id === subId ? { ...sub, status: action === "CANCEL" ? "Cancelled" : "Downgraded" } : sub))
      );

      // 2. Clear executing state and save this ID to the completed array
      setMessages((prev) => {
        const newMsgs = [...prev];
        newMsgs[msgIndex].executingSub = null;
        newMsgs[msgIndex].executedSubs = [...(newMsgs[msgIndex].executedSubs || []), subId];
        return newMsgs;
      });
    } catch (error) {
      alert(`PayPal Execution Failed: ${error}`);
      setMessages((prev) => {
        const newMsgs = [...prev];
        newMsgs[msgIndex].executingSub = null;
        return newMsgs;
      });
    }
  };

  const handleIgnore = (msgIndex: number) => {
    setMessages((prev) => {
      const newMsgs = [...prev];
      newMsgs[msgIndex].isIgnored = true;
      return newMsgs;
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 overflow-hidden">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm shrink-0">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-[#003087]" strokeWidth={2.5} />
            <h1 className="text-xl font-extrabold text-[#003087] tracking-tight">
              SubPilot <span className="font-light text-slate-700">AI</span>
            </h1>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-semibold text-slate-500 mt-1">
            <a href="#" className="text-[#003087] border-b-2 border-[#003087] pb-1">Dashboard</a>
            <a href="#" className="hover:text-slate-800 pb-1">Assistant</a>
            <a href="#" className="hover:text-slate-800 pb-1">History</a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-flex items-center px-4 py-1.5 bg-[#003087] text-white text-xs font-bold rounded-full">
            Secure Verification
          </span>
          <div className="flex items-center gap-3 font-semibold text-sm">
            John Doe
            <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
              <User className="w-5 h-5 text-slate-500" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-6 h-[calc(100vh-80px)]">
        <div className="lg:col-span-1 xl:col-span-3 h-full min-h-0 flex flex-col">
          <SubscriptionGrid subscriptions={subscriptions} />
        </div>
        <div className="lg:col-span-1 xl:col-span-2 h-full min-h-0 flex flex-col">
          <ChatInterface
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            onExecute={handleExecute}
            onIgnore={handleIgnore}
          />
        </div>
      </main>
    </div>
  );
}