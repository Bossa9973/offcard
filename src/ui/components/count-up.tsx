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
 * CountUp: Tabular numerical count-up on view entrance & value morph (Scroll-Craft Enhanced)
 * - 900ms cubic ease-out
 * - Tabular figures so layout does not jitter
 * - Re-animates smoothly when `to` prop changes (e.g. billing toggle)
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
	const inViewRef = useRef(false);
	const currentValRef = useRef(from);

	useEffect(() => {
		const el = ref.current;
		if (!el || typeof window === "undefined") return;

		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			setVal(to);
			currentValRef.current = to;
			return;
		}

		const animateTo = (target: number, startVal: number) => {
			const startTime = performance.now();
			const step = (now: number) => {
				const elapsed = now - startTime;
				const progress = Math.min(1, elapsed / duration);
				const current = startVal + (target - startVal) * easeOut(progress);
				setVal(current);
				currentValRef.current = current;

				if (progress < 1) {
					requestAnimationFrame(step);
				} else {
					setVal(target);
					currentValRef.current = target;
				}
			};
			requestAnimationFrame(step);
		};

		if (inViewRef.current) {
			// Already in view: smoothly animate from current value to new target
			animateTo(to, currentValRef.current);
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && !inViewRef.current) {
					inViewRef.current = true;
					observer.disconnect();
					animateTo(to, from);
				}
			},
			{ threshold: 0.1 }
		);

		observer.observe(el);
		return () => observer.disconnect();
	}, [to, from, duration]);

	const formatted = Math.round(val).toLocaleString(undefined, {
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
