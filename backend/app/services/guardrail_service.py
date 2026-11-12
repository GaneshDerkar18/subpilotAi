from app.schemas.agent_schema import AgentAction

class GuardrailService:
    # In a real app, this would be in the database
    WHITELISTED_MERCHANTS = ["Netflix", "Adobe", "Gold's Gym", "Spotify"]
    CRITICAL_MERCHANTS = ["Health Insurance", "Electricity Provider", "Rent"]
    MAX_AUTONOMOUS_SPEND_CAP = 50.00

    @staticmethod
    def evaluate_action(agent_action: AgentAction, merchant_name: str, monthly_cost: float) -> dict:
        """
        Takes the AI's proposed action and runs it through strict Python rules.
        Returns a dictionary indicating if it's approved, rejected, or needs Human-in-the-loop.
        """
        # Rule 1: Never touch critical infrastructure
        if merchant_name in GuardrailService.CRITICAL_MERCHANTS:
            return {
                "status": "REJECTED",
                "reason": f"System Policy: AI is not authorized to modify {merchant_name}."
            }
            
        # Rule 2: Low confidence requires human review
        if agent_action.confidence_score < 0.85:
            return {
                "status": "REQUIRES_APPROVAL",
                "reason": "AI confidence is too low. Human review required."
            }
            
        # Rule 3: High cost requires human review
        if monthly_cost > GuardrailService.MAX_AUTONOMOUS_SPEND_CAP:
            return {
                "status": "REQUIRES_APPROVAL",
                "reason": f"Monthly cost (${monthly_cost}) exceeds the $50 autonomous spend cap."
            }
            
        # If it passes all safety checks, but it's a destructive action (Cancel/Suspend)
        # We always enforce Human-In-The-Loop for safety in this Hackathon demo.
        if agent_action.action in ["CANCEL", "SUSPEND", "REVISE"]:
            return {
                "status": "REQUIRES_APPROVAL",
                "reason": "Destructive financial action requires final user consent."
            }

        return {
            "status": "APPROVED",
            "reason": "Action is safe and within limits."
        }