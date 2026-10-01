import { ScreenLifecycle, useScreenRefresh } from "./screen-lifecycle";
import { useWallet } from "./wallet-provider";
import { DollarBillsPictogram } from "@frosted-ui/icons";
import { Button, EmptyState } from "frosted-ui";
import { useContext, useEffect, useRef, useState } from "react";

import type { WithdrawalReadiness } from "../../lib/withdraw-readiness";

interface InlineWithdrawHandle {
	refresh(): Promise<void>;
	destroy(): void;
	mount(target: HTMLElement): void;
}

interface WithdrawCapableWallet {
	create(
		name: "withdraw",
		options: {
			accessToken?: string;
			onWithdrawalRequested?: () => void;
			onDone?: () => void;
			onError?: (error: { message: string }) => void;
		},
	): InlineWithdrawHandle;
}

function InlineWithdraw({ accessToken, onChanged, onDone }: { accessToken: string | undefined; onChanged: () => void; onDone: () => void }) {
	const wallet = useWallet() as WithdrawCapableWallet | null;
	const live = useRef<InlineWithdrawHandle | null>(null);
	const target = useRef<HTMLDivElement>(null);
	const { active } = useContext(ScreenLifecycle);
	const callbacks = useRef({ onChanged, onDone });
	callbacks.current = { onChanged, onDone };
	const [finished, setFinished] = useState(false);
	const [attempt, setAttempt] = useState(0);
	useEffect(() => {
		if (!active && finished) { setAttempt((value) => value + 1); setFinished(false); }
	}, [active, finished]);
	const [error, setError] = useState("");

	useEffect(() => {
		if (!wallet || !target.current) return;
		const container = target.current;
		const enableScrolling = () => {
			for (const frame of container.querySelectorAll("iframe")) {
				frame.setAttribute("scrolling", "auto");
			}
		};
		const observer = new MutationObserver(enableScrolling);
		observer.observe(container, { childList: true, subtree: true });

		const element = wallet.create("withdraw", {
			accessToken,
			onWithdrawalRequested: () => { setFinished(true); callbacks.current.onChanged(); },
			onDone: () => callbacks.current.onDone(),
			onError: ({ message }) => setError(message),
		});
		live.current = element;
		element.mount(container);
		enableScrolling();

		return () => {
			observer.disconnect();
			live.current = null;
			element.destroy();
		};
	}, [accessToken, wallet, attempt]);

	useScreenRefresh(() => live.current?.refresh(), 0);

	return (
		<section className="nb-withdraw-element">
			{error ? <p className="nb-status__detail">{error}</p> : null}
			<div ref={target} />
		</section>
	);
}

export function Withdraw({
	readiness,
	onOpenSettings,
	onVerify,
	verifyToken,
	onChanged,
	onDone,
}: {
	readiness: WithdrawalReadiness | undefined;
	onOpenSettings: () => void;
	onVerify: () => void;
	verifyToken: string | undefined;
	onChanged: () => void;
	onDone: () => void;
}) {
	if (!readiness) return <p role="status" className="nb-status">Checking withdrawal availability…</p>;
	const verificationRequired = readiness.verificationRequired;
	const failed = readiness.source === "fallback";
	if (!readiness.payoutActive)
		return (
			<div className="nb-scene">
				<EmptyState.Root>
					<EmptyState.Header>
						<EmptyState.Media variant="ghost">
							<DollarBillsPictogram aria-hidden className="size-32" />
						</EmptyState.Media>
						<EmptyState.Title>
							{failed ? "Unable to check withdrawals" : verificationRequired ? "Verify your identity to withdraw" : "Withdrawals unavailable"}
						</EmptyState.Title>
						<EmptyState.Description>
							{failed ? "We couldn't check your payout status. Please try again."
								: verificationRequired ? "Complete identity verification to start withdrawing your money."
									: "Payouts are not active for this account. Check Settings for your status and any required actions."}
						</EmptyState.Description>
					</EmptyState.Header>
					<EmptyState.Actions>
						<Button
							className="min-w-0"
							onClick={failed ? () => window.location.reload() : verificationRequired ? onVerify : onOpenSettings}
							size="3"
							type="button"
							variant="classic"
						>
							{failed ? "Try again" : verificationRequired ? "Verify identity" : "View settings"}
						</Button>
					</EmptyState.Actions>
				</EmptyState.Root>
			</div>
		);

	return <InlineWithdraw accessToken={verifyToken} onChanged={onChanged} onDone={onDone} />;
}
