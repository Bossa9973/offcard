import { monochromeAppearance } from "../theme";
import { useScreenRefresh } from "./screen-lifecycle";
import type { DashboardHandle, PaymentsTableElementHandle } from "@whop/elements-react";
import { useWhop } from "@whop/elements-react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "frosted-ui";
import { useEffect, useRef, useState } from "react";

import { loginHref } from "../../lib/login";


export function InvoicingScreen({ accountId, accessToken, canReadPayments }: {
	accountId: string;
	accessToken: string | undefined;
	canReadPayments: boolean;
}) {
	const whop = useWhop();
	const navigate = useNavigate();
	const live = useRef<PaymentsTableElementHandle | null>(null);
	const target = useRef<HTMLDivElement>(null);
	const [error, setError] = useState("");
	const [attempt, setAttempt] = useState(0);
	useEffect(() => {
		if (!whop || !accessToken || !canReadPayments || !target.current || !accountId.startsWith("biz_")) return;
		let group: DashboardHandle | undefined;
		let table: PaymentsTableElementHandle | undefined;
		let active = true;
		const timeout = setTimeout(() => {
			if (active) setError("The payments table could not finish loading. Reload this page to try the latest Elements build.");
		}, 30_000);
		setError("");
		try {
			group = whop.dashboard.create({ accountId, accessToken, appearance: monochromeAppearance });
			table = group.create("paymentsTable", {
				showActions: true,
				showRowActions: false,
				showStatusTabs: false,
				showTracking: false,
				onPaymentSelected: ({ paymentId }) => {
					if (!/^pay_[A-Za-z0-9]+$/.test(paymentId)) return;
					void navigate({ to: "/account/$accountId/payments/detail/$paymentId", params: { accountId, paymentId } });
				},
				onError: (failure) => {
					clearTimeout(timeout);
					if (active) setError(failure.message);
				},
				onReady: () => {
					clearTimeout(timeout);
					if (active) {
						setError("");
					}
				},
			});
			live.current = table;
			table.mount(target.current);
		} catch (failure) {
			clearTimeout(timeout);
			setError(failure instanceof Error ? failure.message : "Payments failed to load.");
		}
		return () => {
			active = false;
			clearTimeout(timeout);
			live.current = null;
			table?.destroy();
			group?.destroy();
		};
	}, [whop, accountId, accessToken, canReadPayments, attempt, navigate]);

	useScreenRefresh(() => live.current?.refresh());

	if (!accountId.startsWith("biz_")) return <p>Select an entity to view payments.</p>;
	return (
		<div className="nb-stack">
		{!canReadPayments ? (
		<section className="nb-panel nb-stack">
			<p>Reconnect with Whop to allow this app to read your payments.</p>
			<div><a className="nb-button nb-button--primary nb-signin" href={loginHref(accountId, `/account/${accountId}/payments`)}>Connect payments</a></div>
		</section>
	) : <>
			{error ? <div role="alert">
				<p>{error}</p>
				<Button className="nb-button nb-button--secondary" onClick={() => setAttempt((value) => value + 1)} variant="soft">Retry payments</Button>{" "}
				<Button className="nb-button nb-button--secondary" onClick={() => window.location.reload()} variant="soft">Reload page</Button>
			</div> : null}
			<p className="nb-table-hint">Swipe across the table for customer and payment details.</p>
			<div className="nb-history-frame" hidden={Boolean(error)} ref={target} />
		</>}
		</div>
	);
}
