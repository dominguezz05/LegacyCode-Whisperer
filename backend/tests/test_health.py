from __future__ import annotations


async def test_health_returns_ok(client):
    response = await client.get("/health")
    assert response.status_code == 200


async def test_health_body(client):
    data = (await client.get("/health")).json()
    assert data["status"] == "ok"
    assert "version" in data
