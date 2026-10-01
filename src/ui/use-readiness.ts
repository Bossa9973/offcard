import { useEffect, useRef, useState } from "react";

// Per-component/account memory only. Never caches authenticated data in storage or a service worker.
// Navigation can render immediately while the readiness request runs independently.
export function useReadiness<T>(scope: string, enabled: boolean, active: boolean, revision: number, load: () => Promise<T>) {
	const latest = useRef(load);
	latest.current = load;
	const [snapshot, setSnapshot] = useState<{ scope: string; revision: number; at: number; value: T }>();
	const cached = useRef(snapshot);
	const pending = useRef<{ key: string; promise: Promise<T> } | undefined>(undefined);
	useEffect(() => {
		if (!enabled) return;
		const previous = cached.current;
		if (previous?.scope === scope && previous.revision === revision && Date.now() - previous.at < 10_000) return;
		let cancelled = false;
		const key = `${scope}:${revision}`;
		const promise = pending.current?.key === key ? pending.current.promise : latest.current();
		pending.current = { key, promise };
		void promise.then((value) => {
			if (cancelled) return;
			const next = { scope, revision, at: Date.now(), value };
			cached.current = next;
			setSnapshot(next);
		}).catch(() => {
			// Callers supply their normal fail-closed fallback for transport failures.
		}).finally(() => {
			if (pending.current?.promise === promise) pending.current = undefined;
		});
		return () => { cancelled = true; };
	}, [scope, enabled, active, revision]);
	return snapshot?.scope === scope && snapshot.revision === revision ? snapshot.value : undefined;
}
