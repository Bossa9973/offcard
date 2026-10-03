import { useRef, useState, useEffect } from "react";
import { BankCard } from "../components/bank-card";
import { CurrencyIcon } from "../components/currency-icons";
import { HERO_LIGHT_CARD, HERO_DARK_CARD, HERO_TOAST_PAYMENTS } from "../components/demo-data";
import { useTilt } from "../hooks/use-tilt";

export interface HeroCardStackProps {
	className?: string;
}

const CURRENCY_CONFIGS: Record<
	string,
	{
		badge: string;
		networkLabel: string;
		subBalance: string;
		toastCurrency: string;
		toastSub: string;
	}
> = {
	USDC: {
		badge: "USDC",
		networkLabel: "Funded by USDC",
		subBalance: "5,750.20 USDC",
		toastCurrency: "USDC",
		toastSub: "45.00 USDC",
	},
	ETH: {
		badge: "ETH",
		networkLabel: "Funded by Ethereum",
		subBalance: "2.148 ETH",
		toastCurrency: "ETH",
		toastSub: "0.038 ETH",
	},
	SOL: {
		badge: "SOL",
		networkLabel: "Funded by Solana",
		subBalance: "38.25 SOL",
		toastCurrency: "SOL",
		toastSub: "0.42 SOL",
	},
	BTC: {
		badge: "BTC",
		networkLabel: "Funded by Bitcoin",
		subBalance: "0.0824 BTC",
		toastCurrency: "BTC",
		toastSub: "0.0012 BTC",
	},
};

/**
 * 3D Physical Hero Card Stage (Scroll-Craft Interactive Deck)
 * - Both cards fully rendered from BankCard component
 * - Dark card back: Moneta reference artwork, pinstripe texture, chip, numbers
 * - Light card front: USDC/crypto pill, balance, chip, live currency switcher
 * - Interactive 3D Fanning & Layer Separation Mode
 * - Pointer tilt + dynamic specular glare tracking
 * - Floating status toast cycles through payments
 */
export function HeroCardStack({ className = "" }: HeroCardStackProps) {
	const stageRef = useRef<HTMLDivElement>(null);
	const [hovered, setHovered] = useState(false);
	const [toastIdx, setToastIdx] = useState(0);
	const [selectedCurrency, setSelectedCurrency] = useState("USDC");
	const [fanned, setFanned] = useState(false);
	const [ripple, setRipple] = useState(false);

	// Pointer parallax hook (±5° tilt, smooth lerp + specular glare + scroll pitch)
	useTilt(stageRef, 5);

	// Cycle through payments every 5.5s
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

	const handleCurrencySelect = (code: string) => {
		setSelectedCurrency(code);
		setRipple(true);
		setTimeout(() => setRipple(false), 550);
	};

	const currentToast = HERO_TOAST_PAYMENTS[toastIdx] || HERO_TOAST_PAYMENTS[0];
	const currCfg = CURRENCY_CONFIGS[selectedCurrency] || CURRENCY_CONFIGS.USDC;

	return (
		<div
			ref={stageRef}
			className={`off-hero-stage ${hovered ? "off-hero-stage--hover" : ""} ${fanned ? "off-hero-stage--fanned" : ""} ${className}`}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			{/* Interactive Deck Toolbar */}
			<div className="off-deck-toolbar" data-keep-clear="deck-toolbar">
				<div className="off-currency-switch" role="radiogroup" aria-label="Card currency selection">
					{Object.keys(CURRENCY_CONFIGS).map((code) => {
						const active = selectedCurrency === code;
						return (
							<button
								key={code}
								type="button"
								role="radio"
								aria-checked={active}
								className={`off-curr-pill ${active ? "off-curr-pill--active" : ""}`}
								onClick={() => handleCurrencySelect(code)}
							>
								<CurrencyIcon code={code} size={13} />
								<span>{code}</span>
							</button>
						);
					})}
				</div>

				<button
					type="button"
					className={`off-fan-toggle ${fanned ? "off-fan-toggle--active" : ""}`}
					onClick={() => setFanned((v) => !v)}
					aria-label={fanned ? "Switch to stacked card view" : "Fan cards to inspect 3D layers"}
					title="Toggle 3D spatial layer fanning"
				>
					<span className="off-fan-toggle__icon" aria-hidden="true">
						{fanned ? "⊞" : "◫"}
					</span>
					<span>{fanned ? "Stacked" : "Fan 3D"}</span>
				</button>
			</div>

			{/* Floor reflection under floating card stack */}
			<div className="off-hero-floor-reflection" aria-hidden="true" />

			{/* 3D Transform Container */}
			<div className="off-hero-card-stack" aria-label="Interactive 3D Card Stack">
				{/* 1. Back Card (Dark, Fully rendered Moneta pinstripe) */}
				<div className={`off-stack-card off-stack-card--back ${fanned ? "off-stack-card--back-fanned" : ""}`}>
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

				{/* 2. Front Card (Light lumen gradient, selected crypto asset) */}
				<div
					className={`off-stack-card off-stack-card--front ${fanned ? "off-stack-card--front-fanned" : ""} ${ripple ? "off-stack-card--ripple" : ""}`}
				>
					<BankCard
						variant="light"
						balance={HERO_LIGHT_CARD.balance}
						subBalance={currCfg.subBalance}
						assetBadge={currCfg.badge}
						networkLabel={currCfg.networkLabel}
						last4={HERO_LIGHT_CARD.last4}
						expiry={HERO_LIGHT_CARD.expiry}
						holder={HERO_LIGHT_CARD.holder}
						sheenDelay="0s"
					/>
				</div>

				{/* 3. Floating Status Toast: Safe zone below-left of stack */}
				<div
					key={toastIdx}
					className="off-hero-toast off-hero-toast--animating"
					role="status"
					data-floating="hero-toast"
				>
					<div className="off-toast-dot" aria-hidden="true" />
					<CurrencyIcon code={selectedCurrency !== "USDC" && toastIdx === 0 ? selectedCurrency : currentToast.currency} size={15} />
					<div className="off-toast-text">
						<span className="off-toast-label">{currentToast.label}</span>
						<span className="off-toast-meta">·</span>
						<span className="off-toast-crypto">
							{selectedCurrency !== "USDC" && toastIdx === 0 ? currCfg.toastSub : currentToast.subLabel}
						</span>
						<span className="off-toast-merchant">({currentToast.merchant})</span>
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

