import type { LedgerActivity, WalletHandle } from "@whop/elements-react";
import { useWallet, useWalletAppearance } from "./wallet-provider";
import { useEffect, useRef } from "react";

import { WalletElement } from "./wallet-element";
import { tokens } from "../tokens";

interface OverlayHandle {
	open(): void;
}

interface MountedElementHandle {
	destroy(): void;
	mount(target: HTMLElement): void;
}

interface SelectedHolding {
	holding: string;
	kind: "usd" | "cash" | "asset";
}

interface BalancesHandle {
	create(
		name: "balance",
		options: { appearance?: unknown; accessToken?: string; accountName?: string; height: number; range: "1M" },
	): MountedElementHandle;
	create(
		name: "list",
		options: {
			appearance?: unknown;
			accessToken?: string;
			onBalanceSelected: (payload: SelectedHolding) => void;
			showUsdEquivalent: boolean;
		},
	): MountedElementHandle;
	destroy(): void;
}

type MergedWalletHandle = WalletHandle & {
	create(name: "balances", options: { accessToken?: string; appearance?: unknown }): BalancesHandle;
	createOverlay(
		name: "activityDetail",
		options: { activity: LedgerActivity },
	): OverlayHandle;
};

export function Overview({
	accessToken,
	accountName,
	onHoldingChange,
}: {
	accessToken: string | undefined;
	accountName: string | undefined;
	onHoldingChange: (holding: string | null) => void;
}) {
	const wallet = useWallet() as MergedWalletHandle | null;

	return (
		<div className="nb-stack nb-stack--overview nb-stack--home">
			<BalancesSurface
				accessToken={accessToken}
				accountName={accountName}
				onHoldingChange={onHoldingChange}
				wallet={wallet}
			/>

			<section className="nb-panel nb-panel--activity">
				<WalletElement
					name="activity"
					options={{
						accessToken,
						canOpenCardTransactionDetails: true,
						onActivitySelected: ({ activity }: { activity: LedgerActivity }) => {
							wallet?.createOverlay("activityDetail", { activity }).open();
						},
					}}
				/>
			</section>
		</div>
	);
}

function BalancesSurface({
	accessToken,
	accountName,
	onHoldingChange,
	wallet,
}: {
	accessToken: string | undefined;
	accountName: string | undefined;
	onHoldingChange: (holding: string | null) => void;
	wallet: MergedWalletHandle | null;
}) {
	const appearance = useWalletAppearance();
	const balanceTarget = useRef<HTMLDivElement>(null);
	const listTarget = useRef<HTMLDivElement>(null);
	const onHoldingChangeRef = useRef(onHoldingChange);
	onHoldingChangeRef.current = onHoldingChange;

	useEffect(() => {
		if (!wallet || !balanceTarget.current || !listTarget.current) return;

		const balances = wallet.create("balances", { accessToken, appearance });
		const balance = balances.create("balance", {
			appearance,
			accessToken,
			accountName,
			// Shorter than the shared chart height so balances start above the fold.
			height: Number.parseInt(tokens["chart-height"], 10) - 60,
			range: "1M",
		});
		const list = balances.create("list", {
			appearance,
			accessToken,
			onBalanceSelected: ({ holding }) => onHoldingChangeRef.current(holding),
			showUsdEquivalent: true,
		});
		balance.mount(balanceTarget.current);
		list.mount(listTarget.current);

		return () => {
			balance.destroy();
			list.destroy();
			balances.destroy();
		};
	}, [accessToken, accountName, wallet]);

	return (
		<div className="nb-overview-grid">
			{/* Money actions live in the balance hero: top-right on wide layouts, under the chart when narrow. */}
			<section className="nb-panel nb-panel--balance-chart" aria-label="Total balance">
				<div ref={balanceTarget} />
				<div className="nb-actions-element nb-actions-element--hero" role="group" aria-label="Move money">
					<WalletElement
						name="actions"
						options={{
							showAccept: false,
							showWithdraw: true,
							showConvert: true,
						}}
					/>
				</div>
			</section>

			<section className="nb-panel nb-panel--balances" aria-label="Balances by currency and asset">
				<div ref={listTarget} />
			</section>
		</div>
	);
}
