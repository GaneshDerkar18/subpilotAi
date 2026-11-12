import { useState, useRef, useEffect } from "react";
import { Send, Bot } from "lucide-react";
import { Message } from "../types";
import DecisionCard from "./DecisionCard";

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  onExecute: (index: number, action: string, subId: string) => void;
  onIgnore: (index: number) => void;
}

export default function ChatInterface({ messages, isLoading, onSendMessage, onExecute, onIgnore }: ChatInterfaceProps) {
  const [chatInput, setChatInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!chatInput.trim()) return;
    onSendMessage(chatInput);
    setChatInput("");
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
      {/* Header - LOCKED */}
      <div className="p-4 border-b border-slate-100 bg-white flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
          <Bot className="w-5 h-5 text-slate-700" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Agentic Copilot</h2>
      </div>

      {/* Messages - SCROLLABLE */}
      <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-6 bg-slate-50/50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-3`}>
            {msg.role === "assistant" && (
              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-5 h-5 text-slate-600" />
              </div>
            )}
            <div 
              className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === "user" 
                  ? "bg-[#003087] text-white rounded-tr-sm" 
                  : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm"
              }`}
            >
              <p>{msg.content}</p>
              <DecisionCard msg={msg} index={i} onExecute={onExecute} onIgnore={onIgnore} />
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start gap-3">
            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-slate-600" />
            </div>
            <div className="bg-white border border-slate-200 px-4 py-4 rounded-2xl rounded-tl-sm shadow-sm flex gap-2 items-center">
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Box - LOCKED */}
      <div className="p-4 bg-white border-t border-slate-100 shrink-0">
        <div className="flex gap-2 items-center relative">
          <input
            type="text"
            className="flex-grow pl-5 pr-12 py-3.5 bg-slate-50 border border-slate-300 rounded-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087] transition-all"
            placeholder="Type 'Cancel Adobe'..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !chatInput.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-[#003087] hover:bg-blue-800 active:bg-blue-900 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}