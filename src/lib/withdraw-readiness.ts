import { createServerFn } from "@tanstack/react-start";
import {
	getRequest,
	getResponseHeaders,
	setResponseHeader,
} from "@tanstack/react-start/server";

import { persistSession, resolveSession } from "./session";
import { userHeaders, WHOP_API } from "./whop";

const PAYOUT_CAPABILITIES = [
	"standard_payout",
	"instant_payout",
	"crypto_payout",
] as const;

type PayoutCapability = (typeof PAYOUT_CAPABILITIES)[number];

interface AccountResponse {
	capabilities?: Partial<Record<PayoutCapability, string>>;
	required_actions?: Array<{
		action?: string;
		blocked_capabilities?: string[];
		cta?: string | null;
		status?: string;
	}> | null;
	verification?: {
		business?: { status?: string | null } | null;
		individual?: { status?: string | null } | null;
	} | null;
}

export interface WithdrawalReadiness {
	verificationRequired: boolean;
	payoutActive: boolean;
	source: "account" | "fallback";
	verificationKind: "business" | "individual";
}

const FALLBACK_READINESS: WithdrawalReadiness = {
	verificationRequired: false,
	payoutActive: false,
	source: "fallback",
	verificationKind: "individual",
};

export function withdrawalReadinessOf(account: AccountResponse): WithdrawalReadiness {
	const business = account.verification?.business?.status ?? null;
	const individual = account.verification?.individual?.status ?? null;
	const payoutActive = PAYOUT_CAPABILITIES.some(
		(capability) => account.capabilities?.[capability] === "active",
	);
	const actions = account.required_actions ?? [];
	const verificationNotStarted = account.verification != null
		&& [individual, business].every((status) => status === null || status === "not_started")
		&& !actions.some((action) => action.action === "verify_identity"
			|| PAYOUT_CAPABILITIES.some((capability) => action.blocked_capabilities?.includes(capability)));
	const verificationRequired = !payoutActive && (verificationNotStarted || actions.some(
		(action) => action.action === "verify_identity"
			&& action.status === "required"
			&& action.cta?.includes("verify=true")
			&& (PAYOUT_CAPABILITIES.some((capability) => action.blocked_capabilities?.includes(capability))
				|| (!action.blocked_capabilities?.length && individual !== "approved" && business !== "approved")),
	));

	return {
		payoutActive,
		verificationRequired,
		source: "account",
		verificationKind: individual === "approved" && business ? "business" : "individual",
	};
}

function validateAccount(input: unknown): { accountId: string } {
	if (
		typeof input !== "object" ||
		input === null ||
		!("accountId" in input) ||
		typeof input.accountId !== "string" ||
		input.accountId.length === 0
	) {
		throw new Error("An account ID is required.");
	}

	return { accountId: input.accountId };
}

function keepRotatedSession(session: Awaited<ReturnType<typeof resolveSession>>): void {
	if (!("tokens" in session) || !session.rotated) return;

	const response = persistSession(new Response(), session);
	const cookie = response.headers.get("Set-Cookie");
	if (cookie) getResponseHeaders().append("Set-Cookie", cookie);
}

export const getWithdrawalReadiness = createServerFn({ method: "GET" })
	.inputValidator(validateAccount)
	.handler(async ({ data }): Promise<WithdrawalReadiness> => {
		setResponseHeader("Cache-Control", "private, no-store");

		const session = await resolveSession(getRequest(), data.accountId);
		if (!("tokens" in session)) return FALLBACK_READINESS;
		keepRotatedSession(session);

		try {
			const response = await fetch(
				`${WHOP_API}/accounts/${encodeURIComponent(data.accountId)}`,
				{ headers: userHeaders(session.tokens.accessToken) },
			);
			if (!response.ok) return FALLBACK_READINESS;

			const account = (await response.json()) as AccountResponse;
			return withdrawalReadinessOf(account);
		} catch {
			return FALLBACK_READINESS;
		}
	});
