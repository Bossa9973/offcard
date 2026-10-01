import { useEffect, useRef, useState, type ReactNode } from "react";
import { ScreenLifecycle } from "./screen-lifecycle";

// Bound hidden iframe memory and how long a screen can return without a fresh mount.
export const SCREEN_RETAIN_MS = 5 * 60_000;

export function RetainedScreen({ active, retain, preload = 0, name, children, retainMs = SCREEN_RETAIN_MS, revision = 0 }: {
	active: boolean;
	retain: boolean;
	/** A new intent ID can warm the screen again after its previous retention expired. */
	preload?: number;
	name: string;
	/** null retains this screen for the account session. */
	retainMs?: number | null;
	revision?: number;
	children: ReactNode;
}) {
	const target = useRef<HTMLDivElement>(null);
	const [width, setWidth] = useState<number>();
	const [mounted, setMounted] = useState(active);

	useEffect(() => {
		if (active || (retain && preload)) setMounted(true);
		else if (!retain) setMounted(false);
	}, [active, preload, retain]);

	useEffect(() => {
		if (active || !retain || !mounted || retainMs === null) return;
		const timer = setTimeout(() => setMounted(false), retainMs);
		return () => clearTimeout(timer);
	}, [active, retain, mounted, retainMs]);

	// Keep the frame viewport at its normal width while parked. display:none collapses
	// it to zero, forcing charts/tables to resize and redraw on every tab switch.
	useEffect(() => {
		const parent = target.current?.parentElement;
		if (!parent) return;
		const observer = new ResizeObserver(([entry]) => {
			if (entry && entry.contentRect.width > 0) setWidth(entry.contentRect.width);
		});
		observer.observe(parent);
		return () => observer.disconnect();
	}, [mounted, active]);

	if (!active && (!retain || !mounted)) return null;
	return <div ref={target} data-retained-screen={name} hidden={!active} inert={!active}
		style={active ? undefined : { display: "block", position: "fixed", left: "-200vw", top: 0, width: width ?? "100%", visibility: "hidden", pointerEvents: "none" }}><ScreenLifecycle.Provider value={{ active, revision }}>{children}</ScreenLifecycle.Provider></div>;
}
