import { useScreenRefresh } from "./screen-lifecycle";
import { useWallet, useWalletAppearance } from "./wallet-provider";
import { useEffect, useRef, useState } from "react";
import type { ActivityFilters } from "../report-navigation";

interface MountedReportElement {
 refresh(): Promise<void>;
 destroy(): void;
 mount(target: HTMLElement): void;
}
interface ReportsHandle {
 create(name: "balanceReport" | "reportActivity", options?: Record<string, unknown>): MountedReportElement;
 destroy(): void;
}
interface ReportsCapableWallet {
 create(name: "reports", options: Record<string, unknown>): ReportsHandle;
}

export function ReportsScreen({ view, filters, onActivity }: {
 view: "summary" | "activity";
 filters: ActivityFilters;
 onActivity: (filters: ActivityFilters) => void;
}) {
 const wallet = useWallet() as ReportsCapableWallet | null;
 const appearance = useWalletAppearance();
 const live = useRef<MountedReportElement | null>(null);
 const target = useRef<HTMLDivElement>(null);
 const callback = useRef(onActivity); callback.current = onActivity;
 const [error, setError] = useState("");
 const filterKey = JSON.stringify(filters);
 useEffect(() => {
  if (!wallet || !target.current) return;
  let reports: ReportsHandle | undefined;
  let element: MountedReportElement | undefined;
  try {
   setError("");
   reports = wallet.create("reports", { appearance });
   // Only one history surface at a time. Recreate the summary on return to clear
   // its internal inline drilldown; the host URL owns the visible destination.
   element = view === "activity"
    ? reports.create("reportActivity", { appearance, filters: JSON.parse(filterKey) })
    : reports.create("balanceReport", { appearance, onActivityRequested: (next: ActivityFilters) => callback.current(next) });
   live.current = element;
   element.mount(target.current);
  } catch (failure) { setError(failure instanceof Error ? failure.message : "Reports failed to load."); }
  return () => { live.current = null; element?.destroy(); reports?.destroy(); };
 }, [wallet, view, filterKey]);
 useScreenRefresh(() => live.current?.refresh());
 return <div className="nb-stack nb-reports">
  {error ? <p className="nb-status__detail" role="alert">{error}</p> : null}
  <div className={`nb-reports__element nb-reports__element--${view}`} ref={target} />
 </div>;
}
