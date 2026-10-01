import type { DepositElementHandle } from "@whop/elements/wallet";
import { useScreenRefresh } from "./screen-lifecycle";
import { useRouterState } from "@tanstack/react-router";
import { useWallet } from "./wallet-provider";
import { useEffect, useRef } from "react";

import { loginHref } from "../../lib/login";
import { DepositActivity } from "./deposit-activity";

function DepositSurface({
	accountId,
	accessToken,
	onVerify,
}: {
	accountId: string;
	accessToken: string;
	onVerify: () => void;
}) {
	const wallet = useWallet();
	const live = useRef<DepositElementHandle | null>(null);
	const target = useRef<HTMLDivElement>(null);
	const verify = useRef<() => void>(() => undefined);
	verify.current = onVerify;

	useEffect(() => {
		if (!wallet || !target.current) return;

		const deposit = wallet.create("deposit", {
			accessToken,
			onIdentityVerificationRequested: () => verify.current(),
			showBank: true,
			showCrypto: true,
		});
		live.current = deposit;
		deposit.mount(target.current);

		return () => {
			live.current = null;
			deposit.destroy();
		};
	}, [accessToken, wallet]);

	useScreenRefresh(() => live.current?.refresh(), 5 * 60_000);

	return (
		<div className="nb-stack">
			<section className="nb-panel nb-panel--borderless">
				<div ref={target} />
			</section>
			<DepositActivity accessToken={accessToken} />
		</div>
	);
}

export function AddMoney({
	accountId,
	accessToken,
	error,
	isLoading,
	onVerify,
}: {
	accountId: string;
	accessToken: string | undefined;
	error: string | undefined;
	isLoading: boolean;
	onVerify: () => void;
}) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });

	if (isLoading) return <p className="nb-status">Opening Deposit&hellip;</p>;

	if (!accessToken)
		return (
			<div className="nb-status nb-status--notice">
				<p>Deposit needs your permission.</p>
				{error ? <p className="nb-status__detail">{error}</p> : null}
				<a
					className="nb-button nb-button--primary nb-signin"
					href={loginHref(accountId, pathname)}
				>
					Grant permission
				</a>
			</div>
		);

	return (
		<DepositSurface onVerify={onVerify} key={`${accountId}:${accessToken}`} accountId={accountId} accessToken={accessToken} />
	);
}
