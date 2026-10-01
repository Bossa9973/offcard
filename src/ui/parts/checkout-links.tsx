import { useScreenRefresh } from "./screen-lifecycle";
import { Link16 } from "@frosted-ui/icons";
import { Button, EmptyState, Skeleton } from "frosted-ui";
import { useEffect, useState } from "react";
import type { CheckoutLink } from "../../lib/checkout-links";
import { loginHref } from "../../lib/login";

export function CheckoutLinks({ accountId }: { accountId: string }) {
	const [links, setLinks] = useState<CheckoutLink[]>([]);
	const [cursor, setCursor] = useState<string | null>(null);
	const [nextCursor, setNextCursor] = useState<string | null>(null);
	const [attempt, setAttempt] = useState(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [needsReauth, setNeedsReauth] = useState(false);
	const [copied, setCopied] = useState("");
	const [copyError, setCopyError] = useState("");

	useEffect(() => {
		const controller = new AbortController();
		setLoading(true);
		setError("");
		setNeedsReauth(false);
		const params = new URLSearchParams({ account_id: accountId });
		if (cursor) params.set("after", cursor);
		void (async () => {
			try {
				const response = await fetch(`/api/checkout?${params}`, { signal: controller.signal });
				const data = await response.json();
				if (controller.signal.aborted) return;
				if (!response.ok) {
					setNeedsReauth(response.status === 401 || Boolean(data.needsReauth));
					throw new Error(data.error?.message ?? "Could not load checkout links.");
				}
				setLinks((previous) => cursor
					? [...previous, ...data.links.filter((link: CheckoutLink) => !previous.some((item) => item.id === link.id))]
					: data.links);
				setNextCursor(data.nextCursor);
			} catch (failure) {
				if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : "Could not load checkout links.");
			} finally {
				if (!controller.signal.aborted) setLoading(false);
			}
		})();
		return () => controller.abort();
	}, [accountId, cursor, attempt]);

	useScreenRefresh(() => setAttempt((value) => value + 1));

	async function copy(link: CheckoutLink) {
		setCopyError("");
		try {
			await navigator.clipboard.writeText(link.url);
			setCopied(link.id);
		} catch {
			setCopyError("Could not copy the link. You can open it and copy the address instead.");
		}
	}

	return (
		<section className="nb-checkout-links" aria-label="Payment links" aria-busy={loading}>
			{loading || links.length > 0 ? <div className="nb-data-table-scroll nb-checkout-links-scroll">
				<table className="nb-data-table">
					<thead><tr><th scope="col">Link</th><th scope="col">Amount</th><th scope="col">Created</th><th scope="col"><span className="nb-checkout-links-sr">Actions</span></th></tr></thead>
					<tbody>
						{links.map((link) => <tr key={link.id}>
							<td><a href={link.url} title={link.url} target="_blank" rel="noopener noreferrer">{link.title || "Payment link"}</a><small title={link.url}>{new URL(link.url).host} · {link.id.slice(-8)}</small></td>
							<td>{link.amount !== null && link.currency ? new Intl.NumberFormat(undefined, { style: "currency", currency: link.currency }).format(link.amount) : "—"}
								{link.billingDays ? <small>Every {link.billingDays} days</small> : null}</td>
							<td>{new Date(link.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</td>
							<td><div className="nb-checkout-links-actions"><button type="button" className="nb-button nb-button--secondary nb-secondary-action" onClick={() => void copy(link)} aria-label={`Copy checkout link ${link.id}`}>{copied === link.id ? "Copied" : "Copy"}</button>
								<a className="nb-button nb-button--secondary nb-secondary-action" href={link.url} target="_blank" rel="noopener noreferrer" aria-label={`Open checkout link ${link.id}`}>Open ↗</a></div></td>
						</tr>)}
						{loading ? Array.from({ length: links.length ? 2 : 3 }, (_, index) => <tr key={`loading-${index}`} aria-hidden="true">
							{[0, 1, 2, 3].map((column) => <td key={column}><Skeleton.Rect style={{ height: 20, width: column === 0 ? 240 : 100 }} /></td>)}
						</tr>) : null}
					</tbody>
				</table>
			</div> : null}
			{loading ? <p role="status">Loading checkout links…</p> : null}
			{!loading && !error && links.length === 0 ? (
				<div className="nb-checkout-links-empty">
					<EmptyState.Root>
						<EmptyState.Header>
							<EmptyState.Media variant="soft"><Link16 aria-hidden width={28} height={28} /></EmptyState.Media>
							<EmptyState.Title>No payment links yet</EmptyState.Title>
							<EmptyState.Description>Create a payment link to share with your customer.</EmptyState.Description>
						</EmptyState.Header>
					</EmptyState.Root>
				</div>
			) : null}
			{error ? <div role="alert"><p>{error}</p>{needsReauth
				? <Button className="nb-button nb-button--secondary" variant="soft" nativeButton={false} render={<a href={loginHref(accountId, `/account/${accountId}/invoicing`)} />}>Connect checkout links</Button>
				: <Button className="nb-button nb-button--secondary" variant="soft" onClick={() => setAttempt((value) => value + 1)}>Retry</Button>}</div> : null}
			{copyError ? <p role="alert">{copyError}</p> : null}
			{nextCursor && !error ? <Button className="nb-button nb-button--secondary" variant="soft" disabled={loading} onClick={() => setCursor(nextCursor)}>Load more</Button> : null}
		</section>
	);
}
