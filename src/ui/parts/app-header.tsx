import { DropdownMenu } from "frosted-ui";
import { useRef, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";

export function AppHeader({ viewerName, viewingAccount, onSettings, accountId, menu }: {
	viewerName: string | null;
	viewingAccount?: string;
	onSettings?: () => void;
	accountId?: string;
	menu?: ReactNode;
}) {
	const logout = useRef<HTMLFormElement>(null);
	const name = viewerName?.trim() || "Your profile";
	const initials = viewerName?.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
	const homeContent = <Wordmark />;

	return (
		<header className="nb-app-header">
			<div className="nb-app-header__start">
			{menu}
			{accountId ? (
				<Link className="nb-app-header__home" to="/account/$accountId" params={{ accountId }} aria-label="Neo home"
					// Already on Home: the link would be a no-op, so bring the page back to the top instead.
					onClick={(event) => { if (event.currentTarget.getAttribute("href") === window.location.pathname) window.scrollTo({ top: 0, behavior: "smooth" }); }}>{homeContent}</Link>
			) : <a className="nb-app-header__home" href="/">{homeContent}</a>}
			{viewingAccount ? <p className="nb-current-account">You’re viewing <strong>{viewingAccount}</strong></p> : null}
			</div>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger disabled={!onSettings}>
					<button type="button" className="nb-profile-trigger" aria-label={`User profile: ${name}`}>
					<span className="nb-profile-avatar" aria-hidden="true">{initials || <svg fill="none" width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="5" r="2.5" stroke="currentColor" /><path d="M3 14v-1a5 5 0 0 1 10 0v1" stroke="currentColor" /></svg>}</span>
					</button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end" sideOffset={6}>
					<DropdownMenu.Group>
						<DropdownMenu.GroupLabel>{name}</DropdownMenu.GroupLabel>
						<DropdownMenu.Item onClick={onSettings}>Settings</DropdownMenu.Item>
						<DropdownMenu.Separator />
						<DropdownMenu.Item color="gray" onClick={() => logout.current?.requestSubmit()}>Sign out</DropdownMenu.Item>
					</DropdownMenu.Group>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
			<form ref={logout} action="/api/auth/logout" method="post" hidden />
		</header>
	);
}

import { Wordmark } from "../components/wordmark";

export { Wordmark };
