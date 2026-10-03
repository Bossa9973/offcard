import { useEffect, type RefObject } from "react";

/**
 * useScrollCraft: Scroll-Craft Timeline & Storyboard Orchestrator
 *
 * Implements the core scroll-craft philosophy:
 * 1. Scroll as a Timeline: Publishes normalized progression (--sc-p, --sc-hero-p, --sc-bento-p,
 *    --sc-pricing-p, --sc-cta-p, --sc-horizon-p) continuously via a smooth rAF loop.
 * 2. 3D Spatial Storyboard: Translates wheel travel into physical depth & card fanning.
 * 3. Kinetic Typographic Reveals: Observes and animates headers & data blocks.
 * 4. Micro-Parallax & Magnetic CTA: Handles subtle layer offsets and desktop magnetic button physics.
 * 5. Full prefers-reduced-motion safety: Instantly reveals final states without motion.
 * 6. Zero Layout Shifts: Operates strictly on GPU-accelerated transforms, opacities, and CSS variables.
 */
export function useScrollCraft(containerRef: RefObject<HTMLElement | null>) {
	useEffect(() => {
		if (typeof window === "undefined" || !containerRef.current) return;

		const root = containerRef.current;
		document.documentElement.classList.add("js");

		const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

		if (prefersReduced) {
			root.querySelectorAll(
				"[data-sc-reveal], .off-tile, .off-plan-card, .off-faq-sidebar, .off-faq-accordion, .off-cta-card, .off-bento-header, .off-section-header, .off-settlement-step"
			).forEach((el) => {
				el.classList.add("is-revealed");
			});
			return;
		}

		// 1. IntersectionObserver for one-shot physical entrances
		const revealObserver = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						entry.target.classList.add("is-revealed");
						revealObserver.unobserve(entry.target);
					}
				}
			},
			{
				threshold: 0.1,
				rootMargin: "0px 0px -30px 0px",
			}
		);

		const revealSelectors = [
			"[data-sc-reveal]",
			".off-bento-header",
			".off-tile",
			".off-section-header",
			".off-plan-card",
			".off-faq-sidebar",
			".off-faq-accordion",
			".off-cta-card",
			".off-settlement-timeline",
		];

		const targets = root.querySelectorAll(revealSelectors.join(", "));
		targets.forEach((el) => {
			const rect = el.getBoundingClientRect();
			if (rect.top < window.innerHeight && rect.bottom > 0) {
				el.classList.add("is-revealed");
			} else {
				revealObserver.observe(el);
			}
		});

		// 2. Continuous Scroll Timeline Engine
		const sections = root.querySelectorAll<HTMLElement>("section.off-band");
		const heroSection = root.querySelector<HTMLElement>(".off-hero-band");
		const bentoSection = root.querySelector<HTMLElement>(".off-bento-band");
		const pricingSection = root.querySelector<HTMLElement>(".off-pricing-band");
		const ctaSection = root.querySelector<HTMLElement>(".off-cta-band");
		const cardStack = root.querySelector<HTMLElement>(".off-hero-card-stack");

		let rafId: number | null = null;
		let lastScrollY = window.scrollY;

		const updateTimelines = () => {
			const vh = window.innerHeight;
			const scrollY = window.scrollY;
			const maxScroll = Math.max(1, document.documentElement.scrollHeight - vh);
			const docP = Math.min(1, Math.max(0, scrollY / maxScroll));

			// Publish global document progression
			root.style.setProperty("--sc-doc-p", docP.toFixed(4));
			root.style.setProperty("--sc-scroll-y", `${scrollY.toFixed(1)}px`);

			// Section-specific timelines
			sections.forEach((sec) => {
				const rect = sec.getBoundingClientRect();
				const totalTravel = vh + rect.height;
				const current = vh - rect.top;
				const p = Math.max(0, Math.min(1, current / totalTravel));
				sec.style.setProperty("--sc-p", p.toFixed(4));

				const focus = (rect.top + rect.height / 2 - vh / 2) / (vh / 2);
				sec.style.setProperty("--sc-focus", Math.max(-1, Math.min(1, focus)).toFixed(4));
			});

			// Hero 3D Card Fanning & Spatial Separation
			if (heroSection && cardStack) {
				const heroRect = heroSection.getBoundingClientRect();
				// Progress from 0 (at very top) to 1 (when hero completely scrolls out)
				const heroP = Math.max(0, Math.min(1, -heroRect.top / Math.max(1, heroRect.height)));
				root.style.setProperty("--sc-hero-p", heroP.toFixed(4));

				// 3D spatial separation parameters
				// As user scrolls the first 45% of the hero, the cards fan out in 3D
				const fanSpread = Math.min(1, heroP * 2.2);
				cardStack.style.setProperty("--sc-hero-spread", `${(fanSpread * 60).toFixed(1)}px`);
				cardStack.style.setProperty("--sc-hero-pitch", `${(heroP * -12).toFixed(2)}deg`);
				cardStack.style.setProperty("--sc-hero-rot-extra", `${(fanSpread * 4.5).toFixed(2)}deg`);
			}

			// Bento Section Progress
			if (bentoSection) {
				const bentoRect = bentoSection.getBoundingClientRect();
				const bentoTravel = vh + bentoRect.height;
				const bentoCurrent = vh - bentoRect.top;
				const bentoP = Math.max(0, Math.min(1, bentoCurrent / bentoTravel));
				root.style.setProperty("--sc-bento-p", bentoP.toFixed(4));
			}

			// Horizon Mode Wipe (Dark Bento -> Light Pricing boundary)
			if (pricingSection) {
				const pricingRect = pricingSection.getBoundingClientRect();
				// Horizon progress: 0 when pricing is below fold, 1 when pricing occupies full screen
				const horizonP = Math.max(0, Math.min(1, (vh - pricingRect.top) / (vh * 0.85)));
				root.style.setProperty("--sc-horizon-p", horizonP.toFixed(4));
			}

			// Closing CTA Progress
			if (ctaSection) {
				const ctaRect = ctaSection.getBoundingClientRect();
				const ctaP = Math.max(0, Math.min(1, (vh - ctaRect.top) / (vh * 0.75)));
				root.style.setProperty("--sc-cta-p", ctaP.toFixed(4));
			}

			lastScrollY = scrollY;
			rafId = null;
		};

		const onScroll = () => {
			if (rafId === null) {
				rafId = requestAnimationFrame(updateTimelines);
			}
		};

		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", onScroll, { passive: true });
		updateTimelines();

		// 3. Desktop Magnetic Button Physics ([data-sc-magnet])
		const magneticButtons = root.querySelectorAll<HTMLElement>("[data-sc-magnet]");
		const magneticCleanups: Array<() => void> = [];

		if (!prefersReduced && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
			magneticButtons.forEach((btn) => {
				const strength = parseFloat(btn.getAttribute("data-sc-magnet") || "0.22");
				let mRaf = 0;
				let targetX = 0;
				let targetY = 0;
				let currentX = 0;
				let currentY = 0;
				let hovering = false;

				const tickMagnet = () => {
					currentX += (targetX - currentX) * 0.12;
					currentY += (targetY - currentY) * 0.12;
					btn.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;

					if (hovering || Math.abs(currentX) > 0.1 || Math.abs(currentY) > 0.1) {
						mRaf = requestAnimationFrame(tickMagnet);
					} else {
						btn.style.transform = "";
						mRaf = 0;
					}
				};

				const onMouseMove = (e: MouseEvent) => {
					const rect = btn.getBoundingClientRect();
					const centerX = rect.left + rect.width / 2;
					const centerY = rect.top + rect.height / 2;
					targetX = (e.clientX - centerX) * strength;
					targetY = (e.clientY - centerY) * strength;
					if (!mRaf) mRaf = requestAnimationFrame(tickMagnet);
				};

				const onMouseEnter = () => {
					hovering = true;
					if (!mRaf) mRaf = requestAnimationFrame(tickMagnet);
				};

				const onMouseLeave = () => {
					hovering = false;
					targetX = 0;
					targetY = 0;
				};

				btn.addEventListener("mousemove", onMouseMove, { passive: true });
				btn.addEventListener("mouseenter", onMouseEnter);
				btn.addEventListener("mouseleave", onMouseLeave);

				magneticCleanups.push(() => {
					btn.removeEventListener("mousemove", onMouseMove);
					btn.removeEventListener("mouseenter", onMouseEnter);
					btn.removeEventListener("mouseleave", onMouseLeave);
					if (mRaf) cancelAnimationFrame(mRaf);
				});
			});
		}

		return () => {
			revealObserver.disconnect();
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onScroll);
			if (rafId !== null) cancelAnimationFrame(rafId);
			magneticCleanups.forEach((c) => c());
		};
	}, [containerRef]);
}
