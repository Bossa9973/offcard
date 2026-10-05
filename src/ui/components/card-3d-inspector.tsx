/**
 * Card3DInspector
 *
 * Large-format, physically-modelled 3D card display.
 * - Dynamic pointer-tracking perspective tilt (±14° X/Y).
 * - Live specular glare that follows the cursor.
 * - Click-to-flip (or Flip button) to inspect the physical card back.
 * - Physical back face: magnetic stripe, signature area, laser-etched CVC,
 *   laser-etched cardholder, contactless antenna mark.
 *
 * Designed to match the Off-Card BankCard design language exactly.
 */

import {
	type PointerEvent as ReactPointerEvent,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { motion, AnimatePresence, type Variants } from "motion/react";
import { Wordmark } from "./wordmark";
import { MastercardLogo } from "./mastercard-logo";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InspectorCardData {
	id: string;
	/** Edition name: "Grid", "Chrome", "Carbon", "Lumen" */
	product: string;
	variant: "grid" | "chrome" | "carbon" | "lumen";
	/** URL of the full-bleed brand artwork image */
	image: string;
	holder: string;
	lastFour: string;
	expires: string;
	/** One-liner physical material specification */
	materialSpec: string;
	/** Mass in grams */
	massGrams: number;
	/** Thickness in mm */
	thicknessMm: number;
	/** Surface finish descriptor */
	finish: string;
	/** Primary use case */
	useCase: string;
}

export interface Card3DInspectorProps {
	card: InspectorCardData;
	onFlip?: (isBack: boolean) => void;
	className?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_TILT = 14; // degrees

// Variant-specific overlays that add material character on top of the artwork
const VARIANT_OVERLAY: Record<string, string> = {
	grid: "rgba(12,14,20,0.38)",
	chrome: "rgba(8,8,12,0.28)",
	carbon: "rgba(6,6,8,0.42)",
	lumen: "rgba(14,12,18,0.32)",
};

// ─── EMV Chip ────────────────────────────────────────────────────────────────

function EMVChip({ variant }: { variant: string }) {
	const chipGrad: Record<string, string> = {
		grid: "linear-gradient(135deg, #7a7060 0%, #c8b870 45%, #a08840 100%)",
		chrome: "linear-gradient(135deg, #b0a8a0 0%, #e0d8c8 45%, #908878 100%)",
		carbon: "linear-gradient(135deg, #585850 0%, #989080 45%, #484840 100%)",
		lumen: "linear-gradient(135deg, #c0b060 0%, #f0e098 45%, #a09040 100%)",
	};

	return (
		<div
			className="card3d-chip"
			style={{ background: chipGrad[variant] ?? chipGrad.grid }}
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
	);
}

// ─── Preloaded Artwork Assets ────────────────────────────────────────────────
const ALL_EDITION_ARTWORKS = [
	{ id: "grid", image: "/images/cards/card-grid.jpg" },
	{ id: "chrome", image: "/images/cards/card-chrome.jpg" },
	{ id: "carbon", image: "/images/cards/card-carbon.jpg" },
	{ id: "lumen", image: "/images/cards/card-lumen.jpg" },
];

// ─── Front Face ───────────────────────────────────────────────────────────────

function CardFront({
	card,
	isHovered,
}: {
	card: InspectorCardData;
	isHovered: boolean;
}) {
	return (
		<div
			className={`card3d-face card3d-face--front card3d-face--${card.variant}`}
		>
			{/* Brand artwork for active edition */}
			<div
				className="card3d-artwork"
				style={{
					backgroundImage: `url(${card.image})`,
					opacity: 1,
					pointerEvents: "none",
				}}
				aria-hidden="true"
			/>

			{/* Dark overlay for legibility */}
			<div
				className="card3d-overlay"
				style={{ background: VARIANT_OVERLAY[card.variant] }}
			/>

			{/* Dynamic specular glare */}
			<div
				className="card3d-glare"
				style={{ opacity: isHovered ? 1 : 0 }}
			/>

			{/* Animated specular sheen sweep */}
			<div className="card3d-sheen" />

			{/* Perimeter rim chamfer */}
			<div className="card3d-rim" />

			{/* Header row: edition badge + contactless */}
			<div className="card3d-header">
				<div className="card3d-edition">
					<span className="card3d-issuer">Off-Card</span>
					<span className="card3d-product">{card.product}</span>
				</div>
				{/* Contactless wave */}
				<svg
					width="22"
					height="22"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.6"
					strokeLinecap="round"
					className="card3d-contactless"
					aria-hidden="true"
				>
					<path d="M7 16a6 6 0 0 1 0-8" opacity="0.95" />
					<path d="M10.5 19a10 10 0 0 0 0-14" opacity="0.65" />
					<path d="M14 21.5a14 14 0 0 0 0-19" opacity="0.38" />
				</svg>
			</div>

			{/* Mid: EMV Chip */}
			<div className="card3d-chip-row">
				<EMVChip variant={card.variant} />
			</div>

			{/* Footer row: masked PAN + holder + expiry + Mastercard logo */}
			<div className="card3d-footer">
				<div className="card3d-pan">
					<span aria-hidden="true">•••• •••• ••••</span>{" "}
					<span>{card.lastFour}</span>
				</div>
				<div className="card3d-footer-meta">
					<span className="card3d-holder">{card.holder.toUpperCase()}</span>
					<div className="card3d-footer-right">
						<div className="card3d-expiry">
							<span className="card3d-expiry-label">VALID THRU</span>
							<span className="card3d-expiry-value">{card.expires}</span>
						</div>
						<MastercardLogo width={38} textColor="#ffffff" className="card3d-network-logo" />
					</div>
				</div>
			</div>
		</div>
	);
}

// ─── Back Face ────────────────────────────────────────────────────────────────

function CardBack({ card }: { card: InspectorCardData }) {
	return (
		<div className={`card3d-face card3d-face--back card3d-face--${card.variant}`}>
			{/* Brand artwork for active edition on back */}
			<div
				className="card3d-artwork card3d-artwork--back"
				style={{
					backgroundImage: `url(${card.image})`,
					opacity: 1,
					pointerEvents: "none",
				}}
				aria-hidden="true"
			/>
			<div className="card3d-overlay" style={{ background: VARIANT_OVERLAY[card.variant] }} />
			<div className="card3d-rim" />

			{/* Magnetic Stripe */}
			<div className="card3d-magstripe" aria-hidden="true">
				<div className="card3d-magstripe-band" />
			</div>

			{/* Signature + CVC panel */}
			<div className="card3d-signature-row" aria-hidden="true">
				<div className="card3d-signature-panel">
					{/* Laser-etched diagonal lines pattern */}
					<div className="card3d-signature-lines" />
					<div className="card3d-holder-etch">{card.holder.toUpperCase()}</div>
				</div>
				<div className="card3d-cvc-block">
					<span className="card3d-cvc-label">CVV</span>
					<span className="card3d-cvc-value">•••</span>
				</div>
			</div>

			{/* Contactless antenna marker */}
			<div className="card3d-antenna-row">
				<svg
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.6"
					strokeLinecap="round"
					className="card3d-contactless"
					style={{ opacity: 0.5 }}
					aria-hidden="true"
				>
					<path d="M7 16a6 6 0 0 1 0-8" />
					<path d="M10.5 19a10 10 0 0 0 0-14" opacity="0.65" />
					<path d="M14 21.5a14 14 0 0 0 0-19" opacity="0.35" />
				</svg>

				{/* Wordmark at bottom-right of back */}
				<Wordmark variant="foil" size="sm" style={{ gap: "6px" }} />
			</div>

			{/* Laser-etched expiry on back */}
			<div className="card3d-back-expiry">
				<span className="card3d-expiry-label">VALID THRU</span>
				<span className="card3d-expiry-value">{card.expires}</span>
			</div>
		</div>
	);
}

// ─── Flip button ──────────────────────────────────────────────────────────────

function FlipButton({ isBack, onClick }: { isBack: boolean; onClick: () => void }) {
	return (
		<button
			type="button"
			className="card3d-flip-btn"
			onClick={onClick}
			aria-label={isBack ? "Show card front" : "Flip to card back"}
		>
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
				<path d="M1 4v6h6" />
				<path d="M23 20v-6h-6" />
				<path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" />
			</svg>
			{isBack ? "Show front" : "Flip card"}
		</button>
	);
}

const CARD_TRANSITION_VARIANTS: Variants = {
	initial: { opacity: 0, y: -10 },
	animate: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const },
	},
	exit: {
		opacity: 0,
		y: 10,
		transition: { duration: 0.18, ease: "easeIn" },
	},
};

