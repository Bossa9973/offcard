import { useEffect, type RefObject } from "react";

/**
 * useTilt Hook (Pass 3, Section 6)
 * Subtle pointer parallax (max ±6° tilt) with requestAnimationFrame lerp smoothing.
 * Automatically disabled on touch screens and when prefers-reduced-motion is active.
 */
export function useTilt(ref: RefObject<HTMLElement | null>, max = 4) {
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		if (typeof window === "undefined") return;
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		if (window.matchMedia("(hover: none)").matches) return;

		let raf = 0;
		let tx = 0;
		let ty = 0;
		let x = 0;
		let y = 0;

		const onMove = (e: PointerEvent) => {
			const r = el.getBoundingClientRect();
			tx = ((e.clientX - r.left) / r.width - 0.5) * 2 * max;
			ty = ((e.clientY - r.top) / r.height - 0.5) * -2 * max;
		};

		const onLeave = () => {
			tx = 0;
			ty = 0;
		};

		const tick = () => {
			x += (tx - x) * 0.08;
			y += (ty - y) * 0.08;
			el.style.setProperty("--tilt-x", `${y.toFixed(2)}deg`);
			el.style.setProperty("--tilt-y", `${x.toFixed(2)}deg`);
			raf = requestAnimationFrame(tick);
		};

		el.addEventListener("pointermove", onMove);
		el.addEventListener("pointerleave", onLeave);
		raf = requestAnimationFrame(tick);

		return () => {
			cancelAnimationFrame(raf);
			el.removeEventListener("pointermove", onMove);
			el.removeEventListener("pointerleave", onLeave);
		};
	}, [ref, max]);
}
