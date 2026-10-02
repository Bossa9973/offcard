import { useEffect, type RefObject } from "react";

/**
 * useReveal: Scroll-triggered physical reveal (Pass 5, Section 4.4)
 * - Uses shared IntersectionObserver
 * - Triggers once when 15% in view
 * - Respects prefers-reduced-motion
 * - SSR safe: never hides text if JS is disabled
 */
export function useReveal(ref: RefObject<HTMLElement | null>, threshold = 0.15) {
	useEffect(() => {
		const el = ref.current;
		if (!el || typeof window === "undefined") return;

		// Mark document as JS-hydrated so reveals can activate
		document.documentElement.classList.add("js");

		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			el.classList.add("is-revealed");
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					el.classList.add("is-revealed");
					observer.unobserve(el);
				}
			},
			{ threshold }
		);

		observer.observe(el);
		return () => observer.disconnect();
	}, [ref, threshold]);
}
