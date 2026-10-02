import { useRef, useState, useEffect } from "react";
import { BankCard } from "../components/bank-card";
import { CurrencyIcon } from "../components/currency-icons";
import { HERO_LIGHT_CARD, HERO_DARK_CARD, HERO_TOAST_PAYMENTS } from "../components/demo-data";
import { useTilt } from "../hooks/use-tilt";

export interface HeroCardStackProps {
	className?: string;
}

/**
 * 3D Physical Hero Card Stage (Pass 5, Section 1.5, 2.4, 4.3, 4.6)
 * - Both cards fully rendered from BankCard component
 * - Dark card back: balance $5,750.20, label, wordmark visible in top-left crescent
 * - Light card front: USDC pill, funded by USDC, lower balance, EMV chip
 * - Calibrated 3D poses without text collisions
 * - Floating toast cycles through 3 payments every 5.5s in safe zone below-left
 * - Pointer tilt + specular sheen tracking
 */
export function HeroCardStack({ className = "" }: HeroCardStackProps) {
	const stageRef = useRef<HTMLDivElement>(null);
	const [hovered, setHovered] = useState(false);
	const [toastIdx, setToastIdx] = useState(0);

	// Pointer parallax hook (±4° tilt, 0.08 lerp)
	useTilt(stageRef, 4);

	// Cycle through 3 demo payments every 5.5s (Pass 5, Section 4.6)
	useEffect(() => {
		const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		if (reduce) return;

		const timer = setInterval(() => {
			if (!document.hidden) {
				setToastIdx((prev) => (prev + 1) % HERO_TOAST_PAYMENTS.length);
			}
		}, 5500);

		return () => clearInterval(timer);
	}, []);

	const currentToast = HERO_TOAST_PAYMENTS[toastIdx] || HERO_TOAST_PAYMENTS[0];

	return (
		<div
			ref={stageRef}
			className={`off-hero-stage ${hovered ? "off-hero-stage--hover" : ""} ${className}`}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			aria-hidden="true"
		>
			{/* Floor reflection under floating card stack */}
			<div className="off-hero-floor-reflection" />

			{/* 3D Transform Container */}
			<div className="off-hero-card-stack">
				{/* 1. Back Card (Dark, Fully rendered Moneta pinstripe - balance & wordmark fully visible) */}
				<div className="off-stack-card off-stack-card--back">
					<BankCard
						variant="dark"
						balance={HERO_DARK_CARD.balance}
						networkLabel={HERO_DARK_CARD.networkLabel}
						cardNumber={HERO_DARK_CARD.cardNumber}
						last4={HERO_DARK_CARD.last4}
						expiry={HERO_DARK_CARD.expiry}
						holder={HERO_DARK_CARD.holder}
						sheenDelay="1s"
					/>
				</div>

				{/* 2. Front Card (Light lumen gradient, USDC pill, large balance) */}
				<div className="off-stack-card off-stack-card--front">
					<BankCard
						variant="light"
						balance={HERO_LIGHT_CARD.balance}
						subBalance={HERO_LIGHT_CARD.subBalance}
						assetBadge={HERO_LIGHT_CARD.assetBadge}
						networkLabel={HERO_LIGHT_CARD.networkLabel}
						last4={HERO_LIGHT_CARD.last4}
						expiry={HERO_LIGHT_CARD.expiry}
						holder={HERO_LIGHT_CARD.holder}
						sheenDelay="0s"
					/>
				</div>

				{/* 3. Floating Status Toast: Cycles every 5.5s in dedicated safe zone */}
				<div
					key={toastIdx}
					className="off-hero-toast off-hero-toast--animating"
					role="status"
					data-floating="hero-toast"
				>
					<div className="off-toast-dot" aria-hidden="true" />
					{currentToast.currency && (
						<CurrencyIcon code={currentToast.currency} size={15} />
					)}
					<div className="off-toast-text">
						<span className="off-toast-label">{currentToast.label}</span>
						<span className="off-toast-meta">·</span>
						<span className="off-toast-crypto">{currentToast.subLabel}</span>
						<span className="off-toast-merchant">
							({currentToast.merchant})
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}

// Backward compatibility exports
export { BankCard, VelobankCreditCard, OffCardCreditCard } from "../components/bank-card";
export const PhoneCardDeck = HeroCardStack;
export const OffCardTiltedHeroStack = HeroCardStack;
