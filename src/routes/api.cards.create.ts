import { createFileRoute } from "@tanstack/react-router";

import { NO_INJECT, USERINFO_URL } from "../lib/oauth";
import { persistSession, resolveSession, signedOut } from "../lib/session";
import { WHOP_API } from "../lib/whop";

const CARD_API_VERSION_DATE = "2026-08-25-2";
const TEAM_READ_SCOPES = ["company:authorized_user:read"] as const;
const CARD_CREATE_SCOPES = ["payout:account:update"] as const;
const PAGE_SIZE = 100;
const MAX_PAGES = 10;
const UPSTREAM_TIMEOUT_MS = 8_000;

type SpendLimitFrequency = "daily" | "monthly" | "one_time" | "weekly";

interface TeamMemberRow {
	id?: string;
	is_agent?: boolean;
	status?: string;
	user?: {
		id?: string;
		name?: string | null;
		profile_picture?: { url?: string | null } | null;
		username?: string | null;
	} | null;
}

export interface CardTeamMember {
	id: string;
	imageUrl: string | null;
	name: string | null;
	username: string;
}

function sessionAccountId(accountId: string): string | undefined {
	return accountId.startsWith("biz_") ? accountId : undefined;
}

function cardHeaders(accessToken: string): HeadersInit {
	return {
		...NO_INJECT,
		Accept: "application/json",
		"Api-Version-Date": CARD_API_VERSION_DATE,
		Authorization: `Bearer ${accessToken}`,
	};
}

