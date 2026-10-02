import type { LedgerActivity } from "@whop/elements-react";
import { Wallet, useWallet } from "./wallet-provider";
import { useCallback, useEffect, useState } from "react";
import { DESIGN_MODE } from "../../design-mode";
import { VelobankCreditCard } from "./phone-card-deck";

import type { CardApplicationState } from "./card-application";
import { CardApplication } from "./card-application";
import { WalletElement, WalletCardsElement, WalletCardsUnit } from "./wallet-element";
import type { VerificationKind } from "./verify-gate";

interface CardDetailsOverlay {
	close(): void;
	destroy(): void;
	open(): void;
}

interface CardDetailsOpener {
	createOverlay(
		name: "cardDetails",
		options: {
			cardId: string;
			card?: { id: string; name: string; last4: string; status: string };
			hideMenuButton?: boolean;
			onAllTransactionsRequested?: (payload: { cardId: string }) => void;
			onCloseRequested?: (payload: { cardId: string }) => void;
			onTopUpRequested?: (payload: { cardId: string }) => void;
			onTransactionSelected?: (payload: { transactionId: string }) => void;
		},
	): CardDetailsOverlay;
}

export function CardsScreen({
	accountId,
	accessToken,
	application,
	enabled,
	error,
	onAddInformation,
	onCreateCard,
	onTopUp,
	initialCardId,
	onVerify,
	onViewTransactions,
}: {
	accountId: string;
	accessToken: string | undefined;
	application: CardApplicationState;
	enabled: boolean;
	error: string | undefined;
	onAddInformation: () => void;
	onCreateCard: () => void;
	onTopUp: (cardId: string) => void;
	initialCardId?: string;
	onVerify: (kind: VerificationKind) => void;
	onViewTransactions: (cardId?: string) => void;
}) {
	const wallet = useWallet() as CardDetailsOpener | null;
	const [selectedCard, setSelectedCard] = useState<string | null>(DESIGN_MODE ? "icrd_demo" : initialCardId ?? null);
	const [previewLoading, setPreviewLoading] = useState(!DESIGN_MODE);
	const [previewError, setPreviewError] = useState("");
	const [previewAttempt, setPreviewAttempt] = useState(0);
	useEffect(() => {
		if (DESIGN_MODE || !accessToken || application.scene !== "approved" || !enabled) return;
		const abort = new AbortController();
		setPreviewLoading(true); setPreviewError("");
		void fetch(`/api/cards/featured?accountId=${encodeURIComponent(accountId)}`, { signal: abort.signal })
			.then(async response => {
				const body = await response.json();
				if (!response.ok) throw new Error(body.error?.message ?? "Could not load the card preview.");
				if (body.cardId !== null && !/^icrd_[a-zA-Z0-9]+$/.test(body.cardId)) throw new Error("No valid card was returned.");
				if (!abort.signal.aborted) setSelectedCard(current => current ?? body.cardId);
			}).catch(error => { if (!abort.signal.aborted) setPreviewError(error.message); })
			.finally(() => { if (!abort.signal.aborted) setPreviewLoading(false); });
		return () => abort.abort();
	}, [accessToken, accountId, application.scene, enabled, previewAttempt]);
	const openTransaction = useCallback(({ transactionId }: { transactionId: string }) => {
		(wallet as unknown as { createOverlay(name: string, options: Record<string, unknown>): CardDetailsOverlay } | null)
			?.createOverlay("activityDetail", { cardTransactionId: transactionId }).open();
	}, [wallet]);

	const openCardDetails = useCallback(
		(cardId: string) => {
			if (!wallet) return;
			// Each official demo has its own fixtures. WhopCard only knows icrd_demo;
			// its direct-only metadata prop cannot override an iframe's fixture.
			if (!DESIGN_MODE) setSelectedCard(cardId);
			const overlay = wallet.createOverlay("cardDetails", {
				cardId,
				// The official table and drawer demos have independent card fixtures.
				// Pass the table's public metadata through the supported card prop.
				...(DESIGN_MODE ? { card: DEMO_CARD_METADATA[cardId] } : {}),
				hideMenuButton: true,
				onTransactionSelected: ({ transactionId }) => {
					overlay.close(); overlay.destroy();
					openTransaction({ transactionId });
				},
				onCloseRequested: () => {
					overlay.close();
					overlay.destroy();
				},
				onAllTransactionsRequested: () => {
					overlay.close();
					overlay.destroy();
					onViewTransactions(cardId);
				},
				onTopUpRequested: () => {
					overlay.close();
					overlay.destroy();
					onTopUp(cardId);
				},
			});
			overlay.open();
		},
		[onTopUp, onViewTransactions, openTransaction, wallet],
	);

	if (!accessToken)
		return (
			<div className="nb-status nb-status--notice">
				<p>Cards needs your permission.</p>
				<p className="nb-status__detail">
					Verifying an entity to issue cards requires the{" "}
					<code>identity:read</code> and <code>identity:write</code> scopes. Sign
					in again and approve them to turn cards on.
				</p>
				{error ? <p className="nb-status__detail">{error}</p> : null}
				<a className="nb-button nb-button--primary nb-signin" href="/api/auth/login">
					Grant permission
				</a>
			</div>
		);

	if (application.loading) return <CardsSkeleton />;

	if (application.scene && application.scene !== "approved")
		return <CardApplication
				onAddInformation={onAddInformation}
				onVerify={onVerify}
				state={application}
			/>;

	return (
		<WalletCardsUnit>
			<div className="nb-stack nb-cards-dashboard">
				<div className="nb-cards-summary">
					<section className="nb-cards-chart" aria-label="Card spending">
						<WalletCardsElement name="cardsChart" options={{ enabled, accessToken }} />
					</section>
					<section className="nb-cards-preview" aria-label="Card preview" style={{ overflow: "visible", padding: "1.5rem" }}>
						<div style={{ width: "100%", maxWidth: "23rem", margin: "0 auto" }}>
							<VelobankCreditCard
								cardName={selectedCard && DEMO_CARD_METADATA[selectedCard] ? DEMO_CARD_METADATA[selectedCard].name : "PREMIUM CARD"}
								cardNumber={selectedCard && DEMO_CARD_METADATA[selectedCard] ? `•••• •••• •••• ${DEMO_CARD_METADATA[selectedCard].last4}` : "2781 8191 6671 3190"}
							/>
						</div>
					</section>
				</div>
				<section aria-label="All cards">
					<WalletCardsElement name="cardsTable" options={{ accessToken, onCreateCardRequested: onCreateCard, onCardSelected: ({ cardId }: { cardId: string }) => openCardDetails(cardId) }} />
				</section>
				<section className="nb-panel nb-cards-transactions" aria-label="Card activity">
					<Wallet accountId={accountId} accessToken={accessToken}>
						<CardActivity accessToken={accessToken} onViewAll={() => onViewTransactions()} />
					</Wallet>
				</section>
			</div>
		</WalletCardsUnit>
	);
}

