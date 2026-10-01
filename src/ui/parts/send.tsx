import { useContext, useEffect, useState } from "react";
import { ScreenLifecycle } from "./screen-lifecycle";
import { WalletElement } from "./wallet-element";

export function SendMoney({
	accessToken,
	error,
	isEntity,
	onDone,
	onChanged,
}: {
	accessToken: string | undefined;
	error: string | undefined;
	isEntity: boolean;
	onDone: () => void;
	onChanged: () => void;
}) {
	const { active } = useContext(ScreenLifecycle);
	const [finished, setFinished] = useState(false);
	const [attempt, setAttempt] = useState(0);
	useEffect(() => {
		if (!active && finished) {
			setAttempt((value) => value + 1);
			setFinished(false);
		}
	}, [active, finished]);
	const completed = () => { setFinished(true); onChanged(); };
	// Unlike the hosted company key, an OAuth grant can carry payout:withdraw_funds — so a
	// failure here means the consent screen was declined or the grant predates the scope,
	// both of which a fresh sign-in fixes.
	if (!accessToken)
		return (
			<div className="nb-status nb-status--notice">
				<p>Sending needs your permission.</p>
				<p className="nb-status__detail">
					Sign in again and approve the Send permissions to move money and search
					recipients{isEntity ? "." : ", and create claim links."}
				</p>
				{error ? <p className="nb-status__detail">{error}</p> : null}
				<a className="nb-button nb-button--primary nb-signin" href="/api/auth/login">
					Grant permission
				</a>
			</div>
		);

	return (
		<section className="nb-panel nb-panel--borderless">
			<WalletElement
				className="nb-send-element"
				name="send"
				refreshStaleMs={0}
				key={attempt}
				options={{
					accessToken,
					canCreateLink: !isEntity,
					canSearchRecipients: true,
					onDone,
					onSendCompleted: completed,
					onLinkCreated: completed,
				}}
			/>
		</section>
	);
}
