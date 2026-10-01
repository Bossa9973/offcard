import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import {
	checkoutPayload,
	hostedCheckoutUrl,
	CHECKOUT_SCOPES,
} from "../src/lib/checkout";
import { createCheckout } from "../src/routes/api.checkout";

const draft = {
	accountId: "biz_test",
	title: "Website design",
	description: "Five pages",
	amount: "1250.50",
	currency: "usd",
	billing: "one_time",
	redirectUrl: "",
};
const originalFetch = globalThis.fetch;
afterEach(() => {
	globalThis.fetch = originalFetch;
});

function request({
	body = draft,
	scopes = [...CHECKOUT_SCOPES],
	origin = "https://neobank.example",
	signedIn = true,
	key = "12345678-1234-1234-1234-123456789012",
}: {
	body?: unknown;
	scopes?: string[];
	origin?: string;
	signedIn?: boolean;
	key?: string;
} = {}) {
	const tokens = {
		accessToken: "test-user-token",
		refreshToken: null,
		expiresAt: Date.now() + 3_600_000,
		scopes,
	};
	return new Request("https://neobank.example/api/checkout", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Origin: origin,
			"Idempotency-Key": key,
			...(signedIn
				? {
						Cookie: `nb_tokens_biz_test=${encodeURIComponent(JSON.stringify(tokens))}`,
					}
				: {}),
		},
		body: JSON.stringify(body),
	});
}

function upstream(body: unknown, status = 200) {
	const calls: { url: string; options: RequestInit }[] = [];
	globalThis.fetch = async (url, options) => {
		calls.push({ url: String(url), options: options ?? {} });
		return String(url).endsWith("/products")
			? Response.json({ id: "prod_test", account: { id: "biz_test" } })
			: Response.json(body, { status });
	};
	return calls;
}

const success = {
	id: "ch_test",
	account_id: "biz_test",
	purchase_url: "https://whop.com/checkout/ch_test/",
};

test("one-time invoice sets selected account, price and customer-visible details", () => {
	const payload = checkoutPayload(draft);
	assert.equal(payload.account_id, "biz_test");
	assert.equal(payload.plan.initial_price, 1250.5);
	assert.equal(payload.plan.description, "Five pages");
	assert.equal(payload.plan.plan_type, "one_time");
	assert.equal(payload.plan.visibility, "hidden");
	assert.equal(payload.plan.unlimited_stock, true);
	assert.equal("renewal_price" in payload.plan, false);
});

test("recurring checkout charges the same amount now and each interval", () => {
	for (const [billing, days] of [
		["monthly", 30],
		["yearly", 365],
	] as const) {
		const payload = checkoutPayload({
			...draft,
			billing,
			currency: "eur",
			redirectUrl: "https://example.com/thanks",
		});
		assert.equal(payload.plan.plan_type, "renewal");
		assert.equal(payload.plan.billing_period, days);
		assert.equal(payload.plan.renewal_price, 1250.5);
		assert.equal(payload.plan.currency, "eur");
		assert.equal(payload.redirect_url, "https://example.com/thanks");
	}
});

test("invalid amounts, fields and redirect schemes cannot reach Whop", async () => {
	const calls = upstream(success);
	for (const patch of [
		{ amount: "0" },
		{ amount: "-1" },
		{ amount: "1.001" },
		{ amount: "1e3" },
		{ amount: "Infinity" },
		{ amount: 2 },
		{ title: " " },
		{ title: "x".repeat(31) },
		{ description: "x".repeat(1001) },
		{ currency: "bad" },
		{ billing: "weekly" },
		{ accountId: "user_test" },
		{ redirectUrl: "javascript:alert(1)" },
		{ redirectUrl: "http://example.com" },
		{ redirectUrl: "https://user:pass@example.com" },
	])
		assert.equal(
			(await createCheckout(request({ body: { ...draft, ...patch } }))).status,
			400,
			JSON.stringify(patch),
		);
	assert.equal(calls.length, 0);
});

test("requires same origin, authentication, grant and idempotency key before creation", async () => {
	const calls = upstream(success);
	assert.equal(
		(await createCheckout(request({ origin: "https://attacker.example" })))
			.status,
		403,
	);
	assert.equal(
		(await createCheckout(request({ signedIn: false }))).status,
		401,
	);
	assert.equal((await createCheckout(request({ key: "" }))).status, 400);
	const response = await createCheckout(request({ scopes: [] }));
	assert.equal(response.status, 403);
	assert.equal((await response.json()).needsReauth, true);
	assert.equal(calls.length, 0);
});

