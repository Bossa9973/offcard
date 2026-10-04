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
import { useScrollCraft } from "../hooks/use-scroll-craft";
import { WalletShowcase } from "./wallet-showcase";
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
	const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly");

	// Desktop tile cursor spotlight (Pass 5, Section 4.7)
	useTileSpotlight(pageRef);

	// Scroll-Craft timeline, 3D card fanning, horizon wipe & kinetic reveals
	useScrollCraft(pageRef);

	// Navigation scroll compaction & active section tracking
	useEffect(() => {
		const onScroll = () => {
			setScrolled(window.scrollY > 24);
		};
		window.addEventListener("scroll", onScroll, { passive: true });
		onScroll();

		const sections = ["hero", "features", "card-designs", "pricing", "faq"];
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						setActiveSection(entry.target.id);
					}
				}
			},
			{ threshold: 0.25 }
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

	const getPlanPricing = (planId: string) => {
		if (planId === "starter") {
			return { priceNum: 0, periodText: "/month" };
		}
		if (planId === "growth") {
			return {
				priceNum: billingPeriod === "annual" ? 23 : 29,
				periodText: billingPeriod === "annual" ? "/month, billed annually" : "/month",
			};
		}
		if (planId === "scale") {
			return {
				priceNum: billingPeriod === "annual" ? 79 : 99,
				periodText: billingPeriod === "annual" ? "/month, billed annually" : "/month",
			};
		}
		return { priceNum: 0, periodText: "/month" };
	};

	return (
		<div ref={pageRef} className="off-page">
			{/* Accessibility Skip link */}
			<a href="#main-content" className="off-skip-link">
				Skip to main content
			</a>

			{/* =================================================================
			    7.1 Nav (Clean Sticky Navigation Bar)
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
							href="#card-designs"
							className={`off-nav-link ${activeSection === "card-designs" ? "off-nav-link--active" : ""}`}
						>
							Cards
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
				    Hero Section
				    - Value-noise halftone field
				    - Masked headline assembly
				    - 3D physical hero card stack
				    - Credible performance benchmarks
				    ================================================================= */}
				<section id="hero" className="off-band off-band--dark off-hero-band" aria-label="Introduction">
					{/* Living value-noise halftone field */}
					<HalftoneField variant="hero" pitch={22} className="off-hero-halftone" />

					<div className="off-container" style={{ position: "relative", zIndex: 2 }}>
						<div className="off-hero-grid">
							{/* Left Column (6 cols): Kinetic masked headline & crypto copy */}
							<div className="off-hero-content" data-keep-clear="hero-text">
								<h1 className="off-hero-h1">
									<span className="off-hero-line-mask">
										<span className="off-hero-line off-hero-line--1">Spend crypto</span>
									</span>
									<span className="off-hero-line-mask">
										<span className="off-hero-line off-hero-line--2">like cash</span>
									</span>
								</h1>

								<p className="off-hero-lead">
									Issue cards your team can use anywhere, funded from your crypto balance. Set limits, track every payment, and export clean records.
								</p>

								<div className="off-hero-ctas">
									<div data-sc-magnet="0.22" style={{ display: "inline-block" }}>
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

						{/* Dual-Column Stat Tile with CountUp */}
						<div className="off-stat-tile-combined" data-keep-clear="hero-stat-tile">
							<div className="off-stat-col">
								<div className="off-stat-num">
									<CountUp to={30} suffix="s" />
									<sup className="off-stat-fn" aria-label="Footnote 1">1</sup>
								</div>
								<p className="off-stat-copy">
									{PRODUCT_FACTS.cardIssuanceSpeed.copy}
								</p>
							</div>
							<div className="off-stat-col">
								<div className="off-stat-num">
									<CountUp to={100} suffix="%" />
									<sup className="off-stat-fn" aria-label="Footnote 2">2</sup>
								</div>
								<p className="off-stat-copy">
									{PRODUCT_FACTS.fxMarkup.copy}
								</p>
							</div>
						</div>

						{/* Stat Footnotes */}
						<div className="off-stat-footnotes">
							<span><sup>1</sup> Business identity verification required prior to issuance.</span>
							<span><sup>2</sup> Direct real-time debit against selected treasury balances at authorization.</span>
						</div>
					</div>

					{error && <p className="off-auth-error">{error}</p>}
					{meta && <p className="off-auth-meta">{meta}</p>}
				</section>

				{/* =================================================================
				    Features Bento Grid
				    - Cards in under 30s
				    - Supported assets ticker
				    - Accounting records
				    - Treasury settlement timeline
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
							{/* Tile 1: Cards in Under 30s (7 cols) */}
							<div className="off-tile off-tile--raised off-bento-cards">
								<div className="off-tile-header" style={{ maxWidth: "30ch", position: "relative", zIndex: 4 }} data-keep-clear="tile1-text">
									<h3 className="off-tile-heading">Cards in under 30 seconds</h3>
									<p className="off-tile-body">
										Issue single-use or recurring cards for anyone on your team. Set spend caps and lock cards to specific merchants.
									</p>
								</div>

								{/* Left-middle: Spend Limit Meter with fluid progress animation */}
								<div className="cards-tile__meter-wrap" style={{ position: "relative", zIndex: 4, maxWidth: "48%", marginTop: "16px" }}>
									<SpendMeter />
								</div>

								{/* Anchored Visual: Fully rendered dark card behind, light front card, micro-parallax */}
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

								{/* Pinned Bottom-Left Raised Chips */}
								<div className="cards-tile__chips" data-keep-clear="tile1-chips">
									<span className="off-chip-raised">Single-use</span>
									<span className="off-chip-raised">Recurring</span>
									<span className="off-chip-raised">Merchant-locked</span>
								</div>
							</div>

							{/* Tile 2: Assets (5 cols) */}
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
									<div className="off-currency-midmarket">
										{ASSETS_TILE_META.caption}
									</div>
								</div>
							</div>

							{/* Tile 3: Accounting (5 cols) */}
							<div className="off-tile off-bento-accounting">
								<div className="off-tile-header" data-keep-clear="tile3-header">
									<h3 className="off-tile-heading">Clean financial records</h3>
									<p className="off-tile-body">
										Every transaction arrives in your ledger with reference ID, receipt, and merchant category already attached.
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
									<div className="off-chip-raised">
										<span className="off-status-dot-active" aria-hidden="true" />
										<span>Export-ready for QuickBooks & Xero</span>
									</div>
								</div>
							</div>

							{/* Tile 4: Settlement (7 cols: Treasury settlement sequence) */}
							<div className="off-tile off-tile--gradient off-bento-treasury off-bento-settlement">
								<div className="off-tile-header" data-keep-clear="tile4-header">
									<h3 className="off-tile-heading off-tile-heading--dark">{SETTLEMENT_DEMO.heading}</h3>
									<p className="off-tile-body off-tile-body--dark">
										{SETTLEMENT_DEMO.body}
									</p>
								</div>

								{/* Vertical 3-step settlement sequence */}
								<SettlementTimeline />
							</div>
						</div>
					</div>
				</section>

				{/* =================================================================
				    Card Designs WalletStack Showcase
				    ================================================================= */}
				<WalletShowcase onAction={onAction} href={href} />

				{/* =================================================================
				    Section Seam Transition
				    ================================================================= */}
				<div className="off-horizon-seam" aria-hidden="true">
					<div className="off-horizon-line" />
				</div>

				{/* =================================================================
				    Pricing Section
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

							{/* Interactive Billing Frequency Switcher */}
							<div className="off-billing-toggle-wrap" data-keep-clear="pricing-toggle">
								<div className="off-billing-toggle" role="radiogroup" aria-label="Billing frequency selection">
									{/* Elastic sliding pill indicator */}
									<div
										className={`off-billing-indicator off-billing-indicator--${billingPeriod}`}
										aria-hidden="true"
									/>
									<button
										type="button"
										role="radio"
										aria-checked={billingPeriod === "monthly"}
										className={`off-billing-btn ${billingPeriod === "monthly" ? "off-billing-btn--active" : ""}`}
										onClick={() => setBillingPeriod("monthly")}
									>
										Monthly
									</button>
									<button
										type="button"
										role="radio"
										aria-checked={billingPeriod === "annual"}
										className={`off-billing-btn ${billingPeriod === "annual" ? "off-billing-btn--active" : ""}`}
										onClick={() => setBillingPeriod("annual")}
									>
										<span>Annual</span>
										<span className="off-billing-discount">Save 20%</span>
									</button>
								</div>
							</div>
						</div>

						<div className="off-pricing-grid">
							{PRICING_PLANS.map((plan, idx) => {
								const { priceNum, periodText } = getPlanPricing(plan.id);
								return (
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
												<CountUp to={priceNum} prefix="$" />
												<span className="off-plan-period">{periodText}</span>
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
											<div data-sc-magnet={plan.featured ? "0.18" : undefined} style={{ width: "100%" }}>
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
									</div>
								);
							})}
						</div>

						<p className="off-pricing-footnote">
							All plans include virtual card issuance and instant crypto funding. See pricing terms.
						</p>
					</div>
				</section>

				{/* =================================================================
				    FAQ Section
				    - Two-column layout with sticky sidebar
				    - Accessible accordion answers
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
				    Section Seam Transition
				    ================================================================= */}
				<div className="off-horizon-seam off-horizon-seam--bottom" aria-hidden="true">
					<div className="off-horizon-line" />
				</div>

				{/* =================================================================
				    Closing CTA Section
				    - Fast onboarding call to action
				    - Halftone accent panel
				    ================================================================= */}
				<section className="off-band off-band--dark off-cta-band" aria-labelledby="cta-title">
					<div className="off-container">
						<div className="off-cta-card">
							<div className="off-cta-content" data-keep-clear="cta-content">
								<h2 id="cta-title" className="off-cta-title">
									{PRODUCT_FACTS.onboardingTime.headline}
								</h2>
								<p className="off-cta-desc">
									{PRODUCT_FACTS.onboardingTime.body}
								</p>
								<div data-sc-magnet="0.25" style={{ display: "inline-block" }}>
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
			    7.8 Footer (Merged single clean disclosure)
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
