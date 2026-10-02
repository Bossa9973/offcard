import { useMemo } from "react";

type DensityMode = "left" | "right" | "top" | "bottom" | "radial";

export interface DotFieldProps {
	/** Edge or radial pattern where dots are distributed. */
	density?: DensityMode;
	/** Center X for radial field (defaults to center of viewBox) */
	cx?: number;
	/** Center Y for radial field (defaults to center of viewBox) */
	cy?: number;
	/** Falloff radius for radial density in px. Default 520px (Pass 4, Section 2.6). */
	maxRadius?: number;
	/** Grid pitch in px (default 22 for radial, 24 for directional). */
	pitch?: number;
	/** Deterministic seed so SSR and client match. */
	seed?: number;
	className?: string;
}

function mulberry32(a: number) {
	return () => {
		let t = (a += 0x6d2b79f5);
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/**
 * DotField Component (Pass 2, 1.3 & Pass 4, 2.6)
 * Supports directional density (hero/CTA panels) and radial field centered behind card stacks.
 * Radial mode: pitch 22px, radius 0.8 -> 1.8px, opacity max 0.35, falloff to 0 at ~520px.
 */
export function DotField({
	density = "radial",
	cx,
	cy,
	maxRadius = 520,
	pitch,
	seed = 7,
	className = "",
}: DotFieldProps) {
	const isRadial = density === "radial";
	const effectivePitch = pitch ?? (isRadial ? 22 : 24);
	const W = isRadial ? 1100 : 800;
	const H = isRadial ? 700 : 480;

	const dots = useMemo(() => {
		const rand = mulberry32(seed);
		const out: { x: number; y: number; r: number; o: number }[] = [];
		const centerX = cx ?? W / 2;
		const centerY = cy ?? H / 2;

		for (let y = effectivePitch / 2; y < H; y += effectivePitch) {
			for (let x = effectivePitch / 2; x < W; x += effectivePitch) {
				let strength = 0;
				const jitter = (rand() - 0.5) * 0.08;

				if (isRadial) {
					const dist = Math.hypot(x - centerX, y - centerY);
					if (dist >= maxRadius) continue;
					const normDist = dist / maxRadius;
					// Smooth radial falloff: 1 at center, drops to 0 at maxRadius
					strength = Math.max(0, Math.min(1, Math.pow(1 - normDist, 1.6) + jitter));
				} else {
					const nx = x / W;
					const ny = y / H;
					const edge =
						density === "left"
							? 1 - nx
							: density === "right"
								? nx
								: density === "top"
									? 1 - ny
									: ny;

					strength = Math.max(0, Math.min(1, Math.pow(edge, 2.2) + jitter));
				}

				if (strength < 0.04) continue;

				// Clamp radius 0.8px -> 1.8px, opacity at most 0.35 (Pass 4, 2.6)
				const r = 0.8 + strength * 1.0;
				const o = 0.05 + strength * 0.30;

				out.push({
					x: Number(x.toFixed(1)),
					y: Number(y.toFixed(1)),
					r: Number(r.toFixed(2)),
					o: Number(o.toFixed(2)),
				});
			}
		}
		return out;
	}, [density, isRadial, effectivePitch, W, H, cx, cy, maxRadius, seed]);

	return (
		<svg
			aria-hidden="true"
			focusable="false"
			className={`off-dotfield ${className}`}
			viewBox={`0 0 ${W} ${H}`}
			preserveAspectRatio="xMidYMid slice"
			style={{
				position: "absolute",
				inset: 0,
				width: "100%",
				height: "100%",
				pointerEvents: "none",
			}}
		>
			<g fill="var(--dot-field, #9a9aa0)">
				{dots.map((d, i) => (
					<circle key={i} cx={d.x} cy={d.y} r={d.r} opacity={d.o} />
				))}
			</g>
		</svg>
	);
}
