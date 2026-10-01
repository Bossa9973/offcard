import { hostedCheckoutUrl } from "./checkout";
import { persistSession, resolveSession, signedOut } from "./session";
import { userHeaders, WHOP_API } from "./whop";

export interface CheckoutLink {
	id: string;
	title?: string;
	url: string;
	createdAt: string;
	amount: number | null;
	currency: string | null;
	billingDays: number | null;
}

export async function listCheckoutLinks(request: Request): Promise<Response> {
	const json = (body: unknown, status = 200) => Response.json(body, {
		status, headers: { "Cache-Control": "no-store" },
	});
	const params = new URL(request.url).searchParams;
	const accountId = params.get("account_id") ?? "";
	const after = params.get("after");
	if (!/^biz_[A-Za-z0-9]+$/.test(accountId) || (after !== null && (!after || after.length > 2048)))
		return json({ error: { message: "Invalid checkout-links request." } }, 400);
	const session = await resolveSession(request, accountId);
	if ("failure" in session) return signedOut("Sign in with Whop to view checkout links.");
	const respond = (body: unknown, status = 200) => persistSession(json(body, status), session);
	if (!session.tokens.scopes.includes("checkout_configuration:basic:read"))
		return respond({ needsReauth: true, error: { message: "Reconnect with Whop to view your saved checkout links." } }, 403);
	const query = new URLSearchParams({ account_id: accountId, first: "20", order: "created_at", direction: "desc" });
	if (after) query.set("after", after);
	try {
		const response = await fetch(`${WHOP_API}/checkout_configurations?${query}`, {
			headers: { ...userHeaders(session.tokens.accessToken), "Api-Version-Date": "2026-09-13" },
			signal: AbortSignal.timeout(10_000),
		});
		const result = await response.json();
		if (!response.ok) return respond({
			needsReauth: response.status === 401 || result?.error?.type === "insufficient_scope",
			error: { message: "Could not load checkout links from Whop. Please try again." },
		}, response.status);
		if (!Array.isArray(result.data)) throw new Error("Invalid checkout links");
		const links: CheckoutLink[] = result.data.map((item: {
			id: string; account_id: string; purchase_url: string; created_at: string;
			plan?: { title?: string; initial_price?: number; currency?: string; plan_type?: string; billing_period?: number };
		}) => {
			const url = hostedCheckoutUrl(item.purchase_url);
			if (item.account_id !== accountId || typeof item.id !== "string" || !url || !Number.isFinite(Date.parse(item.created_at)))
				throw new Error("Invalid checkout link");
			return {
				id: item.id, url, createdAt: item.created_at,
				...(typeof item.plan?.title === "string" && item.plan.title.trim() ? { title: item.plan.title.trim() } : {}),
				amount: typeof item.plan?.initial_price === "number" && Number.isFinite(item.plan.initial_price) ? item.plan.initial_price : null,
				currency: typeof item.plan?.currency === "string" && /^[a-z]{3}$/i.test(item.plan.currency) ? item.plan.currency : null,
				billingDays: item.plan?.plan_type === "renewal" && typeof item.plan.billing_period === "number" ? item.plan.billing_period : null,
			};
		});
		const nextCursor = result.page_info?.has_next_page ? result.page_info.end_cursor : null;
		if (nextCursor !== null && (typeof nextCursor !== "string" || !nextCursor || nextCursor === after))
			throw new Error("Invalid pagination");
		return respond({ links, nextCursor });
	} catch {
		return respond({ error: { message: "Could not load checkout links. Please try again." } }, 502);
	}
}
