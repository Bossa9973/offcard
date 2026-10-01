import { createFileRoute } from "@tanstack/react-router";

import { NO_INJECT, USERINFO_URL } from "../lib/oauth";
import { persistSession, resolveSession, signedOut } from "../lib/session";

declare const process: { env: Record<string, string | undefined> };

const API = `${process.env.WHOP_API_ORIGIN ?? "https://api.whop.com"}/api/v1`;
const API_VERSION_DATE = "2026-08-03";

export interface Entity {
	id: string;
	name: string;
	imageUrl: string | null;
	kind: "entity" | "overview";
}

interface Viewer {
	id: string;
	name?: string | null;
	username?: string | null;
	email?: string | null;
	profile_picture?: { url?: string | null } | null;
}

interface AccountRow {
	id: string;
	title?: string | null;
	logo_url?: string | null;
	parent_account?: { id?: string | null } | null;
}

function isLiveNeobankChild(
	account: AccountRow,
	parentId: string,
	liveCompanyIds: Set<string>,
): boolean {
	return account.parent_account?.id === parentId && liveCompanyIds.has(account.id);
}

// Page size is `first`, capped at 50. An unrecognised query parameter is dropped rather than
// refused, so the `limit=50` this used to send read the endpoint's default page of ten.
const PAGE_SIZE = 50;
const MAX_PAGES = 10;

function userHeaders(accessToken: string): HeadersInit {
	return {
		...NO_INJECT,
		Accept: "application/json",
		"Api-Version-Date": API_VERSION_DATE,
		Authorization: `Bearer ${accessToken}`,
	};
}

function parentHeaders(): HeadersInit {
	const key = process.env.WHOP_API_KEY;
	return {
		"Content-Type": "application/json",
		Accept: "application/json",
		"Api-Version-Date": API_VERSION_DATE,
		...(key ? { Authorization: `Bearer ${key}` } : {}),
	};
}

async function viewerOf(accessToken: string): Promise<Viewer | null> {
	const response = await fetch(`${API}/users/me`, {
		headers: userHeaders(accessToken),
	});
	if (!response.ok) return null;
	return (await response.json()) as Viewer;
}

// Every account the viewer is on a team of, entity or not — the viewer's own token, so the list
// can never contain someone else's entity. null means the read failed, which callers must not
// confuse with "belongs to nothing".
async function listAccounts(headers: HeadersInit): Promise<AccountRow[] | null> {
	const rows: AccountRow[] = [];
	let after: string | undefined;

	for (let page = 0; page < MAX_PAGES; page += 1) {
		const url = new URL(`${API}/accounts`);
		url.searchParams.set("first", String(PAGE_SIZE));
		if (after) url.searchParams.set("after", after);

		const response = await fetch(url, { headers });
		if (!response.ok) return null;

		const body = (await response.json()) as {
			data?: AccountRow[];
			page_info?: { has_next_page?: boolean; end_cursor?: string | null };
		};
		rows.push(...(body.data ?? []));

		const next = body.page_info;
		if (!next?.has_next_page || !next.end_cursor) return rows;
		after = next.end_cursor;
	}

	return rows;
}

// Deleting a Whop company does not delete its financial Account record. The Accounts API can
// therefore keep returning a row whose status is still `active`; the Companies API is the
// canonical source for whether the connected company itself still exists.
async function listLiveCompanyIds(
	parentId: string,
): Promise<Set<string> | null> {
	const ids = new Set<string>();
	let after: string | undefined;

	for (let page = 0; page < MAX_PAGES; page += 1) {
		const url = new URL(`${API}/companies`);
		url.searchParams.set("first", String(PAGE_SIZE));
		url.searchParams.set("parent_company_id", parentId);
		if (after) url.searchParams.set("after", after);

		const response = await fetch(url, { headers: parentHeaders() });
		if (!response.ok) return null;

		const body = (await response.json()) as {
			data?: Array<{ id?: string }>;
			page_info?: { has_next_page?: boolean; end_cursor?: string | null };
		};
		for (const company of body.data ?? []) {
			if (company.id) ids.add(company.id);
		}

		const next = body.page_info;
		if (!next?.has_next_page || !next.end_cursor) return ids;
		after = next.end_cursor;
	}

	return ids;
}

// Which parent an account hangs off is what makes it an entity of THIS neobank rather than some
// other platform's connected account, so the parent has to be named. `me` resolves to whichever
// account the key belongs to.
async function neobankAccount(): Promise<{
	id: string;
	title?: string | null;
	logo_url?: string | null;
} | null> {
	const response = await fetch(`${API}/accounts/me`, {
		headers: parentHeaders(),
	});
	if (!response.ok) return null;
	const body = (await response.json()) as {
		id?: string;
		title?: string | null;
		logo_url?: string | null;
	};
	return body.id ? { id: body.id, logo_url: body.logo_url, title: body.title } : null;
}

