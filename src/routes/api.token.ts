import { createFileRoute } from "@tanstack/react-router";

import { NO_INJECT, SCOPES, USERINFO_URL } from "../lib/oauth";
import { persistSession, resolveSession, signedOut } from "../lib/session";

declare const process: { env: Record<string, string | undefined> };

const API = `${process.env.WHOP_API_ORIGIN ?? "https://api.whop.com"}/api/v1`;
const API_VERSION_DATE = "2026-08-03";

// Every element on the page signs with one token, so it carries the whole grant minus the
// OIDC scopes, which only identify the sign-in and cannot be scoped onto an access token.
const SIGNABLE_ACTIONS = SCOPES.filter(
	(scope) => scope !== "openid" && scope !== "profile" && scope !== "email",
);

// The hosting edge injects the app's own company key on every api.whop.com hop, which would
// replace the user's bearer with one that cannot sign money-out.
function userHeaders(accessToken: string): HeadersInit {
	return {
		...NO_INJECT,
		Accept: "application/json",
		"Api-Version-Date": API_VERSION_DATE,
		Authorization: `Bearer ${accessToken}`,
	};
}

export const Route = createFileRoute("/api/token")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				let accountId: unknown;
				try {
					({ accountId } = (await request.json()) as { accountId?: unknown });
				} catch {
					return Response.json(
						{ error: { message: "Expected a JSON body.", type: "invalid_json" } },
						{ status: 400 },
					);
				}
				if (
					accountId !== undefined &&
					(typeof accountId !== "string" || !accountId.startsWith("biz_"))
				)
					return Response.json(
						{
							error: {
								message: "accountId must be a biz_ account ID.",
								type: "parameter_invalid",
							},
						},
						{ status: 400 },
					);

				const scopedAccountId = accountId as string | undefined;
				const session = await resolveSession(request, scopedAccountId);
				if ("failure" in session)
					return signedOut("Sign in with Whop to continue.");
				const { tokens } = session;

				// The grant is the ceiling: asking for an action it does not include fails the whole
				// mint, so sign only what was granted. Refusing instead would brick sign-in on any
				// scope Whop will not grant this app — the caller reconsents, comes back missing the
				// same scope, and loops. A surface that needs a missing action fails on that call.
				const signable = SIGNABLE_ACTIONS.filter((action) =>
					tokens.scopes.includes(action),
				);
				if (signable.length === 0)
					return Response.json(
						{
							error: {
								message: "Your sign-in granted none of the actions this app needs.",
								type: "insufficient_scope",
							},
						},
						{ headers: { "Cache-Control": "no-store" }, status: 403 },
					);

				let resolvedAccountId = scopedAccountId;
				if (!resolvedAccountId) {
					const who = await fetch(USERINFO_URL, {
						headers: userHeaders(tokens.accessToken),
					});
					if (!who.ok)
						return persistSession(signedOut("Could not read your Whop profile."), session);
					const { sub } = (await who.json()) as { sub: string };
					resolvedAccountId = sub;
				}

				// The user is derived from the OAuth token, so no company_id or user_id is sent.
				const minted = await fetch(`${API}/access_tokens`, {
					body: JSON.stringify({ scoped_actions: signable }),
					headers: userHeaders(tokens.accessToken),
					method: "POST",
				});

				if (!minted.ok) {
					if (minted.status === 401)
						return persistSession(signedOut("Sign in with Whop to continue."), session);
					const body = (await minted.json().catch(() => null)) as {
						error?: { message?: string };
					} | null;
					return Response.json(
						{
							error: {
								message:
									body?.error?.message ?? `Token request failed (${minted.status}).`,
								type: "upstream_error",
							},
						},
						{ headers: { "Cache-Control": "no-store" }, status: minted.status },
					);
				}

				const { token, expires_at } = (await minted.json()) as {
					token: string;
					expires_at: string;
				};

				const response = Response.json(
					{
						accountId: resolvedAccountId,
						canReadPayments: signable.includes("payment:basic:read"),
						expiresAt: expires_at,
						signedIn: true,
						token,
					},
					{ headers: { "Cache-Control": "no-store" } },
				);
				return persistSession(response, session);
			},
		},
	},
});
