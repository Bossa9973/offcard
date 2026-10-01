import type { ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useWhop } from "@whop/elements-react";
import { useWallet } from "./wallet-provider";
import { useEffect, useRef } from "react";

export type VerificationKind = "business" | "individual";

export type VerificationStatus =
	| "action_required"
	| "approved"
	| "manual_review"
	| "not_started"
	| "pending"
	| "processing"
	| "rejected";

interface MountedElementHandle {
	destroy(): void;
	mount(target: HTMLElement): void;
}

interface VerificationsHandle {
	create(
		name: "capabilities",
		options: {
			hideCapabilities?: boolean;
			hideStatus?: boolean;
			onLoaderStart?: () => void;
			onReady?: () => void;
			onError?: (error: { message: string }) => void;
			onVerificationRequested?: (payload: { accountId: string; kind: string }) => void;
		},
	): MountedElementHandle;
	create(
		name: "rfi",
		options: {
			hideUnderReview?: boolean;
			onCompleted?: (payload: { accountId: string }) => void;
			onLoadFailed?: (payload: { reason: "access_denied" | "unavailable" }) => void;
			onSubmitted?: (payload: { itemIds: string[]; source: string }) => void;
		},
	): MountedElementHandle;
	create(
		name: "kyc",
		options: {
			onStatusChanged?: (payload: { status: VerificationStatus }) => void;
		},
	): MountedElementHandle;
	destroy(): void;
}

interface VerificationsCapable {
	verifications: {
		create(options: {
			accountId: string;
			getToken?: () => Promise<string>;
			kind: "business" | "individual";
		}): VerificationsHandle;
	};
}

interface BannerCapableWallet {
	create(
		name: "verification",
		options: {
			accessToken?: string;
			kind: "business" | "individual";
			onVerificationRequested?: () => void;
		},
	): MountedElementHandle;
}

export function VerificationSurface({
	accessToken,
	accountId,
	kind = "individual",
	onStatus,
	visible,
}: {
	accessToken: string;
	accountId: string;
	kind?: VerificationKind;
	onStatus: (status: VerificationStatus) => void;
	visible: boolean;
}) {
	const whop = useWhop() as (VerificationsCapable & object) | null;
	const target = useRef<HTMLDivElement>(null);
	const report = useRef(onStatus);
	report.current = onStatus;

	useEffect(() => {
		if (!whop || !target.current) return;

		const verifications = whop.verifications.create({
			accountId,
			getToken: () => Promise.resolve(accessToken),
			kind,
		});
		const kyc = verifications.create("kyc", {
			onStatusChanged: ({ status }) => report.current(status),
		});
		kyc.mount(target.current);

		return () => {
			kyc.destroy();
			verifications.destroy();
		};
	}, [accessToken, accountId, kind, whop]);

	return (
		<section className={visible ? undefined : "nb-panel--hidden"}>
			<div ref={target} />
		</section>
	);
}

export function CapabilitiesSurface({
	accessToken,
	accountId,
	onVerify,
	onDisplay,
	onReady,
}: {
	accessToken: string;
	accountId: string;
	onVerify: (kind: VerificationKind) => void;
	onDisplay?: () => void;
	onReady?: () => void;
}) {
	const whop = useWhop() as (VerificationsCapable & object) | null;
	const target = useRef<HTMLDivElement>(null);
	const verify = useRef(onVerify);
	verify.current = onVerify;
	const display = useRef(onDisplay);
	display.current = onDisplay;
	const ready = useRef(onReady);
	ready.current = onReady;

	useEffect(() => {
		if (!whop || !target.current) return;

		let active = true;
		const displayed = () => {
			if (active) display.current?.();
		};
		const verifications = whop.verifications.create({
			accountId,
			getToken: () => Promise.resolve(accessToken),
			kind: "business",
		});
		const surface = verifications.create("capabilities", {
			onLoaderStart: displayed,
			onReady: () => {
				displayed();
				if (active) ready.current?.();
			},
			onError: displayed,
			onVerificationRequested: ({ kind }) =>
				verify.current(kind === "business" ? "business" : "individual"),
		});
		surface.mount(target.current);

		return () => {
			active = false;
			surface.destroy();
			verifications.destroy();
		};
	}, [accessToken, accountId, whop]);

	return <div ref={target} />;
}

export function RfiSurface({
	accessToken,
	accountId,
	onOutstandingChange,
}: {
	accessToken: string;
	accountId: string;
	onOutstandingChange?: (outstanding: boolean) => void;
}) {
	const whop = useWhop() as (VerificationsCapable & object) | null;
	const target = useRef<HTMLDivElement>(null);
	const report = useRef(onOutstandingChange);
	report.current = onOutstandingChange;

	useEffect(() => {
		if (!whop || !target.current) return;

		const verifications = whop.verifications.create({
			accountId,
			getToken: () => Promise.resolve(accessToken),
			kind: "business",
		});
		const surface = verifications.create("rfi", {
			onCompleted: () => report.current?.(false),
			onLoadFailed: ({ reason }) => {
				if (reason === "access_denied") report.current?.(false);
			},
			onSubmitted: () => report.current?.(true),
		});
		surface.mount(target.current);

		return () => {
			surface.destroy();
			verifications.destroy();
		};
	}, [accessToken, accountId, whop]);

	return <div ref={target} />;
}

function VerificationBanner({
	accessToken,
	onRequested,
}: {
	accessToken: string;
	onRequested: () => void;
}) {
	const wallet = useWallet() as BannerCapableWallet | null;
	const target = useRef<HTMLDivElement>(null);
	const requested = useRef(onRequested);
	requested.current = onRequested;

	useEffect(() => {
		if (!wallet || !target.current) return;

		const banner = wallet.create("verification", {
			accessToken,
			kind: "business",
			onVerificationRequested: () => requested.current(),
		});
		banner.mount(target.current);

		return () => banner.destroy();
	}, [accessToken, wallet]);

	return <div ref={target} />;
}

export function VerifyGate({
	accessToken,
	accountId,
	children,
	showVerificationBanner,
}: {
	accessToken: string;
	accountId: string;
	children: ReactNode;
	showVerificationBanner: boolean;
}) {
	const navigate = useNavigate();

	function start(): void {
		void navigate({ params: { accountId }, to: "/account/$accountId/verification" });
	}

	return (
		<div className="nb-stack">
			{showVerificationBanner ? (
				<VerificationBanner accessToken={accessToken} onRequested={start} />
			) : null}
			{children}
		</div>
	);
}
