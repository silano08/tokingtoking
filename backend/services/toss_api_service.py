import httpx

from config import settings


def _get_mtls_client() -> httpx.AsyncClient:
    return httpx.AsyncClient(
        cert=(settings.toss_mtls_cert_path, settings.toss_mtls_key_path),
        base_url=settings.toss_api_url,
        timeout=30.0,
    )


async def exchange_authorization_code(
    authorization_code: str, referrer: str
) -> dict:
    async with _get_mtls_client() as client:
        response = await client.post(
            "/api-partner/v1/apps-in-toss/user/oauth2/generate-token",
            json={
                "authorizationCode": authorization_code,
                "referrer": referrer,
            },
        )
        data = response.json()
        if data.get("resultType") != "SUCCESS":
            raise Exception(f"Toss login failed: {data.get('error', {}).get('reason')}")
        return data["success"]


async def get_toss_user_info(access_token: str) -> dict:
    async with _get_mtls_client() as client:
        response = await client.get(
            "/api-partner/v1/apps-in-toss/user/oauth2/login-me",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        data = response.json()
        if data.get("resultType") != "SUCCESS":
            raise Exception(f"Failed to get user info: {data.get('error', {}).get('reason')}")
        return data["success"]


async def get_order_status(order_id: str, user_key: str) -> dict:
    async with _get_mtls_client() as client:
        response = await client.post(
            "/api-partner/v1/apps-in-toss/order/get-order-status",
            json={"orderId": order_id},
            headers={"x-toss-user-key": user_key},
        )
        data = response.json()
        if data.get("resultType") != "SUCCESS":
            raise Exception(f"Order status check failed: {data.get('error', {}).get('reason')}")
        return data["success"]
