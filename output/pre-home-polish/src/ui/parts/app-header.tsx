import { DropdownMenu } from "frosted-ui";
import { useRef, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";

export function AppHeader({ viewerName, onSettings, accountId, menu }: {
	viewerName: string | null;
	onSettings?: () => void;
	accountId?: string;
	menu?: ReactNode;
}) {
	const logout = useRef<HTMLFormElement>(null);
	const name = viewerName?.trim() || "Your profile";
	const initials = viewerName?.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
	const homeContent = <>
		<svg aria-hidden="true" fill="none" width="16" height="16" viewBox="0 0 16 16">
			<path d="m2 7 6-5 6 5v6.5a.5.5 0 0 1-.5.5H10V9H6v5H2.5a.5.5 0 0 1-.5-.5V7Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
		</svg>
		Home
	</>;

	return (
		<header className="nb-app-header">
			<div className="nb-app-header__start">
			{menu}
			{accountId ? (
				<Link className="nb-app-header__home" to="/account/$accountId" params={{ accountId }}>{homeContent}</Link>
			) : <a className="nb-app-header__home" href="/">{homeContent}</a>}
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