function CardActivity({ accessToken, onViewAll }: { accessToken: string; onViewAll: () => void }) {
	const wallet = useWallet();
	return <WalletElement name="activity" options={{
		accessToken,
		defaultLineTypes: ["card_spend_authorization", "card_spend_authorization_void", "card_spend_refund", "cashback"],
		hideFilters: true,
		maxItems: 6,
		canOpenCardTransactionDetails: true,
		onSeeAllRequested: onViewAll,
		onActivitySelected: ({ activity }: { activity: LedgerActivity }) => {
			(wallet as unknown as { createOverlay(name: string, options: { activity: LedgerActivity }): CardDetailsOverlay } | null)
				?.createOverlay("activityDetail", { activity }).open();
		},
	}} />;
}

const DEMO_CARD_METADATA: Record<string, { id: string; name: string; last4: string; status: string }> = {
	icrd_demo1: { id: "icrd_demo1", name: "Ad Spend card 2", last4: "6521", status: "active" },
	icrd_demo2: { id: "icrd_demo2", name: "Adam Personal Salary", last4: "9613", status: "canceled" },
	icrd_demo3: { id: "icrd_demo3", name: "Scaled Estimates Meta Ad spend", last4: "5711", status: "active" },
};

function CardsSkeleton() {
	return (
		<div aria-busy="true" className="nb-stack">
			<div className="nb-skeleton nb-skeleton--panel nb-skeleton--chart" />
			<div className="nb-skeleton nb-skeleton--panel nb-skeleton--table" />
		</div>
	);
}
