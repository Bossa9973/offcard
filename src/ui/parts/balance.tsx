import { marketAsset } from "../../lib/market-prices";
import { AssetScreen } from "./asset";
import type { LedgerActivity } from "@whop/elements-react";
import { useWallet } from "./wallet-provider";
import { useEffect, useRef } from "react";

import { WalletElement } from "./wallet-element";
import { BackButton } from "./ui";

interface OverlayHandle {
	open(): void;
}

interface MountedElementHandle {
	destroy(): void;
	mount(target: HTMLElement): void;
}

interface BalancesHandle {
	create(
		name: "breakdown",
		options: { showSourceCurrency: boolean; currency: string },
	): MountedElementHandle;
	destroy(): void;
}

type MergedWalletHandle = {
	create(name: "balances", options: { accessToken?: string }): BalancesHandle;
	createOverlay(
		name: "activityDetail",
		options: { activity: LedgerActivity },
	): OverlayHandle;
};

type BalanceScreenProps = { accountId: string; accessToken: string | undefined; holding: string; onBack: () => void; onSeeAll: () => void; onChanged?: () => void };
export function BalanceScreen(props: BalanceScreenProps) {
 const asset=marketAsset(props.holding);
 return asset ? <AssetScreen {...props} asset={asset}/> : <CashBalanceScreen {...props}/>;
}

function CashBalanceScreen({
	accessToken,
	holding,
	onBack,
	onSeeAll,
}: {
	accessToken: string | undefined;
	holding: string;
	onBack: () => void;
	onSeeAll: () => void;
}) {
	const wallet = useWallet() as MergedWalletHandle | null;
	const breakdownTarget = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!wallet || !breakdownTarget.current) return;

		const balances = wallet.create("balances", { accessToken });
		const breakdown = balances.create("breakdown", {
			showSourceCurrency: true,
			currency: holding,
		});
		breakdown.mount(breakdownTarget.current);

		return () => {
			breakdown.destroy();
			balances.destroy();
		};
	}, [accessToken, holding, wallet]);

	return (
		<div className="nb-stack nb-stack--overview">
			<BackButton label="Back to Home" onClick={onBack} />

			<section className="nb-balance-breakdown">
				<div ref={breakdownTarget} />
			</section>

			<section className="nb-actions-element nb-actions-element--full">
				<WalletElement
					name="actions"
					options={{
						showAccept: false,
						showWithdraw: true,
					}}
				/>
			</section>

			<section className="nb-panel nb-panel--activity nb-panel--activity-flush">
				<WalletElement
					name="activity"
					options={{
						accessToken,
						canOpenCardTransactionDetails: true,
						maxItems: 6, hideFilters: true, onSeeAllRequested: onSeeAll,
						currency: holding,
						onActivitySelected: ({ activity }: { activity: LedgerActivity }) => {
							wallet?.createOverlay("activityDetail", { activity }).open();
						},
					}}
				/>
			</section>
		</div>
	);
}
