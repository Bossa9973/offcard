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

/** Brand lockup, shared by the app header and the signed-out landing page. Uses currentColor. */
export function Wordmark() {
	return (
		<svg className="nb-logo" role="img" aria-label="Neo" viewBox="0 0 1010 238" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
			<path d="M0 114.465H763.76C772.044 114.465 778.76 107.749 778.76 99.4652C778.76 95.487 777.179 91.6717 774.366 88.8586L711.4 25.8924L725.542 11.7502L799.3 85.5081C813.107 99.3152 835.493 99.3152 849.3 85.5081L923.058 11.7502L937.2 25.8924L874.234 88.8586C871.421 91.6717 869.84 95.487 869.84 99.4652C869.84 107.749 876.556 114.465 884.84 114.465H1009.18V134.465H884.84C876.556 134.465 869.84 141.181 869.84 149.465C869.84 153.443 871.421 157.259 874.234 160.072L937.2 223.038L923.058 237.18L849.3 163.422C835.493 149.615 813.107 149.615 799.3 163.422L725.542 237.18L711.4 223.038L774.366 160.072C777.179 157.259 778.76 153.443 778.76 149.465C778.76 141.181 772.044 134.465 763.76 134.465H0V114.465Z" />
			<path d="M0 97.8V0H221.24V56.84H21.38V81.17H221.24V97.81H0V97.8ZM21.38 40.96H184.73C193.28 40.96 200.21 34.6 200.21 26.75V16.63H36.86C28.31 16.63 21.38 22.99 21.38 30.84V40.96Z" />
			<path d="M231.62 97.8V0H452.74V97.8H231.62ZM275.89 81.16H431.95V37.64C431.95 26.04 421.7 16.63 409.06 16.63H253C253 16.63 253 52.32 253 66.74C253 81.16 263.25 81.16 275.89 81.16Z" />
			<path d="M663.33 97.8L663.41 39.28C663.43 26.83 652.43 16.73 638.87 16.73H509.03C495.48 16.73 484.49 26.81 484.49 39.25V97.8H463.11V0H684.23V97.8H663.32H663.33Z" />
		</svg>
	);
}
