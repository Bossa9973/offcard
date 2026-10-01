import { useState } from "react";

export type InviteCopy = { link: string; copied: boolean };

/** Copies the public entry point, never the current account or its route. */
export function useCopyInviteLink() {
	const [result, setResult] = useState<InviteCopy | null>(null);

	async function copyInviteLink() {
		const link = new URL("/", window.location.origin).href;
		try {
			await navigator.clipboard.writeText(link);
			setResult({ link, copied: true });
			return true;
		} catch {
			// The confirmation still opens and shows the link to copy by hand.
			setResult({ link, copied: false });
			return false;
		}
	}

	return { copyInviteLink, result, closeConfirmation: () => setResult(null) };
}
