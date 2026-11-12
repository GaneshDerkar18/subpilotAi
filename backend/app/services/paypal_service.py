import os
import httpx
from fastapi import HTTPException

class PayPalService:
    def __init__(self):
        self.client_id = os.getenv("PAYPAL_CLIENT_ID")
        self.client_secret = os.getenv("PAYPAL_CLIENT_SECRET")
        # Use PayPal Sandbox URL
        self.base_url = "https://api-m.sandbox.paypal.com"

    async def _get_access_token(self) -> str:
        """Generates an OAuth2 access token from PayPal Sandbox."""
        url = f"{self.base_url}/v1/oauth2/token"
        auth = (self.client_id, self.client_secret)
        headers = {"Accept": "application/json", "Accept-Language": "en_US"}
        data = {"grant_type": "client_credentials"}

        async with httpx.AsyncClient() as client:
            response = await client.post(url, auth=auth, headers=headers, data=data)
            if response.status_code != 200:
                raise HTTPException(status_code=500, detail=f"PayPal Auth Failed: {response.text}")
            return response.json().get("access_token")

    async def _get_headers(self) -> dict:
        token = await self._get_access_token()
        return {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
            "Accept": "application/json"
        }

    async def cancel_subscription(self, subscription_id: str, reason: str):
        """Cancels a live subscription on PayPal Sandbox."""
        url = f"{self.base_url}/v1/billing/subscriptions/{subscription_id}/cancel"
        headers = await self._get_headers()
        payload = {"reason": reason}

        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers)
            # PayPal returns 204 No Content on successful cancellation
            if response.status_code not in [204, 200]:
                raise HTTPException(status_code=response.status_code, detail=f"PayPal Cancellation Error: {response.text}")
            return {"success": True, "message": "Subscription cancelled successfully on PayPal."}

    async def suspend_subscription(self, subscription_id: str, reason: str):
        """Suspends a live subscription on PayPal Sandbox."""
        url = f"{self.base_url}/v1/billing/subscriptions/{subscription_id}/suspend"
        headers = await self._get_headers()
        payload = {"reason": reason}

        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers)
            if response.status_code not in [204, 200]:
                raise HTTPException(status_code=response.status_code, detail=f"PayPal Suspension Error: {response.text}")
            return {"success": True, "message": "Subscription suspended successfully on PayPal."}