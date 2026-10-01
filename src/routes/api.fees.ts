import { createFileRoute } from "@tanstack/react-router";
import {
	FEE_OPTIONS,
	markupFor,
	markupPatch,
	validMarkup,
	type ChildMarkups,
} from "../lib/account-fees";
import { persistSession, resolveSession, signedOut } from "../lib/session";
import { userHeaders, WHOP_API } from "../lib/whop";
import { USERINFO_URL } from "../lib/oauth";

declare const process: { env: Record<string, string | undefined> };

async function handleFees(request: Request): Promise<Response> {
	const accountId = new URL(request.url).searchParams.get("accountId");
	const session = await resolveSession(request, accountId ?? undefined);
	if ("failure" in session)
		return signedOut("Sign in with Whop to manage fees.");
	const reply = (body: unknown, status = 200) =>
		persistSession(
			Response.json(body, {
				status,
				headers: { "Cache-Control": "no-store" },
			}),
			session,
		);
	const error = (message: string, status: number) =>
		reply({ error: { message } }, status);
	if (
		request.method === "PATCH" &&
		request.headers.get("origin") !== new URL(request.url).origin
	) {
		return error("This request must come from the neobank.", 403);
	}
	if (!accountId || !/^biz_[a-zA-Z0-9]+$/.test(accountId))
		return error("A valid account is required.", 400);
	try {
		const headers = {
			"Content-Type": "application/json",
			Accept: "application/json",
			"Api-Version-Date": "2026-09-15",
			...(process.env.WHOP_API_KEY
				? { Authorization: `Bearer ${process.env.WHOP_API_KEY}` }
				: {}),
		};
		const parentResponse = await fetch(`${WHOP_API}/accounts/me`, { headers });
		if (!parentResponse.ok)
			return error("Could not identify this neobank. Please try again.", 502);
		const parent = (await parentResponse.json()) as {
			id?: string;
			owner?: { id?: string };
		};
		if (parent.id !== accountId)
			return error("Only the neobank owner can manage its default fees.", 403);
		const viewerResponse = await fetch(USERINFO_URL, {
			headers: userHeaders(session.tokens.accessToken),
		});
		if (!viewerResponse.ok)
			return error(
				"Could not verify your identity. Sign in with Whop again.",
				viewerResponse.status === 401 ? 401 : 502,
			);
		const viewer = (await viewerResponse.json()) as { sub?: string };
		if (!viewer.sub)
			return error(
				"Could not verify your signed-in identity. Please try again.",
				502,
			);
		if (parent.owner?.id !== viewer.sub) {
			let isTeamOwner = false;
			let after: string | undefined;
			for (let page = 0; page < 10; page += 1) {
				const teamUrl = new URL(`${WHOP_API}/team_members`);
				teamUrl.searchParams.set("account_id", accountId);
				teamUrl.searchParams.set("user_id", viewer.sub);
				teamUrl.searchParams.set("role", "owner");
				teamUrl.searchParams.set("status", "joined");
				teamUrl.searchParams.set("first", "50");
				if (after) teamUrl.searchParams.set("after", after);
				const teamResponse = await fetch(teamUrl, { headers });
				if (!teamResponse.ok)
					return error(
						"Could not verify your team role. Check the neobank API key can read team members and try again.",
						502,
					);
				const team = (await teamResponse.json()) as {
					data?: Array<{
						account_id?: string;
						user?: { id?: string } | null;
						role?: string;
						status?: string;
					}>;
					page_info?: { has_next_page?: boolean; end_cursor?: string | null };
				};
				isTeamOwner =
					team.data?.some(
						(member) =>
							member.account_id === accountId &&
							member.user?.id === viewer.sub &&
							member.role === "owner" &&
							member.status === "joined",
					) === true;
				if (isTeamOwner || !team.page_info?.has_next_page) break;
				if (
					!team.page_info.end_cursor ||
					team.page_info.end_cursor === after ||
					page === 9
				)
					return error(
						"Could not finish verifying your team role. Please try again.",
						502,
					);
				after = team.page_info.end_cursor;
			}
			if (!isTeamOwner)
				return error(
					"Only the neobank owner or an active Owner-role team member can manage its default fees.",
					403,
				);
		}
		const url = `${WHOP_API}/accounts/${accountId}/fees`;
		const currentResponse = await fetch(url, { headers });
		if (!currentResponse.ok)
			return error(
				currentResponse.status === 403
					? "The neobank API key needs permission to manage connected-account fees (company:update_child_fees). Reconnecting with Whop will not fix this."
					: "Could not load fee settings. Please try again.",
				currentResponse.status,
			);
		const current = (await currentResponse.json()) as {
			account_id: string;
			child_markups: ChildMarkups | null;
		};
		if (current.account_id !== accountId)
			return error("Could not verify the fee account.", 502);
		if (request.method === "GET")
			return reply({
				account_id: accountId,
				child_markups: current.child_markups,
			});
		let body: unknown;
		try {
			body = await request.json();
		} catch {
			return error("Expected a JSON body.", 400);
		}
		if (!body || typeof body !== "object" || Array.isArray(body))
			return error("Invalid fee update.", 400);
		const { category, key, value, ...extra } = body as Record<string, unknown>;
		if (Object.keys(extra).length)
			return error("Unknown fee update fields.", 400);
		const option = FEE_OPTIONS.find(
			(candidate) => candidate.category === category && candidate.key === key,
		);
		if (!option || !current.child_markups)
			return error("This markup is not available.", 400);
		const markup = markupFor(current.child_markups, option);
		if (!markup?.adjustable)
			return error(
				"The neobank API key does not have permission to change this markup (company:update_child_fees). Reconnecting with Whop will not fix this.",
				403,
			);
		if (!validMarkup(value, markup))
			return error(
				"Enter valid non-negative fees within the permitted limits.",
				400,
			);
		const updatedResponse = await fetch(url, {
			method: "PATCH",
			headers,
			body: JSON.stringify(markupPatch(option, value)),
		});
		const updated = (await updatedResponse.json()) as {
			account_id?: string;
			child_markups?: ChildMarkups | null;
			error?: { message?: string };
		};
		if (!updatedResponse.ok)
			return error(
				updated.error?.message ?? "Could not save the fee. Please try again.",
				updatedResponse.status,
			);
		if (updated.account_id !== accountId || !updated.child_markups)
			return error(
				"The update completed, but the fee settings could not be read. Reload before trying again.",
				502,
			);
		return reply({
			account_id: accountId,
			child_markups: updated.child_markups,
		});
	} catch {
		return error(
			"Could not reach fee settings. Reload to check the latest values before trying again.",
			502,
		);
	}
}

export const Route = createFileRoute("/api/fees")({
	server: {
		handlers: {
			GET: ({ request }) => handleFees(request),
			PATCH: ({ request }) => handleFees(request),
		},
	},
});
