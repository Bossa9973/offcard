import { useEffect, useState } from "react";
import type { TabKey } from "./tabs";

// Stagger expensive frame initialization, prioritizing the visible screen and user input.
export function useWarmScreens(scope: string, enabled: boolean, isEntity: boolean, cardsApproved: boolean) {
	const [warmed, setWarmed] = useState<{ scope: string; tabs: Partial<Record<TabKey, number>> }>({ scope, tabs: {} });
	useEffect(() => {
		if (!enabled) return;
		const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
		if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType ?? "") || navigator.hardwareConcurrency <= 2) return;
		const queue: TabKey[] = [...(isEntity ? [...(cardsApproved ? ["cards" as const] : []), "invoicing" as const, "report" as const] : []), "settings", "withdraw"];
		let cancelled = false;
		let lastInput = Date.now();
		const noteInput = () => { lastInput = Date.now(); };
		const inputEvents = ["pointerdown", "pointermove", "keydown"] as const;
		for (const event of inputEvents) window.addEventListener(event, noteInput, { passive: true });
		let timer: ReturnType<typeof setTimeout>;
		let idle: number | undefined;
		const step = () => {
			if (cancelled) return;
			if (document.visibilityState !== "visible" || Date.now() - lastInput < 1_500) {
				timer = setTimeout(step, 1_000);
				return;
			}
			const warm = () => {
				if (cancelled) return;
				if (document.visibilityState !== "visible" || Date.now() - lastInput < 1_500) { timer = setTimeout(step, 1_000); return; }
				const tab = queue.shift();
				if (!tab) return;
				setWarmed((previous) => ({ scope, tabs: { ...(previous.scope === scope ? previous.tabs : {}), [tab]: Date.now() } }));
				if (queue.length) timer = setTimeout(step, 1_000);
			};
			if ("requestIdleCallback" in window) idle = window.requestIdleCallback(warm, { timeout: 2_000 });
			else warm();
		};
		timer = setTimeout(step, 2_000);
		return () => {
			cancelled = true;
			for (const event of inputEvents) window.removeEventListener(event, noteInput);
			clearTimeout(timer);
			if (idle !== undefined) window.cancelIdleCallback(idle);
		};
	}, [scope, enabled, isEntity, cardsApproved]);
	return warmed.scope === scope ? warmed.tabs : {};
}
