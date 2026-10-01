import { createDesignApi } from "../lib/design-api";

// Public market prices are the one real read; everything else under /api is answered with
// sample data in the browser, so preview never reaches account endpoints or needs a session.
const PASSTHROUGH = new Set(["/api/market-prices"]);
let installed = false;

export function installPreviewFetch() {
	if (installed || typeof window === "undefined") return;
	installed = true;
	const respond = createDesignApi();
	const original = window.fetch.bind(window);
	window.fetch = (input, init) => {
		const request = new Request(input, init);
		const url = new URL(request.url);
		if (url.origin !== window.location.origin || !url.pathname.startsWith("/api/") || PASSTHROUGH.has(url.pathname))
			return original(input, init);
		return respond(request);
	};
}
