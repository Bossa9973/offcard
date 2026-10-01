import { createFileRoute } from "@tanstack/react-router";

import { persistSession, resolveSession, signedOut } from "../lib/session";
import {
	mapLimits,
	mapPayoutMethod,
	personalUsdOf,
	usdBalanceOf,
	type PayoutLimits,
	type SavedPayoutMethod,
} from "../lib/withdraw-map";
import { ownerOf, userHeaders, WHOP_API } from "../lib/whop";

const READ_SCOPES = [
	"payout:destination:read",
	"payout:withdrawal:read",
	"user:balance:read",
	"company:balance:read",
] as const;
const WRITE_SCOPES = ["payout:withdraw_funds"] as const;

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

function badRequest(message: string, type = "parameter_invalid"): Response {
	return Response.json({ error: { message, type } }, { status: 400 });
}

async function upstream<T>(
	accessToken: string,
	path: string,
	init: RequestInit = {},
): Promise<{ ok: true; status: number; body: T } | { ok: false; status: number; message: string; code?: string }> {
	const response = await fetch(`${WHOP_API}${path}`, {
		...init,
		headers: {
			...userHeaders(accessToken),
			...(init.headers ?? {}),
		},
	});
	const body = (await response.json().catch(() => null)) as {
		error?: { message?: string; code?: string };
		message?: string;
	} | null;
	if (!response.ok) {
		return {
			code: body?.error?.code,
			message:
				body?.error?.message ??
				body?.message ??
				`Request failed (${response.status}).`,
			ok: false,
			status: response.status,
		};
	}
	return { body: body as T, ok: true, status: response.status };
}

function ownerQuery(accountId: string): URLSearchParams {
	const owner = ownerOf(accountId);
	const params = new URLSearchParams();
	if ("user_id" in owner) params.set("user_id", owner.user_id);
	else params.set("account_id", owner.account_id);
	return params;
}

type OwnerSnapshot =
	| {
			ok: true;
			available: number;
			pending: number;
			payoutCountry?: string;
	  }
	| { ok: false; status: number; message: string };

async function loadPersonal(
	accessToken: string,
	accountId: string,
): Promise<OwnerSnapshot> {
	const me = await upstream<ViewerBalance>(accessToken, "/users/me");
	if (!me.ok) return me;
	if (me.body.id !== accountId)
		return {
			message: "That personal account is not the one you signed in as.",
			ok: false,
			status: 403,
		};
	return { ok: true, ...personalUsdOf(me.body.balance?.cash) };
}

async function loadEntity(
	accessToken: string,
	accountId: string,
): Promise<OwnerSnapshot> {
	const account = await upstream<AccountBalance>(
		accessToken,
		`/accounts/${accountId}`,
	);
	if (!account.ok) return account;
	const country = account.body.country;
	return {
		ok: true,
		...usdBalanceOf(account.body.balances),
		payoutCountry: country?.length === 2 ? country : undefined,
	};
}

interface ViewerBalance {
	id: string;
	balance?: {
		cash?: {
			currency: string;
			balance: number;
			pending_balance_usd: number;
			total_withdrawable_balance: number;
		}[];
	} | null;
}

interface AccountBalance {
	country?: string | null;
	balances?: {
		symbol: string;
		breakdown: { available: string; pending: string };
	}[];
}

