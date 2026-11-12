from typing import Literal, Optional, List, Dict, Any
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.services.paypal_service import PayPalService
from app.schemas.agent_schema import AgentAction
from app.services.agent_service import AgentService
from app.services.guardrail_service import GuardrailService
import asyncio

# Initialize the FastAPI app exactly once
app = FastAPI(title="SubPilot AI Backend", version="1.0.0")

# --- Enable CORS for Next.js ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows your Next.js frontend to connect safely
    allow_credentials=True,
    allow_methods=["*"],  # Allows POST, GET, OPTIONS, etc.
    allow_headers=["*"],
)

# --- Request Models ---
class ExecuteRequest(BaseModel):
    subscription_id: str
    action: Literal["CANCEL", "SUSPEND", "REVISE"]
    reason: str = "Authorized by user via SubPilot UI"

class AnalyzeRequest(BaseModel):
    user_prompt: str
    merchant_name: Optional[str] = ""
    monthly_cost: Optional[float] = 0.0
    subscription_id: Optional[str] = ""
    contract_policy: Optional[str] = ""
    active_subscriptions: Optional[List[Dict[str, Any]]] = []

# --- Dependencies ---
def get_paypal_service():
    return PayPalService()

def get_agent_service():
    return AgentService()

# --- Routes ---
@app.get("/api/v1/health")
async def health_check():
    """Basic health check to ensure the API is running."""
    return {"status": "healthy", "service": "SubPilot AI API"}

@app.post("/api/v1/test-paypal-auth")
async def test_paypal_auth(paypal: PayPalService = Depends(get_paypal_service)):
    """Tests if our backend can successfully get a token from the PayPal Sandbox."""
    try:
        token = await paypal._get_access_token()
        return {"success": True, "message": "PayPal Sandbox authentication successful!"}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/api/v1/agent/evaluate")
async def evaluate_action(request: AnalyzeRequest, agent: AgentService = Depends(get_agent_service)):
    """Simulates the AI Agent reasoning and Guardrail evaluation."""
    
    try:
        # Pass the full portfolio to the AI
        ai_decision = agent.analyze_subscription(
            user_prompt=request.user_prompt,
            merchant_name=request.merchant_name,
            active_subscriptions=request.active_subscriptions
        )
        
        # Only attach ID if a specific subscription was targeted
        if request.subscription_id:
            ai_decision.subscription_id = request.subscription_id

    except Exception as e:
        return {"success": False, "error": f"AI Engine Failed: {str(e)}"}    

    # Skip guardrails if the AI rejected the prompt or gave general advice (NO_ACTION)
    if ai_decision.action == "NO_ACTION":
        guardrail_result = {"status": "APPROVED", "reason": "No execution required."}
    else:
        guardrail_result = GuardrailService.evaluate_action(
            agent_action=ai_decision, 
            merchant_name=request.merchant_name,
            monthly_cost=request.monthly_cost
        )
    
    return {
        "success": True,
        "ai_proposed_action": ai_decision.model_dump(),
        "guardrail_status": guardrail_result
    }

@app.post("/api/v1/agent/execute")
async def execute_action(request: ExecuteRequest, paypal: PayPalService = Depends(get_paypal_service)):
    """The final execution step that actually hits the PayPal API."""
    try:
        # --- HACKATHON DEMO MOCK BYPASS ---
        # If the ID is one of our frontend mock IDs, simulate a successful PayPal response
        if request.subscription_id in ["I-1234567890", "I-0987654321", "I-4567890123", "I-CRITICAL01"]:
            await asyncio.sleep(1.5) # Fake network delay for the UI loading spinner
            return {"success": True, "message": f"Successfully simulated {request.action} on PayPal Sandbox."}
        # -----------------------------------

        if request.action == "CANCEL":
            await paypal.cancel_subscription(request.subscription_id, request.reason)
        elif request.action in ["SUSPEND", "REVISE"]:
            await paypal.suspend_subscription(request.subscription_id, request.reason)
            
        return {"success": True, "message": f"Successfully executed {request.action} on PayPal Sandbox."}
    except Exception as e:
        return {"success": False, "error": str(e)}