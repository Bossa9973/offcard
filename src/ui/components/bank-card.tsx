import type { CSSProperties } from "react";
import { Pinstripe } from "./pinstripe";
import { Wordmark } from "./wordmark";
import { CurrencyIcon } from "./currency-icons";
import { MastercardLogo } from "./mastercard-logo";

export interface BankCardProps {
	variant: "dark" | "light";
	balance?: string;
	subBalance?: string;
	assetBadge?: string;
	networkLabel?: string;
	cardNumber?: string;
	last4?: string;
	expiry?: string;
	holder?: string;
	cardName?: string;
	decorative?: boolean;
	sheenDelay?: string;
	className?: string;
	style?: CSSProperties;
}

/**
 * BankCard Physical Material System (Pass 5, Section 1)
 *
 * Dark Card:
 * - 160deg dark metallic gradient base
 * - Edge-to-edge Moneta pinstripe texture (slate to olive gold, lower-right glow)
 * - Soft dark scrim behind text zones for 4.5:1+ contrast without stripe masking
 * - Top-left: "Current balance" + "$5,750.20"
 * - Top-right: Off-Card wordmark
 * - Mid-left: Metallic EMV chip
 * - Bottom-left: Full number "5282 3456 7890 2343" or masked digits
 * - Bottom-right: Expiry "08/28"
 *
 * Light Card:
 * - Clean Lumen gradient fill (pale lime to pale lavender)
 * - Top-left: Real SVG USDC token pill + "Funded by USDC"
 * - Top-right: Off-Card wordmark
 * - Mid-left: Metallic EMV chip
 * - Bottom-left: Balance / sub-balance or cardholder
 * - Bottom-right: Expiry
 */
export function BankCard({
	variant,
	balance,
	subBalance,
	assetBadge,
	networkLabel,
	cardNumber,
	last4 = "7474",
	expiry = "08/28",
	holder = "ALEX MORGAN",
	decorative = false,
	sheenDelay,
	className = "",
	style,
}: BankCardProps) {
	const dark = variant === "dark";

	if (decorative) {
		return (
			<div
				className={`off-bank-card off-bank-card--${variant} off-bank-card--decorative ${className}`}
				role="presentation"
				aria-hidden="true"
				style={style}
			>
				{dark && <Pinstripe seed={17} />}
				<div
					className="off-bankcard__sheen"
					style={sheenDelay ? { animationDelay: sheenDelay } : undefined}
					aria-hidden="true"
				/>
				{dark && <div className="off-bankcard__gloss" aria-hidden="true" />}
			</div>
		);
	}

	const displayCardNumber = cardNumber || (dark ? "5282 3456 7890 2343" : `•••• •••• •••• ${last4}`);

	return (
		<div
			className={`off-bank-card off-bank-card--${variant} ${className}`}
			role="img"
			aria-label={`${dark ? "Dark" : "Light"} Off-Card business card ending in ${last4}`}
			style={style}
		>
			{/* Dark card: edge-to-edge pinstripe with olive glow */}
			{dark && <Pinstripe seed={11} />}

			{/* Soft dark scrim behind text blocks for contrast over pinstripes */}
			{dark && (
				<>
					<div className="off-bank-card__scrim off-bank-card__scrim--top" aria-hidden="true" />
					<div className="off-bank-card__scrim off-bank-card__scrim--bottom" aria-hidden="true" />
					<div className="off-bank-card__scrim off-bank-card__scrim--brand" aria-hidden="true" />
				</>
			)}

			{/* Specular sheen & surface gloss */}
			<div
				className="off-bankcard__sheen"
				style={sheenDelay ? { animationDelay: sheenDelay } : undefined}
				aria-hidden="true"
			/>
			<div className="off-bankcard__glare" aria-hidden="true" />
			{dark && <div className="off-bankcard__gloss" aria-hidden="true" />}

			{/* Top Row */}
			<div className="off-bank-card__header">
				<div className="off-bank-card__balance-block" data-keep-clear="card-header">
					{assetBadge && (
						<div className="off-bank-card__asset-pill">
							<CurrencyIcon code={assetBadge} size={15} />
							<span className="off-asset-code">{assetBadge}</span>
						</div>
					)}
					{assetBadge && networkLabel && (
						<div className="off-bank-card__label">{networkLabel}</div>
					)}
					{!assetBadge && balance && (
						<>
							<div className="off-bank-card__label">
								{networkLabel || "Current balance"}
							</div>
							<div className="off-bank-card__balance" data-keep-clear="card-balance">
								{balance}
							</div>
							{subBalance && (
								<div className="off-bank-card__sub-balance">{subBalance}</div>
							)}
						</>
					)}
				</div>
				<div className="off-bank-card__brand-right" data-keep-clear="card-brand">
					<Wordmark variant={dark ? "foil" : "light"} size="sm" />
				</div>
			</div>

			{/* Mid Row: Metallic EMV Chip with etched contact lines */}
			<div className="off-bank-card__chip-wrapper">
				<div className="off-bank-card__chip" aria-hidden="true">
					<svg
						width="100%"
						height="100%"
						viewBox="0 0 44 32"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						style={{ position: "absolute", inset: 0, opacity: 0.28, pointerEvents: "none" }}
					>
						<rect x="0.5" y="0.5" width="43" height="31" rx="4.5" stroke="#000" strokeWidth="1" />
						<path d="M14 0V32M30 0V32M0 16H44M14 10H30M14 22H30" stroke="#000" strokeWidth="0.8" />
					</svg>
				</div>
			</div>

			{/* Bottom Row */}
			<div className="off-bank-card__footer">
				{assetBadge && balance ? (
					// Light card with large lower-left balance
					<div className="off-bank-card__lower-balance" data-keep-clear="card-balance-lower">
						<div className="off-bank-card__balance off-bank-card__balance--large">{balance}</div>
						<div className="off-bank-card__sub-balance-row">
							<span>{subBalance || "Available balance"}</span>
							<div className="off-bank-card__footer-right">
								<span className="off-bank-card__footer-expiry">{expiry}</span>
								<MastercardLogo width={30} textColor="#000000" className="off-bankcard-mc" />
							</div>
						</div>
					</div>
				) : (
					// Dark card standard layout
					<>
						<div className="off-bank-card__digits" data-keep-clear="card-digits">
							<span className="off-card-num-text">{displayCardNumber}</span>
							<div className="off-bank-card__footer-right">
								<span className="off-card-expiry-text">{expiry}</span>
								<MastercardLogo width={30} textColor="#ffffff" className="off-bankcard-mc" />
							</div>
						</div>
						{holder && !cardNumber && (
							<div className="off-bank-card__holder" data-keep-clear="card-holder">{holder}</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}

// Backward compatibility aliases
export const VelobankCreditCard = (props: {
	cardholderName?: string;
	cardNumber?: string;
	cardName?: string;
	expiry?: string;
	className?: string;
}) => (
	<BankCard
		variant="dark"
		holder={props.cardholderName}
		cardNumber={props.cardNumber}
		last4={props.cardNumber?.slice(-4)}
		expiry={props.expiry}
		className={props.className}
	/>
);

export const OffCardCreditCard = BankCard;
