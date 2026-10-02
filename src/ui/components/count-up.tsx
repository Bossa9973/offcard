import { useEffect, useRef, useState } from "react";

export interface CountUpProps {
	to: number;
	from?: number;
	duration?: number;
	prefix?: string;
	suffix?: string;
	decimals?: number;
	className?: string;
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * CountUp: Tabular numerical count-up on view entrance (Pass 5, Section 4.5)
 * - 900ms cubic ease-out
 * - Tabular figures so layout does not jitter
 * - Triggers once when scrolled into view
 * - Instant static value under prefers-reduced-motion
 */
export function CountUp({
	to,
	from = 0,
	duration = 900,
	prefix = "",
	suffix = "",
	decimals = 0,
	className = "",
}: CountUpProps) {
	const [val, setVal] = useState(from);
	const ref = useRef<HTMLSpanElement>(null);
	const hasRun = useRef(false);

	useEffect(() => {
		const el = ref.current;
		if (!el || typeof window === "undefined") return;

		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			setVal(to);
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && !hasRun.current) {
					hasRun.current = true;
					observer.disconnect();

					const startTime = performance.now();
					const step = (now: number) => {
						const elapsed = now - startTime;
						const progress = Math.min(1, elapsed / duration);
						const current = from + (to - from) * easeOut(progress);
						setVal(current);

						if (progress < 1) {
							requestAnimationFrame(step);
						} else {
							setVal(to);
						}
					};
					requestAnimationFrame(step);
				}
			},
			{ threshold: 0.1 }
		);

		observer.observe(el);
		return () => observer.disconnect();
	}, [to, from, duration]);

	const formatted = val.toLocaleString(undefined, {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	});

	return (
		<span ref={ref} className={`off-count-up ${className}`} style={{ fontVariantNumeric: "tabular-nums" }}>
			{prefix}
			{formatted}
			{suffix}
		</span>
	);
}
