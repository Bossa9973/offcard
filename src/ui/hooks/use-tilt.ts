import { useEffect, type RefObject } from "react";

/**
 * useTilt Hook (Enhanced for 3D Spatial Deck Interaction)
 * - Subtle pointer parallax with spring-lerp smoothing
 * - Computes dynamic specular glare coordinates (--glare-x, --glare-y, --glare-opacity)
 * - Tracks scroll velocity to add 3D perspective pitch (--scroll-pitch)
 * - Gentle ambient oscillation (--float-y) that does not clobber 3D rotate
 * - Automatically disabled when prefers-reduced-motion is active
 */
export function useTilt(ref: RefObject<HTMLElement | null>, max = 5) {
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		if (typeof window === "undefined") return;
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

		let raf = 0;
		let tx = 0;
		let ty = 0;
		let x = 0;
		let y = 0;
		let targetGlareX = 50;
		let targetGlareY = 50;
		let glareX = 50;
		let glareY = 50;
		let targetOpacity = 0;
		let currentOpacity = 0;
		let scrollPitch = 0;
		let targetScrollPitch = 0;

		const onScroll = () => {
			const rect = el.getBoundingClientRect();
			// As hero scrolls, add a gentle 3D tilt-back into the screen
			const progress = Math.max(0, Math.min(1, -rect.top / (window.innerHeight * 0.75)));
			targetScrollPitch = progress * -8;
		};

		window.addEventListener("scroll", onScroll, { passive: true });
		onScroll();

		const onMove = (e: PointerEvent) => {
			const r = el.getBoundingClientRect();
			const relX = (e.clientX - r.left) / r.width;
			const relY = (e.clientY - r.top) / r.height;
			tx = (relX - 0.5) * 2 * max;
			ty = (relY - 0.5) * -2 * max;
			targetGlareX = Math.max(0, Math.min(100, relX * 100));
			targetGlareY = Math.max(0, Math.min(100, relY * 100));
			targetOpacity = 0.75;
		};

		const onLeave = () => {
			tx = 0;
			ty = 0;
			targetOpacity = 0;
		};

		const t0 = performance.now();

		const tick = (now: number) => {
			x += (tx - x) * 0.08;
			y += (ty - y) * 0.08;
			glareX += (targetGlareX - glareX) * 0.1;
			glareY += (targetGlareY - glareY) * 0.1;
			currentOpacity += (targetOpacity - currentOpacity) * 0.08;
			scrollPitch += (targetScrollPitch - scrollPitch) * 0.06;

			// Natural gentle floating oscillation (±3.5px)
			const elapsed = (now - t0) * 0.0018;
			const floatY = Math.sin(elapsed) * 3.5;

			el.style.setProperty("--tilt-x", `${y.toFixed(2)}deg`);
			el.style.setProperty("--tilt-y", `${x.toFixed(2)}deg`);
			el.style.setProperty("--glare-x", `${glareX.toFixed(1)}%`);
			el.style.setProperty("--glare-y", `${glareY.toFixed(1)}%`);
			el.style.setProperty("--glare-opacity", `${currentOpacity.toFixed(2)}`);
			el.style.setProperty("--scroll-pitch", `${scrollPitch.toFixed(2)}deg`);
			el.style.setProperty("--float-y", `${floatY.toFixed(2)}px`);

			raf = requestAnimationFrame(tick);
		};

		el.addEventListener("pointermove", onMove, { passive: true });
		el.addEventListener("pointerleave", onLeave, { passive: true });
		raf = requestAnimationFrame(tick);

		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener("scroll", onScroll);
			el.removeEventListener("pointermove", onMove);
			el.removeEventListener("pointerleave", onLeave);
		};
	}, [ref, max]);
}

