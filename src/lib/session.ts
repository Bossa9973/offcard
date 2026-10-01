import {
	appId,
	clientSecret,
	NO_INJECT,
	readCookie,
	setCookie,
	TOKEN_URL,
	readAnyAccountCookie,
	tokenCookie,
	type StoredTokens,
} from "./oauth";

const REFRESH_MARGIN_MS = 5 * 60_000;
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;
const requestRefreshes = new WeakMap<Request, Map<string, Promise<StoredTokens | null>>>();

export type Session =
	| { tokens: StoredTokens; rotated: boolean; scopedTo?: string }
	| { failure: "signed_out" };

async function refresh(tokens: StoredTokens): Promise<StoredTokens | null> {
	if (!tokens.refreshToken) return null;

	const response = await fetch(TOKEN_URL, {
		body: JSON.stringify({
			client_id: appId(),
			...(clientSecret() ? { client_secret: clientSecret() } : {}),
			grant_type: "refresh_token",
			refresh_token: tokens.refreshToken,
		}),
		headers: NO_INJECT,
		method: "POST",
	});
	if (!response.ok) return null;

	const granted = (await response.json()) as {
		access_token: string;
		refresh_token?: string;
		expires_in: number;
		scope?: string;
	};
	return {
		accessToken: granted.access_token,
		expiresAt: Date.now() + granted.expires_in * 1000,
		// Refresh tokens rotate on every use, so dropping the new one strands the session at the
		// next refresh.
		refreshToken: granted.refresh_token ?? tokens.refreshToken,
		// An omitted `scope` means unchanged, not none.
		scopes: granted.scope ? granted.scope.split(" ").filter(Boolean) : tokens.scopes,
	};
}

/**
 * The one place a request turns a cookie into usable tokens. Every route shares it so they cannot
 * disagree about when to refresh — /api/entities previously never refreshed at all, and simply
 * started failing an hour into every session.
 */
export async function resolveSession(
	request: Request,
	accountId?: string,
): Promise<Session> {
	const read = (scope?: string): StoredTokens | null => {
		const raw = readCookie(request, tokenCookie(scope));
		if (!raw) return null;
		try {
			return JSON.parse(raw) as StoredTokens;
		} catch {
			return null;
		}
	};

	// Every cookie that could carry this viewer, best first. A cookie that parses is not a cookie
	// that still works: refresh tokens are single-use, so a spent one has to fall through to the
	// next candidate rather than end the search. Reporting a signed-in viewer as signed out is what
	// puts the app in a sign-in loop.
	const candidates: { scope?: string; tokens: StoredTokens }[] = [];
	const consider = (scope: string | undefined, tokens: StoredTokens | null) => {
		if (!tokens) return;
		if (candidates.some((held) => held.tokens.accessToken === tokens.accessToken)) return;
		candidates.push({ scope, tokens });
	};

	// An entity-scoped cookie wins when it exists, so signing into one entity as another Whop user
	// keeps working. Falling back to the plain cookie is what stops a second consent round: the
	// grant identifies the viewer, and access tokens are minted from it without naming a company,
	// so one sign-in already covers every entity the viewer can reach.
	consider(accountId, read(accountId));
	if (accountId) consider(undefined, read(undefined));
	const spare = readAnyAccountCookie(request, accountId);
	if (spare) {
		try {
			consider(spare.accountId, JSON.parse(spare.raw) as StoredTokens);
		} catch {
			// A corrupt cookie is not a candidate.
		}
	}

	for (const candidate of candidates) {
		if (candidate.tokens.expiresAt - Date.now() >= REFRESH_MARGIN_MS)
			return { rotated: false, scopedTo: candidate.scope, tokens: candidate.tokens };

		let refreshes = requestRefreshes.get(request);
		if (!refreshes) {
			refreshes = new Map();
			requestRefreshes.set(request, refreshes);
		}
		const refreshKey = candidate.tokens.refreshToken ?? candidate.tokens.accessToken;
		let pending = refreshes.get(refreshKey);
		if (!pending) {
			pending = refresh(candidate.tokens);
			refreshes.set(refreshKey, pending);
		}
		const next = await pending;
		// Rotation has to land back in the cookie it came from, so `scopedTo` travels with the
		// winner: writing it anywhere else strands whichever cookie still holds the spent token.
		if (next) return { rotated: true, scopedTo: candidate.scope, tokens: next };
	}

	return { failure: "signed_out" };
}

export function persist(
	response: Response,
	tokens: StoredTokens,
	accountId?: string,
): Response {
	response.headers.append(
		"Set-Cookie",
		setCookie(tokenCookie(accountId), JSON.stringify(tokens), COOKIE_MAX_AGE),
	);
	return response;
}

export function persistSession(response: Response, session: Session): Response {
	if (!("tokens" in session) || !session.rotated) return response;
	return persist(response, session.tokens, session.scopedTo);
}

/**
 * Deliberately does NOT clear the session cookie. Refresh tokens are single-use, so two requests
 * refreshing at once means the loser gets invalid_grant on a token the winner already rotated —
 * and clearing here would destroy the session the winner just renewed. A genuinely dead refresh
 * token simply keeps answering 401 until the viewer signs in again.
 */
export function signedOut(message: string): Response {
	return Response.json(
		{ error: { message, type: "not_authenticated" }, signedIn: false },
		{ headers: { "Cache-Control": "no-store" }, status: 401 },
	);
}
