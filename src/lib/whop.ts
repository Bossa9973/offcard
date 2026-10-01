import { NO_INJECT } from "./oauth";

declare const process: { env: Record<string, string | undefined> };

export const WHOP_API = `${process.env.WHOP_API_ORIGIN ?? "https://api.whop.com"}/api/v1`;
export const API_VERSION_DATE = "2026-08-03";

// Every api.whop.com hop gets the app's company key injected at the edge unless opted
// out. That key cannot hold payout:withdraw_funds, so withdraw has to carry the user's
// bearer and refuse the inject.
export function userHeaders(accessToken: string): HeadersInit {
	return {
		...NO_INJECT,
		Accept: "application/json",
		"Api-Version-Date": API_VERSION_DATE,
		Authorization: `Bearer ${accessToken}`,
	};
}

export function ownerOf(
	accountId: string,
): { user_id: string } | { account_id: string } {
	if (accountId.startsWith("user_")) return { user_id: accountId };
	return { account_id: accountId };
}
