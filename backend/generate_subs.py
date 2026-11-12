import httpx
import asyncio
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

async def generate_sandbox_subscriptions():
    # Load credentials correctly from environment variables
    client_id = os.getenv("PAYPAL_CLIENT_ID")
    client_secret = os.getenv("PAYPAL_CLIENT_SECRET")
    
    if not client_id or not client_secret:
        print("❌ Error: PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET not found in environment variables or .env file.")
        return

    async with httpx.AsyncClient() as client:
        # Get OAuth Token
        print("Authenticating with PayPal Sandbox...")
        token_res = await client.post(
            "https://api-m.sandbox.paypal.com/v1/oauth2/token",
            auth=(client_id, client_secret),
            data={"grant_type": "client_credentials"}
        )
        
        if token_res.status_code != 200:
            print(f"Auth Failed: {token_res.text}")
            return
            
        token = token_res.json().get("access_token")
        print("Authentication successful! Generating subscription IDs...\n")
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}"
        }
        
        # Your created Plan IDs
        plans = {
            "Adobe Creative Cloud": "P-6XG71870XW7568513NL3AHGA",
            "Gold's Gym": "P-1132162579523542MNL3AIPA",
            "Netflix": "P-0C324036HV323860SNL3AI5Y"
        }
        
        for name, plan_id in plans.items():
            payload = {
                "plan_id": plan_id,
                "subscriber": {
                    "name": {"given_name": "Test", "surname": "Buyer"},
                    "email_address": "sb-rhqm4753271269@personal.example.com"
                },
                "application_context": {
                    "brand_name": "SubPilot",
                    "locale": "en-US",
                    "user_action": "SUBSCRIBE_NOW",
                    "return_url": "https://example.com/return",
                    "cancel_url": "https://example.com/cancel"
                }
            }
            
            res = await client.post(
                "https://api-m.sandbox.paypal.com/v1/billing/subscriptions",
                json=payload,
                headers=headers
            )
            
            if res.status_code in [200, 201]:
                sub_data = res.json()
                print(f"👉 {name} Subscription ID: {sub_data.get('id')}")
            else:
                print(f"❌ Failed to generate subscription for {name}: {res.text}")

asyncio.run(generate_sandbox_subscriptions())