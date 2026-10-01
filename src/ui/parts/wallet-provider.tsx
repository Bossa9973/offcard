import { monochromeAppearance } from "../theme";
import { useWhop, type Wallet as OfficialWallet, type WalletHandle } from "@whop/elements-react";
import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, type ComponentProps } from "react";
import { handleLifecycle } from "../handle-lifecycle";

const WalletContext = createContext<WalletHandle | null>(null);
const WalletAppearanceContext = createContext<NonNullable<ComponentProps<typeof OfficialWallet>["appearance"]>>(monochromeAppearance);

// Use the official SDK and iframe surfaces with an app-owned React lifecycle.
// The pinned React provider caches a handle in a ref, then destroys it during
// effect disconnect. React can reconnect that same tree without resetting refs.
export function Wallet({ children, fallback: _fallback, ...options }: ComponentProps<typeof OfficialWallet>) {
 const whop = useWhop();
 const themedOptions = { ...options, appearance: {
  ...monochromeAppearance, ...options.appearance,
  variables: { ...monochromeAppearance.variables, ...options.appearance?.variables },
  classes: Object.fromEntries([...new Set([...Object.keys(monochromeAppearance.classes), ...Object.keys(options.appearance?.classes ?? {})])].map(key => [key, { ...monochromeAppearance.classes[key], ...options.appearance?.classes?.[key] }])) ,
 } };
 const latest = useRef(themedOptions);
 latest.current = themedOptions;
 const owner = useMemo(() => whop ? handleLifecycle(
  () => whop.wallet.create(latest.current),
  handle => handle.destroy(),
 ) : null, [whop, options.accountId]);
 useLayoutEffect(() => {
  owner?.activate();
  return () => owner?.release();
 }, [owner]);
 useEffect(() => { owner?.handle.update(themedOptions); });
 return <WalletAppearanceContext.Provider value={themedOptions.appearance}><WalletContext.Provider value={owner?.handle ?? null}>{children}</WalletContext.Provider></WalletAppearanceContext.Provider>;
}

export function useWallet() { return useContext(WalletContext); }

export function useWalletAppearance() { return useContext(WalletAppearanceContext); }
