/**
 * Card Architecture Studio
 *
 * Full-width, synchronized two-column section:
 * Left  → Large-format 3D Card Inspector (tilt, flip, material specs)
 * Right → Interactive Wallet Stack (fanning, click-to-open, activity panel)
 *
 * Selecting a card in either component syncs the active selection in both.
 *
 * Elemental Card Editions:
 *   Grid    – 316L Stainless Steel, micro-etched topography, 16.0g
 *   Chrome  – Grade 5 Titanium PVD, chromatic interference, 17.5g
 *   Carbon  – Tungsten Carbide + Matte Ceramic, zero front imprint, 19.8g
 *   Lumen   – Dual-Tone Anodized Aluminum, kinetic striations, 12.2g
 */

import { useCallback, useState } from "react";
import { WalletStack, type WalletCard } from "../components/wallet-stack";
import { Card3DInspector, type InspectorCardData } from "../components/card-3d-inspector";
import { HalftoneField } from "../components/halftone-field";
import { DEMO_CARDHOLDER } from "../../content/demoData";

// ─── Elemental card data ───────────────────────────────────────────────────────

const ELEMENTAL_CARDS: (InspectorCardData & WalletCard)[] = [
	{
		// Grid
		id: "grid",
		issuer: "Off-Card",
		product: "Grid",
		variant: "grid",
		image: "/images/cards/card-grid.jpg",
		holder: DEMO_CARDHOLDER,
		lastFour: "7474",
		expires: "08/28",
		materialSpec: "Precision Brushed Steel",
		massGrams: 16.0,
		thicknessMm: 0.84,
		finish: "Laser-etched micro-grid surface",
		useCase: "Executive treasury & operational liquidity",
		balance: 5750.20,
		balanceLabel: "Available balance",
		transactions: [
			{ id: "g1", merchant: "Design software", detail: "Subscription · Today", amount: -54.99 },
			{ id: "g2", merchant: "Cloud infrastructure", detail: "Monthly invoice · Yesterday", amount: -312.40 },
			{ id: "g3", merchant: "Product prototyping", detail: "Subscription · 3 days ago", amount: -15.00 },
		],
	},
	{
		// Chrome
		id: "chrome",
		issuer: "Off-Card",
		product: "Chrome",
		variant: "chrome",
		image: "/images/cards/card-chrome.jpg",
		holder: DEMO_CARDHOLDER,
		lastFour: "2343",
		expires: "12/29",
		materialSpec: "Mirror-Polished Alloy",
		massGrams: 17.5,
		thicknessMm: 0.84,
		finish: "Specular reflective mirror finish",
		useCase: "High-volume corporate procurement & supplier payments",
		balance: 18450.00,
		balanceLabel: "Current balance",
		transactions: [
			{ id: "c1", merchant: "API compute", detail: "Usage · Today", amount: -88.32 },
			{ id: "c2", merchant: "Application hosting", detail: "Monthly · 2 days ago", amount: -20.00 },
			{ id: "c3", merchant: "Treasury deposit", detail: "Settlement · 4 days ago", amount: +5000.00 },
		],
	},
	{
		// Carbon
		id: "carbon",
		issuer: "Off-Card",
		product: "Carbon",
		variant: "carbon",
		image: "/images/cards/card-carbon.jpg",
		holder: DEMO_CARDHOLDER,
		lastFour: "9613",
		expires: "06/27",
		materialSpec: "Matte Black Ceramic-Coat",
		massGrams: 18.0,
		thicknessMm: 0.84,
		finish: "Scratch-resistant matte finish",
		useCase: "Founder & leadership discretionary spend",
		balance: 31200.00,
		balanceLabel: "Settlement reserve",
		transactions: [
			{ id: "k1", merchant: "Executive lodging", detail: "Travel & expense · Today", amount: -1240.00 },
			{ id: "k2", merchant: "Operating transfer", detail: "Treasury · Yesterday", amount: +15000.00 },
		],
	},
	{
		// Lumen
		id: "lumen",
		issuer: "Off-Card",
		product: "Lumen",
		variant: "lumen",
		image: "/images/cards/card-lumen.jpg",
		holder: DEMO_CARDHOLDER,
		lastFour: "0917",
		expires: "03/28",
		materialSpec: "Dual-Tone Anodized Aluminum",
		massGrams: 12.2,
		thicknessMm: 0.84,
		finish: "Bead-blasted dual spectrum linear texture",
		useCase: "Everyday employee expense & software subscriptions",
		balance: 2380.50,
		balanceLabel: "Spent this month",
		transactions: [
			{ id: "l1", merchant: "Workspace suite", detail: "Seats · Today", amount: -72.00 },
			{ id: "l2", merchant: "Team communications", detail: "Annual plan · Yesterday", amount: -240.00 },
			{ id: "l3", merchant: "Code assistant licenses", detail: "Team licenses · 3 days ago", amount: -190.00 },
		],
	},
];

