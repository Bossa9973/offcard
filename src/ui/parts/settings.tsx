import type { VerificationKind } from "./verify-gate";
import { CapabilitiesSurface, RfiSurface } from "./verify-gate";
import { useEffect, useState } from "react";
import { FeeSettings } from "./fee-settings";

export function Settings({
	accessToken,
	accountId,
	hasInformationRequests,
	isNeobankOwner,
	onVerify,
	onChanged,
}: {
	accessToken: string | undefined;
	accountId: string;
	hasInformationRequests: boolean;
	isNeobankOwner: boolean;
	onVerify: (kind: VerificationKind) => void;
	onChanged: () => void;
}) {
	const [hasOutstanding, setHasOutstanding] = useState(hasInformationRequests);

	// Route data is account-specific. Reset the local completion state when Settings is opened
	// for another account, but let RFI completion hide the surface in the current session.
	useEffect(() => {
		setHasOutstanding(hasInformationRequests);
	}, [accountId, hasInformationRequests]);

	return (
		<div className="nb-stack">
			{accessToken && hasInformationRequests && hasOutstanding ? (
				<section className="nb-panel nb-panel--verifications nb-panel--borderless">
					<RfiSurface
						accessToken={accessToken}
						accountId={accountId}
						onOutstandingChange={setHasOutstanding}
					/>
				</section>
			) : null}

			{accessToken ? (
				<section className="nb-panel nb-panel--verifications nb-panel--borderless">
					<CapabilitiesSurface
						accessToken={accessToken}
						accountId={accountId}
						onVerify={onVerify}
					/>
				</section>
			) : null}

			{isNeobankOwner && accessToken ? <FeeSettings key={accountId} accountId={accountId} onChanged={onChanged} /> : null}

		</div>
	);
}
