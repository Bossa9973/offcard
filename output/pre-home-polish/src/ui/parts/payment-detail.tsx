import { monochromeAppearance } from "../theme";
import type { DashboardHandle, PaymentDetailElementHandle } from "@whop/elements-react";
import { useWhop } from "@whop/elements-react";
import { Link } from "@tanstack/react-router";
import { Button, Skeleton } from "frosted-ui";
import { useEffect, useRef, useState } from "react";
import { DESIGN_MODE } from "../../design-mode";
import { loginHref } from "../../lib/login";

export function PaymentDetailScreen({ accountId, paymentId, accessToken, canReadPayments }: {
	accountId: string;
	paymentId: string;
	accessToken: string | undefined;
	canReadPayments: boolean;
}) {
	const whop = useWhop();
	const target = useRef<HTMLDivElement>(null);
	const [error, setError] = useState("");
	const [attempt, setAttempt] = useState(0);
	useEffect(() => {
		if (!whop || !accessToken || !canReadPayments || !target.current) return;
		let group: DashboardHandle | undefined;
		let detail: PaymentDetailElementHandle | undefined;
		let active = true;
		setError("");
		const timeout = setTimeout(() => {
			if (active) setError("Payment details did not finish loading. Retry to load the latest Elements build.");
		}, 30_000);
		try {
			group = whop.dashboard.create({ accountId: DESIGN_MODE ? "biz_demo" : accountId, accessToken, appearance: monochromeAppearance });
			detail = group.create("paymentDetail", {
				paymentId: DESIGN_MODE ? "pay_demoDetail" : paymentId,
				showActions: false,
				onReady: () => { clearTimeout(timeout); if (active) setError(""); },
				onError: (failure) => { clearTimeout(timeout); if (active) setError(failure.message); },
			});
			detail.mount(target.current);
		} catch (failure) {
			clearTimeout(timeout);
			setError(failure instanceof Error ? failure.message : "Payment details failed to load.");
		}
		return () => { active = false; clearTimeout(timeout); detail?.destroy(); group?.destroy(); };
	}, [whop, accountId, paymentId, accessToken, canReadPayments, attempt]);
	return <div className="nb-payment-detail">
		<nav aria-label="Breadcrumb" className="nb-payment-breadcrumb"><Link to="/account/$accountId/payments" params={{ accountId }}>Payments</Link><span aria-hidden>›</span><span>Payment details</span></nav>
		{!canReadPayments ? <div className="nb-stack"><p>Reconnect with Whop to read this payment.</p><a href={loginHref(accountId, `/account/${accountId}/payments/detail/${paymentId}`)}>Connect payments</a></div>
			: <>
				{error ? <div role="alert" className="nb-stack"><p>{error}</p><div><Button variant="soft" onClick={() => setAttempt(value => value + 1)}>Retry</Button></div></div> : null}
				{!whop || !accessToken ? <Skeleton.Rect style={{ height: 400, width: "100%" }} /> : null}
				{DESIGN_MODE ? <p className="nb-section-note">Sample payment details. The official demo uses a standalone fixture, so these details may differ from the selected row.</p> : null}
				<div ref={target} hidden={Boolean(error)} />
			</>}
	</div>;
}