test("uses user OAuth without edge key injection and preserves the retry key", async () => {
	const calls = upstream(success);
	for (let i = 0; i < 2; i++) {
		const response = await createCheckout(request());
		assert.equal(response.status, 200);
		assert.deepEqual(await response.json(), {
			id: "ch_test",
			purchaseUrl: success.purchase_url,
		});
		assert.equal(response.headers.get("Cache-Control"), "no-store");
	}
	const headers = new Headers(calls[0].options.headers);
	assert.equal(headers.get("Authorization"), "Bearer test-user-token");
	assert.equal(headers.get("x-whop-inject-key"), "none");
	assert.equal(headers.get("Api-Version-Date"), "2026-09-13");
	assert.equal(
		headers.get("Idempotency-Key"),
		new Headers(calls[2].options.headers).get("Idempotency-Key"),
	);
	assert.deepEqual(JSON.parse(calls[1].options.body as string), {
		...checkoutPayload(draft),
		plan: { ...checkoutPayload(draft).plan, product_id: "prod_test" },
	});
	assert.equal(calls.length, 4);
	assert.ok(calls[0].url.endsWith("/api/v1/products"));
	assert.ok(calls[1].url.endsWith("/api/v1/checkout_configurations"));
	assert.deepEqual(JSON.parse(calls[0].options.body as string), {
		account_id: "biz_test",
		title: "Website design",
		description: "Five pages",
		visibility: "hidden",
		send_welcome_message: false,
	});
	assert.notEqual(
		headers.get("Idempotency-Key"),
		new Headers(calls[1].options.headers).get("Idempotency-Key"),
	);
	assert.equal(
		new Headers(calls[1].options.headers).get("Idempotency-Key"),
		new Headers(calls[3].options.headers).get("Idempotency-Key"),
	);
});

test("upstream permission errors and timeouts show recoverable errors", async () => {
	upstream({ error: { message: "Not authorized for this account" } }, 403);
	const denied = await createCheckout(request());
	assert.equal(denied.status, 403);
	assert.match((await denied.json()).error.message, /Not authorized/);
	globalThis.fetch = async () => {
		throw new Error("timeout");
	};
	assert.equal((await createCheckout(request())).status, 504);
	upstream({ error: { message: "Request is still running" } }, 409);
	assert.equal((await createCheckout(request())).status, 409);
});

test("rejects missing, unsafe or wrong-account checkout responses", async () => {
	for (const result of [
		{ ...success, purchase_url: null },
		{ ...success, purchase_url: "https://evil.example/checkout/test" },
		{ ...success, account_id: "biz_other" },
	]) {
		upstream(result);
		assert.equal((await createCheckout(request())).status, 502);
	}
	assert.equal(hostedCheckoutUrl("javascript:alert(1)"), null);
	assert.equal(
		hostedCheckoutUrl("https://whop.com.evil.example/checkout/test"),
		null,
	);
	assert.equal(hostedCheckoutUrl(success.purchase_url), success.purchase_url);
});

test("product failure prevents checkout creation", async () => {
	for (const [body, status] of [
		[{ error: { message: "Product creation not allowed" } }, 403],
		[{ id: "prod_other", account: { id: "biz_other" } }, 200],
	] as const) {
		let calls = 0;
		globalThis.fetch = async () => {
			calls++;
			return Response.json(body, { status });
		};
		assert.equal(
			(await createCheckout(request())).status,
			status === 200 ? 502 : status,
		);
		assert.equal(calls, 1);
	}
});

test("a checkout timeout retries with the same product and checkout keys", async () => {
	const calls: { url: string; key: string | null }[] = [];
	let checkoutCalls = 0;
	globalThis.fetch = async (url, options) => {
		calls.push({
			url: String(url),
			key: new Headers(options?.headers).get("Idempotency-Key"),
		});
		if (String(url).endsWith("/products"))
			return Response.json({ id: "prod_test", account: { id: "biz_test" } });
		if (++checkoutCalls === 1)
			throw new Error("timeout after product creation");
		return Response.json(success);
	};
	assert.equal((await createCheckout(request())).status, 504);
	assert.equal((await createCheckout(request())).status, 200);
	assert.deepEqual(calls.slice(0, 2), calls.slice(2));
});
