import { createContext, useContext, useEffect, useRef } from "react";

export const ScreenLifecycle = createContext({ active: true, revision: 0 });

// Refresh data through the official handle, never by navigating/recreating the iframe.
// Hidden screens defer invalidation until they are shown. Quick tab switches reuse fresh data.
export function useScreenRefresh(refresh: () => void | Promise<unknown>, staleMs = 15_000) {
	const { active, revision } = useContext(ScreenLifecycle);
	const latest = useRef(refresh);
	latest.current = refresh;
	const first = useRef(true);
	const state = useRef({ revision, refreshedAt: Date.now() });

	useEffect(() => {
		const initial = first.current;
		first.current = false;
		if (!active) return;
		let cancelled = false;
		const update = () => {
			if (document.visibilityState !== "visible") return;
			if (state.current.revision === revision && Date.now() - state.current.refreshedAt < staleMs) return;
			state.current = { revision, refreshedAt: Date.now() };
			void Promise.resolve().then(() => {
				if (!cancelled) return latest.current();
			}).catch(() => {
				// The official Element owns its request error UI. Allow the next activation to retry.
				state.current.refreshedAt = 0;
			});
		};
		if (!initial) update();
		window.addEventListener("focus", update);
		document.addEventListener("visibilitychange", update);
		return () => {
			cancelled = true;
			window.removeEventListener("focus", update);
			document.removeEventListener("visibilitychange", update);
		};
	}, [active, revision, staleMs]);
}
