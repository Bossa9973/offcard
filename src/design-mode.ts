/** `?whop_preview=1` runs the app on demo Elements and sample host data, without signing in. */
export const PREVIEW_PARAM = "whop_preview";

const DESIGN_BUILD = typeof __NEOBANK_DESIGN__ !== "undefined" && __NEOBANK_DESIGN__;

export function isPreviewSearch(search: string) {
	return new URLSearchParams(search).get(PREVIEW_PARAM) === "1";
}

// Client-only: the server decides preview from the request URL in the root route instead.
// The router retains the param on every navigation, so this holds for the whole session.
export const PREVIEW_MODE = !DESIGN_BUILD && typeof window !== "undefined" && isPreviewSearch(window.location.search);
export const DESIGN_MODE = DESIGN_BUILD || PREVIEW_MODE;

// The public demo runtime only serves fixtures for its own account and token.
export const DESIGN_ACCOUNT_ID = PREVIEW_MODE ? "biz_demo" : "biz_XXXXXXXXXXXX";
export const DESIGN_TOKEN = PREVIEW_MODE ? "tok_demo" : "local-design-sample-token";
