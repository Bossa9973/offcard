/**
 * WalletStack – Fan a stack of payment cards and lift one out to see its activity.
 *
 * v2: Elemental Card Editions (Grid, Chrome, Carbon, Lumen)
 * - All cards clickable: clicking any background card selects it directly.
 * - CardFace uses real brand artwork images with BankCard-quality physical details.
 * - Matches Off-Card BankCard design language (EMV chip, specular sheen, rim chamfer).
 */
import {
	type KeyboardEvent,
	type PointerEvent as ReactPointerEvent,
	useCallback,
	useEffect,
	useId,
	useRef,
	useState,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { Wordmark } from "./wordmark";
import { MastercardLogo } from "./mastercard-logo";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WalletTransaction {
	id: string;
	merchant: string;
	detail: string;
	amount: number;
	icon?: React.ReactNode;
	avatar?: string;
}

export interface WalletCard {
	id: string;
	/** e.g. "Off-Card" */
	issuer: string;
	/** Edition name e.g. "Grid", "Chrome" */
	product: string;
	lastFour: string;
	holder: string;
	variant?: "grid" | "chrome" | "carbon" | "lumen";
	expires?: string;
	network?: React.ReactNode;
	/** URL path to the brand artwork image that covers the card face */
	image?: string;
	balance: number;
	balanceLabel: string;
	transactions: WalletTransaction[];
}

export interface WalletStackProps {
	cards: WalletCard[];
	label?: string;
	currency?: string;
	locale?: string;
	onSelectedChange?: (card: WalletCard | null) => void;
	/** Called when front card index changes */
	onFrontChange?: (index: number) => void;
	/** Controlled active front index */
	activeIndex?: number;
	className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(amount: number, currency = "USD", locale = "en-US") {
	return new Intl.NumberFormat(locale, {
		style: "currency",
		currency,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(amount);
}

const SPRING = { stiffness: 280, damping: 30 } as const;
const SPRING_FAST = { stiffness: 420, damping: 36 } as const;

// Per-variant text colour for overlaid typography (artwork is dark for all 4)
const TEXT_COLOR: Record<string, string> = {
	grid: "rgba(255,255,255,0.92)",
	chrome: "rgba(255,255,255,0.94)",
	carbon: "rgba(255,255,255,0.90)",
	lumen: "rgba(255,255,255,0.95)",
};

const CHIP_GRAD: Record<string, string> = {
	grid: "linear-gradient(135deg, #7a7060 0%, #c8b870 45%, #a08840 100%)",
	chrome: "linear-gradient(135deg, #b0a8a0 0%, #e0d8c8 45%, #908878 100%)",
	carbon: "linear-gradient(135deg, #585850 0%, #989080 45%, #484840 100%)",
	lumen: "linear-gradient(135deg, #c0b060 0%, #f0e098 45%, #a09040 100%)",
};

// ─── Card face ────────────────────────────────────────────────────────────────

function CardFace({
	card,
	isFront,
	isHovered,
}: {
	card: WalletCard;
	isFront: boolean;
	isHovered: boolean;
}) {
	const variant = card.variant ?? "grid";
	const textColor = TEXT_COLOR[variant] ?? "rgba(255,255,255,0.92)";

	return (
		<div
			className={`ws-card-face ws-card-face--${variant}`}
			style={{
				color: textColor,
			} as React.CSSProperties}
			aria-hidden="true"
		>
			{/* Brand artwork as full-bleed background */}
			{card.image && (
				<div
					className="ws-card-artwork"
					style={{ backgroundImage: `url(${card.image})` }}
				/>
			)}

			{/* Dark overlay scrim so typography is always readable */}
			<div className="ws-card-scrim" />

			{/* Specular glare follows pointer */}
			<div className="ws-card-glare" />

			{/* Continuous specular sheen sweep */}
			<div className="ws-card-sheen" />

			{/* Perimeter rim chamfer highlight */}
			<div className="ws-card-rim" aria-hidden="true" />

			{/* ── Header: issuer + contactless icon ── */}
			<div className="ws-card-header">
				<div className="ws-card-issuer-block">
					<span className="ws-card-issuer">{card.issuer}</span>
					<span className="ws-card-product">{card.product}</span>
				</div>
				{/* Contactless / NFC icon */}
				<svg
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.8"
					strokeLinecap="round"
					className="ws-card-contactless"
					aria-hidden="true"
				>
					<path d="M7 16a6 6 0 0 1 0-8" opacity="0.9" />
					<path d="M10.5 19a10 10 0 0 0 0-14" opacity="0.65" />
					<path d="M14 21.5a14 14 0 0 0 0-19" opacity="0.40" />
				</svg>
			</div>

			{/* ── Mid: Metallic EMV Chip ── */}
			<div className="ws-card-chip-row">
				<div
					className={`ws-card-chip ws-card-chip--${variant}`}
					style={{ background: CHIP_GRAD[variant] ?? CHIP_GRAD.grid }}
				>
					<svg
						width="100%"
						height="100%"
						viewBox="0 0 44 32"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
					>
						<rect x="0.5" y="0.5" width="43" height="31" rx="4.5" stroke="rgba(0,0,0,0.22)" strokeWidth="1" />
						<path d="M14 0V32M30 0V32M0 16H44M14 10H30M14 22H30" stroke="rgba(0,0,0,0.18)" strokeWidth="0.8" />
					</svg>
				</div>
			</div>

			{/* ── Footer: card number + holder + expiry + Mastercard logo ── */}
			<div className="ws-card-footer">
				<div className="ws-card-number">
					<span aria-hidden="true">•••• •••• ••••</span>{" "}
					<span>{card.lastFour}</span>
				</div>
				<div className="ws-card-meta">
					<div className="ws-card-holder">{card.holder.toUpperCase()}</div>
					<div className="ws-card-footer-right">
						{card.expires && (
							<div className="ws-card-expires">
								<span className="ws-card-meta-label">VALID THRU</span>
								<span className="ws-card-meta-value">{card.expires}</span>
							</div>
						)}
						<MastercardLogo width={30} textColor="#ffffff" className="ws-card-network-logo" />
					</div>
				</div>
			</div>
		</div>
	);
}

// ─── Single animated stack card ───────────────────────────────────────────────

function StackCard({
	card,
	index,
	total,
	frontIndex,
	isOpen,
	isFanning,
	currency,
	locale,
	onSelect,
	onClose,
	onBringToFront,
	labelId,
}: {
	card: WalletCard;
	index: number;
	total: number;
	frontIndex: number;
	isOpen: boolean;
	isFanning: boolean;
	currency: string;
	locale: string;
	onSelect: () => void;
	onClose: () => void;
	/** Called when a background card is clicked to bring it to front */
	onBringToFront: () => void;
	labelId: string;
}) {
	const relPos = ((index - frontIndex) % total + total) % total;
	const isFront = relPos === 0;
	const stackY = relPos * 10;
	const scale = 1 - relPos * 0.028;
	const zIndex = isFront ? total + 5 : (total - relPos);

	const y = isOpen && isFront ? -220 : isOpen ? 60 + relPos * 14 : isFanning && isFront ? -8 : stackY;
	const scaleVal = isOpen && isFront ? 1.04 : isOpen ? scale * 0.86 : scale;
	const opacity = isOpen && !isFront ? 0.18 : 1;

	// Click handler:
	// - background card → bring to front
	// - front card (open) → close
	// - front card (closed) → open
	function handleClick() {
		if (!isFront) {
			onBringToFront();
		} else if (isOpen) {
			onClose();
		} else {
			onSelect();
		}
	}

	return (
		<motion.button
			className={`ws-stack-card ws-stack-card--${card.variant ?? "grid"}${isFront ? " ws-stack-card--front" : ""}${isOpen && isFront ? " ws-stack-card--open" : ""}`}
			style={{ zIndex }}
			animate={{ y, scale: scaleVal, opacity, rotateX: isFanning && isFront ? -4 : 0 }}
			transition={SPRING}
			onPointerMove={(e: ReactPointerEvent<HTMLButtonElement>) => {
				if (!isFront) return;
				const r = e.currentTarget.getBoundingClientRect();
				const nx = (e.clientX - r.left) / r.width;
				const ny = (e.clientY - r.top) / r.height;
				e.currentTarget.style.setProperty("--ws-glare-x", `${(nx * 100).toFixed(1)}%`);
				e.currentTarget.style.setProperty("--ws-glare-y", `${(ny * 100).toFixed(1)}%`);
			}}
			onClick={handleClick}
			tabIndex={isFront ? 0 : -1}
			aria-expanded={isFront ? isOpen : undefined}
			aria-label={`Off-Card ${card.product} ending ${card.lastFour}, ${relPos + 1} of ${total}, ${formatCurrency(card.balance, currency, locale)}`}
			aria-describedby={isFront ? labelId : undefined}
		>
			<CardFace
				card={card}
				isFront={isFront}
				isHovered={isFanning && isFront}
			/>
		</motion.button>
	);
}

// ─── Activity panel ────────────────────────────────────────────────────────────

function ActivityPanel({
	card,
	currency,
	locale,
	countUpBalance,
}: {
	card: WalletCard;
	currency: string;
	locale: string;
	countUpBalance: number;
	onClose: () => void;
}) {
	return (
		<motion.div
			className="ws-activity-panel"
			initial={{ opacity: 0, y: 24 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: 12 }}
			transition={SPRING_FAST}
			role="region"
			aria-label={`${card.issuer} ${card.product} activity`}
		>
			<div className="ws-activity-balance">
				<span className="ws-activity-label">{card.balanceLabel}</span>
				<span className="ws-activity-amount">
					{formatCurrency(countUpBalance, currency, locale)}
				</span>
			</div>

			{card.transactions.length > 0 ? (
				<ul className="ws-activity-list" aria-label="Recent transactions">
					{card.transactions.map((tx, i) => (
						<motion.li
							key={tx.id}
							className="ws-activity-row"
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ ...SPRING_FAST, delay: 0.08 + i * 0.06 }}
						>
							{tx.avatar ? (
								<img src={tx.avatar} className="ws-activity-avatar" alt="" aria-hidden="true" />
							) : (
								<div className="ws-activity-icon">
									{tx.icon ?? (
										<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
											<rect x="2" y="5" width="20" height="14" rx="2" />
											<line x1="2" y1="10" x2="22" y2="10" />
										</svg>
									)}
								</div>
							)}
							<div className="ws-activity-info">
								<span className="ws-activity-merchant">{tx.merchant}</span>
								<span className="ws-activity-detail">{tx.detail}</span>
							</div>
							<span className={`ws-activity-tx-amount${tx.amount >= 0 ? " ws-activity-tx-amount--positive" : ""}`}>
								{tx.amount >= 0 ? "+" : ""}
								{formatCurrency(tx.amount, currency, locale)}
							</span>
						</motion.li>
					))}
				</ul>
			) : (
				<p className="ws-activity-empty">No recent transactions</p>
			)}
		</motion.div>
	);
}

// ─── WalletStack root ─────────────────────────────────────────────────────────

export function WalletStack({
	cards,
	label = "Wallet",
	currency = "USD",
	locale = "en-US",
	onSelectedChange,
	onFrontChange,
	activeIndex,
	className = "",
}: WalletStackProps) {
	const [internalFrontIndex, setInternalFrontIndex] = useState(0);
	const frontIndex = activeIndex !== undefined ? activeIndex : internalFrontIndex;
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [fanning, setFanning] = useState(false);
	const [countUp, setCountUp] = useState(0);
	const labelId = useId();

	const selectedCard = selectedId ? (cards.find((c) => c.id === selectedId) ?? null) : null;

	// Count-up on open
	useEffect(() => {
		if (!selectedCard) { setCountUp(0); return; }
		const target = selectedCard.balance;
		const duration = 900;
		const start = performance.now();
		let raf: number;
		const tick = (now: number) => {
			const t = Math.min(1, (now - start) / duration);
			const eased = 1 - (1 - t) ** 3;
			setCountUp(target * eased);
			if (t < 1) raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, [selectedCard]);

	const openCard = useCallback((id: string) => {
		setSelectedId(id);
		onSelectedChange?.(cards.find((c) => c.id === id) ?? null);
	}, [cards, onSelectedChange]);

	const closeCard = useCallback(() => {
		setSelectedId(null);
		onSelectedChange?.(null);
	}, [onSelectedChange]);

	const cycleFront = useCallback((delta: number) => {
		const next = ((frontIndex + delta) % cards.length + cards.length) % cards.length;
		if (activeIndex === undefined) {
			setInternalFrontIndex(next);
		}
		onFrontChange?.(next);
	}, [cards.length, onFrontChange, frontIndex, activeIndex]);

	/** Bring a specific card (by cards array index) to the front */
	const bringToFront = useCallback((cardIndex: number) => {
		// If a card is open, switch to that card's open state directly
		if (selectedId !== null) {
			openCard(cards[cardIndex].id);
		}
		if (activeIndex === undefined) {
			setInternalFrontIndex(cardIndex);
		}
		onFrontChange?.(cardIndex);
	}, [cards, selectedId, openCard, onFrontChange, activeIndex]);

	const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
		switch (e.key) {
			case "ArrowDown": case "ArrowRight":
				e.preventDefault();
				if (selectedId) {
					const cur = cards.findIndex((c) => c.id === selectedId);
					openCard(cards[(cur + 1) % cards.length].id);
				} else cycleFront(1);
				break;
			case "ArrowUp": case "ArrowLeft":
				e.preventDefault();
				if (selectedId) {
					const cur = cards.findIndex((c) => c.id === selectedId);
					openCard(cards[((cur - 1) % cards.length + cards.length) % cards.length].id);
				} else cycleFront(-1);
				break;
			case "Home":
				e.preventDefault();
				if (selectedId) openCard(cards[0].id); else bringToFront(0);
				break;
			case "End":
				e.preventDefault();
				if (selectedId) openCard(cards[cards.length - 1].id); else bringToFront(cards.length - 1);
				break;
			case "Enter": case " ":
				e.preventDefault();
				if (selectedId) closeCard(); else openCard(cards[frontIndex].id);
				break;
			case "Escape":
				e.preventDefault();
				closeCard();
				break;
		}
	}, [cards, cycleFront, closeCard, frontIndex, openCard, selectedId, bringToFront]);

	if (!cards.length) return null;

	return (
		<div
			className={`ws-root ${className}`}
			role="group"
			aria-label={label}
			onKeyDown={handleKeyDown}
		>
			{/* SR hint */}
			<span id={labelId} className="ws-sr-hint">
				Arrow keys cycle cards, Enter opens, Escape closes.
			</span>

			{/* Header bar */}
			<div className="ws-header">
				<AnimatePresence mode="wait">
					{selectedCard ? (
						<motion.button
							key="back"
							className="ws-back-btn"
							initial={{ opacity: 0, x: -6 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -6 }}
							transition={SPRING_FAST}
							onClick={closeCard}
						>
							<ArrowLeft size={13} aria-hidden="true" />
							All cards
						</motion.button>
					) : (
						<motion.span
							key="count"
							className="ws-header-label"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={SPRING_FAST}
						>
							{label} · {cards.length} {cards.length === 1 ? "card" : "cards"}
						</motion.span>
					)}
				</AnimatePresence>
			</div>

			{/* Card stage */}
			<div
				className={`ws-stage${fanning ? " ws-stage--fanning" : ""}`}
				onMouseEnter={() => !selectedId && setFanning(true)}
				onMouseLeave={() => setFanning(false)}
			>
				{cards.map((card, i) => (
					<StackCard
						key={card.id}
						card={card}
						index={i}
						total={cards.length}
						frontIndex={frontIndex}
						isOpen={selectedId !== null}
						isFanning={fanning && selectedId === null}
						currency={currency}
						locale={locale}
						labelId={labelId}
						onSelect={() => openCard(card.id)}
						onClose={closeCard}
						onBringToFront={() => bringToFront(i)}
					/>
				))}
			</div>

			{/* Activity panel */}
			<AnimatePresence>
				{selectedCard && (
					<ActivityPanel
						key={selectedCard.id}
						card={selectedCard}
						currency={currency}
						locale={locale}
						countUpBalance={countUp}
						onClose={closeCard}
					/>
				)}
			</AnimatePresence>

			{/* SR live region */}
			<div role="status" aria-live="polite" aria-atomic="true" className="ws-sr-hint">
				{selectedCard ? `${selectedCard.issuer} ${selectedCard.product} opened` : ""}
			</div>
		</div>
	);
}