// ─── Material specs display ────────────────────────────────────────────────────

function SpecRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="card-studio-spec-row">
			<span className="card-studio-spec-label">{label}</span>
			<span className="card-studio-spec-value">{value}</span>
		</div>
	);
}

// ─── Card Architecture Studio ─────────────────────────────────────────────────

export function WalletShowcase({
	onAction,
	href = "/api/auth/login",
}: {
	onAction?: () => void;
	href?: string;
}) {
	const [activeIndex, setActiveIndex] = useState(0);
	const activeCard = ELEMENTAL_CARDS[activeIndex];

	const handleTabSelect = useCallback((i: number) => {
		setActiveIndex(i);
	}, []);

	const handleWalletFrontChange = useCallback((i: number) => {
		setActiveIndex(i);
	}, []);

	// Edition-reactive ambient glow colors
	const AMBIENT_GLOWS: Record<string, string> = {
		grid: "radial-gradient(ellipse 60% 50% at 50% 45%, rgba(160, 180, 205, 0.07) 0%, rgba(40, 50, 70, 0.03) 45%, transparent 70%)",
		chrome: "radial-gradient(ellipse 65% 55% at 50% 45%, rgba(240, 210, 170, 0.08) 0%, rgba(140, 120, 200, 0.04) 40%, transparent 70%)",
		carbon: "radial-gradient(ellipse 55% 45% at 50% 45%, rgba(200, 200, 210, 0.05) 0%, rgba(30, 30, 35, 0.02) 45%, transparent 70%)",
		lumen: "radial-gradient(ellipse 65% 55% at 50% 45%, rgba(210, 230, 120, 0.08) 0%, rgba(130, 150, 220, 0.04) 40%, transparent 70%)",
	};

	return (
		<section
			id="card-designs"
			data-band="dark"
			className="off-band off-band--dark card-studio-band relative overflow-hidden"
			aria-labelledby="card-studio-title"
		>
			{/* Dynamic value-noise interactive halftone field */}
			<HalftoneField variant="studio" pitch={24} className="opacity-45 pointer-events-none" />

			{/* Responsive ambient spotlight that subtly shifts with active card edition */}
			<div
				className="pointer-events-none absolute inset-0 transition-all duration-700 ease-out z-0"
				style={{ background: AMBIENT_GLOWS[activeCard.variant] ?? AMBIENT_GLOWS.grid }}
				aria-hidden="true"
			/>

			<div className="off-container relative z-10">

				{/* Section headline */}
				<div className="card-studio-headline">
					<h2 id="card-studio-title" className="off-bento-h2">
						Physical &amp; Virtual Cards
					</h2>
					<p className="off-bento-lead card-studio-sub">
						Four physical card editions engineered for leadership, team procurement, and everyday business spending.
					</p>
				</div>

				{/* Clean Segmented Edition Selector */}
				<div className="card-studio-tabs" role="tablist" aria-label="Card edition selector">
					{ELEMENTAL_CARDS.map((card, i) => {
						const isSelected = i === activeIndex;
						return (
							<button
								key={card.id}
								type="button"
								role="tab"
								id={`tab-${card.id}`}
								aria-selected={isSelected}
								aria-controls={`panel-${card.id}`}
								className={`card-studio-tab${isSelected ? " card-studio-tab--active" : ""}`}
								onClick={() => handleTabSelect(i)}
							>
								<span className="card-studio-tab-name">{card.product}</span>
							</button>
						);
					})}
				</div>

				{/* Main dual-column studio */}
				<div className="card-studio-duo">

					{/* ── LEFT: 3D Inspector + specs ── */}
					<div
						className="card-studio-inspector-col"
						id={`panel-${activeCard.id}`}
						role="tabpanel"
						aria-labelledby={`tab-${activeCard.id}`}
					>
						<Card3DInspector
							card={activeCard}
							className="card-studio-inspector"
						/>

						{/* Physical specification readout - confirmed specifications */}
						<div className="card-studio-specs">
							<SpecRow label="Material" value={activeCard.materialSpec} />
							<SpecRow label="Finish" value={activeCard.finish} />
							<SpecRow label="Primary use" value={activeCard.useCase} />
						</div>

						<a
							href={onAction ? undefined : href}
							onClick={onAction}
							className="card-studio-cta"
						>
							Issue your {activeCard.product} card →
						</a>
					</div>

					{/* ── RIGHT: Wallet Stack ── */}
					<div className="card-studio-stack-col">
						<WalletStack
							cards={ELEMENTAL_CARDS}
							label="Card editions"
							currency="USD"
							locale="en-US"
							activeIndex={activeIndex}
							onFrontChange={handleWalletFrontChange}
							className="card-studio-wallet"
						/>
					</div>
				</div>
			</div>
		</section>
	);
}
