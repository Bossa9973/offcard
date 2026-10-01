import { invoiceCheckout } from "./invoice";
import { DESIGN_ACCOUNT_ID, DESIGN_TOKEN } from "../design-mode";
import { FEE_OPTIONS, type ChildMarkups, type FeeMarkup } from "./account-fees";

/** Sample host API for design builds and the public blueprint preview. No credentials, no writes. */
export function createDesignApi() {
	const entities = [
		{ id: DESIGN_ACCOUNT_ID, name: "Alex’s account", imageUrl: null, kind: "entity" },
	];
	const invoiceLinks = new Map<string, { id: string; purchaseUrl: string; title: string; amount: number; currency: string; createdAt: string }>();
	const markups = { payouts: {}, deposits: {} } as ChildMarkups;
	for (const option of FEE_OPTIONS) {
		const fee: FeeMarkup = {
			percentage: 0.5, fixed: { amount: "0", currency: "usd", display_decimals: 2 },
			default: { percentage: 0.5, fixed: { amount: "0", currency: "usd", display_decimals: 2 } },
			maximum: { percentage: 5, fixed: { amount: "10", currency: "usd", display_decimals: 2 } },
			source: "default", adjustable: true,
		};
		if (option.category === "payouts" || option.category === "deposits") markups[option.category][option.key] = fee;
		else markups[option.category] = fee;
	}

	return async (request: Request): Promise<Response> => {
		const url = new URL(request.url);
		const json = (value: unknown, status = 200) => Response.json(value, { status, headers: { "Cache-Control": "no-store" } });
		const body = request.method === "GET" || request.method === "HEAD" ? {} : await request.json().catch(() => ({}));
		switch (url.pathname) {
			case "/api/auth/login":
				return Response.redirect(new URL(`/account/${DESIGN_ACCOUNT_ID}`, url), 303);
			case "/api/auth/logout":
				return Response.redirect(new URL("/", url), 303);
			case "/api/entities":
				if (request.method === "POST") {
					const entity = { id: `biz_Design${entities.length}`, name: String(body.name || "New business"), imageUrl: null, kind: "entity" };
					entities.push(entity);
					return json({ entity }, 201);
				}
				return json({ entities, viewerName: "Alex Morgan" });
			case "/api/token":
				return json({ accountId: body.accountId || DESIGN_ACCOUNT_ID, token: DESIGN_TOKEN, expiresAt: new Date(Date.now() + 3600000).toISOString(), canReadPayments: true });
			case "/api/cards":
				return json({ scene: "approved", appliesAsBusiness: false, identityApproved: true, kind: "individual", outstanding: 0, spendable: 8420.55, status: "approved" });
			case "/api/cards/create":
				return request.method === "POST"
					? json({ id: "icrd_design", object: "card" }, 201)
					: json({ viewerId: "user_design", members: [
						{ id: "user_design", name: "Alex Morgan", username: "alex", imageUrl: null },
					] });
			case "/api/checkout":
				if (request.method !== "GET") return json({ error: { message: "This is a design preview. Checkout links are not created." } }, 422);
				return json({ links: [...invoiceLinks.values()].map(link => ({ ...link, url: link.purchaseUrl, billingDays: null })), nextCursor: null });
			case "/api/invoices/checkout": {
				if (request.method !== "POST") return json({ error: { message: "Use POST." } }, 405);
				try {
					const payload = invoiceCheckout(body.accountId, body.invoice);
					const key = request.headers.get("Idempotency-Key") || body.invoice.id;
					let link = invoiceLinks.get(key);
					if (!link) {
						link = { id: `sample_${body.invoice.id}`, title: `Invoice ${body.invoice.number}`, purchaseUrl: new URL(`/api/design/payment-preview?invoice=${encodeURIComponent(body.invoice.id)}`, url).href, amount: Number(payload.amount), currency: payload.currency, createdAt: new Date().toISOString() };
						invoiceLinks.set(key, link);
					}
					return json(link);
				} catch (e) { return json({ error: { message: e instanceof Error ? e.message : "Check your invoice." } }, 400); }
			}
			case "/api/design/payment-preview":
				return samplePaymentPage();
			case "/api/fees": {
				if (request.method === "PATCH") {
					const group = body.category as keyof ChildMarkups;
					const fee = group === "payouts" || group === "deposits" ? markups[group]?.[body.key] : markups[group];
					if (!fee) return json({ error: { message: "Unknown sample fee." } }, 400);
					fee.percentage = body.value?.percentage ?? fee.default.percentage ?? 0;
					fee.fixed = body.value ? { ...fee.fixed, amount: String(body.value.fixed) } : { ...(fee.default.fixed ?? fee.fixed) };
					fee.source = body.value ? "custom" : "default";
				}
				return json({ child_markups: markups });
			}
			default:
				return json({ error: { message: `No design fixture for ${url.pathname}.` } }, 501);
		}
	};
}

/** Static stand-in for an invoice payment link. It cannot take a payment. */
export function samplePaymentPage() {
	return new Response('<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sample payment link</title><style>body{font:18px system-ui;background:#111111;color:#ffffff;max-width:600px;margin:15vh auto;padding:24px}h1{letter-spacing:-.04em}a{color:inherit}</style><h1>Sample payment link</h1><p>This invoice was generated in the local design preview. No payment can be made here.</p><a href="/?whop_preview=1&preview_tab=invoicing">Back to invoices</a></html>', { headers: { "Content-Type": "text/html", "Cache-Control": "no-store" } });
}
