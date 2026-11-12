// src/components/SubscriptionGrid.tsx
import { Search, Filter, SlidersHorizontal, CheckCircle2 } from "lucide-react";
import { Subscription } from "../types";

export default function SubscriptionGrid({ subscriptions }: { subscriptions: Subscription[] }) {
  const getIconColor = (name: string) => {
    if (name.includes("Adobe")) return "bg-gradient-to-br from-red-500 to-orange-400";
    if (name.includes("Gold's")) return "bg-yellow-400 text-black";
    if (name.includes("Netflix")) return "bg-black text-red-600";
    return "bg-slate-200 text-slate-700";
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Active Subscriptions</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search" 
              className="pl-9 pr-4 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#003087] w-32 md:w-48 transition-all"
            />
          </div>
          <button className="p-1.5 border border-slate-300 rounded-lg text-slate-500 hover:bg-slate-50"><Filter className="w-4 h-4" /></button>
          <button className="p-1.5 border border-slate-300 rounded-lg text-slate-500 hover:bg-slate-50"><SlidersHorizontal className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Subscription List */}
      <div className="p-5 overflow-y-auto flex-1 space-y-3">
        <div className="grid grid-cols-12 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">
          <div className="col-span-6">Merchant</div>
          <div className="col-span-3 text-right">Cost ($)</div>
          <div className="col-span-3 text-right">Status</div>
        </div>
        
        {subscriptions.map((sub) => (
          <div key={sub.id} className="grid grid-cols-12 items-center p-3 rounded-xl border border-slate-200 hover:border-[#003087] hover:shadow-sm transition-all bg-white group">
            {/* Merchant Info */}
            <div className="col-span-6 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm ${getIconColor(sub.merchant)}`}>
                {sub.merchant.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-slate-800 group-hover:text-[#003087] transition-colors">{sub.merchant}</p>
                <p className="text-xs text-slate-500">{sub.billing}</p>
              </div>
            </div>

            {/* Cost */}
            <div className="col-span-3 text-right font-semibold text-slate-700">
              ${sub.cost.toFixed(2)}
            </div>

            {/* Status */}
            <div className="col-span-3 flex items-center justify-end gap-2">
              {sub.merchant === "Health Insurance" && (
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-md">Critical</span>
              )}
              {sub.status === "Active" ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-full">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold rounded-full">
                  {sub.status}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}