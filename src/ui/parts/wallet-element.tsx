import type { ReactNode } from "react";
import { useWallet, useWalletAppearance } from "./wallet-provider";
import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { handleLifecycle } from "../handle-lifecycle";

import { useScreenRefresh } from "./screen-lifecycle";

interface MountedElementHandle {
	update?: (options: Record<string, unknown>) => void;
	refresh?: () => Promise<void>;
	destroy(): void;
	mount(target: HTMLElement): void;
}

interface WalletCreator {
	create(name: string, options: Record<string, unknown>): MountedElementHandle;
}

// The published react wrapper bakes its element list, and the pinned build predates several of
// these, so they are minted through the handle instead of a generated component.
export function WalletElement({
	className,
	name,
	options,
	refreshStaleMs,
}: {
	className?: string;
	name: string;
	refreshStaleMs?: number;
	options?: Record<string, unknown>;
}) {
	const wallet = useWallet() as WalletCreator | null;
	const appearance = useWalletAppearance();
	const target = useRef<HTMLDivElement>(null);
	const live = useRef<MountedElementHandle | null>(null);
	const [error, setError] = useState("");
	const latest = useRef(options);
	latest.current = options;
	const key = JSON.stringify(options ?? {});
	const appearanceKey = JSON.stringify(appearance);

	useEffect(() => {
		if (!wallet || !target.current) return;

		setError("");
		const supplied = latest.current ?? {};
		const callbacks = Object.fromEntries(Object.entries(supplied).filter(([, value]) => typeof value === "function").map(([key]) => [key, (...args: unknown[]) => {
			const callback = latest.current?.[key];
			if (typeof callback === "function") callback(...args);
		}]));
		const element = wallet.create(name, {
			...supplied,
			appearance,
			...callbacks,
			onError: (failure: { message?: string }) => {
				setError(failure.message ?? `${name} failed to load.`);
				const onError = latest.current?.onError;
				if (typeof onError === "function") onError(failure);
			},
		});
		live.current = element;
		element.mount(target.current);

		return () => { live.current = null; element.destroy(); };
	}, [key, name, wallet]);
	useEffect(() => { live.current?.update?.({ appearance }); }, [appearanceKey]);

	useScreenRefresh(() => live.current?.refresh?.(), refreshStaleMs);

	return (
		<>
			{error ? <p className="nb-status__detail">{error}</p> : null}
			<div className={className} ref={target} />
		</>
	);
}

interface UnitHandle {
	update?: (options: Record<string, unknown>) => void;
	create(name: string, options: Record<string, unknown>): MountedElementHandle;
	destroy(): void;
}

interface UnitCreator {
	create(name: string, options: Record<string, unknown>): UnitHandle;
}

const CardsUnitContext = createContext<UnitHandle | null>(null);

export function WalletCardsUnit({
	children,
	options,
}: {
	children: ReactNode;
	options?: Record<string, unknown>;
}) {
	const wallet = useWallet() as UnitCreator | null;
	const appearance = useWalletAppearance();
	const latest = useRef(options);
	latest.current = options;
	const key = JSON.stringify(options ?? {});
	const owner = useMemo(() => wallet ? handleLifecycle(
		() => wallet.create("cards", { ...latest.current, appearance }),
		unit => unit.destroy(),
	) : null, [key, wallet]);
	useLayoutEffect(() => {
		owner?.activate();
		return () => owner?.release();
	}, [owner]);
	const appearanceKey = JSON.stringify(appearance);
	useEffect(() => { owner?.handle.update?.({ appearance }); }, [owner, appearanceKey]);

	return (
		<CardsUnitContext.Provider value={owner?.handle ?? null}>{children}</CardsUnitContext.Provider>
	);
}

export function WalletCardsElement({
	className,
	name,
	options,
}: {
	className?: string;
	name: string;
	options?: Record<string, unknown>;
}) {
	const unit = useContext(CardsUnitContext);
	const appearance = useWalletAppearance();
	const target = useRef<HTMLDivElement>(null);
	const live = useRef<MountedElementHandle | null>(null);
	const latest = useRef(options);
	latest.current = options;
	const key = JSON.stringify(options ?? {});
	const appearanceKey = JSON.stringify(appearance);

	useEffect(() => {
		if (!unit || !target.current) return;

		const element = unit.create(name, { ...latest.current, appearance });
		live.current = element;
		element.mount(target.current);
		return () => { live.current = null; element.destroy(); };
	}, [key, name, unit]);
	useEffect(() => { live.current?.update?.({ appearance }); }, [appearanceKey]);

	useScreenRefresh(() => live.current?.refresh?.());

	return <div className={className} ref={target} />;
}
