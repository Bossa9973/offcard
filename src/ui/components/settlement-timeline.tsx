import { useEffect, useRef, useState } from "react";
import { SETTLEMENT_STEPS } from "../../content/demoData";

/**
 * SettlementTimeline: 3-step vertical on-chain settlement progress (Pass 5, Section 2.2 & 4.7)
 * - Three recessed wells: Authorized -> Converted -> Settled (with txHash)
 * - Sequential entrance animation on first view (180ms stagger, dot fill, slide 8px)
 * - Respects prefers-reduced-motion
 */
export function SettlementTimeline() {
	const ref = useRef<HTMLDivElement>(null);
	const [activeCount, setActiveCount] = useState(0);

	useEffect(() => {
		const el = ref.current;
		if (!el || typeof window === "undefined") return;

		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			setActiveCount(SETTLEMENT_STEPS.length);
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					observer.disconnect();
					// Animate steps in sequence 180ms apart
					let step = 0;
					const interval = setInterval(() => {
						step++;
						setActiveCount(step);
						if (step >= SETTLEMENT_STEPS.length) {
							clearInterval(interval);
						}
					}, 180);
				}
			},
			{ threshold: 0.2 }
		);

		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	return (
		<div ref={ref} className="off-settlement-timeline" data-keep-clear="settlement-timeline">
			{SETTLEMENT_STEPS.map((item, idx) => {
				const isVisible = activeCount > idx;
				return (
					<div
						key={item.step}
						className={`off-well off-settlement-step ${isVisible ? "off-settlement-step--active" : ""}`}
						style={{ "--i": idx } as React.CSSProperties}
					>
						<div className="off-settlement-step__left">
							<span
								className={`off-step-dot ${isVisible ? "off-step-dot--filled" : ""}`}
								aria-hidden="true"
							/>
							<span className="off-step-name">{item.step}</span>
							{"hash" in item && (
								<span className="off-tx-hash off-tx-hash--step">{item.hash}</span>
							)}
						</div>
						<div className="off-settlement-step__right">
							{/* VERIFY: Seconds timing for demo settlement */}
							<span className="off-step-time">{item.time}</span>
						</div>
					</div>
				);
			})}
		</div>
	);
}
