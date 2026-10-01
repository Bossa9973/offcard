import assert from "node:assert/strict";
import test from "node:test";
import { createDesignApi } from "../src/lib/design-api";

test("design API opens a sample account without credentials and keeps created entities locally", async () => {
	const respond = createDesignApi();
	const request = (path: string, body?: object) => new Request(`http://localhost:5180${path}`, body ? {
		method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" },
	} : undefined);
	const initial = await (await respond(request("/api/entities"))).json();
	const token = await (await respond(request("/api/token", { accountId: initial.entities[0].id }))).json();
	assert.equal(token.accountId, initial.entities[0].id);
	assert.equal(token.token, "local-design-sample-token");
	const created = await (await respond(request("/api/entities", { name: "Studio" }))).json();
	const after = await (await respond(request("/api/entities"))).json();
	assert.ok(after.entities.some((entity: { id: string }) => entity.id === created.entity.id));
	const isolated = await (await createDesignApi()(request("/api/entities"))).json();
	assert.equal(isolated.entities.length, initial.entities.length);
});

test("unknown and real checkout operations cannot fall through to live APIs", async () => {
	const respond = createDesignApi();
	for (const path of ["/api/payouts", "/api/checkout"]) {
		const response = await respond(new Request(`http://localhost:5180${path}`, {
			method: "POST", body: JSON.stringify({ amount: 100 }),
		}));
		assert.ok(response.status >= 400);
		assert.ok((await response.json()).error.message);
	}
});

test("design sign out returns to the homepage without issuing a session cookie", async () => {
	const response = await createDesignApi()(new Request("http://localhost:5180/api/auth/logout", { method: "POST" }));
	assert.equal(response.status, 303);
	assert.equal(response.headers.get("Location"), "http://localhost:5180/");
	assert.equal(response.headers.get("Set-Cookie"), null);
});

test("fee edits preserve the money shape consumed by the Settings screen", async () => {
	const respond = createDesignApi();
	const response = await respond(new Request("http://localhost:5180/api/fees", {
		method: "PATCH", body: JSON.stringify({ category: "payouts", key: "crypto", value: { percentage: 1, fixed: 2 } }),
	}));
	const fee = (await response.json()).child_markups.payouts.crypto;
	assert.equal(fee.percentage, 1);
	assert.equal(fee.fixed.amount, "2");
	assert.equal(fee.fixed.currency, "usd");
});
