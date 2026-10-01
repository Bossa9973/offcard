import { createFileRoute } from "@tanstack/react-router";

import {
	appId,
	AUTHORIZE_URL,
	challengeOf,
	COOKIE,
	randomString,
	redirectUri,
	SCOPES,
	setCookie,
} from "../lib/oauth";
import { isSafeReturnPath } from "../lib/login";

export const Route = createFileRoute("/api/auth/login")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const query = new URL(request.url).searchParams;
				const requestedAccountId = query.get("account_id");
				const accountId = requestedAccountId?.startsWith("biz_")
					? requestedAccountId
					: undefined;
				// Re-validated here rather than trusted from the link: a path that could carry a
				// scheme or a protocol-relative host would turn the callback into an open redirect.
				const requestedReturn = query.get("return_to");
				const returnTo =
					requestedReturn && isSafeReturnPath(requestedReturn)
						? requestedReturn
						: undefined;
				const verifier = randomString();
				const state = randomString(16);
				// Required whenever `openid` is requested (Oauth::ValidateAuthorizeRequest), and
				// it is what ties the returned id_token to this particular request.
				const nonce = randomString(16);

				// Deliberately no `company_id`: it scopes the grant to one company, and every token
				// minted from it inherits that claim. A company-scoped token sees only that
				// company's own people in recipient lists, and 404s on GET /users/me. The entity
				// still travels in the PKCE cookie, which is what files the grant under its cookie.
				const params = new URLSearchParams({
					client_id: appId(),
					code_challenge: await challengeOf(verifier),
					code_challenge_method: "S256",
					nonce,
					redirect_uri: redirectUri(request),
					response_type: "code",
					scope: SCOPES.join(" "),
					state,
				});

				return new Response(null, {
					headers: {
						Location: `${AUTHORIZE_URL}?${params}`,
						// The verifier never reaches the browser's JS, so a stolen authorization code
						// cannot be redeemed from anywhere but this server.
						"Set-Cookie": setCookie(
							COOKIE.pkce,
							JSON.stringify({ accountId, nonce, returnTo, state, verifier }),
							600,
						),
					},
					status: 302,
				});
			},
		},
	},
});
