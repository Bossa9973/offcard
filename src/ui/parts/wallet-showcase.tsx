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

// ─── Elemental card data ───────────────────────────────────────────────────────

const ELEMENTAL_CARDS: (InspectorCardData & WalletCard)[] = [
	{
		// Grid
		id: "grid",
		issuer: "Off-Card",
		product: "Grid",
		variant: "grid",
		image: "/images/cards/card-grid.jpg",
		holder: "Alex Morgan",
		lastFour: "7474",
		expires: "08/28",
		materialSpec: "316L Austenitic Stainless Steel",
		massGrams: 16.0,
		thicknessMm: 0.84,
		finish: "Micro-etched topographic dot field",
		useCase: "Automated treasury & DeFi liquidity routing",
		balance: 5750.20,
		balanceLabel: "Available balance",
		transactions: [
			{ id: "g1", merchant: "Adobe Creative Cloud", detail: "Subscription · Today", amount: -54.99 },
			{ id: "g2", merchant: "AWS", detail: "Invoice #1182 · Yesterday", amount: -312.40 },
			{ id: "g3", merchant: "Figma", detail: "Subscription · 3 days ago", amount: -15.00 },
		],
	},
	{
		// Chrome
		id: "chrome",
		issuer: "Off-Card",
		product: "Chrome",
		variant: "chrome",
		image: "/images/cards/card-chrome.jpg",
		holder: "Alex Morgan",
		lastFour: "2343",
		expires: "12/29",
		materialSpec: "Grade 5 Titanium, PVD Mirror Polish",
		massGrams: 17.5,
		thicknessMm: 0.84,
		finish: "Chromatic interference light dispersion",
		useCase: "High-volume private custody & settlement",
		balance: 18450.00,
		balanceLabel: "Current balance",
		transactions: [
			{ id: "c1", merchant: "Anthropic API", detail: "Usage · Today", amount: -88.32 },
			{ id: "c2", merchant: "Vercel Pro", detail: "Monthly · 2 days ago", amount: -20.00 },
			{ id: "c3", merchant: "USDC Transfer", detail: "Deposit · 4 days ago", amount: +5000.00 },
		],
	},
	{
		// Carbon
		id: "carbon",
		issuer: "Off-Card",
		product: "Carbon",
		variant: "carbon",
		image: "/images/cards/card-carbon.jpg",
		holder: "Alex Morgan",
		lastFour: "9613",
		expires: "06/27",
		materialSpec: "Tungsten Carbide & Matte Ceramic",
		massGrams: 19.8,
		thicknessMm: 0.84,
		finish: "Laser-annealed matte matrix, zero front imprint",
		useCase: "Discretional offline settlement & sovereign custody",
		balance: 31200.00,
		balanceLabel: "Settlement reserve",
		transactions: [
			{ id: "k1", merchant: "Private Wire", detail: "Outbound SWIFT · Today", amount: -12000.00 },
			{ id: "k2", merchant: "USDC Bridge", detail: "Inbound · Yesterday", amount: +15000.00 },
		],
	},
	{
		// Lumen
		id: "lumen",
		issuer: "Off-Card",
		product: "Lumen",
		variant: "lumen",
		image: "/images/cards/card-lumen.jpg",
		holder: "Alex Morgan",
		lastFour: "0917",
		expires: "03/28",
		materialSpec: "Dual-Tone Anodized 6000-Series Aluminum",
		massGrams: 12.2,
		thicknessMm: 0.84,
		finish: "Bead-blasted dual spectrum, kinetic striations",
		useCase: "Borderless multi-currency everyday spending",
		balance: 2380.50,
		balanceLabel: "Spent this month",
		transactions: [
			{ id: "l1", merchant: "Airbnb", detail: "Lisbon stay · Today", amount: -420.00 },
			{ id: "l2", merchant: "TAP Air Portugal", detail: "Flight LIS-LHR · Yesterday", amount: -195.00 },
			{ id: "l3", merchant: "Revolut FX", detail: "EUR→USD · 3 days ago", amount: +840.00 },
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

	return (
		<section
			id="card-designs"
			className="off-band off-band--dark card-studio-band"
			aria-labelledby="card-studio-title"
		>
			<div className="off-container">

				{/* Section headline */}
				<div className="card-studio-headline">
					<h2 id="card-studio-title" className="off-bento-h2">
						Card Architecture
					</h2>
					<p className="off-bento-lead card-studio-sub">
						Four elemental editions — each a distinct material specification,
						engineered for a specific financial function.
					</p>
				</div>

				{/* Edition selector tabs */}
				<div className="card-studio-tabs" role="tablist" aria-label="Card edition selector">
					{ELEMENTAL_CARDS.map((card, i) => (
						<button
							key={card.id}
							type="button"
							role="tab"
							id={`tab-${card.id}`}
							aria-selected={i === activeIndex}
							aria-controls={`panel-${card.id}`}
							className={`card-studio-tab${i === activeIndex ? " card-studio-tab--active" : ""} card-studio-tab--${card.variant}`}
							onClick={() => handleTabSelect(i)}
						>
							<span className="card-studio-tab-name">{card.product}</span>
							<span className="card-studio-tab-material">{card.materialSpec.split(",")[0]}</span>
						</button>
					))}
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

						{/* Physical specification readout */}
						<div className="card-studio-specs">
							<SpecRow label="Material" value={activeCard.materialSpec} />
							<SpecRow label="Mass" value={`${activeCard.massGrams}g`} />
							<SpecRow label="Thickness" value={`${activeCard.thicknessMm}mm`} />
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
						<p className="card-studio-stack-label">Wallet</p>
						<WalletStack
							cards={ELEMENTAL_CARDS}
							label="Card editions"
							currency="USD"
							locale="en-US"
							onFrontChange={handleWalletFrontChange}
							className="card-studio-wallet"
						/>
					</div>
				</div>
			</div>
		</section>
	);
}
