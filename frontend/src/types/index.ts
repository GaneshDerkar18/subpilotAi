export type Subscription = {
  id: string;
  merchant: string;
  cost: number;
  billing: string;
  status: string;
};

export type AIDecision = {
  success: boolean;
  ai_proposed_action: {
    action: string;
    subscription_id: string;
    reasoning: string;
    benefits?: string[];
    disadvantages?: string[];
    alternative_recommendation?: string;
    recommended_cancellations?: {
      subscription_id: string;
      merchant: string;
    }[];
  };
  guardrail_status: {
    status: "REQUIRES_APPROVAL" | "REJECTED" | "APPROVED";
    reason: string;
  };
};

export type Message = {
  role: "user" | "assistant";
  content: string;
  decisionData?: AIDecision;
  isIgnored?: boolean;
  // --- UPDATED TRACKING FIELDS ---
  executedSubs?: string[];       // Tracks all completed IDs
  executingSub?: string | null;  // Tracks the one currently loading
};