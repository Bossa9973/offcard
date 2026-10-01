import { createFileRoute } from "@tanstack/react-router";

import {
	appId,
	clientSecret,
	clearCookie,
	COOKIE,
	NO_INJECT,
	readCookie,
	redirectUri,
	setCookie,
	TOKEN_URL,
	tokenCookie,
	type StoredTokens,
} from "../lib/oauth";
import { isSafeReturnPath } from "../lib/login";

function nonceOf(idToken: string): string | null {
	const payload = idToken.split(".")[1];
	if (!payload) return null;
	try {
		const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
		return (JSON.parse(json) as { nonce?: string }).nonce ?? null;
	} catch {
		return null;
	}
}

function landingFor(returnTo: string | undefined, accountId: string | undefined): string {
	if (returnTo && isSafeReturnPath(returnTo)) return returnTo;
	return accountId ? `/account/${accountId}` : "/";
}

function failure(message: string): Response {
	return new Response(null, {
		headers: {
			Location: `/?auth_error=${encodeURIComponent(message)}`,
			"Set-Cookie": clearCookie(COOKIE.pkce),
		},
		status: 302,
	});
}

export const Route = createFileRoute("/api/auth/callback")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const url = new URL(request.url);
				const error = url.searchParams.get("error");
				if (error)
					return failure(
						url.searchParams.get("error_description") ?? error,
					);

				const code = url.searchParams.get("code");
				const state = url.searchParams.get("state");
				const stored = readCookie(request, COOKIE.pkce);
				if (!code || !state || !stored)
					return failure("The sign-in attempt expired. Try again.");

				const {
					accountId,
					nonce: expectedNonce,
					returnTo,
					state: expected,
					verifier,
				} = JSON.parse(stored) as {
					accountId?: string;
					nonce: string;
					returnTo?: string;
					state: string;
					verifier: string;
				};
				// Whop redirects here, so anyone can hit this route with a code they obtained
				// elsewhere; the state has to match the one this server issued.
				if (state !== expected) return failure("Sign-in state did not match.");

				const response = await fetch(TOKEN_URL, {
					body: JSON.stringify({
						client_id: appId(),
						...(clientSecret() ? { client_secret: clientSecret() } : {}),
						code,
						code_verifier: verifier,
						grant_type: "authorization_code",
						redirect_uri: redirectUri(request),
					}),
					headers: NO_INJECT,
					method: "POST",
				});

				if (!response.ok) {
					const body = (await response.json().catch(() => null)) as {
						error_description?: string;
					} | null;
					return failure(
						body?.error_description ?? `Token exchange failed (${response.status}).`,
					);
				}

				const granted = (await response.json()) as {
					access_token: string;
					id_token?: string;
					refresh_token?: string;
					expires_in: number;
					scope?: string;
				};

				// The nonce exists to prove this id_token answers the request we just made.
				// Signature verification is left to the transport: the token came back over TLS
				// from a direct server-to-server call, never through the browser.
				if (granted.id_token && nonceOf(granted.id_token) !== expectedNonce)
					return failure("Sign-in could not be verified. Try again.");

				const tokens: StoredTokens = {
					accessToken: granted.access_token,
					expiresAt: Date.now() + granted.expires_in * 1000,
					refreshToken: granted.refresh_token ?? null,
					scopes: (granted.scope ?? "").split(" ").filter(Boolean),
				};

				return new Response(null, {
					headers: [
						["Location", landingFor(returnTo, accountId)],
						["Set-Cookie", clearCookie(COOKIE.pkce)],
						[
							"Set-Cookie",
							setCookie(
								tokenCookie(accountId),
								JSON.stringify(tokens),
								60 * 60 * 24 * 30,
							),
						],
					],
					status: 302,
				});
			},
		},
	},
});
