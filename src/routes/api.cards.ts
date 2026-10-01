import { createFileRoute } from "@tanstack/react-router";

import { persistSession, resolveSession, signedOut } from "../lib/session";
import { userHeaders, WHOP_API } from "../lib/whop";

const READ_SCOPES = ["company:balance:read", "identity:read"] as const;
const APPLY_SCOPES = ["payout:account:update"] as const;

const NO_IDENTITY = /no approved identity verification/i;

export type CardScene =
	| "approved"
	| "declined"
	| "intro"
	| "needs_identity"
	| "needs_information"
	| "needs_resubmit"
	| "review"
	| "unavailable";

interface AccountCards {
	kind?: string | null;
	status?: string | null;
}

interface VerificationProfile {
	status?: string | null;
}

interface AccountBalanceToken {
	breakdown?: { spendable?: string | null } | null;
	symbol?: string | null;
}

interface AccountRead {
	balances?: AccountBalanceToken[] | null;
	capabilities?: { card_issuing?: string | null } | null;
	cards?: AccountCards | null;
	verification?: {
		business?: VerificationProfile | null;
		individual?: VerificationProfile | null;
	} | null;
}

function resolvedVerification(account: AccountRead): string | null {
	const business = account.verification?.business?.status ?? null;
	const individual = account.verification?.individual?.status ?? null;
	if (business && business !== "not_started") return business;
	return individual ?? business;
}

interface VerificationsRead {
	data?: { requested_information?: unknown[] | null }[] | null;
}

function badRequest(message: string, type = "parameter_invalid"): Response {
	return Response.json({ error: { message, type } }, { status: 400 });
}

function missingScopes(granted: string[], needed: readonly string[]): string[] {
	return needed.filter((scope) => !granted.includes(scope));
}

function insufficient(missing: string[]): Response {
	return Response.json(
		{
			error: {
				message: `Your sign-in did not grant: ${missing.join(", ")}.`,
				type: "insufficient_scope",
			},
			needsReauth: true,
		},
		{ headers: { "Cache-Control": "no-store" }, status: 403 },
	);
}

const UPSTREAM_TIMEOUT_MS = 8_000;

async function upstream<T>(
	accessToken: string,
	path: string,
	init: RequestInit = {},
): Promise<
	| { ok: true; status: number; body: T }
	| { ok: false; status: number; message: string }
> {
	let response: Response;
	try {
		response = await fetch(`${WHOP_API}${path}`, {
			...init,
			headers: { ...userHeaders(accessToken), ...(init.headers ?? {}) },
			signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
		});
	} catch {
		return {
			message: `Whop did not answer ${path} in time.`,
			ok: false,
			status: 504,
		};
	}
	const body = (await response.json().catch(() => null)) as
		| { error?: { message?: string }; message?: string }
		| null;
	if (!response.ok)
		return {
			message:
				body?.error?.message ??
				body?.message ??
				`Request failed (${response.status}).`,
			ok: false,
			status: response.status,
		};
	return { body: body as T, ok: true, status: response.status };
}

function outstandingCount(read: VerificationsRead | null): number {
	if (!read?.data) return 0;
	return read.data.reduce(
		(total, entry) => total + (entry.requested_information?.length ?? 0),
		0,
	);
}

function sceneOf(account: AccountRead, outstanding: number): CardScene {
	if (!account.capabilities?.card_issuing) return "unavailable";

	const status = account.cards?.status;
	if (!account.cards || !status) return "intro";
	if (status === "approved") return "approved";
	if (status === "needs_information") return "needs_resubmit";
	if (status === "needs_verification")
		return outstanding > 0 ? "needs_information" : "needs_identity";
	if (status === "denied" || status === "locked" || status === "canceled")
		return "declined";
	return "review";
}

function spendableOf(account: AccountRead): number | null {
	const usd = account.balances?.find((token) => token.symbol === "USD");
	const raw = usd?.breakdown?.spendable;
	if (raw == null) return null;
	const parsed = Number.parseFloat(raw);
	return Number.isFinite(parsed) ? parsed : null;
}

function sessionAccountId(accountId: string): string | undefined {
	return accountId.startsWith("biz_") ? accountId : undefined;
}

export const Route = createFileRoute("/api/cards")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const url = new URL(request.url);
				const accountId = url.searchParams.get("accountId") ?? "";
				if (!accountId.startsWith("biz_"))
					return badRequest("accountId must be a biz_ id.");

				const session = await resolveSession(request, sessionAccountId(accountId));
				if ("failure" in session)
					return signedOut("Sign in with Whop to continue.");

				const missing = missingScopes(session.tokens.scopes, READ_SCOPES);
				if (missing.length > 0)
					return persistSession(insufficient(missing), session);

				const account = await upstream<AccountRead>(
					session.tokens.accessToken,
					`/accounts/${accountId}`,
				);
				if (!account.ok)
					return persistSession(
						Response.json(
							{ error: { message: account.message, type: "upstream_error" } },
							{ status: account.status },
						),
						session,
					);

				const status = account.body.cards?.status;
				const collects =
					status === "needs_information" || status === "needs_verification";
				const verifications = collects
					? await upstream<VerificationsRead>(
							session.tokens.accessToken,
							`/verifications?account_id=${encodeURIComponent(accountId)}`,
						)
					: null;
				const outstanding = outstandingCount(
					verifications?.ok ? verifications.body : null,
				);

				return persistSession(
					Response.json(
						{
							appliesAsBusiness:
								account.body.verification?.business?.status === "approved",
							identityApproved: resolvedVerification(account.body) === "approved",
							kind: account.body.cards?.kind ?? null,
							outstanding,
							scene: sceneOf(account.body, outstanding),
							spendable: spendableOf(account.body),
							status: status ?? null,
						},
						{ headers: { "Cache-Control": "no-store" } },
					),
					session,
				);
			},

			POST: async ({ request }) => {
				const body = (await request.json().catch(() => null)) as {
					accountId?: unknown;
				} | null;
				const accountId =
					typeof body?.accountId === "string" ? body.accountId : "";
				if (!accountId.startsWith("biz_"))
					return badRequest("accountId must be a biz_ id.");

				const session = await resolveSession(request, sessionAccountId(accountId));
				if ("failure" in session)
					return signedOut("Sign in with Whop to continue.");

				const missing = missingScopes(session.tokens.scopes, APPLY_SCOPES);
				if (missing.length > 0)
					return persistSession(insufficient(missing), session);

				const applied = await upstream<{ object?: string; status?: string }>(
					session.tokens.accessToken,
					"/cards",
					{
						body: JSON.stringify({ account_id: accountId }),
						headers: { "Content-Type": "application/json" },
						method: "POST",
					},
				);

				if (!applied.ok)
					return persistSession(
						Response.json(
							{
								error: {
									message: applied.message,
									type: NO_IDENTITY.test(applied.message)
										? "identity_required"
										: "upstream_error",
								},
							},
							{ status: applied.status },
						),
						session,
					);

				return persistSession(
					Response.json(
						{ object: applied.body.object ?? null, status: applied.body.status ?? null },
						{ headers: { "Cache-Control": "no-store" } },
					),
					session,
				);
			},
		},
	},
});
