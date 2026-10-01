export interface FeeMoney {
	amount: string;
	currency: string;
	display_decimals: number;
}

export interface FeeMarkup {
	percentage: number;
	fixed: FeeMoney;
	default: { percentage: number | null; fixed: FeeMoney | null };
	maximum: { percentage: number | null; fixed: FeeMoney | null };
	source: "default" | "custom";
	adjustable: boolean;
}

export interface ChildMarkups {
	payouts: Record<string, FeeMarkup>;
	deposits: Record<string, FeeMarkup>;
	payments: FeeMarkup;
	transfers: FeeMarkup;
	crypto_swaps: FeeMarkup;
}

export const FEE_CATEGORIES = [
	{
		key: "payouts",
		label: "Withdrawals",
		description: "Add markup fees to withdrawals from your connected accounts.",
	},
	{
		key: "deposits",
		label: "Deposits",
		description: "Earn on deposits into your connected accounts.",
	},
	{
		key: "payments",
		label: "Payments",
		description: "Earn on payments your connected accounts receive.",
	},
	{
		key: "transfers",
		label: "Transfers",
		description: "Earn on transfers your connected accounts send.",
	},
	{
		key: "crypto_swaps",
		label: "Swaps",
		description: "Earn on cryptocurrency swaps your connected accounts make.",
	},
] as const;

export type FeeCategory = (typeof FEE_CATEGORIES)[number]["key"];

export const FEE_OPTIONS = [
	{
		category: "payouts",
		key: "crypto",
		label: "Crypto",
		description: "Cryptocurrency withdrawals (Bitcoin, USDC, etc.)",
	},
	{
		category: "payouts",
		key: "rtp",
		label: "Instant transfer (RTP)",
		description: "Instant bank transfer",
	},
	{
		category: "payouts",
		key: "next_day_bank",
		label: "Next day bank",
		description: "Next-day bank withdrawals",
	},
	{
		category: "payouts",
		key: "bank_wire",
		label: "Bank wire",
		description: "Bank wire withdrawals",
	},
	{
		category: "payouts",
		key: "digital_wallet",
		label: "Digital wallet",
		description: "Venmo and PayPal withdrawals",
	},
	{
		category: "deposits",
		key: "bank",
		label: "Bank deposit",
		description: "Deposits from a bank account",
	},
	{
		category: "deposits",
		key: "crypto",
		label: "Crypto deposit",
		description: "Cryptocurrency deposits",
	},
	{
		category: "payments",
		key: "payments",
		label: "Payment markup",
		description:
			"Deducted from payment proceeds unless a checkout application fee is set",
	},
	{
		category: "transfers",
		key: "transfers",
		label: "Transfer markup",
		description: "Charged on internal transfers the connected account sends",
	},
	{
		category: "crypto_swaps",
		key: "crypto_swaps",
		label: "Swap markup",
		description: "Charged on cryptocurrency token swaps",
	},
] as const;

export type FeeOption = (typeof FEE_OPTIONS)[number];

export function markupFor(
	markups: ChildMarkups,
	option: FeeOption,
): FeeMarkup | undefined {
	if (option.category === "payouts" || option.category === "deposits") {
		return markups[option.category][option.key];
	}
	return markups[option.category];
}

export function markupPatch(
	option: FeeOption,
	value: { percentage: number; fixed: number } | null,
) {
	return {
		child_markups: {
			[option.category]:
				option.category === "payouts" || option.category === "deposits"
					? { [option.key]: value }
					: value,
		},
	};
}

export function validMarkup(
	value: unknown,
	markup: FeeMarkup,
): value is { percentage: number; fixed: number } | null {
	if (value === null) return true;
	if (!value || typeof value !== "object" || Array.isArray(value)) return false;
	const fields = value as Record<string, unknown>;
	if (Object.keys(fields).length !== 2) return false;
	return (["percentage", "fixed"] as const).every((key) => {
		const amount = fields[key];
		const maximum =
			key === "percentage"
				? markup.maximum.percentage
				: Number(markup.maximum.fixed?.amount);
		return (
			typeof amount === "number" &&
			Number.isFinite(amount) &&
			amount >= 0 &&
			maximum !== null &&
			Number.isFinite(maximum) &&
			amount <= maximum
		);
	});
}
