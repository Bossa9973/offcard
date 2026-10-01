import { createFileRoute } from "@tanstack/react-router";

import {
	CHECKOUT_SCOPES,
	checkoutPayload,
	hostedCheckoutUrl,
} from "../lib/checkout";
import { persistSession, resolveSession, signedOut } from "../lib/session";
import { userHeaders, WHOP_API } from "../lib/whop";
import { listCheckoutLinks } from "../lib/checkout-links";

function json(body: unknown, status = 200) {
	return Response.json(body, {
		status,
		headers: { "Cache-Control": "no-store" },
	});
}

export async function createCheckout(request: Request, options: { invoice?: boolean } = {}): Promise<Response> {
	if (request.headers.get("Origin") !== new URL(request.url).origin)
		return json(
			{ error: { message: "This request must come from the invoicing page." } },
			403,
		);
	const key = request.headers.get("Idempotency-Key") ?? "";
	if (!/^[a-zA-Z0-9-]{16,128}$/.test(key))
		return json(
			{ error: { message: "A valid request identifier is required." } },
			400,
		);
	let payload: ReturnType<typeof checkoutPayload>;
	try {
		payload = checkoutPayload(await request.json());
	} catch (error) {
		return json(
			{
				error: {
					message:
						error instanceof Error ? error.message : "Invalid invoice details.",
				},
			},
			400,
		);
	}
	const session = await resolveSession(request, payload.account_id);
	if ("failure" in session)
		return signedOut("Sign in with Whop to create an invoice.");
	const respond = (body: unknown, status = 200) =>
		persistSession(json(body, status), session);
	if (CHECKOUT_SCOPES.some((scope) => !session.tokens.scopes.includes(scope)))
		return respond(
			{
				needsReauth: true,
				error: { message: "Reconnect with Whop to allow invoice creation." },
			},
			403,
		);

	try {
		const productResponse = await fetch(`${WHOP_API}/products`, {
			method: "POST",
			headers: {
				...userHeaders(session.tokens.accessToken),
				"Api-Version-Date": "2026-09-13",
				"Idempotency-Key": `neobank-invoice-v2-product-${payload.account_id}-${key}`,
			},
			body: JSON.stringify({
				account_id: payload.account_id,
				title: payload.plan.title,
				...(payload.plan.description
					? { description: payload.plan.description }
					: {}),
				visibility: "hidden",
				send_welcome_message: false,
			}),
			signal: AbortSignal.timeout(10_000),
		});
		const product = (await productResponse.json().catch(() => null)) as {
			id?: string;
			account?: { id?: string };
			error?: { message?: string; type?: string };
		} | null;
		if (!productResponse.ok)
			return respond(
				{
					error: {
						message:
							product?.error?.message ??
							"Whop could not create the invoice product. Please try again.",
					},
					needsReauth:
						productResponse.status === 401 ||
						product?.error?.type === "insufficient_scope",
				},
				productResponse.status,
			);
		if (
			!product?.id?.startsWith("prod_") ||
			product.account?.id !== payload.account_id
		)
			return respond(
				{
					error: {
						message:
							"Whop did not return a valid invoice product. Retry to recover the same request.",
					},
				},
				502,
			);

		const response = await fetch(`${WHOP_API}/checkout_configurations`, {
			method: "POST",
			headers: {
				...userHeaders(session.tokens.accessToken),
				"Api-Version-Date": "2026-09-13",
				"Idempotency-Key": `neobank-invoice-v2-checkout-${payload.account_id}-${key}`,
			},
			body: JSON.stringify({
				...payload,
				plan: { ...payload.plan, product_id: product.id, ...(options.invoice ? { override_tax_type: "inclusive", adaptive_pricing_enabled: false, stock: 1, unlimited_stock: false } : {}) },
			}),
			signal: AbortSignal.timeout(10_000),
		});
		const result = (await response.json().catch(() => null)) as {
			id?: string;
			account_id?: string;
			purchase_url?: string;
			error?: { message?: string; type?: string };
		} | null;
		if (!response.ok)
			return respond(
				{
					error: {
						message:
							result?.error?.message ??
							"Whop could not create this checkout link. Please try again.",
					},
					needsReauth:
						response.status === 401 ||
						result?.error?.type === "insufficient_scope",
				},
				response.status,
			);
		const purchaseUrl = hostedCheckoutUrl(result?.purchase_url);
		if (!purchaseUrl || !result?.id || result.account_id !== payload.account_id)
			return respond(
				{
					error: {
						message:
							"Whop did not return a valid checkout link. Retry to recover the same request.",
					},
				},
				502,
			);
		return respond({ id: result.id, purchaseUrl });
	} catch {
		return respond(
			{
				error: {
					message:
						"Whop did not respond. Try again to recover your checkout link.",
				},
			},
			504,
		);
	}
}

export const Route = createFileRoute("/api/checkout")({
	server: { handlers: { GET: ({ request }) => listCheckoutLinks(request), POST: ({ request }) => createCheckout(request) } },
});
