import { useEffect, useRef } from "react";

export interface HalftoneFieldProps {
	variant?: "hero" | "panel";
	pitch?: number;
	className?: string;
}

const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

function hash(x: number, y: number) {
	let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263);
	h = Math.imul(h ^ (h >>> 13), 1274126177);
	return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

function vnoise(x: number, y: number) {
	const xi = Math.floor(x);
	const yi = Math.floor(y);
	const u = smooth(x - xi);
	const v = smooth(y - yi);
	const a = hash(xi, yi);
	const b = hash(xi + 1, yi);
	const c = hash(xi, yi + 1);
	const d = hash(xi + 1, yi + 1);
	return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

/**
 * HalftoneField: Dynamic value-noise halftone flow field (Pass 5, Section 3)
 * - Canvas 2D procedural rendering
 * - 22px pitch grid with smooth drifting value noise
 * - Masked away from headline and text
 * - Gentle pointer reaction within 150px
 * - Static under prefers-reduced-motion
 * - Auto-pauses offscreen via IntersectionObserver
 */
export function HalftoneField({ variant = "hero", pitch = 22, className = "" }: HalftoneFieldProps) {
	const ref = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = ref.current;
		const ctx = canvas?.getContext("2d");
		if (!canvas || !ctx) return;

		const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
		let w = 0;
		let h = 0;
		let raf = 0;
		let last = 0;
		let visible = true;
		const t0 = performance.now();
		const pointer = { x: -9999, y: -9999 };

		const mask = (nx: number, ny: number) => {
			if (variant === "hero") {
				const horiz = smooth(clamp01((nx - 0.38) / 0.5));
				const vert = 1 - smooth(clamp01((ny - 0.7) / 0.3));
				return horiz * vert;
			}
			return smooth(clamp01((nx - 0.6) / 0.4));
		};

		const draw = (now: number) => {
			ctx.clearRect(0, 0, w, h);
			const t = (now - t0) * 0.00011;
			const cols = Math.ceil(w / pitch);
			const rows = Math.ceil(h / pitch);
			for (let j = 0; j < rows; j++) {
				for (let i = 0; i < cols; i++) {
					const x = i * pitch + pitch / 2;
					const y = j * pitch + pitch / 2;
					const m = mask(x / w, y / h);
					if (m < 0.02) continue;
					const n =
						vnoise(i * 0.11 + t * 3.2, j * 0.11 - t * 2.1) * 0.65 +
						vnoise(i * 0.27 - t * 4.5, j * 0.27 + t * 1.7) * 0.35;
					let level = m * (0.3 + 0.7 * n);
					const dx = x - pointer.x;
					const dy = y - pointer.y;
					const d = Math.hypot(dx, dy);
					if (d < 150) level = Math.min(1, level + smooth(1 - d / 150) * 0.5);
					const r = 0.5 + level * 1.5;
					ctx.fillStyle = `rgba(154,154,160,${(0.12 + level * 0.38).toFixed(3)})`;
					ctx.beginPath();
					ctx.arc(x, y, r, 0, Math.PI * 2);
					ctx.fill();
				}
			}
		};

		const resize = () => {
			const rect = canvas.getBoundingClientRect();
			if (rect.width === 0 || rect.height === 0) return;
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			w = rect.width;
			h = rect.height;
			canvas.width = Math.round(w * dpr);
			canvas.height = Math.round(h * dpr);
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			draw(performance.now());
		};

		const loop = (now: number) => {
			raf = requestAnimationFrame(loop);
			if (!visible || document.hidden || now - last < 33) return; // ~30fps budget
			last = now;
			draw(now);
		};

		const onMove = (e: PointerEvent) => {
			const r = canvas.getBoundingClientRect();
			pointer.x = e.clientX - r.left;
			pointer.y = e.clientY - r.top;
		};

		const ro = new ResizeObserver(resize);
		ro.observe(canvas);
		const io = new IntersectionObserver(([en]) => {
			visible = en?.isIntersecting ?? false;
		});
		io.observe(canvas);
		resize();

		if (!reduce) {
			window.addEventListener("pointermove", onMove, { passive: true });
			raf = requestAnimationFrame(loop);
		}

		return () => {
			cancelAnimationFrame(raf);
			ro.disconnect();
			io.disconnect();
			window.removeEventListener("pointermove", onMove);
		};
	}, [variant, pitch]);

	return (
		<canvas
			ref={ref}
			aria-hidden="true"
			className={`off-halftone-field ${className}`}
			style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
		/>
	);
}
