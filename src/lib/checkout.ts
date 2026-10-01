export const CHECKOUT_SCOPES = [
	"checkout_configuration:create",
	"plan:create",
	"access_pass:create",
] as const;
export const CHECKOUT_CURRENCIES = ["usd", "eur", "gbp", "cad", "aud"] as const;
export const BILLING_OPTIONS = [
	{ value: "one_time", label: "One-time payment", days: 0 },
	{ value: "monthly", label: "Every 30 days", days: 30 },
	{ value: "yearly", label: "Every 365 days", days: 365 },
] as const;

export function checkoutPayload(input: unknown) {
	if (!input || typeof input !== "object")
		throw new Error("Enter your invoice details.");
	const body = input as Record<string, unknown>;
	const accountId = typeof body.accountId === "string" ? body.accountId : "";
	if (!/^biz_[A-Za-z0-9]+$/.test(accountId))
		throw new Error("Select an entity to create an invoice.");
	const title = typeof body.title === "string" ? body.title.trim() : "";
	if (!title || title.length > 30)
		throw new Error("Enter a title of up to 30 characters.");
	const description =
		typeof body.description === "string" ? body.description.trim() : "";
	if (description.length > 1000)
		throw new Error("Keep the description under 1,001 characters.");
	const amount = typeof body.amount === "string" ? body.amount.trim() : "";
	if (!/^\d{1,9}(\.\d{1,2})?$/.test(amount) || Number(amount) <= 0)
		throw new Error(
			"Enter an amount greater than zero, with up to two decimal places.",
		);
	const currency = CHECKOUT_CURRENCIES.find((value) => value === body.currency);
	if (!currency) throw new Error("Choose a supported currency.");
	const billing = BILLING_OPTIONS.find(
		(option) => option.value === body.billing,
	);
	if (!billing) throw new Error("Choose a billing frequency.");
	const redirectUrl =
		typeof body.redirectUrl === "string" ? body.redirectUrl.trim() : "";
	if (redirectUrl) {
		let url: URL;
		try {
			url = new URL(redirectUrl);
		} catch {
			throw new Error("Enter a valid HTTPS redirect URL.");
		}
		if (
			url.protocol !== "https:" ||
			url.username ||
			url.password ||
			redirectUrl.length > 2048
		)
			throw new Error("Enter a valid HTTPS redirect URL.");
	}
	return {
		account_id: accountId,
		mode: "payment" as const,
		plan: {
			title,
			...(description ? { description } : {}),
			currency,
			initial_price: Number(amount),
			plan_type: billing.days ? ("renewal" as const) : ("one_time" as const),
			...(billing.days
				? { billing_period: billing.days, renewal_price: Number(amount) }
				: {}),
			// Match dashboard-created checkout links so they appear in its default list.
			visibility: "hidden" as const,
			release_method: "buy_now" as const,
			unlimited_stock: true,
		},
		...(redirectUrl ? { redirect_url: redirectUrl } : {}),
	};
}

export function hostedCheckoutUrl(value: unknown): string | null {
	if (typeof value !== "string") return null;
	try {
		const url = new URL(value);
		return url.protocol === "https:" &&
			url.hostname === "whop.com" &&
			!url.username &&
			!url.password &&
			!url.port &&
			url.pathname.startsWith("/checkout/")
			? url.href
			: null;
	} catch {
		return null;
	}
}
