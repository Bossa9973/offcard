import { AutoTextarea } from "./ui";
import { Checkmark16, Link16, Plus16 } from "@frosted-ui/icons";
import { Button, Dialog, IconButton } from "frosted-ui";
import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";

import {
	BILLING_OPTIONS,
	CHECKOUT_CURRENCIES,
	checkoutPayload,
	hostedCheckoutUrl,
} from "../../lib/checkout";
import { loginHref } from "../../lib/login";

const EMPTY_DRAFT = {
	title: "",
	description: "",
	amount: "",
	currency: "usd",
	billing: "one_time",
	redirectUrl: "",
};
type Draft = typeof EMPTY_DRAFT;
type Attempt = { body: string; key: string };

export function CreateInvoiceButton({ accountId, onCreated, open, onOpenChange }: {
	accountId: string;
	onCreated?: () => void;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
	const [creating, setCreating] = useState(false);
	const [error, setError] = useState("");
	const [needsReauth, setNeedsReauth] = useState(false);
	const [purchaseUrl, setPurchaseUrl] = useState("");
	const [copied, setCopied] = useState(false);
	const attempt = useRef<Attempt | null>(null);
	const pending = useRef(false);
	const linkInput = useRef<HTMLInputElement>(null);
	const linkId = useId();
	const storageKey = `neobank-invoice-${accountId}`;

	useEffect(() => {
		try {
			const saved = JSON.parse(sessionStorage.getItem(storageKey) ?? "null");
			if (!saved) return;
			checkoutPayload({ ...saved.draft, accountId });
			setDraft(saved.draft);
			if (
				typeof saved.attempt?.body === "string" &&
				typeof saved.attempt?.key === "string"
			)
				attempt.current = saved.attempt;
			setPurchaseUrl(hostedCheckoutUrl(saved.purchaseUrl) ?? "");
		} catch {
			/* Storage can be unavailable or an old draft may be invalid. */
		}
	}, [accountId, storageKey]);

	function save(url = "") {
		try {
			sessionStorage.setItem(
				storageKey,
				JSON.stringify({ draft, attempt: attempt.current, purchaseUrl: url }),
			);
		} catch {
			/* Creating a link also works when browser storage is unavailable. */
		}
	}

	function update(field: keyof Draft, value: string) {
		setDraft((current) => ({ ...current, [field]: value }));
		setError("");
	}

	async function submit(event: FormEvent) {
		event.preventDefault();
		if (pending.current) return;
		setError("");
		setNeedsReauth(false);
		const body = JSON.stringify({ ...draft, accountId });
		try {
			checkoutPayload(JSON.parse(body));
		} catch (failure) {
			setError(
				failure instanceof Error
					? failure.message
					: "Check your payment link details.",
			);
			return;
		}
		if (attempt.current?.body !== body)
			attempt.current = { body, key: crypto.randomUUID() };
		save();
		pending.current = true;
		setCreating(true);
		try {
			const response = await fetch("/api/checkout", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Idempotency-Key": attempt.current.key,
				},
				body,
				signal: AbortSignal.timeout(25_000),
			});
			const result = await response.json().catch(() => null);
			if (!response.ok) {
				setNeedsReauth(result?.needsReauth === true || response.status === 401);
				// A definitive validation/authorization failure can use a new key after correction.
				// Keep the key for timeouts and conflicts, where creation may have succeeded.
				if ([400, 401, 403, 422].includes(response.status)) {
					attempt.current = null;
					save();
				}
				throw new Error(
					result?.error?.message ??
						"Unable to create a checkout link. Try again.",
				);
			}
			const url = hostedCheckoutUrl(result?.purchaseUrl);
			if (!url)
				throw new Error(
					"No hosted link was returned. Try again to recover this request.",
				);
			setPurchaseUrl(url);
			save(url);
			onCreated?.();
		} catch (failure) {
			setError(
				failure instanceof Error && failure.name !== "TimeoutError"
					? failure.message
					: "The request timed out. Try again to recover your link.",
			);
		} finally {
			pending.current = false;
			setCreating(false);
		}
	}

	async function copyLink() {
		try {
			await navigator.clipboard.writeText(purchaseUrl);
			setCopied(true);
			setError("");
		} catch {
			linkInput.current?.select();
			setError("Select and copy the link above.");
		}
	}

	function reset() {
		setDraft(EMPTY_DRAFT);
		setPurchaseUrl("");
		setCopied(false);
		setError("");
		setNeedsReauth(false);
		attempt.current = null;
		try {
			sessionStorage.removeItem(storageKey);
		} catch {
			/* Optional storage. */
		}
	}

	const amount = Number(draft.amount);
	const amountLabel =
		Number.isFinite(amount) && amount > 0
			? new Intl.NumberFormat("en-US", {
					style: "currency",
					currency: draft.currency,
				}).format(amount)
			: "—";
	const frequency = BILLING_OPTIONS.find(
		(option) => option.value === draft.billing,
	);

	return (
		<Dialog.Root
			open={open}
			onOpenChange={(value) => {
				if (pending.current) return;
				if (value && purchaseUrl) reset();
				onOpenChange(value);
			}}
		>
			<Dialog.Trigger>
				<button type="button" className="nb-button nb-button--primary nb-primary-button" disabled={!accountId.startsWith("biz_")}>
					<Plus16 aria-hidden /> Create payment link
				</button>
			</Dialog.Trigger>
			<Dialog.Content size="3" className="nb-invoice-dialog">
				<Dialog.Title>
					{purchaseUrl ? "Your payment link is ready" : "Create payment link"}
				</Dialog.Title>
				<Dialog.Description>
					{purchaseUrl
						? "Share this link with your customer to get paid on Whop."
						: "Create a hosted checkout link for your product or service."}
				</Dialog.Description>
				{purchaseUrl ? (
					<div className="nb-invoice-form">
						<div className="nb-invoice-summary">
							<strong>{draft.title}</strong>
							<span>
								{amountLabel} · {frequency?.label}
							</span>
						</div>
						<div className="nb-invoice-field">
							<label htmlFor={linkId}>Checkout link</label>
							<div className="nb-invoice-link">
								<input
									id={linkId}
									ref={linkInput}
									readOnly
									value={purchaseUrl}
									onFocus={(event) => event.target.select()}
								/>
								<IconButton
									aria-label={copied ? "Link copied" : "Copy checkout link"}
									title={copied ? "Copied!" : "Copy link"}
									color="gray"
									variant="ghost"
									onClick={copyLink}
								>
									{copied ? (
										<Checkmark16 aria-hidden />
									) : (
										<Link16 aria-hidden />
									)}
								</IconButton>
							</div>
						</div>
						{error ? (
							<p className="nb-invoice-error" role="alert">
								{error}
							</p>
						) : null}
						<span className="sr-only" role="status">
							{copied ? "Checkout link copied" : ""}
						</span>
						<div className="nb-invoice-footer">
							<Button
								className="nb-button nb-button--primary"
								nativeButton={false}
								render={
									<a
										href={purchaseUrl}
										target="_blank"
										rel="noopener noreferrer"
									/>
								}
								variant="soft"
							>
								Open checkout ↗
							</Button>
							<Dialog.Close>
								<Button className="nb-button nb-button--secondary" variant="soft" onClick={reset}>
									Done
								</Button>
							</Dialog.Close>
						</div>
					</div>
				) : (
					<form className="nb-invoice-form" onSubmit={submit}>
						<fieldset disabled={creating}>
							<label className="nb-invoice-field">
								What are you selling?
								<input
									autoFocus
									required
									maxLength={30}
									placeholder="e.g. Website design"
									value={draft.title}
									onChange={(event) => update("title", event.target.value)}
								/>
								<small>Shown to your customer · up to 30 characters</small>
							</label>
							<label className="nb-invoice-field">
								Description{" "}
								<span className="nb-invoice-optional">Optional</span>
								<AutoTextarea
									rows={3}
									maxLength={1000}
									placeholder="Describe what’s included"
									value={draft.description}
									onChange={(event) =>
										update("description", event.target.value)
									}
								/>
							</label>
							<div className="nb-invoice-columns">
								<label className="nb-invoice-field">
									Amount
									<input
										required
										inputMode="decimal"
										placeholder="0.00"
										value={draft.amount}
										onChange={(event) => update("amount", event.target.value)}
									/>
								</label>
								<label className="nb-invoice-field">
									Currency
									<select
										value={draft.currency}
										onChange={(event) => update("currency", event.target.value)}
									>
										{CHECKOUT_CURRENCIES.map((currency) => (
											<option key={currency} value={currency}>
												{currency.toUpperCase()}
											</option>
										))}
									</select>
								</label>
							</div>
							<label className="nb-invoice-field">
								Billing
								<select
									value={draft.billing}
									onChange={(event) => update("billing", event.target.value)}
								>
									{BILLING_OPTIONS.map((option) => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</select>
							</label>
							<details className="nb-invoice-options">
								<summary>After payment</summary>
								<label className="nb-invoice-field">
									Redirect URL{" "}
									<span className="nb-invoice-optional">Optional</span>
									<input
										type="url"
										maxLength={2048}
										placeholder="https://your-site.com/thank-you"
										value={draft.redirectUrl}
										onChange={(event) =>
											update("redirectUrl", event.target.value)
										}
									/>
									<small>Send customers here after checkout.</small>
								</label>
							</details>
						</fieldset>
						<div className="nb-invoice-summary">
							<span>
								{frequency?.days
									? `Due today, then every ${frequency.days} days`
									: "One-time payment"}
							</span>
							<strong>{amountLabel}</strong>
						</div>
						{error ? (
							<div className="nb-invoice-error" role="alert">
								<p>{error}</p>
								{needsReauth ? (
									<a
										href={loginHref(
											accountId,
											`/account/${accountId}/invoicing`,
										)}
									>
										Reconnect with Whop
									</a>
								) : null}
							</div>
						) : null}
						<div className="nb-invoice-footer">
							<Dialog.Close>
								<Button className="nb-button nb-button--secondary" type="button" variant="soft" disabled={creating}>
									Cancel
								</Button>
							</Dialog.Close>
							<Button
								className="nb-button nb-button--primary"
								color="gray"
								variant="solid"
								type="submit"
								disabled={creating}
								aria-busy={creating}
							>
								{creating ? "Creating link…" : "Create payment link"}
							</Button>
						</div>
					</form>
				)}
			</Dialog.Content>
		</Dialog.Root>
	);
}
