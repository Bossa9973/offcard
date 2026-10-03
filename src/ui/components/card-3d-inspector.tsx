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
	useRef,
	useState,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import { Wordmark } from "./wordmark";

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

// ─── Front Face ───────────────────────────────────────────────────────────────

function CardFront({
	card,
	glareX,
	glareY,
	isHovered,
}: {
	card: InspectorCardData;
	glareX: number;
	glareY: number;
	isHovered: boolean;
}) {
	return (
		<div
			className={`card3d-face card3d-face--front card3d-face--${card.variant}`}
			style={{
				"--card3d-glare-x": `${glareX}%`,
				"--card3d-glare-y": `${glareY}%`,
			} as React.CSSProperties}
		>
			{/* Full-bleed brand artwork */}
			<div
				className="card3d-artwork"
				style={{ backgroundImage: `url(${card.image})` }}
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

			{/* Footer row: masked PAN + holder + expiry */}
			<div className="card3d-footer">
				<div className="card3d-pan">
					<span aria-hidden="true">•••• •••• ••••</span>{" "}
					<span>{card.lastFour}</span>
				</div>
				<div className="card3d-footer-meta">
					<span className="card3d-holder">{card.holder.toUpperCase()}</span>
					<div className="card3d-expiry">
						<span className="card3d-expiry-label">VALID THRU</span>
						<span className="card3d-expiry-value">{card.expires}</span>
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
			{/* Full-bleed artwork on back too, flipped */}
			<div
				className="card3d-artwork card3d-artwork--back"
				style={{ backgroundImage: `url(${card.image})` }}
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

// ─── Card3DInspector root ─────────────────────────────────────────────────────

export function Card3DInspector({ card, onFlip, className = "" }: Card3DInspectorProps) {
	const [isFlipped, setIsFlipped] = useState(false);
	const [rotX, setRotX] = useState(0);
	const [rotY, setRotY] = useState(0);
	const [glareX, setGlareX] = useState(50);
	const [glareY, setGlareY] = useState(40);
	const [isHovered, setIsHovered] = useState(false);
	const cardRef = useRef<HTMLDivElement>(null);
	const rafRef = useRef<number>(0);

	const handlePointerMove = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
		const el = cardRef.current;
		if (!el) return;
		const rect = el.getBoundingClientRect();
		const nx = (e.clientX - rect.left) / rect.width;
		const ny = (e.clientY - rect.top) / rect.height;

		const targetRotY = (nx - 0.5) * MAX_TILT * 2;
		const targetRotX = -(ny - 0.5) * MAX_TILT * 1.4;

		cancelAnimationFrame(rafRef.current);
		rafRef.current = requestAnimationFrame(() => {
			setRotX(targetRotX);
			setRotY(targetRotY);
			setGlareX(nx * 100);
			setGlareY(ny * 100);
		});
	}, []);

	const handlePointerLeave = useCallback(() => {
		setIsHovered(false);
		const ease = () => {
			setRotX((v) => {
				const next = v * 0.82;
				return Math.abs(next) < 0.05 ? 0 : next;
			});
			setRotY((v) => {
				const next = v * 0.82;
				return Math.abs(next) < 0.05 ? 0 : next;
			});
		};
		const loop = () => {
			ease();
			rafRef.current = requestAnimationFrame(loop);
		};
		loop();
		setTimeout(() => cancelAnimationFrame(rafRef.current), 600);
	}, []);

	const handleFlip = useCallback(() => {
		const next = !isFlipped;
		setIsFlipped(next);
		setRotX(0);
		setRotY(0);
		onFlip?.(next);
	}, [isFlipped, onFlip]);

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
						transform: `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY + (isFlipped ? 180 : 0)}deg)`,
					}}
					onPointerMove={(e) => {
						if (isFlipped) return; // tilt only on front
						setIsHovered(true);
						handlePointerMove(e);
					}}
					onPointerLeave={handlePointerLeave}
					onPointerEnter={() => !isFlipped && setIsHovered(true)}
					onClick={handleFlip}
					role="button"
					tabIndex={0}
					aria-label={`Off-Card ${card.product} — click to ${isFlipped ? "show front" : "flip to back"}`}
					onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleFlip(); } }}
				>
					<CardFront card={card} glareX={glareX} glareY={glareY} isHovered={isHovered} />
					<CardBack card={card} />
				</div>

				{/* Flip button */}
				<FlipButton isBack={isFlipped} onClick={handleFlip} />
			</div>
		</div>
	);
}
