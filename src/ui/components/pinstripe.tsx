import { useMemo, useId } from "react";

export interface PinstripeProps {
	seed?: number;
	className?: string;
	style?: React.CSSProperties;
}

function rng(seed: number) {
	let s = seed >>> 0;
	return () => {
		s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
		return s / 4294967296;
	};
}

/**
 * Moneta Reference Pinstripe Artwork (Pass 5, Section 1.3 & 4.3)
 * - 165 line segments (150-190 range)
 * - Shallow diagonal descending left to right (~20° off horizontal)
 * - Variable length (15% to 70% of card width: 84px to 392px)
 * - Banded streak grouping across full face
 * - Slate-to-olive diagonal gradient (#474656 -> #8c8a4a)
 * - Warm olive glow in lower-right quadrant (rgba(140, 138, 74, 0.35))
 * - Opacity 0.35 to 0.75 for crisp visibility
 * - Subtle live drift animation along angle (0 -> 6px over 14s alternate)
 */
export function Pinstripe({ seed = 7, className = "", style }: PinstripeProps) {
	const rawId = useId();
	const id = rawId.replace(/[^a-zA-Z0-9_-]/g, "");

	const lines = useMemo(() => {
		const r = rng(seed);
		const out: { x1: number; y1: number; x2: number; y2: number; w: number; o: number }[] = [];
		const count = 165;
		const angleRad = (20 * Math.PI) / 180;
		const cosA = Math.cos(angleRad);
		const sinA = Math.sin(angleRad);

		// Band clusters to reproduce the organic stepped flow lines
		for (let i = 0; i < count; i++) {
			// Spread across height with slight overshoot for angle coverage
			const baseY = (i / count) * 440 - 70;
			// Length varies between 15% (84px) and 70% (392px)
			const len = 84 + r() * 308;
			// Staggered X offsets so lines form banded streaks rather than a rigid grid
			const clusterOffset = (i % 5) * 28 - 50;
			const x1 = r() * 640 - 100 + clusterOffset;
			const y1 = baseY + (r() - 0.5) * 12;

			out.push({
				x1,
				y1,
				x2: x1 + cosA * len,
				y2: y1 + sinA * len,
				w: 0.6 + r() * 0.5, // 0.6 to 1.1px
				o: 0.35 + r() * 0.40, // 0.35 to 0.75
			});
		}
		return out;
	}, [seed]);

	return (
		<svg
			aria-hidden="true"
			focusable="false"
			className={`off-pinstripe ${className}`}
			viewBox="0 0 560 350"
			preserveAspectRatio="xMidYMid slice"
			style={{
				position: "absolute",
				inset: 0,
				width: "100%",
				height: "100%",
				pointerEvents: "none",
				...style,
			}}
		>
			<defs>
				{/* Slate to Olive-Gold diagonal stroke gradient */}
				<linearGradient id={`${id}-tone`} x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stopColor="#474656" />
					<stop offset="45%" stopColor="#555462" />
					<stop offset="78%" stopColor="#7a7846" />
					<stop offset="100%" stopColor="#8c8a4a" />
				</linearGradient>

				{/* Internal olive glow at lower right (55% radius) */}
				<radialGradient id={`${id}-olive-glow`} cx="86%" cy="86%" r="55%">
					<stop offset="0%" stopColor="#8c8a4a" stopOpacity="0.38" />
					<stop offset="35%" stopColor="#8c8a4a" stopOpacity="0.22" />
					<stop offset="70%" stopColor="#5a5942" stopOpacity="0.08" />
					<stop offset="100%" stopColor="#000000" stopOpacity="0" />
				</radialGradient>
			</defs>

			{/* Warm olive lower-right glow background */}
			<rect width="560" height="350" fill={`url(#${id}-olive-glow)`} />

			{/* Full face crisp pinstripes with subtle animated drift */}
			<g className="off-pinstripe__drift" stroke={`url(#${id}-tone)`} strokeLinecap="round">
				{lines.map((l, i) => (
					<line
						key={i}
						x1={l.x1}
						y1={l.y1}
						x2={l.x2}
						y2={l.y2}
						strokeWidth={l.w}
						opacity={l.o}
					/>
				))}
			</g>
		</svg>
	);
}
