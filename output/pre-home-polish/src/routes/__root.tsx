import type { ReactNode } from "react";
import { lazy, Suspense } from "react";

import { createRootRoute, HeadContent, Scripts, useRouterState } from "@tanstack/react-router";

import "../styles.css";
import { NeobankApp } from "../ui/app";
import { SignIn } from "../ui/parts/sign-in";
import { getAuthState } from "../lib/auth-state";
import { loginHref } from "../lib/login";
import { elementsResourceHints, elementsScriptUrl } from "../ui/elements-loader";
import { DESIGN_ACCOUNT_ID, DESIGN_MODE } from "../design-mode";
import { tokenCss } from "../ui/tokens";

const ActionStudies = lazy(() => import("../ui/action-studies").then(module => ({ default: module.ActionStudies })));

function RootContent() {
	const { signedIn } = Route.useRouteContext();
	const location = useRouterState({ select: (state) => state.location });
	if (DESIGN_MODE && new URLSearchParams(location.searchStr).has("button-studies"))
		return <Suspense fallback={<p className="nb-status">Loading button studies…</p>}><ActionStudies /></Suspense>;
	if (DESIGN_MODE && location.pathname === "/")
		return <SignIn label="Sign up" href={`/account/${DESIGN_ACCOUNT_ID}`} />;
	if (!signedIn) {
		const error = new URLSearchParams(location.searchStr).get("auth_error") ?? undefined;
		return <SignIn label={location.pathname === "/" ? "Sign up" : "Sign in with Whop"} href={loginHref(undefined, location.pathname)} error={error} />;
	}
	return <NeobankApp />;
}

function RootDocument({ children }: { children: ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<style>{tokenCss}</style>
				<HeadContent />
				{elementsResourceHints.map((hint) => (
					<link key={`${hint.rel}:${hint.href}`} {...hint} />
				))}
				<script async data-whop-elements="" src={elementsScriptUrl} />
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
	beforeLoad: () => DESIGN_MODE ? { signedIn: true } : getAuthState(),
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ content: "width=device-width, initial-scale=1", name: "viewport" },
			{ title: "Neobank" },
		],
	}),
	component: RootContent,
	errorComponent: RootError,
	shellComponent: RootDocument,
});
