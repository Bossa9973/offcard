import type { CardScene } from "../../routes/api.cards";
import type { VerificationKind } from "./verify-gate";
import {
	BoltFilled16,
	CoinsFilled16,
	ControlsFilled16,
	CreditCardPictogram,
	LockKeyholePictogram,
	ReceiptPictogram,
	ShieldKeyholePictogram,
} from "@frosted-ui/icons";
import { Badge, Button, EmptyState, Spinner, Text } from "frosted-ui";
import type { ComponentProps, ComponentType, ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";

interface Application {
	appliesAsBusiness: boolean;
	identityApproved: boolean;
	kind: string | null;
	outstanding: number;
	scene: CardScene;
	spendable?: number | null;
	status: string | null;
}

export interface CardApplicationState {
	applying: boolean;
	apply: () => void;
	error: string | undefined;
	loading: boolean;
	needsIdentity: boolean;
	scene: CardScene | undefined;
	application: Application | undefined;
	refresh: () => void;
}

const APPLICATION_POLL_INTERVAL_MS = 3_000;

export function useCardApplication(
	accountId: string,
	enabled = true,
): CardApplicationState {
	const [application, setApplication] = useState<Application | undefined>();
	const [loading, setLoading] = useState(true);
	const [applying, setApplying] = useState(false);
	const [error, setError] = useState<string | undefined>();
	const [needsIdentity, setNeedsIdentity] = useState(false);

	const load = useCallback(async () => {
		if (!enabled) {
			setApplication(undefined);
			setLoading(false);
			return;
		}
		const response = await fetch(
			`/api/cards?accountId=${encodeURIComponent(accountId)}`,
		);
		const body = (await response.json().catch(() => null)) as
			| (Application & { error?: { message?: string } })
			| null;
		if (!response.ok) {
			setError(
				body?.error?.message ??
					`Could not read your card application (${response.status}).`,
			);
			setApplication(undefined);
		} else if (body?.scene) {
			setError(undefined);
			setApplication(body);
		} else {
			setError(`Cards read returned no application state (${response.status}).`);
			setApplication(undefined);
		}
		setLoading(false);
	}, [accountId, enabled]);

	useEffect(() => {
		setLoading(true);
		void load();
	}, [load]);

	// Applications which are still under review are asynchronous on the issuer side. Keep the
	// on-screen decision current rather than requiring the user to reload after applying.
	useEffect(() => {
		if (application?.scene !== "review") return;
		const interval = window.setInterval(() => void load(), APPLICATION_POLL_INTERVAL_MS);
		return () => window.clearInterval(interval);
	}, [application?.scene, load]);

	const apply = useCallback(async () => {
		setApplying(true);
		setError(undefined);
		setNeedsIdentity(false);
		const response = await fetch("/api/cards", {
			body: JSON.stringify({ accountId }),
			headers: { "Content-Type": "application/json" },
			method: "POST",
		});
		const body = (await response.json().catch(() => null)) as {
			error?: { message?: string; type?: string };
		} | null;
		if (!response.ok) {
			if (body?.error?.type === "identity_required") setNeedsIdentity(true);
			else
				setError(body?.error?.message ?? "Could not file your card application.");
		}
		setApplying(false);
		await load();
	}, [accountId, load]);

	return {
		application,
		apply,
		applying,
		error,
		loading,
		needsIdentity,
		refresh: () => void load(),
		scene: application?.scene,
	};
}

type PictogramComponent = ComponentType<{
	"aria-hidden"?: boolean | "false" | "true";
	className?: string;
}>;

function Scene({
	badge,
	children,
	description,
	pictogram: Pictogram,
	title,
}: {
	badge?: ReactNode;
	children?: ReactNode;
	description?: ReactNode;
	pictogram: PictogramComponent;
	title: ReactNode;
}) {
	return (
		<div className="nb-scene">
			<EmptyState.Root>
				<EmptyState.Header>
					<EmptyState.Media variant="ghost">
						<Pictogram aria-hidden className="size-32" />
					</EmptyState.Media>
					{badge}
					<EmptyState.Title>{title}</EmptyState.Title>
					{description ? (
						<EmptyState.Description>{description}</EmptyState.Description>
					) : null}
				</EmptyState.Header>
				{children ? <EmptyState.Actions>{children}</EmptyState.Actions> : null}
			</EmptyState.Root>
		</div>
	);
}

function SceneButton({ children, ...props }: ComponentProps<typeof Button>) {
	return (
		<Button
			className="nb-button nb-button--primary min-w-0"
			size="3"
			type="button"
			variant="classic"
			{...props}
		>
			{children}
		</Button>
	);
}

function SceneActions({ children }: { children: ReactNode }) {
	return (
		<div className="mx-auto flex w-full max-w-[320px] flex-col gap-3">
			{children}
		</div>
	);
}

function FeatureRow({ icon, label }: { icon: ReactNode; label: string }) {
	return (
		<div className="flex items-center gap-3">
			<span className="text-gray-12 shrink-0">{icon}</span>
			<Text className="text-gray-12" size="3" weight="medium">
				{label}
			</Text>
		</div>
	);
}

export function CardApplication({
	onAddInformation,
	onVerify,
	state,
}: {
	onAddInformation: () => void;
	onVerify: (kind: VerificationKind) => void;
	state: CardApplicationState;
}) {
	const { application, apply, applying, error, needsIdentity, scene } = state;

	if (needsIdentity || scene === "needs_identity")
		return (
			<Scene
				description="Our card issuer needs to confirm who you are before it can approve cards for this entity."
				pictogram={ShieldKeyholePictogram}
				title="Verify your identity to continue"
			>
				<SceneActions>
					<SceneButton onClick={() => onVerify("individual")}>Verify identity</SceneButton>
				</SceneActions>
			</Scene>
		);

	if (scene === "unavailable")
		return (
			<Scene
				description="Set up payments on this entity before applying for cards."
				pictogram={LockKeyholePictogram}
				title="No ledger account found"
			/>
		);

	if (scene === "intro") {
		const unverified = application ? !application.identityApproved : false;
		return (
			<Scene
				pictogram={CreditCardPictogram}
				title="Access your spending power, instantly"
			>
				<div className="mx-auto flex w-fit flex-col items-stretch gap-6 text-left">
					<div className="flex flex-col items-start gap-3">
						<FeatureRow
							icon={<BoltFilled16 />}
							label="Spend instantly from your pending balance"
						/>
						<FeatureRow
							icon={<CoinsFilled16 />}
							label="Assign cards to your team"
						/>
						<FeatureRow
							icon={<ControlsFilled16 />}
							label="Control spend limits and locations"
						/>
					</div>
					<SceneButton
						disabled={applying}
						onClick={unverified ? () => onVerify("individual") : apply}
					>
						{unverified
							? "Verify identity"
							: applying
								? "Submitting…"
								: application?.appliesAsBusiness
									? "Apply as a business"
									: "Apply for cards"}
					</SceneButton>
				</div>
			</Scene>
		);
	}

	if (scene === "review")
		return (
			<Scene
				badge={
					<Badge color="gray" size="2">
						<Spinner size="1" />
						In review
					</Badge>
				}
				description="We'll notify you when it's done"
				pictogram={CreditCardPictogram}
				title="Your card application is in review"
			/>
		);

	if (scene === "needs_information" || scene === "needs_resubmit")
		return (
			<Scene
				description={
					scene === "needs_resubmit"
						? "Our card issuer couldn't accept everything you sent. Resubmit the requested items to continue."
						: "Our card issuer needs a few documents before it can approve cards for this entity."
				}
				pictogram={ReceiptPictogram}
				title={
					scene === "needs_resubmit"
						? "We need a few more details"
						: "We need a few documents"
				}
			>
				<SceneActions>
					<SceneButton onClick={onAddInformation}>Add information</SceneButton>
				</SceneActions>
			</Scene>
		);

	if (scene === "declined") {
		const canReapply = application?.appliesAsBusiness === true;
		return (
			<Scene
				description={
					canReapply
						? "Our card issuer reviewed your application and couldn't approve it. Your entity is verified now, so you can apply again as the business."
						: "Our card issuer reviewed your application and couldn't approve it. If you run a registered business, verify it and you can apply again on its behalf."
				}
				pictogram={LockKeyholePictogram}
				title="We couldn't approve your card application"
			>
				<SceneActions>
					{canReapply ? (
						<SceneButton disabled={applying} onClick={apply}>
							{applying ? "Submitting…" : "Apply as a business"}
						</SceneButton>
					) : (
						<SceneButton onClick={() => onVerify("business")}>Verify your business</SceneButton>
					)}
				</SceneActions>
			</Scene>
		);
	}

	return (
		<Scene
			description={
				error ??
				`Cards reported an unexpected state${application?.status ? ` (${application.status})` : ""}.`
			}
			pictogram={LockKeyholePictogram}
			title="Cards are unavailable right now"
		/>
	);
}
