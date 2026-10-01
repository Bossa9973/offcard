import type { ReactNode } from "react";

const paths: Record<string, ReactNode> = {
	overview: <path d="m2 7 6-5 6 5v6.5a.5.5 0 0 1-.5.5H10V9H6v5H2.5a.5.5 0 0 1-.5-.5V7Z" />,
	cards: <><rect x="1.5" y="3.5" width="13" height="9" rx="1.5" /><path d="M1.5 6.5h13M4 10h3" /></>,
	invoicing: <><path d="M3.5 1.5h9v13l-2-1.25-1.5 1.25L7.5 13.25 6 14.5l-1.5-1.25-1 .75v-12.5Z" /><path d="M6 5h4M6 8h4" /></>,
	report: <path d="M2 14h12M4 11V7M8 11V3M12 11V6" />,
	settings: <><path d="M2 4h6.5M11.5 4H14M2 8h1.5M6.5 8H14M2 12h8.5M13.5 12h.5" /><circle cx="10" cy="4" r="1.5" /><circle cx="5" cy="8" r="1.5" /><circle cx="12" cy="12" r="1.5" /></>,
	invite: <><circle cx="6.5" cy="5" r="2.5" /><path d="M1.5 14v-.5a5 5 0 0 1 8.5-3.5M12.5 9v5M10 11.5h5" /></>,
};

export function NavIcon({ name }: { name: string }) {
	const content = paths[name];
	if (!content) return null;
	return (
		<svg aria-hidden="true" className="nb-nav__icon" fill="none" width="16" height="16" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
			{content}
		</svg>
	);
}
