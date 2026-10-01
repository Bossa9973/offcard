declare const process: { env: Record<string, string | undefined> };

const OAUTH_ORIGIN = process.env.WHOP_OAUTH_ORIGIN ?? "https://api.whop.com";

export const AUTHORIZE_URL = `${OAUTH_ORIGIN}/oauth/authorize`;
export const TOKEN_URL = `${OAUTH_ORIGIN}/oauth/token`;
export const USERINFO_URL = `${OAUTH_ORIGIN}/oauth/userinfo`;

// The wallet elements each need a scoped token, and CreateAccessToken refuses any scoped_action
// the OAuth grant does not already carry — so everything the app can ever mint has to be
// consented to here. payout:withdraw_funds is what the hosted company key can never hold.
export const SCOPES = [
	"openid",
	"profile",
	// Creating an entity binds it to a Whop user BY EMAIL, which is what makes that user its
	// owner — so without this scope a new entity cannot be attributed to whoever asked for it.
	"email",
	// GET /users/me returns the email with this scope, which is the same call the entity list
	// already makes. The OIDC `email` scope only feeds /oauth/userinfo.
	"user:email:read",
	"user:balance:read",
	"member:basic:read",
	"member:email:read",
	"payment:basic:read",
	"plan:basic:read",
	"access_pass:basic:read",
	"checkout_configuration:create",
	"checkout_configuration:basic:read",
	"plan:create",
	"access_pass:create",
	// Entities are child companies, so switching to one reads a company balance rather than the
	// viewer's own. Both are needed because the personal account stays in the picker.
	"company:balance:read",
	"company:authorized_user:read",
	"stats:read",
	"payout:account:read",
	"payout:account:update",
	"identity:read",
	"identity:write",
	"payout:withdrawal:read",
	// GET /payouts/methods 403s without this — withdrawal:read covers history and
	// limits, destination:read is what lists the bank accounts you can pay out to.
	"payout:destination:read",
	"payout:transfer:read",
	"payout:withdraw_funds",
	"payout:create_destination",
	"payout:update_destination",
	"payout:delete_destination",
	"payout:transfer_funds",
	"payout:transfer:export",
	"crypto_wallet:swap",
] as const;

export const COOKIE = {
	pkce: "nb_pkce",
	tokens: "nb_tokens",
} as const;

export function tokenCookie(accountId?: string): string {
	return accountId ? `${COOKIE.tokens}_${accountId}` : COOKIE.tokens;
}

export interface StoredTokens {
	accessToken: string;
	refreshToken: string | null;
	expiresAt: number;
	scopes: string[];
}

function base64url(bytes: Uint8Array): string {
	let binary = "";
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function randomString(bytes = 32): string {
	return base64url(crypto.getRandomValues(new Uint8Array(bytes)));
}

export async function challengeOf(verifier: string): Promise<string> {
	const digest = await crypto.subtle.digest(
		"SHA-256",
		new TextEncoder().encode(verifier),
	);
	return base64url(new Uint8Array(digest));
}

// The hosted runtime injects APP_ID (app-hosting/src/isolate.ts:141). WHOP_APP_ID is what
// `whop apps dev` and the build step set locally — it is reserved, not runtime-provided, so
// reading only that one throws in production.
export function appId(): string {
	const id = process.env.APP_ID ?? process.env.WHOP_APP_ID;
	if (!id) throw new Error("No app id in the environment (APP_ID / WHOP_APP_ID).");
	return id;
}

// Present only when the app is registered as a confidential client. PKCE alone authenticates a
// public client; a confidential one must also prove itself with an App API key at the token
// endpoint (Oauth::ClientValidator). Supporting both means upgrading is just setting this secret.
export function clientSecret(): string | undefined {
	return process.env.WHOP_CLIENT_SECRET || undefined;
}

// Every api.whop.com hop gets the app's company key injected at the edge unless opted out. On
// the OAuth endpoints that key is wrong at best: the token exchange authenticates with the code
// and verifier, not a bearer.
export const NO_INJECT: HeadersInit = {
	"Content-Type": "application/json",
	"x-whop-inject-key": "none",
};

export function redirectUri(request: Request): string {
	return new URL("/api/auth/callback", new URL(request.url).origin).toString();
}

// httpOnly throughout: the browser never needs to read these, and an OAuth token that JS can
// read is one XSS away from being someone else's withdrawal.
export function setCookie(
	name: string,
	value: string,
	maxAgeSeconds: number,
): string {
	return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAgeSeconds}`;
}

export function clearCookie(name: string): string {
	return `${name}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export function readAnyAccountCookie(
	request: Request,
	except?: string,
): { accountId: string; raw: string } | null {
	const header = request.headers.get("cookie");
	if (!header) return null;
	for (const part of header.split(";")) {
		const [key, ...rest] = part.trim().split("=");
		const prefix = `${COOKIE.tokens}_`;
		if (!key?.startsWith(prefix)) continue;
		const accountId = key.slice(prefix.length);
		if (accountId !== except) return { accountId, raw: decodeURIComponent(rest.join("=")) };
	}
	return null;
}

export function readCookie(request: Request, name: string): string | null {
	const header = request.headers.get("cookie");
	if (!header) return null;
	for (const part of header.split(";")) {
		const [key, ...rest] = part.trim().split("=");
		if (key === name) return decodeURIComponent(rest.join("="));
	}
	return null;
}
