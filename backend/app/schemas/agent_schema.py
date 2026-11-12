from pydantic import BaseModel, Field
from typing import Literal, Optional, List

class AgentAction(BaseModel):
    action: Literal["CANCEL", "SUSPEND", "REVISE", "NO_ACTION", "require_hitl"] = Field(
        description="The specific PayPal action to take."
    )
    subscription_id: Optional[str] = Field(
        default=None, 
        description="The PayPal subscription ID (e.g., I-BW452GLLEP1G)."
    )
    target_plan_id: Optional[str] = Field(
        default=None, 
        description="If revising/downgrading, the new PayPal Plan ID to switch to."
    )
    reasoning: str = Field(
        description="A plain English explanation of why the AI chose this action to show to the user."
    )
    confidence_score: float = Field(
        description="A score between 0.0 and 1.0 indicating how confident the AI is.",
        ge=0.0, le=1.0
    )
    
    # --- PROACTIVE ADVISORY FIELDS ---
    benefits: List[str] = Field(
        default_factory=list,
        description="1 to 2 bullet points on the benefits of cancelling right now (e.g., 'Stop future recurring charges', 'Immediate refund')."
    )
    disadvantages: List[str] = Field(
        default_factory=list,
        description="1 to 2 bullet points on the disadvantages (e.g., 'Incur a 50% early termination fee', 'Lose access immediately')."
    )
    alternative_recommendation: str = Field(
        default="",
        description="A smarter alternative based on the policy, such as 'Wait until the billing cycle ends on day 30 to avoid fees'."
    )
    # Add this to the bottom of your AgentAction class:
    recommended_cancellations: List[dict] = Field(
        default_factory=list,
        description="If providing general advice, list the specific subscriptions to cancel here. Format: [{'subscription_id': '...', 'merchant': '...'}]"
    )