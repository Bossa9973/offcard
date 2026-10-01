import { useContext } from "react";
import { ScreenLifecycle } from "./screen-lifecycle";
import { Pencil16, XMark16 } from "@frosted-ui/icons";
import { Button, Dialog, IconButton, Tabs, TextField } from "frosted-ui";
import { useEffect, useRef, useState } from "react";
import {
	FEE_CATEGORIES,
	FEE_OPTIONS,
	markupFor,
	validMarkup,
	type ChildMarkups,
	type FeeCategory,
	type FeeMarkup,
	type FeeOption,
} from "../../lib/account-fees";

function formatFee(
	percentage: number | null,
	fixed: FeeMarkup["default"]["fixed"],
) {
	const money = new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: fixed?.currency ?? "usd",
		minimumFractionDigits: fixed?.display_decimals ?? 2,
	}).format(Number(fixed?.amount ?? 0));
	return `${percentage ?? 0}% + ${money}`;
}

interface FeesResponse {
	child_markups?: ChildMarkups | null;
	error?: { message?: string };
}

export function FeeSettings({ accountId, onChanged }: { accountId: string; onChanged?: () => void }) {
	const { active } = useContext(ScreenLifecycle);
	const [markups, setMarkups] = useState<ChildMarkups | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [revision, setRevision] = useState(0);
	const [category, setCategory] = useState<FeeCategory>("payouts");
	const [editing, setEditing] = useState<FeeOption | null>(null);
	const [saved, setSaved] = useState<string | null>(null);
	useEffect(() => { if (!active) setEditing(null); }, [active]);
	const url = `/api/fees?${new URLSearchParams({ accountId })}`;

	useEffect(() => {
		const controller = new AbortController();
		setLoading(true);
		setError(null);
		void (async () => {
			try {
				const response = await fetch(url, { signal: controller.signal });
				const body = (await response.json()) as FeesResponse;
				if (controller.signal.aborted) return;
				if (!response.ok)
					throw new Error(
						body.error?.message ?? "Could not load fee settings.",
					);
				setMarkups(body.child_markups ?? null);
			} catch (cause) {
				if (!controller.signal.aborted)
					setError(
						cause instanceof Error
							? cause.message
							: "Could not load fee settings.",
					);
			} finally {
				if (!controller.signal.aborted) setLoading(false);
			}
		})();
		return () => controller.abort();
	}, [url, revision]);

	const selected = FEE_CATEGORIES.find((item) => item.key === category)!;
	const editedMarkup =
		editing && markups ? markupFor(markups, editing) : undefined;

	return (
		<section className="nb-fees" aria-labelledby="markup-fees-heading">
			<h2 id="markup-fees-heading">Markup fees</h2>
			<p className="nb-fees__muted">
				Set default fees to monetize your neobank
			</p>
			{!loading && error ? (
				<div role="alert" className="nb-fees__notice">
					<p>{error}</p>
					<Button
						className="nb-button nb-button--secondary"
						variant="soft"
						onClick={() => setRevision((value) => value + 1)}
					>
						Try again
					</Button>
				</div>
			) : !loading && !markups ? (
				<p className="nb-fees__muted">
					Default markup fees are not available for this account.
				</p>
			) : (
				<Tabs.Root
					value={category}
					onValueChange={(value) => {
						setCategory(value as FeeCategory);
						setSaved(null);
					}}
				>
					<Tabs.List className="nb-fees__tabs">
						{FEE_CATEGORIES.map((item) => (
							<Tabs.Trigger key={item.key} value={item.key}>
								{item.label}
							</Tabs.Trigger>
						))}
					</Tabs.List>
					<Tabs.Content value={category} className="nb-fees__content">
						<p className="nb-fees__muted">{selected.description}</p>
						{loading ? (
							<span role="status" className="nb-fees__loading-label">
								Loading fee settings…
							</span>
						) : null}
						{FEE_OPTIONS.filter((option) => option.category === category).map(
							(option) => {
								if (loading)
									return (
										<div
											className="nb-fees__card"
											key={option.key}
											aria-hidden="true"
										>
											<div className="nb-fees__card-info nb-fees__skeleton-info">
												<span className="nb-skeleton nb-fees__skeleton-title" />
												<span className="nb-skeleton nb-fees__skeleton-description" />
											</div>
											<div className="nb-fees__card-actions">
												<span className="nb-skeleton nb-fees__skeleton-rate" />
												<span className="nb-skeleton nb-fees__skeleton-edit" />
											</div>
										</div>
									);
								const markup = markups ? markupFor(markups, option) : undefined;
								if (!markup) return null;
								return (
									<div className="nb-fees__card" key={option.key}>
										<div className="nb-fees__card-info">
											<h3>{option.label}</h3>
											<p className="nb-fees__muted">{option.description}</p>
											{!markup.adjustable ? (
												<p className="nb-fees__muted">
													The neobank API key needs permission to manage
													connected-account fees. Reconnecting with Whop will
													not fix this.
												</p>
											) : null}
										</div>
										<div className="nb-fees__card-actions">
											<p>{formatFee(markup.percentage, markup.fixed)}</p>
											<IconButton
												variant="ghost"
												color="gray"
												aria-label={`Edit ${option.label} fee`}
												disabled={!markup.adjustable}
												onClick={() => {
													setEditing(option);
													setSaved(null);
												}}
											>
												<Pencil16 />
											</IconButton>
										</div>
									</div>
								);
							},
						)}
					</Tabs.Content>
				</Tabs.Root>
			)}
			{saved ? (
				<p role="status" className="nb-fees__muted">
					{saved}
				</p>
			) : null}
			{editing && editedMarkup ? (
				<EditFee
					key={`${editing.category}:${editing.key}`}
					option={editing}
					markup={editedMarkup}
					url={url}
					onClose={() => setEditing(null)}
					onSaved={(next, reset) => {
						setMarkups(next);
						setEditing(null);
						setSaved(reset ? "Default fee restored." : "Markup fee saved.");
						onChanged?.();
					}}
				/>
			) : null}
		</section>
	);
}

