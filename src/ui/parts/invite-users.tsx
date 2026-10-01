import { EnvelopeOpenPictogram, Link16 } from "@frosted-ui/icons";
import { Dialog } from "frosted-ui";
import { useCopyInviteLink } from "../use-copy-invite-link";
import { NavIcon } from "./nav-icons";
import { Button } from "./ui";

export function InviteUsers() {
	const { copyInviteLink, result, closeConfirmation } = useCopyInviteLink();

	return (
		<div className="nb-invite">
			<button className="nb-nav__item" onClick={() => void copyInviteLink()} type="button">
				<NavIcon name="invite" />
				<span>Invite users</span>
			</button>
			<InviteConfirmation result={result} onClose={closeConfirmation} />
		</div>
	);
}

export function InviteConfirmation({ result, onClose }: { result: ReturnType<typeof useCopyInviteLink>["result"]; onClose: () => void }) {
	return (
		<Dialog.Root open={result !== null} onOpenChange={(open) => { if (!open) onClose(); }}>
			<Dialog.Content size="2" className="nb-invite-dialog">
				<EnvelopeOpenPictogram className="nb-invite-pictogram" variant="dark" aria-hidden />
				<Dialog.Title className="nb-invite-title">{result?.copied === false ? "Copy your invite link" : "Link copied!"}</Dialog.Title>
				<Dialog.Description className="nb-invite-description">
					{result?.copied === false
						? "Your browser blocked automatic copying. Select the link below to share it."
						: "Send your neobank to your friends and they can start depositing."}
				</Dialog.Description>
				{result?.copied === false ? (
					<input aria-label="Invite link" className="nb-invite-link nb-invite-link--field" readOnly value={result.link} autoFocus onFocus={(event) => event.target.select()} />
				) : (
					<div className="nb-invite-link"><Link16 aria-hidden /><span>{result?.link}</span></div>
				)}
				<Dialog.Close>
					<Button variant="primary" className="nb-invite-done">Got it</Button>
				</Dialog.Close>
			</Dialog.Content>
		</Dialog.Root>
	);
}