// ─── Card3DInspector root ─────────────────────────────────────────────────────

export function Card3DInspector({ card, onFlip, className = "" }: Card3DInspectorProps) {
	const [isFlipped, setIsFlipped] = useState(false);
	const [isHovered, setIsHovered] = useState(false);
	const [isTransitioning, setIsTransitioning] = useState(false);
	const cardRef = useRef<HTMLDivElement>(null);
	const rafRef = useRef<number>(0);

	// Preload all 4 edition textures on idle
	useEffect(() => {
		const preload = () => {
			ALL_EDITION_ARTWORKS.forEach((item) => {
				const img = new Image();
				img.src = item.image;
			});
		};
		if (typeof window !== "undefined") {
			if ("requestIdleCallback" in window) {
				(window as unknown as { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(preload);
			} else {
				setTimeout(preload, 150);
			}
		}
	}, []);

	// Reset flip state cleanly when card edition changes
	useEffect(() => {
		setIsFlipped(false);
		const el = cardRef.current;
		if (el) {
			el.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg)";
		}
	}, [card.id]);

	const handlePointerMove = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
		const el = cardRef.current;
		if (!el || isFlipped || isTransitioning) return;
		const rect = el.getBoundingClientRect();
		const nx = (e.clientX - rect.left) / rect.width;
		const ny = (e.clientY - rect.top) / rect.height;

		const targetRotY = (nx - 0.5) * MAX_TILT * 2;
		const targetRotX = -(ny - 0.5) * MAX_TILT * 1.4;

		cancelAnimationFrame(rafRef.current);
		rafRef.current = requestAnimationFrame(() => {
			if (!el) return;
			el.style.transform = `perspective(1200px) rotateX(${targetRotX.toFixed(2)}deg) rotateY(${targetRotY.toFixed(2)}deg)`;
			el.style.setProperty("--card3d-glare-x", `${(nx * 100).toFixed(1)}%`);
			el.style.setProperty("--card3d-glare-y", `${(ny * 100).toFixed(1)}%`);
		});
	}, [isFlipped, isTransitioning]);

	const handlePointerLeave = useCallback(() => {
		setIsHovered(false);
		const el = cardRef.current;
		if (!el) return;
		cancelAnimationFrame(rafRef.current);
		el.style.transition = "transform 0.75s cubic-bezier(0.22, 1, 0.36, 1)";
		el.style.transform = isFlipped
			? "perspective(1200px) rotateX(0deg) rotateY(180deg)"
			: "perspective(1200px) rotateX(0deg) rotateY(0deg)";
		setTimeout(() => {
			if (el) el.style.transition = "";
		}, 750);
	}, [isFlipped]);

	const handleFlip = useCallback(() => {
		if (isTransitioning) return;
		const next = !isFlipped;
		setIsFlipped(next);
		const el = cardRef.current;
		if (el) {
			// Buttery-smooth, luxurious easing with natural inertia
			el.style.transition = "transform 0.88s cubic-bezier(0.22, 1, 0.36, 1)";
			el.style.transform = next
				? "perspective(1200px) rotateX(0deg) rotateY(180deg)"
				: "perspective(1200px) rotateX(0deg) rotateY(0deg)";
			setTimeout(() => {
				if (el) el.style.transition = "";
			}, 880);
		}
		onFlip?.(next);
	}, [isFlipped, isTransitioning, onFlip]);

	return (
		<div className={`card3d-root ${className}`}>
			{/* 3D stage */}
			<div className="card3d-stage">
				{/* Floor reflection */}
				<div className="card3d-floor-reflection" aria-hidden="true" />

				{/* Card container — perspective tilt + flip */}
				<div
					ref={cardRef}
					className="card3d-scene"
					style={{
						transform: isFlipped
							? "perspective(1200px) rotateX(0deg) rotateY(180deg)"
							: "perspective(1200px) rotateX(0deg) rotateY(0deg)",
						pointerEvents: isTransitioning ? "none" : "auto",
					}}
					onPointerMove={handlePointerMove}
					onPointerLeave={handlePointerLeave}
					onPointerEnter={() => !isFlipped && !isTransitioning && setIsHovered(true)}
					onClick={handleFlip}
					role="button"
					tabIndex={0}
					aria-label={`Off-Card ${card.product} — click to ${isFlipped ? "show front" : "flip to back"}`}
					onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleFlip(); } }}
				>
					<AnimatePresence mode="wait" initial={false}>
						<motion.div
							key={card.id}
							variants={CARD_TRANSITION_VARIANTS}
							initial="initial"
							animate="animate"
							exit="exit"
							onAnimationStart={() => setIsTransitioning(true)}
							onAnimationComplete={() => setIsTransitioning(false)}
							style={{
								position: "absolute",
								inset: 0,
								transformStyle: "preserve-3d",
							}}
						>
							<CardFront card={card} isHovered={isHovered} />
							<CardBack card={card} />
						</motion.div>
					</AnimatePresence>
				</div>

				{/* Flip button */}
				<FlipButton isBack={isFlipped} onClick={handleFlip} />
			</div>
		</div>
	);
}
