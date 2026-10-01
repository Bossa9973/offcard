import { loadWhop } from "@whop/elements";
import { WhopElements } from "@whop/elements-react";
import { Theme } from "frosted-ui";
import { DESIGN_ACCOUNT_ID } from "../design-mode";
import { Wallet } from "./parts/wallet-provider";
import { WalletElement } from "./parts/wallet-element";
import { monochromeAppearance, monochromeTheme, quietOutlineActionClasses } from "./theme";
import { tokens as t } from "./tokens";
import "./action-studies.css";

const elements = typeof window === "undefined" ? null : loadWhop();
type Rules = Record<string, Record<string, string>>;
const studies: { name: string; description: string; classes: Rules }[] = [
	{ name: "01 / Quiet outline", description: "Thin borders, no heavy fill. My pick for the current layout.", classes: quietOutlineActionClasses },
	{ name: "02 / Soft pills", description: "A softer silhouette with a restrained grey fill.", classes: {
		"whop-Actions > button": { backgroundColor: "#222222", border: `1px solid ${t.border}`, height: "64px", borderRadius: "28px" },
		"whop-Actions > button:hover": { backgroundColor: t.hover },
	} },
	{ name: "03 / Bare essentials", description: "Just icons and labels; the surface appears on hover.", classes: {
		"whop-Actions > button": { backgroundColor: "transparent", border: "1px solid transparent", height: "64px", color: t.muted },
		"whop-Actions > button:hover": { backgroundColor: t.raised, color: t.text },
	} },
	{ name: "04 / White porcelain", description: "High contrast. Makes the actions a clear focal point.", classes: {
		"whop-Actions > button": { backgroundColor: t.accent, color: t.inverse, height: "64px", borderRadius: "10px", border: "1px solid transparent" },
		"whop-Actions > button:hover": { backgroundColor: t["accent-hover"] },
	} },
	{ name: "05 / Icon medallions", description: "Circular icon buttons with labels below. More of a wallet feel.", classes: {
		"whop-Actions > button": { display: "block", backgroundColor: "transparent", height: "88px", border: "0", padding: "4px" },
		"whop-Actions > button > svg": { display: "block", backgroundColor: t.raised, border: `1px solid ${t.border}`, borderRadius: "50%", width: "48px", height: "48px", padding: "13px", margin: "0 auto 8px" },
		"whop-Actions > button > span": { display: "block", textAlign: "center", fontSize: "13px" },
		"whop-Actions > button:hover": { backgroundColor: "transparent" },
		"whop-Actions > button:hover > svg": { backgroundColor: t.hover, borderColor: t.muted },
	} },
];

/** Local design-only comparison, using real official iframe buttons and sample flows. */
export function ActionStudies() {
	return <Theme {...monochromeTheme} hasBackground={false}>
		<WhopElements elements={elements} appearance={monochromeAppearance}>
			<main className="nb-action-studies">
				<header>
					<a href={`/account/${DESIGN_ACCOUNT_ID}`}>← Back to Home</a>
					<h1>Five ways to move money.</h1>
					<p>Same official buttons. Different visual weight. Hover, focus, or click to try them.</p>
				</header>
				{studies.map((study) => <section key={study.name}>
					<div className="nb-action-study-label"><h2>{study.name}</h2><p>{study.description}</p></div>
					<div className="nb-action-study-preview">
						<Wallet accountId={DESIGN_ACCOUNT_ID} appearance={{ classes: study.classes }}>
							<WalletElement name="actions" options={{ showAccept: false, showWithdraw: true, showConvert: true }} />
						</Wallet>
					</div>
				</section>)}
			</main>
		</WhopElements>
	</Theme>;
}
