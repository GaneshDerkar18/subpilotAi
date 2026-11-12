import httpx
import base64
import time
from fastapi import HTTPException
from app.core.config import get_settings

settings = get_settings()

class PayPalService:
    def __init__(self):
        self.base_url = settings.PAYPAL_BASE_URL
        self.client_id = settings.PAYPAL_CLIENT_ID
        self.client_secret = settings.PAYPAL_CLIENT_SECRET
        self._access_token = None
        self._token_expires_at = 0
        self.client = httpx.AsyncClient(timeout=10.0)

    async def _get_access_token(self) -> str:
        # Return cached token if it's still valid
        if self._access_token and time.time() < self._token_expires_at:
            return self._access_token

        # Generate a new OAuth2 Token via HTTP Basic Auth
        auth_string = f"{self.client_id}:{self.client_secret}"
        encoded_auth = base64.b64encode(auth_string.encode()).decode()
        
        response = await self.client.post(
            f"{self.base_url}/v1/oauth2/token",
            headers={"Authorization": f"Basic {encoded_auth}"},
            data={"grant_type": "client_credentials"}
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="PayPal Authentication Failed")
            
        data = response.json()
        self._access_token = data["access_token"]
        # Subtract 60 seconds as a safety buffer for expiration
        self._token_expires_at = time.time() + data["expires_in"] - 60 
        
        return self._access_token

    async def suspend_subscription(self, subscription_id: str, reason: str = "Requested via SubPilot"):
        token = await self._get_access_token()
        url = f"{self.base_url}/v1/billing/subscriptions/{subscription_id}/suspend"
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        # PayPal REQUIRES this JSON body for suspend/cancel endpoints!
        payload = {
            "reason": reason
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json=payload)
            if response.status_code >= 400:
                raise Exception(f"PayPal Error: {response.status_code} {response.text}")
                
    async def cancel_subscription(self, subscription_id: str, reason: str = "AI Agent requested cancellation") -> bool:
        """Permanently cancels a PayPal subscription."""
        token = await self._get_access_token()
        
        response = await self.client.post(
            f"{self.base_url}/v1/billing/subscriptions/{subscription_id}/cancel",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            },
            json={"reason": reason}
        )
        if response.status_code == 204:
            return True
        raise HTTPException(status_code=response.status_code, detail="Failed to cancel subscription via PayPal")