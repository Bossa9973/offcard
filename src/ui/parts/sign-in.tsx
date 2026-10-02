import { type ReactNode, useEffect, useRef, useState } from "react";
import { Button } from "../components/button";
import { HalftoneField } from "../components/halftone-field";
import { BankCard } from "../components/bank-card";
import { Wordmark } from "../components/wordmark";
import { HeroCardStack } from "./phone-card-deck";
import { FaqItem } from "../components/faq-item";
import { CountUp } from "../components/count-up";
import { SpendMeter } from "../components/spend-meter";
import { SettlementTimeline } from "../components/settlement-timeline";
import { AssetsTicker } from "../components/assets-ticker";
import { useTileSpotlight } from "../hooks/use-tile-spotlight";
import {
	ASSETS_TILE_META,
	SETTLEMENT_DEMO,
	SAMPLE_LEDGER_ROWS,
	PRICING_PLANS,
	FAQ_QUESTIONS,
	HERO_LIGHT_CARD,
	HERO_DARK_CARD,
} from "../components/demo-data";
import { PRODUCT_FACTS } from "../../content/productFacts";

export function SignIn({
	error,
	href = "/api/auth/login",
	label = "Open account",
	meta,
	onAction,
}: {
	error?: string;
	href?: string;
	label?: string;
	meta?: string;
	onAction?: () => void;
	subtitle?: string;
	title?: ReactNode;
}) {
	const currentYear = new Date().getFullYear();
	const pageRef = useRef<HTMLDivElement>(null);
	const [scrolled, setScrolled] = useState(false);
	const [activeSection, setActiveSection] = useState<string>("features");

	// Desktop tile cursor spotlight (Pass 5, Section 4.7)
	useTileSpotlight(pageRef);

	// Navigation scroll compaction & active section tracking (Pass 5, Section 4.9 & 5.1)
	useEffect(() => {
		const onScroll = () => {
			setScrolled(window.scrollY > 24);
		};
		window.addEventListener("scroll", onScroll, { passive: true });
		onScroll();

		// Track active section for nav underline
		const sections = ["features", "pricing", "faq"];
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						setActiveSection(entry.target.id);
					}
				}
			},
			{ threshold: 0.3 }
		);

		sections.forEach((id) => {
			const el = document.getElementById(id);
			if (el) observer.observe(el);
		});

		return () => {
			window.removeEventListener("scroll", onScroll);
			observer.disconnect();
		};
	}, []);

	return (
		<div ref={pageRef} className="off-page">
			{/* Accessibility Skip link */}
			<a href="#main-content" className="off-skip-link">
				Skip to main content
			</a>

			{/* =================================================================
			    7.1 Nav (Pass 5, Section 4.9 & 5.1: 64px -> 56px on scroll,
			    rgba(0,0,0,0.92) blur(16px), zero grey strip, clean over white band)
			    ================================================================= */}
			<header className={`off-nav-sticky ${scrolled ? "off-nav-sticky--scrolled" : ""}`}>
				<div className="off-nav-container">
					<a href="/" className="off-brand-link" aria-label="Off-Card Home" data-keep-clear="nav-brand">
						<Wordmark variant="dark" size="md" />
					</a>

					<nav className="off-nav-links" aria-label="Primary navigation">
						<a
							href="#features"
							className={`off-nav-link ${activeSection === "features" ? "off-nav-link--active" : ""}`}
						>
							Features
						</a>
						<a
							href="#pricing"
							className={`off-nav-link ${activeSection === "pricing" ? "off-nav-link--active" : ""}`}
						>
							Pricing
						</a>
						<a
							href="#faq"
							className={`off-nav-link ${activeSection === "faq" ? "off-nav-link--active" : ""}`}
						>
							FAQ
						</a>
					</nav>

					<div className="off-nav-actions">
						<Button
							variant="primary"
							size="sm"
							href={onAction ? undefined : href}
							onClick={onAction}
						>
							Open account
						</Button>
					</div>
				</div>
			</header>

			<main id="main-content">
				{/* =================================================================
				    7.2 Hero Band (Pass 5, Section 3.2: Living HalftoneField background,
				    staggered entrance, fully rendered Moneta cards, no overlaps)
				    ================================================================= */}
				<section className="off-band off-band--dark off-hero-band" aria-label="Introduction">
					{/* Living value-noise halftone field */}
					<HalftoneField variant="hero" pitch={22} className="off-hero-halftone" />

					<div className="off-container" style={{ position: "relative", zIndex: 2 }}>
						<div className="off-hero-grid">
							{/* Left Column (6 cols): 2-line uppercase headline & crypto copy */}
							<div className="off-hero-content" data-keep-clear="hero-text">
								<h1 className="off-hero-h1">
									<span className="off-hero-line off-hero-line--1">Spend crypto</span>
									<span className="off-hero-line off-hero-line--2">like cash</span>
								</h1>

								<p className="off-hero-lead">
									Issue cards your team can use anywhere, funded from your crypto balance. Set limits, track every payment, and export clean records.
								</p>

								<div className="off-hero-ctas">
									<Button
										variant="primary"
										size="md"
										icon={true}
										href={onAction ? undefined : href}
										onClick={onAction}
									>
										Open account
									</Button>
									<Button
										variant="outline-dark"
										size="md"
										href="#features"
									>
										How it works
									</Button>
								</div>
							</div>

							{/* Right Column (6 cols): 3D Physical Hero Card Stack */}
							<div className="off-hero-visual">
								<HeroCardStack />
							</div>
						</div>

						{/* Single Merged Dual-Column Stat Tile with CountUp & Superscript numerals (Pass 5, Section 4.5 & 5.3) */}
						<div className="off-stat-tile-combined" data-keep-clear="hero-stat-tile">
							<div className="off-stat-col">
								<div className="off-stat-num">
									<CountUp to={30} suffix="s" />
									<sup className="off-stat-fn" aria-label="Footnote 1">1</sup>
								</div>
								{/* VERIFY: 30s issuance claim verification */}
								<p className="off-stat-copy">
									{PRODUCT_FACTS.cardIssuanceSpeed.copy}
								</p>
							</div>
							<div className="off-stat-col">
								<div className="off-stat-num">
									<CountUp to={0} suffix="%" />
									<sup className="off-stat-fn" aria-label="Footnote 2">2</sup>
								</div>
								{/* VERIFY: substantiate 0% FX markup claim */}
								<p className="off-stat-copy">
									{PRODUCT_FACTS.fxMarkup.copy}
								</p>
							</div>
						</div>

						{/* Stat Footnotes */}
						<div className="off-stat-footnotes">
							<span><sup>1</sup> Business identity verification required prior to issuance.</span>
							<span><sup>2</sup> Subject to standard network exchange spread at point of sale.</span>
						</div>
					</div>

					{error && <p className="off-auth-error">{error}</p>}
					{meta && <p className="off-auth-meta">{meta}</p>}
				</section>

				{/* =================================================================
				    7.3 Feature Bento (Pass 5, Section 2: Overlap & Cropping Fixes)
				    ================================================================= */}
				<section id="features" className="off-band off-band--dark off-bento-band" aria-labelledby="features-title">
					<div className="off-container">
						{/* Single Merged Header: Heading left (7 cols), Paragraph right (5 cols) */}
						<div className="off-bento-header" data-keep-clear="features-header">
							<h2 id="features-title" className="off-bento-h2">
								Everything you need to spend crypto at work
							</h2>
							<p className="off-bento-lead">
								One dashboard for cards, balances, limits, and reporting.
							</p>
						</div>

						<div className="off-bento-grid-12">
							{/* Tile 1: Cards in Under 30s (7 cols, Pass 5, Section 2.1)
							    - Toast removed! (Hero only)
							    - Text block top-left (max-width: 30ch)
							    - Spend limit meter left-middle
							    - Pinned bottom-left chips row (max-width: 52%)
							    - Bleeding visual right and bottom (width 58%, max 6% bleed)
							*/}
							<div className="off-tile off-tile--raised off-bento-cards">
								<div className="off-tile-header" style={{ maxWidth: "30ch", position: "relative", zIndex: 4 }} data-keep-clear="tile1-text">
									<h3 className="off-tile-heading">Cards in under 30 seconds</h3>
									<p className="off-tile-body">
										Issue single-use or recurring cards for anyone on your team. Set spend caps and lock cards to specific merchants.
									</p>
								</div>

								{/* Left-middle: Spend Limit Meter (Pass 5, Section 2.1) */}
								<div className="cards-tile__meter-wrap" style={{ position: "relative", zIndex: 4, maxWidth: "48%", marginTop: "16px" }}>
									<SpendMeter />
								</div>

								{/* Anchored Visual: Fully rendered dark card behind, light front card, max 6% bleed */}
								<div className="cards-tile__visual" aria-hidden="true">
									<div className="cards-tile__back">
										<BankCard
											variant="dark"
											balance={HERO_DARK_CARD.balance}
											networkLabel={HERO_DARK_CARD.networkLabel}
											cardNumber={HERO_DARK_CARD.cardNumber}
											last4={HERO_DARK_CARD.last4}
											expiry={HERO_DARK_CARD.expiry}
											holder={HERO_DARK_CARD.holder}
											sheenDelay="1.5s"
										/>
									</div>
									<div className="cards-tile__front">
										<BankCard
											variant="light"
											balance={HERO_LIGHT_CARD.balance}
											subBalance={HERO_LIGHT_CARD.subBalance}
											assetBadge={HERO_LIGHT_CARD.assetBadge}
											networkLabel={HERO_LIGHT_CARD.networkLabel}
											last4={HERO_LIGHT_CARD.last4}
											expiry={HERO_LIGHT_CARD.expiry}
											holder={HERO_LIGHT_CARD.holder}
											sheenDelay="0.5s"
										/>
									</div>
								</div>

								{/* Pinned Bottom-Left Raised Chips (max-width: 52% - zero collision with card) */}
								<div className="cards-tile__chips" data-keep-clear="tile1-chips">
									<span className="off-chip-raised">Single-use</span>
									<span className="off-chip-raised">Recurring</span>
									<span className="off-chip-raised">Merchant-locked</span>
								</div>
							</div>

							{/* Tile 2: Assets (5 cols, Pass 5: Real SVG icons & live tick demo) */}
							<div className="off-tile off-bento-currency">
								<div className="off-tile-header" data-keep-clear="tile2-header">
									<h3 className="off-tile-heading">{ASSETS_TILE_META.heading}</h3>
									<p className="off-tile-body">
										{ASSETS_TILE_META.lead}
									</p>
								</div>

								<div className="off-currency-box">
									<div style={{ fontSize: "11px", color: "var(--on-dark-faint)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
										{ASSETS_TILE_META.sampleLabel}
									</div>
									{/* Real vector SVG currency icons + live tick */}
									<AssetsTicker />
									{/* VERIFY: Converted at spend */}
									<div className="off-currency-midmarket">
										{ASSETS_TILE_META.caption}
									</div>
								</div>
							</div>

							{/* Tile 3: Accounting (5 cols, neutral demo merchants - Pass 5, Section 5.5) */}
							<div className="off-tile off-bento-accounting">
								<div className="off-tile-header" data-keep-clear="tile3-header">
									<h3 className="off-tile-heading">Books that close themselves</h3>
									<p className="off-tile-body">
										Every transaction arrives in your ledger with on-chain reference, receipt, and category already attached.
									</p>
								</div>

								<div className="off-ledger-list" data-keep-clear="tile3-ledger">
									{SAMPLE_LEDGER_ROWS.map((row, i) => (
										<div key={i} className="off-well off-ledger-item">
											<div className="off-ledger-left">
												<span className="off-ledger-date">{row.date}</span>
												<div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
													<span className="off-ledger-merchant">{row.merchant}</span>
													<span className="off-tx-hash">{row.txHash}</span>
												</div>
											</div>
											<strong className="off-ledger-amount">{row.amount}</strong>
										</div>
									))}
								</div>

								<div style={{ marginTop: "auto" }} data-keep-clear="tile3-chips">
									{/* VERIFY: QuickBooks and Xero sync */}
									<div className="off-chip-raised">
										<span className="off-status-dot-active" aria-hidden="true" />
										<span>Synced to QuickBooks and Xero</span>
									</div>
								</div>
							</div>

							{/* Tile 4: Settlement (7 cols, Pass 5, Section 2.2: 3-step timeline) */}
							<div className="off-tile off-tile--gradient off-bento-treasury off-bento-settlement">
								<div className="off-tile-header" data-keep-clear="tile4-header">
									<h3 className="off-tile-heading off-tile-heading--dark">{SETTLEMENT_DEMO.heading}</h3>
									{/* VERIFY: On-chain settlement mechanism */}
									<p className="off-tile-body off-tile-body--dark">
										{SETTLEMENT_DEMO.body}
									</p>
								</div>

								{/* Vertical 3-step settlement sequence (Authorized -> Converted -> Settled) */}
								<SettlementTimeline />

								{/* Decorative Sparkline SVG */}
								<svg aria-hidden="true" className="off-sparkline" viewBox="0 0 320 80" fill="none">
									<path
										d="M0 65 C 60 60, 110 40, 160 35 C 210 30, 260 15, 320 8"
										stroke="var(--on-primary)"
										strokeWidth="1.5"
										strokeOpacity="0.28"
									/>
								</svg>
							</div>
						</div>
					</div>
				</section>

				{/* =================================================================
				    7.4 Pricing (Light Catalogue Band, Lifted White Cards, Pass 5)
				    ================================================================= */}
				<section id="pricing" className="off-band off-band--light off-pricing-band" aria-labelledby="pricing-title">
					<div className="off-container">
						<div className="off-section-header" data-keep-clear="pricing-header">
							<h2 id="pricing-title" className="off-section-h2">
								Simple pricing. No hidden spreads
							</h2>
							<p className="off-section-sub">
								Start free. Upgrade when you need more cards, multi-asset spending, or programmatic API access.
							</p>
						</div>

						<div className="off-pricing-grid">
							{PRICING_PLANS.map((plan, idx) => (
								<div
									key={plan.id}
									className={`off-plan-card ${plan.featured ? "off-plan-card--featured" : ""}`}
									style={{ "--i": idx } as React.CSSProperties}
									data-keep-clear={`plan-${plan.id}`}
								>
									{plan.featured && (
										<div className="off-plan-badge">MOST POPULAR</div>
									)}

									<div className="off-plan-top">
										<h3 className="off-plan-name">{plan.name}</h3>
										<div className="off-plan-price">
											<CountUp to={parseInt(plan.price.replace("$", ""), 10)} prefix="$" />
											<span className="off-plan-period">{plan.period}</span>
										</div>
										<p className="off-plan-desc">{plan.description}</p>

										<ul className="off-plan-features">
											{plan.features.map((feat) => (
												<li key={feat} className="off-plan-feature-item">
													<svg
														className="off-check-icon"
														width="16"
														height="16"
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
														strokeWidth="2"
														strokeLinecap="round"
														strokeLinejoin="round"
														aria-hidden="true"
													>
														<polyline points="20 6 9 17 4 12" />
													</svg>
													<span>{feat}</span>
												</li>
											))}
										</ul>
									</div>

									<div className="off-plan-bottom">
										<Button
											variant={plan.variant}
											size="md"
											href={onAction ? undefined : href}
											onClick={onAction}
											className="off-plan-cta"
										>
											{plan.cta}
										</Button>
									</div>
								</div>
							))}
						</div>

						<p className="off-pricing-footnote">
							All plans include virtual card issuance and instant crypto funding. See pricing terms.
						</p>
					</div>
				</section>

				{/* =================================================================
				    7.5 FAQ (Light Band, Sticky Sidebar, Animated Accordion, Pass 5)
				    ================================================================= */}
				<section id="faq" className="off-band off-band--light off-faq-band" aria-labelledby="faq-title">
					<div className="off-container">
						<div className="off-faq-grid">
							{/* Left Column (Sticky heading + contact) */}
							<div className="off-faq-sidebar" data-keep-clear="faq-sidebar">
								<h2 id="faq-title" className="off-section-h2">
									Common questions
								</h2>
								<p className="off-faq-contact-text">
									Can't find your answer? Talk to our team.
								</p>
								<Button
									variant="outline-light"
									size="sm"
									href="mailto:support@offcard.com"
								>
									Contact support
								</Button>
							</div>

							{/* Right Column: Accessible FAQ Accordion */}
							<div className="off-faq-accordion">
								{FAQ_QUESTIONS.map((item, idx) => (
									<FaqItem
										key={item.id}
										question={item.question}
										answer={item.answer}
										defaultOpen={idx === 0}
									/>
								))}
							</div>
						</div>
					</div>
				</section>

				{/* =================================================================
				    7.6 Closing CTA (Dark Band, HalftoneField panel variant, Pass 5)
				    ================================================================= */}
				<section className="off-band off-band--dark off-cta-band" aria-labelledby="cta-title">
					<div className="off-container">
						<div className="off-cta-card">
							<div className="off-cta-content" data-keep-clear="cta-content">
								{/* VERIFY: 5 minute onboarding claim */}
								<h2 id="cta-title" className="off-cta-title">
									{PRODUCT_FACTS.onboardingTime.headline}
								</h2>
								<p className="off-cta-desc">
									{PRODUCT_FACTS.onboardingTime.body}
								</p>
								<Button
									variant="primary"
									size="md"
									icon={true}
									href={onAction ? undefined : href}
									onClick={onAction}
								>
									Open account
								</Button>
							</div>

							{/* Living HalftoneField panel variant (right 40% only) */}
							<div className="off-cta-dots-wrap" aria-hidden="true">
								<HalftoneField variant="panel" pitch={20} />
							</div>
						</div>
					</div>
				</section>
			</main>

			{/* =================================================================
			    7.7 Footer (Pass 5, Section 5.4: Merged single clean disclosure)
			    ================================================================= */}
			<footer className="off-footer">
				<div className="off-container">
					<div className="off-footer-main">
						<div className="off-footer-brand" data-keep-clear="footer-brand">
							<a href="/" className="off-brand-link" aria-label="Off-Card Home">
								<Wordmark variant="dark" size="sm" />
							</a>
							<p className="off-footer-tagline">Spend crypto like cash.</p>
						</div>

						<nav className="off-footer-nav" aria-label="Footer links">
							<a href="#privacy" className="off-footer-link">Privacy Policy</a>
							<a href="#terms" className="off-footer-link">Terms of Service</a>
							<a href="#security" className="off-footer-link">Security</a>
						</nav>
					</div>

					<div className="off-footer-legal" data-keep-clear="footer-legal">
						{/* Single Merged Clean Disclosure without placeholders */}
						<p className="off-legal-disclosure">
							Off-Card is a financial technology platform, not a bank. Crypto assets are volatile and not insured by the FDIC or SIPC. Cards are issued pursuant to licenses from payment card networks.
						</p>
						<p className="off-copyright">
							&copy; {currentYear} Off-Card. All rights reserved.
						</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
