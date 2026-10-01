import { Dialog } from "frosted-ui";
import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { AppHeader } from "./app-header";

export function ResponsiveShell({ accountId, viewerName, onSettings, sidebar, children }: {
	accountId: string;
	viewerName: string | null;
	onSettings: () => void;
	sidebar: ReactNode;
	children: ReactNode;
}) {
	const [open, setOpen] = useState(false);
	const pathname = useRouterState({ select: (state) => state.location.pathname });
	useEffect(() => setOpen(false), [pathname]);
	useEffect(() => {
		const desktop = window.matchMedia("(min-width: 64rem)");
		const closeOnDesktop = () => { if (desktop.matches) setOpen(false); };
		desktop.addEventListener("change", closeOnDesktop);
		return () => desktop.removeEventListener("change", closeOnDesktop);
	}, []);

	return <div className="nb-app">
		<Dialog.Root open={open} onOpenChange={setOpen}>
			<AppHeader accountId={accountId} viewerName={viewerName} onSettings={onSettings} menu={
				<Dialog.Trigger>
					<button className="nb-mobile-menu" type="button" aria-label="Open navigation">
						<svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
					</button>
				</Dialog.Trigger>
			} />
			<Dialog.Content className="nb-mobile-navigation" aria-describedby={undefined} onClickCapture={(event) => {
				const target = event.target as Element;
				if (target.closest(".nb-nav__item") && !target.closest(".nb-invite")) setOpen(false);
			}}>
				<div className="nb-mobile-navigation__header">
					<Dialog.Title>Navigation</Dialog.Title>
					<Dialog.Close><button className="nb-mobile-menu nb-mobile-menu--close" type="button" aria-label="Close navigation">✕</button></Dialog.Close>
				</div>
				{sidebar}
			</Dialog.Content>
		</Dialog.Root>
		<div className="nb-shell">
			<aside className="nb-sidebar">{sidebar}</aside>
			{children}
		</div>
	</div>;
}