function EditFee({
	option,
	markup,
	url,
	onClose,
	onSaved,
}: {
	option: FeeOption;
	markup: FeeMarkup;
	url: string;
	onClose: () => void;
	onSaved: (markups: ChildMarkups, reset: boolean) => void;
}) {
	const [percentage, setPercentage] = useState(String(markup.percentage));
	const [fixed, setFixed] = useState(markup.fixed.amount);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const pending = useRef(false);
	const save = async (reset = false) => {
		if (pending.current) return;
		const value = reset
			? null
			: { percentage: Number(percentage), fixed: Number(fixed) };
		if (
			!reset &&
			(!percentage.trim() || !fixed.trim() || !validMarkup(value, markup))
		) {
			setError("Enter both fees within the permitted limits.");
			return;
		}
		pending.current = true;
		setSaving(true);
		setError(null);
		try {
			const response = await fetch(url, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					category: option.category,
					key: option.key,
					value,
				}),
			});
			const body = (await response.json()) as FeesResponse;
			if (!response.ok || !body.child_markups)
				throw new Error(body.error?.message ?? "Could not save this fee.");
			onSaved(body.child_markups, reset);
		} catch (cause) {
			setError(
				cause instanceof Error
					? cause.message
					: "Could not save. Reload to check the current fee before trying again.",
			);
		} finally {
			pending.current = false;
			setSaving(false);
		}
	};
	return (
		<Dialog.Root
			open
			onOpenChange={(open) => {
				if (!open && !pending.current) onClose();
			}}
		>
			<Dialog.Content size="2" className="nb-fees__dialog">
				<div className="nb-fees__dialog-header">
					<Dialog.Title>Edit {option.label} fee</Dialog.Title>
					<IconButton
						color="gray"
						variant="ghost"
						aria-label="Close fee editor"
						disabled={saving}
						onClick={onClose}
					>
						<XMark16 />
					</IconButton>
				</div>
				<Dialog.Description>
					{option.description}. This default applies to connected accounts
					without an override.
				</Dialog.Description>
				<form
					className="nb-fees__form"
					onSubmit={(event) => {
						event.preventDefault();
						void save();
					}}
				>
					<label htmlFor="fee-percentage">
						Percentage fee
						<TextField.Root>
							<TextField.Input
								id="fee-percentage"
								type="number"
								min="0"
								max={markup.maximum.percentage ?? undefined}
								step="any"
								required
								value={percentage}
								disabled={saving}
								onChange={(event) => setPercentage(event.target.value)}
							/>
							<TextField.Slot>%</TextField.Slot>
						</TextField.Root>
						<span className="nb-fees__muted">
							Up to {markup.maximum.percentage}% of each transaction
						</span>
					</label>
					<label htmlFor="fee-fixed">
						Fixed fee (USD)
						<TextField.Root>
							<TextField.Slot>$</TextField.Slot>
							<TextField.Input
								id="fee-fixed"
								type="number"
								min="0"
								max={markup.maximum.fixed?.amount}
								step="0.01"
								required
								value={fixed}
								disabled={saving}
								onChange={(event) => setFixed(event.target.value)}
							/>
						</TextField.Root>
						<span className="nb-fees__muted">
							Up to ${markup.maximum.fixed?.amount} per transaction
						</span>
					</label>
					{markup.source === "custom" ? (
						<p className="nb-fees__muted">
							Reset restores{" "}
							{formatFee(markup.default.percentage, markup.default.fixed)}.
						</p>
					) : null}
					{error ? (
						<p role="alert" className="nb-fees__error">
							{error}
						</p>
					) : null}
					<div className="nb-fees__footer">
						{markup.source === "custom" ? (
							<Button
								className="nb-button nb-button--secondary"
								type="button"
								variant="soft"
								color="gray"
								disabled={saving}
								onClick={() => void save(true)}
							>
								Reset fee
							</Button>
						) : null}
						<div>
							<Button
								className="nb-button nb-button--secondary"
								type="button"
								color="gray"
								variant="soft"
								disabled={saving}
								onClick={onClose}
							>
								Cancel
							</Button>
							<Button className="nb-button nb-button--primary" type="submit" disabled={saving}>
								{saving ? "Saving…" : "Save"}
							</Button>
						</div>
					</div>
				</form>
			</Dialog.Content>
		</Dialog.Root>
	);
}
