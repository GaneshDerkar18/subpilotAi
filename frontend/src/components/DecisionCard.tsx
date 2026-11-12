import { CheckCircle, ShieldAlert, Loader2, ArrowRight, AlertTriangle, XCircle, Info, Trash2 } from "lucide-react";
import { Message } from "../types";

interface DecisionCardProps {
  msg: Message;
  index: number;
  onExecute: (index: number, action: string, subId: string) => void;
  onIgnore: (index: number) => void;
}

export default function DecisionCard({ msg, index, onExecute, onIgnore }: DecisionCardProps) {
  if (!msg.decisionData) return null;

  if (msg.isIgnored) {
    return (
      <div className="mt-4 p-4 text-sm text-slate-500 bg-slate-100 rounded-lg border border-slate-200">
        You chose to ignore the proposal for {msg.decisionData.ai_proposed_action.action}.
      </div>
    );
  }

  const { ai_proposed_action, guardrail_status } = msg.decisionData;
  const { 
    action, 
    reasoning, 
    subscription_id, 
    benefits, 
    disadvantages, 
    alternative_recommendation, 
    recommended_cancellations 
  } = ai_proposed_action;

  const hasBenefits = (benefits ?? []).length > 0;
  const hasDisadvantages = (disadvantages ?? []).length > 0;

  return (
    <div className="mt-4 bg-white border-2 border-[#FFC439] shadow-sm rounded-xl p-5 text-slate-800 w-full min-w-[320px]">
      <div className="flex items-center space-x-2 mb-3">
        <AlertTriangle className="text-[#FFC439] w-6 h-6" />
        <h3 className="font-extrabold text-lg text-slate-800">
          {action === "NO_ACTION" ? "Financial Advice" : `Action Required: ${action}`} {action === "REVISE" && "(Downgrade)"}
        </h3>
      </div>
      
      <div className="mb-5">
        <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">AI Analysis</span>
        <p className="text-sm leading-relaxed mt-1 text-slate-700">
          {reasoning}
        </p>
      </div>

      {(hasBenefits || hasDisadvantages) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
            <h4 className="font-bold text-emerald-700 text-xs uppercase flex items-center mb-2">
              <CheckCircle className="w-3 h-3 mr-1" /> Benefits
            </h4>
            <ul className="text-xs text-emerald-800 space-y-1 list-disc pl-4">
              {benefits?.map((benefit, i) => <li key={i}>{benefit}</li>)}
            </ul>
          </div>
          
          <div className="bg-rose-50 p-3 rounded-lg border border-rose-100">
            <h4 className="font-bold text-rose-700 text-xs uppercase flex items-center mb-2">
              <XCircle className="w-3 h-3 mr-1" /> Disadvantages
            </h4>
            <ul className="text-xs text-rose-800 space-y-1 list-disc pl-4">
              {disadvantages?.map((disadvantage, i) => <li key={i}>{disadvantage}</li>)}
            </ul>
          </div>
        </div>
      )}

      {alternative_recommendation && (
        <div className="bg-[#003087]/5 p-3 rounded-lg border border-[#003087]/10 mb-5">
          <h4 className="font-bold text-[#003087] text-xs uppercase flex items-center mb-1">
            <Info className="w-3 h-3 mr-1" /> AI Recommendation
          </h4>
          <p className="text-xs text-slate-700">{alternative_recommendation}</p>
        </div>
      )}

      {/* --- ACTIONS BLOCK --- */}
      {action === "NO_ACTION" ? (
        (recommended_cancellations && recommended_cancellations.length > 0) && (
          <div className="mt-5 pt-4 border-t border-slate-100">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">1-Click Actions</span>
            <div className="mt-3 flex flex-col gap-2">
              {recommended_cancellations.map((rec: any, idx: number) => {
                const isExecuted = msg.executedSubs?.includes(rec.subscription_id);
                const isExecuting = msg.executingSub === rec.subscription_id;

                if (isExecuted) {
                  return (
                    <div key={idx} className="w-full py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-bold rounded-lg flex justify-center items-center gap-2">
                      <CheckCircle className="w-4 h-4" /> Cancelled {rec.merchant}
                    </div>
                  );
                }

                return (
                  <button
                    key={idx}
                    onClick={() => onExecute(index, "CANCEL", rec.subscription_id)}
                    disabled={!!msg.executingSub}
                    className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-sm font-bold rounded-lg flex justify-between items-center px-4 transition-colors disabled:opacity-50"
                  >
                    <span className="flex items-center gap-2"><Trash2 className="w-4 h-4"/> Cancel {rec.merchant}</span>
                    {isExecuting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>
          </div>
        )
      ) : guardrail_status.status === "REQUIRES_APPROVAL" ? (
        
        // Target single specific subscription
        msg.executedSubs?.includes(subscription_id) ? (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-center gap-2 text-emerald-700 font-bold text-sm">
            <CheckCircle className="w-5 h-5" /> Execution Successful
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => onExecute(index, action, subscription_id)}
              disabled={!!msg.executingSub}
              className="flex-1 py-2.5 bg-[#FFC439] hover:bg-[#f2b934] active:bg-[#e6b031] text-slate-900 text-sm font-bold rounded-lg flex justify-center items-center gap-2 disabled:opacity-50 transition-all shadow-sm"
            >
              {msg.executingSub === subscription_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Authorize Execution <ArrowRight className="w-4 h-4" /></>}
            </button>
            
            <button 
              onClick={() => onIgnore(index)}
              disabled={!!msg.executingSub}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg transition-colors"
            >
              Ignore Proposal
            </button>
          </div>
        )
      ) : guardrail_status.status === "REJECTED" ? (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700 font-medium flex items-start gap-2">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
          {guardrail_status.reason}
        </div>
      ) : null}
    </div>
  );
}