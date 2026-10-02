import type { ReactNode } from "react";
import { lazy, Suspense, useEffect, useState } from "react";

import { createRootRoute, HeadContent, retainSearchParams, Scripts, useRouter, useRouterState } from "@tanstack/react-router";

import "../styles.css";
import { SignIn } from "../ui/parts/sign-in";
import { getAuthState } from "../lib/auth-state";
import { loginHref } from "../lib/login";
import { demoElementsScriptUrl, elementsResourceHints, elementsScriptUrl } from "../ui/elements-loader";
import { DESIGN_ACCOUNT_ID, DESIGN_MODE, isPreviewSearch, PREVIEW_PARAM } from "../design-mode";
import { SLUG_FOR_TAB, TABS } from "../ui/tabs";
import { tokenCss } from "../ui/tokens";

// Split the signed-in app from the sign-in page so the landing route stays small.
const NeobankApp = lazy(() => import("../ui/app").then(module => ({ default: module.NeobankApp })));
const ActionStudies = lazy(() => import("../ui/action-studies").then(module => ({ default: module.ActionStudies })));

/** `/?whop_preview=1` opens the sample account directly; `preview_tab` picks a section. */
function PreviewEntry({ href }: { href: string }) {
	const router = useRouter();
	useEffect(() => router.history.replace(href), [router, href]);
	return <p className="nb-status" role="status">Loading preview…</p>;
}

function RootContent() {
	const { signedIn, preview } = Route.useRouteContext();
	const location = useRouterState({ select: (state) => state.location });
	// Preview renders only in the browser: the server cannot see the flag at module scope,
	// so rendering the app there would not match the client's first paint.
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);
	if (preview) {
		if (!mounted) return <p className="nb-status" role="status">Loading preview…</p>;
		if (location.pathname === "/") {
			const tab = TABS.find(({ key }) => key === new URLSearchParams(location.searchStr).get("preview_tab"))?.key;
			const slug = tab ? SLUG_FOR_TAB[tab] : "";
			return <PreviewEntry href={`/account/${DESIGN_ACCOUNT_ID}${slug ? `/${slug}` : ""}?${PREVIEW_PARAM}=1`} />;
		}
		return <Suspense fallback={<p className="nb-status" role="status">Loading preview…</p>}><NeobankApp /></Suspense>;
	}
	if (DESIGN_MODE && new URLSearchParams(location.searchStr).has("button-studies"))
		return <Suspense fallback={<p className="nb-status">Loading button studies…</p>}><ActionStudies /></Suspense>;
	if (DESIGN_MODE && location.pathname === "/")
		return <SignIn label="Join now" href={`/account/${DESIGN_ACCOUNT_ID}`} />;
	if (!signedIn) {
		const error = new URLSearchParams(location.searchStr).get("auth_error") ?? undefined;
		return <SignIn label={location.pathname === "/" ? "Join now" : "Sign in with Whop"} href={loginHref(undefined, location.pathname)} error={error} />;
	}
	return <Suspense fallback={null}><NeobankApp /></Suspense>;
}

function RootDocument({ children }: { children: ReactNode }) {
	const { preview } = Route.useRouteContext();
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
				<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
				<style>{tokenCss}</style>
				<HeadContent />
				{preview ? null : elementsResourceHints.map((hint) => (
					<link key={`${hint.rel}:${hint.href}`} {...hint} />
				))}
				<script async data-whop-elements="" src={preview ? demoElementsScriptUrl : elementsScriptUrl} />
			</head>
			<body>
				{children}
				<Scripts />
			</body>
		</html>
	);
}

function RootError({ error }: { error: Error }) {
	return (
		<div className="nb-status nb-status--error">
			<p>Something went wrong on this page.</p>
			<p className="nb-status__detail">{error.message}</p>
			<button className="nb-button nb-button--primary nb-signin" onClick={() => window.location.reload()} type="button">
				Reload
			</button>
		</div>
	);
}

export const Route = createRootRoute({
	// Passes every other param through untouched; only the preview flag is normalized.
	validateSearch: (search: Record<string, unknown>): Record<string, unknown> => search,
	// Keep preview on for every in-app navigation until the visitor leaves the flagged URL.
	search: { middlewares: [retainSearchParams([PREVIEW_PARAM])] },
	beforeLoad: async ({ location }) => {
		// Preview grants nothing server-side: API routes still require a session, and the
		// browser answers /api calls from sample data instead of calling them.
		if (isPreviewSearch(location.searchStr)) return { preview: true, signedIn: false };
		return DESIGN_MODE ? { preview: false, signedIn: true } : { preview: false, ...(await getAuthState()) };
	},
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ content: "width=device-width, initial-scale=1", name: "viewport" },
			{ title: "Neo Finance" },
		],
	}),
	component: RootContent,
	errorComponent: RootError,
	shellComponent: RootDocument,
});
