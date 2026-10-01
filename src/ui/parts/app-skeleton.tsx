import { monochromeTheme } from "../theme";
import { Button, Theme } from "frosted-ui";
import { Plus16 } from "@frosted-ui/icons";

import type { TabKey } from "../tabs";
import { TABS } from "../tabs";
import { AppHeader } from "./app-header";

function TabBody({ tab }: { tab: TabKey }) {
	if (tab === "overview")
		return (
			<div className="nb-stack nb-stack--overview">
				<div className="nb-overview-grid">
					<div className="nb-skeleton nb-skeleton--actions" />
					<div className="nb-skeleton nb-skeleton--panel nb-skeleton--chart" />
					<div className="nb-skeleton nb-skeleton--panel nb-skeleton--list" />
				</div>
				<div className="nb-skeleton nb-skeleton--panel nb-skeleton--activity" />
			</div>
		);

	if (tab === "cards")
		return (
			<div className="nb-stack">
				<div className="nb-skeleton nb-skeleton--panel nb-skeleton--chart" />
				<div className="nb-skeleton nb-skeleton--panel nb-skeleton--table" />
			</div>
		);

	if (tab === "settings")
		return (
			<div className="nb-stack">
				<div className="nb-skeleton nb-skeleton--panel" />
				<div className="nb-skeleton nb-skeleton--panel" />
			</div>
		);

	return (
		<div className="nb-stack">
			<div className="nb-skeleton nb-skeleton--panel" />
		</div>
	);
}

export function AppSkeleton({ tab }: { tab?: TabKey }) {
	return (
		<Theme {...monochromeTheme} hasBackground={false}>
		<div className="nb-app">
			<AppHeader viewerName={null} />
		<div className="nb-shell" aria-busy="true">
			<aside className="nb-sidebar">
				<div className="nb-sidebar__header">
					<div className="nb-skeleton-picker">
						<div className="nb-skeleton nb-skeleton--avatar" />
						<div className="nb-skeleton nb-skeleton--picker-name" />
					</div>
				</div>
				<nav className="nb-nav">
					{TABS.map(({ key, label }) => (
						<span
							aria-current={key === (tab ?? "overview") ? "page" : undefined}
							className="nb-nav__item"
							key={key}
						>
							{label}
						</span>
					))}
					<span className="nb-nav__item">Invite users</span>
				</nav>
			</aside>
			<div className="nb-workspace">
				<main className="nb-main">
					{tab === "invoicing" ? (
						<header className="nb-main__header">
							<h1 className="nb-main__title">Payments</h1>
							<Button color="gray" size="2" variant="solid" disabled><Plus16 aria-hidden /> Create payment link</Button>
						</header>
					) : <div className="nb-skeleton nb-skeleton--title" />}
					<TabBody tab={tab ?? "overview"} />
				</main>
			</div>
		</div>
		</div>
		</Theme>
	);
}
