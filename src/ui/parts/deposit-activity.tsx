import type { LedgerActivity } from "@whop/elements-react";
import { useWallet } from "./wallet-provider";

import { WalletElement } from "./wallet-element";

const DEPOSIT_LINE_TYPES = ["bank_transfer", "onchain_deposit"] as const;
const WITHDRAWAL_LINE_TYPES = [
	"withdrawal",
	"withdrawal_reversal",
	"withdrawal_clawback",
	"withdrawal_clawback_reversal",
	"withdrawal_reclassification",
] as const;

interface OverlayHandle {
	open(): void;
}

interface ActivityDetailOpener {
	createOverlay(
		name: "activityDetail",
		options: { activity: LedgerActivity },
	): OverlayHandle;
}

function FilteredActivity({
	accessToken,
	defaultLineTypes,
}: {
	accessToken: string | undefined;
	defaultLineTypes: readonly string[];
}) {
	const wallet = useWallet() as ActivityDetailOpener | null;

	if (!accessToken) return null;

	return (
		<section className="nb-panel nb-panel--activity nb-panel--borderless">
			<WalletElement
				name="activity"
				options={{
					accessToken,
					canOpenCardTransactionDetails: true,
					defaultLineTypes,
					onActivitySelected: ({ activity }: { activity: LedgerActivity }) => {
						wallet?.createOverlay("activityDetail", { activity }).open();
					},
				}}
			/>
		</section>
	);
}

export function DepositActivity({
	accessToken,
}: {
	accessToken: string | undefined;
}) {
	return (
		<FilteredActivity
			accessToken={accessToken}
			defaultLineTypes={DEPOSIT_LINE_TYPES}
		/>
	);
}

export function WithdrawalActivity({
	accessToken,
}: {
	accessToken: string | undefined;
}) {
	return (
		<FilteredActivity
			accessToken={accessToken}
			defaultLineTypes={WITHDRAWAL_LINE_TYPES}
		/>
	);
}
