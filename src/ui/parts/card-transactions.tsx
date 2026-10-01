import { useWallet } from "./wallet-provider";
import { WalletCardsElement, WalletCardsUnit } from "./wallet-element";

export function CardTransactionsScreen({
	accessToken,
	cardId,
}: {
	accessToken: string | undefined;
	cardId: string | undefined;
}) {
	const wallet = useWallet();
	if (!accessToken)
		return (
			<div className="nb-status nb-status--notice">
				<p>Transactions need your permission.</p>
				<a className="nb-button nb-button--primary nb-signin" href="/api/auth/login">
					Grant permission
				</a>
			</div>
		);

	return (
		<WalletCardsUnit>
			<section className="nb-flush">
				<WalletCardsElement
					name="cardTransactions"
					options={{ accessToken, ...(cardId ? { cardIds: [cardId] } : {}),
						onTransactionSelected: ({ transactionId }: { transactionId: string }) => {
							(wallet as unknown as { createOverlay(name: string, options: Record<string, unknown>): { open(): void } } | null)
								?.createOverlay("activityDetail", { cardTransactionId: transactionId }).open();
						},
					}}
				/>
			</section>
		</WalletCardsUnit>
	);
}