function badRequest(message: string): Response {
	return Response.json(
		{ error: { message, type: "parameter_invalid" } },
		{ headers: { "Cache-Control": "no-store" }, status: 400 },
	);
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

async function viewerIdOf(accessToken: string): Promise<string | null> {
	const apiViewer = await fetch(`${WHOP_API}/users/me`, {
		headers: cardHeaders(accessToken),
		signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
	}).catch(() => null);
	if (apiViewer?.ok) {
		const body = (await apiViewer.json().catch(() => null)) as { id?: string } | null;
		if (body?.id?.startsWith("user_")) return body.id;
	}

	const oidcViewer = await fetch(USERINFO_URL, {
		headers: { ...NO_INJECT, Authorization: `Bearer ${accessToken}` },
		signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
	}).catch(() => null);
	if (!oidcViewer?.ok) return null;
	const body = (await oidcViewer.json().catch(() => null)) as
		| { id?: string; sub?: string }
		| null;
	const id = body?.id ?? body?.sub;
	return id?.startsWith("user_") ? id : null;
}

async function listTeamMembers(
	accessToken: string,
	accountId: string,
): Promise<
	| { ok: true; members: CardTeamMember[] }
	| { ok: false; message: string; status: number }
> {
	const members: CardTeamMember[] = [];
	let after: string | undefined;

	for (let page = 0; page < MAX_PAGES; page += 1) {
		const url = new URL(`${WHOP_API}/team_members`);
		url.searchParams.set("account_id", accountId);
		url.searchParams.set("direction", "desc");
		url.searchParams.set("first", String(PAGE_SIZE));
		url.searchParams.set("status", "joined");
		if (after) url.searchParams.set("after", after);

		const response = await fetch(url, {
			headers: cardHeaders(accessToken),
			signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
		}).catch(() => null);
		if (!response)
			return { message: "Whop did not answer the team member request.", ok: false, status: 504 };
		const body = (await response.json().catch(() => null)) as
			| {
					data?: TeamMemberRow[];
					error?: { message?: string };
					page_info?: { end_cursor?: string | null; has_next_page?: boolean };
			  }
			| null;
		if (!response.ok)
			return {
				message: body?.error?.message ?? `Could not load team members (${response.status}).`,
				ok: false,
				status: response.status,
			};

		for (const member of body?.data ?? []) {
			if (member.status !== "joined" || member.is_agent || !member.user?.id) continue;
			members.push({
				id: member.user.id,
				imageUrl: member.user.profile_picture?.url ?? null,
				name: member.user.name ?? null,
				username: member.user.username ?? member.user.id,
			});
		}

		const pageInfo = body?.page_info;
		if (!pageInfo?.has_next_page || !pageInfo.end_cursor)
			return { members, ok: true };
		if (pageInfo.end_cursor === after)
			return { message: "Team members pagination repeated a cursor.", ok: false, status: 502 };
		after = pageInfo.end_cursor;
	}

	return { message: "The team member list exceeded the supported page limit.", ok: false, status: 502 };
}

function isFrequency(value: unknown): value is SpendLimitFrequency {
	return value === "daily" || value === "weekly" || value === "monthly" || value === "one_time";
}

export const Route = createFileRoute("/api/cards/create")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const accountId = new URL(request.url).searchParams.get("accountId") ?? "";
				if (!accountId.startsWith("biz_")) return badRequest("accountId must be a biz_ id.");

				const session = await resolveSession(request, sessionAccountId(accountId));
				if ("failure" in session) return signedOut("Sign in with Whop to continue.");
				const missing = missingScopes(session.tokens.scopes, TEAM_READ_SCOPES);
				if (missing.length > 0)
					return persistSession(insufficient(missing), session);

				const [team, viewerId] = await Promise.all([
					listTeamMembers(session.tokens.accessToken, accountId),
					viewerIdOf(session.tokens.accessToken),
				]);
				if (!team.ok)
					return persistSession(
						Response.json(
							{ error: { message: team.message, type: "upstream_error" } },
							{ headers: { "Cache-Control": "no-store" }, status: team.status },
						),
						session,
					);

				return persistSession(
					Response.json(
						{ members: team.members, viewerId },
						{ headers: { "Cache-Control": "no-store" } },
					),
					session,
				);
			},

			POST: async ({ request }) => {
				const body = (await request.json().catch(() => null)) as
					| {
							accountId?: unknown;
							assignedUserId?: unknown;
							name?: unknown;
							spendLimit?: unknown;
							spendLimitFrequency?: unknown;
							transactionLimit?: unknown;
					  }
					| null;
				const accountId = typeof body?.accountId === "string" ? body.accountId : "";
				const assignedUserId =
					typeof body?.assignedUserId === "string" ? body.assignedUserId : "";
				const name = typeof body?.name === "string" ? body.name.trim() : "";
				if (!accountId.startsWith("biz_")) return badRequest("accountId must be a biz_ id.");
				if (assignedUserId && !assignedUserId.startsWith("user_"))
					return badRequest("Choose a team member for this card.");
				if (!name || name.length > 30)
					return badRequest("Card name must be between 1 and 30 characters.");

				const spendLimit = typeof body?.spendLimit === "number" ? body.spendLimit : undefined;
				const transactionLimit =
					typeof body?.transactionLimit === "number" ? body.transactionLimit : undefined;
				if (spendLimit !== undefined && (!Number.isFinite(spendLimit) || spendLimit <= 0))
					return badRequest("Spending limit must be greater than zero.");
				if (
					transactionLimit !== undefined &&
					(!Number.isFinite(transactionLimit) || transactionLimit <= 0)
				)
					return badRequest("Per-transaction limit must be greater than zero.");
				if (spendLimit !== undefined && !isFrequency(body?.spendLimitFrequency))
					return badRequest("Choose a valid spending limit frequency.");

				const session = await resolveSession(request, sessionAccountId(accountId));
				if ("failure" in session) return signedOut("Sign in with Whop to continue.");
				const missing = missingScopes(session.tokens.scopes, CARD_CREATE_SCOPES);
				if (missing.length > 0)
					return persistSession(insufficient(missing), session);

				const response = await fetch(`${WHOP_API}/cards`, {
					body: JSON.stringify({
						account_id: accountId,
						...(assignedUserId ? { assigned_user_id: assignedUserId } : {}),
						name,
						...(spendLimit !== undefined
							? {
									spend_limit: spendLimit,
									spend_limit_frequency: body?.spendLimitFrequency,
								}
							: {}),
						...(transactionLimit !== undefined
							? { transaction_limit: transactionLimit }
							: {}),
					}),
					headers: cardHeaders(session.tokens.accessToken),
					method: "POST",
					signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
				}).catch(() => null);
				if (!response)
					return persistSession(
						Response.json(
							{ error: { message: "Whop did not answer the card request.", type: "upstream_error" } },
							{ status: 504 },
						),
						session,
					);

				const result = (await response.json().catch(() => null)) as
					| { error?: { message?: string }; message?: string; object?: string }
					| null;
				if (!response.ok)
					return persistSession(
						Response.json(
							{
								error: {
									message:
										result?.error?.message ??
										result?.message ??
										`Could not create card (${response.status}).`,
									type: "upstream_error",
								},
							},
							{ headers: { "Cache-Control": "no-store" }, status: response.status },
						),
						session,
					);

				return persistSession(
					Response.json(result, {
						headers: { "Cache-Control": "no-store" },
						status: response.status,
					}),
					session,
				);
			},
		},
	},
});
