import { useEffect, type RefObject } from "react";

/**
 * useTileSpotlight: Interactive radial spotlight on hovered tiles (Pass 5, Section 4.7)
 * - Tracks pointer position inside tile
 * - Updates --mx and --my CSS properties via rAF
 * - Disabled on touch and when prefers-reduced-motion
 */
export function useTileSpotlight(containerRef: RefObject<HTMLElement | null>) {
	useEffect(() => {
		const container = containerRef.current;
		if (!container || typeof window === "undefined") return;
		if (window.matchMedia("(hover: none)").matches) return;
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

		const tiles = container.querySelectorAll<HTMLElement>(".off-tile, .off-plan-card");
		const cleanups: (() => void)[] = [];

		tiles.forEach((tile) => {
			let raf = 0;
			let mx = -999;
			let my = -999;

			const onMove = (e: MouseEvent) => {
				const rect = tile.getBoundingClientRect();
				mx = e.clientX - rect.left;
				my = e.clientY - rect.top;
				cancelAnimationFrame(raf);
				raf = requestAnimationFrame(() => {
					tile.style.setProperty("--mx", `${mx.toFixed(1)}px`);
					tile.style.setProperty("--my", `${my.toFixed(1)}px`);
				});
			};

			const onLeave = () => {
				cancelAnimationFrame(raf);
				tile.style.setProperty("--mx", "-999px");
				tile.style.setProperty("--my", "-999px");
			};

			tile.addEventListener("mousemove", onMove, { passive: true });
			tile.addEventListener("mouseleave", onLeave, { passive: true });

			cleanups.push(() => {
				cancelAnimationFrame(raf);
				tile.removeEventListener("mousemove", onMove);
				tile.removeEventListener("mouseleave", onLeave);
			});
		});

		return () => {
			cleanups.forEach((fn) => fn());
		};
	}, [containerRef]);
}
