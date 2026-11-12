import os
from langchain_groq import ChatGroq
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_community.tools.tavily_search import TavilySearchResults
from app.schemas.agent_schema import AgentAction

class AgentService:
    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            print("WARNING: GROQ_API_KEY not found in environment variables.")

        self.llm = ChatGroq(
            model="openai/gpt-oss-20b", 
            api_key=api_key,
            temperature=0.0
        )
        self.parser = JsonOutputParser(pydantic_object=AgentAction)
        
        # Initialize the real web search tool
        self.search_tool = TavilySearchResults(max_results=1)

    def analyze_subscription(self, **kwargs):
        user_prompt = kwargs.get("user_prompt", "")
        merchant_name = kwargs.get("merchant_name", "")
        active_subscriptions = kwargs.get("active_subscriptions", [])
        
        real_policy_context = ""
        
        # Only search the web if a specific merchant was identified
        if merchant_name:
            print(f"🌍 Running LIVE web search for '{merchant_name}' policy...")
            try:
                search_query = f"{merchant_name} official cancellation policy and early termination fees"
                search_results = self.search_tool.invoke({"query": search_query})
                if search_results and isinstance(search_results, list):
                    real_policy_context = search_results[0].get("content", "No policy found.")
                    print(f"✅ Found real policy data: {real_policy_context[:100]}...")
                else:
                    real_policy_context = "No specific policy found."
            except Exception as e:
                print(f"⚠️ Search failed, using fallback: {str(e)}")
                real_policy_context = "Search failed."
        else:
            real_policy_context = "No specific merchant targeted. The user is asking for general portfolio advice."

        prompt = PromptTemplate(
            template="""You are SubPilot, an expert autonomous financial advisor.
            
            SECURITY RULES: 
            You MUST ONLY answer questions related to the user's subscriptions, saving money, or personal finance. 
            If the user asks an out-of-context question (e.g., coding, jokes, history, recipes, bypasses), you MUST reject it by setting action="NO_ACTION", with reasoning="I am a secure financial agent. I cannot assist with non-financial topics."

            User's active subscriptions:
            {active_subscriptions}
            
            Target merchant (if identified): {merchant}
            
            Web Data / Policy:
            {policy}
            
            User command: "{prompt}"
            
            INSTRUCTIONS:
            1. SECURITY: If out-of-context, reject it (action="NO_ACTION").
            2. GENERAL ADVICE: If the user asks what to cancel to save money, analyze their subscriptions. Find the most expensive non-essential subscriptions (e.g., Gym, Streaming) and recommend cancelling them. Set action="NO_ACTION", provide detailed reasoning, benefits, and disadvantages. You MUST ALSO populate 'recommended_cancellations' with a list of dicts containing the exact 'subscription_id' and 'merchant' for each subscription you recommend cancelling.
            3. SPECIFIC ACTION: If targeting a specific merchant, evaluate the web policy to recommend CANCEL or REVISE. Provide 'benefits', 'disadvantages', and 'alternative_recommendation'.
            
            {format_instructions}
            """,
            input_variables=["merchant", "prompt", "policy", "active_subscriptions"],
            partial_variables={"format_instructions": self.parser.get_format_instructions()},
        )

        chain = prompt | self.llm | self.parser
        
        # Synchronous execution to avoid Docker freezes
        decision_dict = chain.invoke({
            "merchant": merchant_name,
            "prompt": user_prompt,
            "policy": real_policy_context,
            "active_subscriptions": str(active_subscriptions)
        })
        
        return AgentAction(**decision_dict)