async function canReadParentBalance(
	accessToken: string,
	parentId: string,
): Promise<boolean> {
	const response = await fetch(`${API}/accounts/${encodeURIComponent(parentId)}`, {
		headers: userHeaders(accessToken),
	});
	if (!response.ok) return false;
	const body = (await response.json()) as { total_usd?: string | null };
	return body.total_usd != null;
}

export const Route = createFileRoute("/api/entities")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const session = await resolveSession(request);
				if ("failure" in session)
					return signedOut("Sign in with Whop to continue.");
				const { tokens } = session;

				const viewerPromise = viewerOf(tokens.accessToken).catch(() => null);
				const parent = await neobankAccount();
				if (parent === null)
					return Response.json(
						{
							entities: [],
							error: {
								message: "Could not load your entities. Try again in a moment.",
								type: "upstream_error",
							},
						},
						{ headers: { "Cache-Control": "no-store" } },
					);

				// Membership, not money: /users/me's `balance.businesses` omits every account whose
				// balance rounds to zero (Users::CalculateOwnedBusinessBalances), so filtering on it
				// hid each new entity until someone funded it.
				const [{ accounts, operator }, liveCompanyIds, viewer] = await Promise.all([
					(async () => {
						const operator = await canReadParentBalance(tokens.accessToken, parent.id);
						const accounts = await listAccounts(
							operator ? parentHeaders() : userHeaders(tokens.accessToken),
						);
						return { accounts, operator };
					})(),
					listLiveCompanyIds(parent.id),
					viewerPromise,
				]);

				// A half-failed read renders identically to owning nothing, which is the bug this
				// list keeps producing — so say the entities could not be loaded rather than
				// showing an empty picker that invites a duplicate entity.
				if (accounts === null || liveCompanyIds === null)
					return Response.json(
						{
							entities: [],
							error: {
								message: "Could not load your entities. Try again in a moment.",
								type: "upstream_error",
							},
						},
						{ headers: { "Cache-Control": "no-store" } },
					);

				const entities: Entity[] = accounts
					.filter((account) => isLiveNeobankChild(account, parent.id, liveCompanyIds))
					.map((account) => ({
						id: account.id,
						imageUrl: account.logo_url ?? null,
						kind: "entity" as const,
						name: account.title || account.id,
					}));

				const overview: Entity[] = operator
					? [
							{
								id: parent.id,
								imageUrl: parent.logo_url ?? null,
								kind: "overview" as const,
								name: parent.title || "Overview",
							},
						]
					: [];

				const answer = Response.json(
					{ entities: [...overview, ...entities], viewerName: viewer?.name?.trim() || viewer?.username?.trim() || null },
					{ headers: { "Cache-Control": "no-store" } },
				);
				return persistSession(answer, session);
			},

			POST: async ({ request }) => {
				const session = await resolveSession(request);
				if ("failure" in session)
					return signedOut("Sign in with Whop to continue.");
				const { tokens } = session;

				let name: unknown;
				let ownerEmail: unknown;
				try {
					({ email: ownerEmail, name } = (await request.json()) as {
						email?: unknown;
						name?: unknown;
					});
				} catch {
					return Response.json(
						{ error: { message: "Expected a JSON body.", type: "invalid_json" } },
						{ status: 400 },
					);
				}
				const requestedTitle = typeof name === "string" ? name.trim() : "";
				if (name !== undefined && !requestedTitle)
					return Response.json(
						{ error: { message: "name is required.", type: "parameter_invalid" } },
						{ status: 400 },
					);

				// The email comes from the viewer's own token and the external_id is generated
				// here. Both decide OWNERSHIP: a client that could name either could mint an
				// entity belonging to someone else, or hijack theirs by reusing its id.
				// /users/me carries it under user:email:read; /oauth/userinfo is the fallback for
				// a grant that only has the OIDC email scope.
				const viewer = await viewerOf(tokens.accessToken);
				const invitedEmail =
					typeof ownerEmail === "string" && ownerEmail.trim() ? ownerEmail.trim() : undefined;
				if (invitedEmail && !requestedTitle)
					return Response.json(
						{ error: { message: "name is required for invitations.", type: "parameter_invalid" } },
						{ status: 400 },
					);
				const parent = await neobankAccount();
				if (!parent)
					return Response.json(
						{
							error: {
								message: "Could not identify this neobank. Try again in a moment.",
								type: "upstream_error",
							},
						},
						{ status: 502 },
					);
				const ownsParent = await canReadParentBalance(tokens.accessToken, parent.id);

				if (invitedEmail && !ownsParent)
					return Response.json(
						{
							error: {
								message: "Only the parent account's owner can invite a consumer.",
								type: "forbidden",
							},
						},
						{ status: 403 },
					);

				if (!ownsParent) {
					const [mine, liveCompanyIds] = await Promise.all([
						listAccounts(userHeaders(tokens.accessToken)),
						listLiveCompanyIds(parent.id),
					]);
					if (mine === null || liveCompanyIds === null)
						return Response.json(
							{
								error: {
									message: "Could not check your existing accounts. Try again in a moment.",
									type: "upstream_error",
								},
							},
							{ status: 502 },
						);
					const existing = mine.find((account) =>
						isLiveNeobankChild(account, parent.id, liveCompanyIds),
					);
					if (existing && name === undefined)
						return persistSession(Response.json({
							entity: {
								id: existing.id,
								imageUrl: existing.logo_url ?? null,
								kind: "entity",
								name: existing.title || existing.id,
							},
						}, { headers: { "Cache-Control": "no-store" } }), session);
					if (existing)
						return Response.json(
							{
								error: {
									message: "You already have an account on this neobank.",
									type: "forbidden",
								},
							},
							{ status: 403 },
						);
				}

				let email = invitedEmail ?? viewer?.email ?? undefined;
				let accountOwnerName = viewer?.username?.trim() || viewer?.name?.trim();
				let userinfoStatus: number | undefined;

				if (!email && !invitedEmail) {
					const who = await fetch(USERINFO_URL, {
						headers: userHeaders(tokens.accessToken),
					});
					userinfoStatus = who.status;
					if (who.ok) {
						const userinfo = (await who.json()) as {
							email?: string;
							preferred_username?: string;
							name?: string;
						};
						email = userinfo.email;
						accountOwnerName ||= userinfo.preferred_username?.trim() || userinfo.name?.trim();
					}
				}

				if (!email)
					return Response.json(
						{
							error: {
								message:
									"This app needs permission to read your email before it can attribute a new entity to you.",
								type: "insufficient_scope",
							},
							needsReauth: true,
							// Whether the scope was never granted or was granted and still yields
							// nothing are different bugs with the same symptom, so say which.
							diagnostics: {
								grantedScopes: tokens.scopes,
								hasEmailScope: tokens.scopes.includes("user:email:read"),
								usersMeReturnedViewer: viewer !== null,
								userinfoStatus,
							},
						},
						{ status: 403 },
					);

				const title = requestedTitle || (accountOwnerName ? `${accountOwnerName}'s account` : "Personal account");
				const externalId = name === undefined && !invitedEmail
					? `nb_${Array.from(new Uint8Array(await crypto.subtle.digest(
						"SHA-256",
						new TextEncoder().encode(`${parent.id}:${email.trim().toLowerCase()}`),
					))).map((byte) => byte.toString(16).padStart(2, "0")).join("")}`
					: `nb_${crypto.randomUUID()}`;
				const created = await fetch(`${API}/accounts`, {
					body: JSON.stringify({
						...(invitedEmail && viewer?.username ? { affiliate_code: viewer.username } : {}),
						email,
						metadata: { external_id: externalId },
						title,
					}),
					headers: parentHeaders(),
					method: "POST",
				});

				if (!created.ok) {
					const body = (await created.json().catch(() => null)) as {
						error?: { message?: string };
						message?: string;
					} | null;
					const message = body?.error?.message ?? body?.message;
					if (created.status === 403 && message?.includes("company:create_child"))
						return Response.json(
							{
								error: {
									message: "This neobank is not configured to open accounts yet. The operator needs to enable account creation. Signing in again will not fix this.",
									type: "configuration_error",
								},
							},
							{ status: 503, headers: { "Cache-Control": "no-store" } },
						);
					return Response.json(
						{
							error: {
								message:
									body?.error?.message ??
									body?.message ??
									`Could not create the entity (${created.status}).`,
								type: "upstream_error",
							},
						},
						{ status: created.status },
					);
				}

				const account = (await created.json()) as { id: string; title?: string };
				const answer = Response.json(
					{
						entity: {
							id: account.id,
							imageUrl: null,
							kind: "entity",
							name: account.title ?? title,
						},
					},
					{ headers: { "Cache-Control": "no-store" }, status: 201 },
				);
				return persistSession(answer, session);
			},
		},
	},
});
