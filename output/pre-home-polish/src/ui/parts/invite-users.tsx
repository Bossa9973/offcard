import { useEffect, useRef, useState } from "react";

export function InviteUsers() {
	const [copied, setCopied] = useState(false);
	const [manualLink, setManualLink] = useState("");
	const reset = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	const fallback = useRef<HTMLInputElement>(null);

	useEffect(() => () => clearTimeout(reset.current), []);
	useEffect(() => {
		if (manualLink) {
			fallback.current?.focus();
			fallback.current?.select();
		}
	}, [manualLink]);

	async function copyLink() {
		// Share the public entry point, never the current account or its route.
		const link = window.location.origin;
		clearTimeout(reset.current);
		setCopied(false);
		try {
			await navigator.clipboard.writeText(link);
			setManualLink("");
			setCopied(true);
			reset.current = setTimeout(() => setCopied(false), 2500);
		} catch {
			setManualLink(link);
		}
	}

	return (
		<div className="nb-invite">
			<button className="nb-nav__item" onClick={copyLink} type="button">
				<span aria-live="polite">{copied ? "Link copied" : "Invite users"}</span>
			</button>
			{manualLink ? (
				<div className="nb-invite__fallback">
					<p role="status">Couldn’t copy automatically. Copy this link to invite users:</p>
					<input aria-label="Invite link" onFocus={(event) => event.target.select()} readOnly ref={fallback} value={manualLink} />
				</div>
			) : null}
		</div>
	);
}