export const Route = createFileRoute("/api/withdraw")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const url = new URL(request.url);
				const accountId = url.searchParams.get("accountId") ?? "";
				if (!accountId.startsWith("user_") && !accountId.startsWith("biz_"))
					return badRequest("accountId must be a user_ or biz_ id.");
				const scopedAccountId = sessionAccountId(accountId);

				const session = await resolveSession(request, scopedAccountId);
				if ("failure" in session)
					return signedOut("Sign in with Whop to continue.");
				const { tokens } = session;

				const missing = missingScopes(tokens.scopes, [
					...READ_SCOPES,
					...WRITE_SCOPES,
				]);
				if (missing.length > 0)
					return persistSession(insufficient(missing), session);

				const amount = url.searchParams.get("amount");
				const currency = url.searchParams.get("currency") ?? "usd";

				const methodsQuery = ownerQuery(accountId);
				methodsQuery.set("include_limits", "true");
				methodsQuery.set("first", "50");
				methodsQuery.set("currency", currency);
				if (amount) methodsQuery.set("amount", amount);

				const personal = accountId.startsWith("user_");
				const [owner, methods] = await Promise.all([
					personal
						? loadPersonal(tokens.accessToken, accountId)
						: loadEntity(tokens.accessToken, accountId),
					upstream<{ data?: SavedPayoutMethod[]; limits?: PayoutLimits }>(
						tokens.accessToken,
						`/payouts/methods?${methodsQuery}`,
					),
				]);

				if (!owner.ok) {
					const response = Response.json(
						{ error: { message: owner.message, type: "upstream_error" } },
						{ headers: { "Cache-Control": "no-store" }, status: owner.status },
					);
					return persistSession(response, session);
				}

				if (!methods.ok) {
					const response = Response.json(
						{ error: { message: methods.message, type: "upstream_error" } },
						{ headers: { "Cache-Control": "no-store" }, status: methods.status },
					);
					return persistSession(response, session);
				}

				const { available, pending, payoutCountry } = owner;

				const response = Response.json(
					{
						available,
						limits: mapLimits(methods.body.limits),
						methods: (methods.body.data ?? []).map(mapPayoutMethod),
						payoutCountry,
						pending,
					},
					{ headers: { "Cache-Control": "no-store" } },
				);
				return persistSession(response, session);
			},

			POST: async ({ request }) => {
				let body: {
					accountId?: unknown;
					amount?: unknown;
					currency?: unknown;
					payoutMethodId?: unknown;
					speed?: unknown;
					notes?: unknown;
					acknowledgeBankWarning?: unknown;
				};
				try {
					body = (await request.json()) as typeof body;
				} catch {
					return badRequest("Expected a JSON body.", "invalid_json");
				}

				const accountId = typeof body.accountId === "string" ? body.accountId : "";
				if (!accountId.startsWith("user_") && !accountId.startsWith("biz_"))
					return badRequest("accountId must be a user_ or biz_ id.");
				if (typeof body.amount !== "number" || !Number.isFinite(body.amount))
					return badRequest("amount must be a number.");
				if (typeof body.payoutMethodId !== "string" || !body.payoutMethodId)
					return badRequest("payoutMethodId is required.");

				const scopedAccountId = sessionAccountId(accountId);
				const session = await resolveSession(request, scopedAccountId);
				if ("failure" in session)
					return signedOut("Sign in with Whop to continue.");
				const { tokens } = session;

				const missing = missingScopes(tokens.scopes, WRITE_SCOPES);
				if (missing.length > 0)
					return persistSession(insufficient(missing), session);

				if (accountId.startsWith("user_")) {
					const me = await upstream<ViewerBalance>(tokens.accessToken, "/users/me");
					if (!me.ok)
						return signedOut("Sign in with Whop to continue.");
					if (me.body.id !== accountId)
						return Response.json(
							{
								error: {
									message: "That personal account is not the one you signed in as.",
									type: "forbidden",
								},
							},
							{ status: 403 },
						);
				}

				const created = await upstream<{ id: string }>(
					tokens.accessToken,
					"/payouts",
					{
						body: JSON.stringify({
							...ownerOf(accountId),
							amount: body.amount,
							currency: typeof body.currency === "string" ? body.currency : "usd",
							payout_method_id: body.payoutMethodId,
							...(body.speed === "instant" || body.speed === "standard"
								? { speed: body.speed }
								: {}),
							...(typeof body.notes === "string" ? { notes: body.notes } : {}),
							...(typeof body.acknowledgeBankWarning === "boolean"
								? { acknowledge_bank_warning: body.acknowledgeBankWarning }
								: {}),
						}),
						headers: { "Idempotency-Key": crypto.randomUUID() },
						method: "POST",
					},
				);

				if (!created.ok) {
					const response = Response.json(
						{
							bankWarning: created.code === "bank_warning_not_acknowledged",
							error: {
								code: created.code,
								message: created.message,
								type: "upstream_error",
							},
						},
						{ headers: { "Cache-Control": "no-store" }, status: created.status },
					);
					return persistSession(response, session);
				}

				const response = Response.json(
					{ payout: { id: created.body.id } },
					{ headers: { "Cache-Control": "no-store" }, status: 201 },
				);
				return persistSession(response, session);
			},
		},
	},
});

function sessionAccountId(accountId: string): string | undefined {
	return accountId.startsWith("biz_") ? accountId : undefined;
}

