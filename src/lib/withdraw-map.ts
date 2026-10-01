import type {
	WithdrawalLimits,
	WithdrawalMethod,
	WithdrawalQuote,
} from "@whop/elements-react";

export interface SavedPayoutMethod {
	id: string;
	nickname: string | null;
	institution_name: string | null;
	account_reference?: string | null;
	payer_name: string | null;
	destination_currency: string;
	is_default: boolean;
	bank_verification_state?: string | null;
	unavailable_reason?: string | null;
	fee_structure: {
		percentage: number;
		fixed_amount: number;
		currency: string;
	} | null;
	estimated_arrival: {
		standard: string | null;
		instant: string | null;
	} | null;
	quote?: {
		amount: number;
		currency: string;
		exchange_rate: number;
		min_limit: number;
		max_limit: number | null;
		standard: { fee: number; total_received: number } | null;
		instant: { fee: number; total_received: number } | null;
	} | null;
	// Current REST shape. Older payloads used payout_destination; accept both so a
	// method does not render as an empty row just because the field was renamed.
	supported_payout_method?: {
		name?: string | null;
		icon_url: string | null;
		delivery_type: string;
		supports_standard_delivery: boolean;
		supports_instant_delivery: boolean;
	} | null;
	payout_destination?: {
		name?: string;
		icon_url: string | null;
		delivery_type: string;
		supports_standard_delivery: boolean;
		supports_instant_delivery: boolean;
	} | null;
}

export interface PayoutLimits {
	standard: { max_amount: number };
	instant: {
		max_amount: number;
		daily_amount_remaining: number | null;
		error_message: string | null;
	};
}

function quoteOf(method: SavedPayoutMethod): WithdrawalQuote | null {
	const quote = method.quote;
	if (!quote) return null;
	return {
		amount: quote.amount,
		currency: quote.currency,
		destinationCurrency: method.destination_currency,
		exchangeRate: quote.exchange_rate,
		minLimit: quote.min_limit,
		maxLimit: quote.max_limit,
		standard: quote.standard
			? {
					estimatedArrival: method.estimated_arrival?.standard,
					fee: quote.standard.fee,
					totalReceived: quote.standard.total_received,
				}
			: null,
		instant: quote.instant
			? {
					estimatedArrival: method.estimated_arrival?.instant,
					fee: quote.instant.fee,
					totalReceived: quote.instant.total_received,
				}
			: null,
	};
}

export function mapPayoutMethod(method: SavedPayoutMethod): WithdrawalMethod {
	const rail = method.supported_payout_method ?? method.payout_destination;
	return {
		accountReference: method.account_reference ?? method.institution_name,
		bankVerificationState: method.bank_verification_state,
		deliveryType: rail?.delivery_type ?? "",
		destinationCurrency: method.destination_currency,
		feeStructure: method.fee_structure
			? {
					currency: method.fee_structure.currency,
					fixedAmount: method.fee_structure.fixed_amount,
					percentage: method.fee_structure.percentage,
				}
			: null,
		iconUrl: rail?.icon_url ?? null,
		id: method.id,
		instantEstimatedArrival: method.estimated_arrival?.instant ?? null,
		isDefault: method.is_default,
		nickname: method.nickname,
		payerName: method.payer_name,
		quote: quoteOf(method),
		standardEstimatedArrival: method.estimated_arrival?.standard ?? null,
		supportsInstant: rail?.supports_instant_delivery ?? false,
		supportsStandard: rail?.supports_standard_delivery ?? false,
		unavailableReason: method.unavailable_reason,
	};
}

export function mapLimits(limits: PayoutLimits | undefined): WithdrawalLimits | undefined {
	if (!limits) return undefined;
	return {
		instant: {
			dailyAmountRemaining: limits.instant.daily_amount_remaining,
			errorMessage: limits.instant.error_message,
			maxAmount: limits.instant.max_amount,
		},
		standard: { maxAmount: limits.standard.max_amount },
	};
}

export function usdBalanceOf(
	balances:
		| { symbol: string; breakdown: { available: string; pending: string } }[]
		| undefined,
): { available: number; pending: number } {
	const row = balances?.find(
		(balance) => balance.symbol.toLowerCase() === "usd",
	);
	return {
		available: Number(row?.breakdown.available ?? 0),
		pending: Number(row?.breakdown.pending ?? 0),
	};
}

export function personalUsdOf(cash: { currency: string; balance: number; pending_balance_usd: number; total_withdrawable_balance: number }[] | undefined): {
	available: number;
	pending: number;
} {
	const row = cash?.find((entry) => entry.currency.toLowerCase() === "usd");
	return {
		available: row?.total_withdrawable_balance ?? row?.balance ?? 0,
		pending: row?.pending_balance_usd ?? 0,
	};
}
