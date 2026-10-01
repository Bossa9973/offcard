import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { listCheckoutLinks } from "../src/lib/checkout-links";

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

function request(account = "biz_test", scopes = ["checkout_configuration:basic:read"], after = "") {
	const tokens = { accessToken: "test-user-token", refreshToken: null, expiresAt: Date.now() + 3_600_000, scopes };
	return new Request(`https://neobank.example/api/checkout?account_id=${account}${after ? `&after=${encodeURIComponent(after)}` : ""}`, {
		headers: { Cookie: `nb_tokens_biz_test=${encodeURIComponent(JSON.stringify(tokens))}` },
	});
}

const link = {
	id: "ch_test", account_id: "biz_test", purchase_url: "https://whop.com/checkout/ch_test/",
	created_at: "2026-09-15T12:00:00Z", metadata: { private: "not returned" },
	plan: { initial_price: 12.5, currency: "usd", plan_type: "renewal", billing_period: 30 },
};

test("lists scoped links with user credentials and forwards pagination", async () => {
	globalThis.fetch = async (url, options) => {
		const parsed = new URL(String(url));
		assert.equal(parsed.searchParams.get("account_id"), "biz_test");
		assert.equal(parsed.searchParams.get("after"), "cursor/one=");
		assert.equal(parsed.searchParams.get("first"), "20");
		assert.equal(new Headers(options?.headers).get("Authorization"), "Bearer test-user-token");
		return Response.json({ data: [link], page_info: { has_next_page: true, end_cursor: "next" } });
	};
	const response = await listCheckoutLinks(request("biz_test", undefined, "cursor/one="));
	assert.equal(response.status, 200);
	assert.equal(response.headers.get("Cache-Control"), "no-store");
	assert.deepEqual(await response.json(), {
		links: [{ id: "ch_test", url: link.purchase_url, createdAt: link.created_at, amount: 12.5, currency: "usd", billingDays: 30 }], nextCursor: "next",
	});
});

test("rejects missing read permission without calling upstream", async () => {
	globalThis.fetch = async () => { throw new Error("Unexpected upstream call"); };
	const response = await listCheckoutLinks(request("biz_test", []));
	assert.equal(response.status, 403);
	assert.equal((await response.json()).needsReauth, true);
});

test("rejects invalid accounts and signed-out requests", async () => {
	assert.equal((await listCheckoutLinks(request("invalid"))).status, 400);
	assert.equal((await listCheckoutLinks(new Request("https://neobank.example/api/checkout?account_id=biz_test"))).status, 401);
});

test("does not return another account's links or unsafe URLs", async () => {
	for (const override of [{ account_id: "biz_other" }, { purchase_url: "https://example.com/checkout/ch_test" }]) {
		globalThis.fetch = async () => Response.json({ data: [{ ...link, ...override }], page_info: { has_next_page: false } });
		const response = await listCheckoutLinks(request());
		assert.equal(response.status, 502);
		assert.equal((await response.json()).links, undefined);
	}
});

test("supports empty results and upstream permission errors", async () => {
	globalThis.fetch = async () => Response.json({ data: [], page_info: { has_next_page: false } });
	assert.deepEqual(await (await listCheckoutLinks(request())).json(), { links: [], nextCursor: null });
	globalThis.fetch = async () => Response.json({ error: { type: "insufficient_scope" } }, { status: 403 });
	const response = await listCheckoutLinks(request());
	assert.equal(response.status, 403);
	assert.equal((await response.json()).needsReauth, true);
});

test("handles failed requests and rejects looping pagination", async () => {
	globalThis.fetch = async () => { throw new Error("Timeout"); };
	assert.equal((await listCheckoutLinks(request())).status, 502);
	globalThis.fetch = async () => Response.json({ data: [link], page_info: { has_next_page: true, end_cursor: "same" } });
	assert.equal((await listCheckoutLinks(request("biz_test", undefined, "same"))).status, 502);
});
