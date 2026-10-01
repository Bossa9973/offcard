import assert from "node:assert/strict";
import { test } from "node:test";
import { getFeaturedCard } from "../src/routes/api.cards.featured";

function request(scopes = ["payout:account:read"]) {
 const session = { accessToken: "test-only-token", refreshToken: null, expiresAt: Date.now() + 3600000, scopes };
 return new Request("https://neobank.example/api/cards/featured?accountId=biz_test", { headers: { Cookie: `nb_tokens_biz_test=${encodeURIComponent(JSON.stringify(session))}` } });
}

test("featured card selects an active card and returns only the ID", async () => {
 const original = globalThis.fetch;
 globalThis.fetch = async (url, init) => {
  assert.equal(new URL(String(url)).searchParams.get("account_id"), "biz_test");
  assert.equal(new Headers(init?.headers).get("Authorization"), "Bearer test-only-token");
  return Response.json({ data: [{ id: "icrd_canceled", status: "canceled" }, { id: "icrd_active", status: "active", privateField: "not-for-the-host" }] });
 };
 try {
  const response = await getFeaturedCard(request());
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { cardId: "icrd_active" });
  assert.equal(response.headers.get("Cache-Control"), "no-store");
 } finally { globalThis.fetch = original; }
});

test("featured card never calls upstream without authentication and scope", async () => {
 const original = globalThis.fetch;
 globalThis.fetch = async () => { throw new Error("Unexpected upstream request"); };
 try {
  assert.equal((await getFeaturedCard(new Request("https://neobank.example/api/cards/featured?accountId=biz_test"))).status, 401);
  assert.equal((await getFeaturedCard(request([]))).status, 403);
 } finally { globalThis.fetch = original; }
});

test("empty, canceled-only and malformed card lists do not produce an invalid preview", async () => {
 const original = globalThis.fetch;
 try {
  for (const data of [[], [{ id: "icrd_canceled", status: "canceled" }], [{ id: "invalid", status: "active" }]]) {
   globalThis.fetch = async () => Response.json({ data });
   assert.deepEqual(await (await getFeaturedCard(request())).json(), { cardId: null });
  }
  globalThis.fetch = async () => Response.json({ unexpected: [] });
  assert.equal((await getFeaturedCard(request())).status, 502);
 } finally { globalThis.fetch = original; }
});
