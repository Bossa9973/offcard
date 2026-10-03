import { useEffect, useRef, useState } from "react";
import { SETTLEMENT_STEPS } from "../../content/demoData";

/**
 * SettlementTimeline: 3-step vertical on-chain settlement progress (Scroll-Craft Kinetic)
 * - Three recessed wells: Authorized -> Converted -> Settled (with txHash)
 * - Sequential illuminated conduit line with pulse animation
 * - Interactive "Simulate swipe" replay trigger with tactile feedback
 * - Respects prefers-reduced-motion
 */
export function SettlementTimeline() {
	const ref = useRef<HTMLDivElement>(null);
	const [activeCount, setActiveCount] = useState(0);
	const [isSimulating, setIsSimulating] = useState(false);

	const runSimulation = () => {
		setIsSimulating(true);
		setActiveCount(0);
		let step = 0;
		const interval = setInterval(() => {
			step++;
			setActiveCount(step);
			if (step >= SETTLEMENT_STEPS.length) {
				clearInterval(interval);
				setTimeout(() => setIsSimulating(false), 800);
			}
		}, 300);
	};

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
					// Delay slightly so the tile entrance lands first
					setTimeout(runSimulation, 220);
				}
			},
			{ threshold: 0.25 }
		);

		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	return (
		<div ref={ref} className="off-settlement-timeline" data-keep-clear="settlement-timeline">
			<div className="off-settlement-header-row">
				<span className="off-settlement-tagline">Real-time payment lifecycle</span>
				<button
					type="button"
					className={`off-settlement-replay-btn ${isSimulating ? "off-settlement-replay-btn--active" : ""}`}
					onClick={runSimulation}
					disabled={isSimulating}
					aria-label="Simulate payment settlement sequence"
				>
					<span className="off-replay-dot" aria-hidden="true" />
					<span>{isSimulating ? "Processing…" : "Simulate swipe"}</span>
				</button>
			</div>

			<div className="off-settlement-steps-wrap">
				{/* Illuminated vertical conduit line connecting the 3 steps */}
				<div
					className="off-settlement-conduit"
					aria-hidden="true"
					style={{
						"--conduit-fill": `${Math.min(100, (activeCount / SETTLEMENT_STEPS.length) * 100)}%`,
					} as React.CSSProperties}
				/>

				{SETTLEMENT_STEPS.map((item, idx) => {
					const isVisible = activeCount > idx;
					const isCurrent = activeCount === idx + 1;
					return (
						<div
							key={item.step}
							className={`off-well off-settlement-step ${isVisible ? "off-settlement-step--active" : ""} ${isCurrent ? "off-settlement-step--current" : ""}`}
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
		</div>
	);
}
