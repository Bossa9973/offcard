import { useEffect, useRef, useState } from "react";

export function NewEntityModal({
	creating,
	error,
	inviting = false,
	needsReauth,
	onClose,
	onCreate,
}: {
	creating: boolean;
	error: string | undefined;
	inviting?: boolean;
	needsReauth: boolean;
	onClose: () => void;
	onCreate: (name: string, email?: string) => Promise<unknown>;
}) {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const input = useRef<HTMLInputElement>(null);
	const returnTo = useRef<Element | null>(null);

	useEffect(() => {
		// Remember what opened the dialog so focus goes back there on close, rather than to the
		// top of the document.
		returnTo.current = document.activeElement;
		input.current?.focus();

		const { overflow } = document.body.style;
		document.body.style.overflow = "hidden";

		function onKey(event: KeyboardEvent) {
			if (event.key === "Escape") onClose();
		}
		document.addEventListener("keydown", onKey);

		return () => {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = overflow;
			(returnTo.current as HTMLElement | null)?.focus?.();
		};
	}, [onClose]);

	return (
		<div className="nb-modal" role="presentation" onClick={onClose}>
			<div
				aria-labelledby="nb-modal-title"
				aria-modal="true"
				className="nb-modal__card"
				onClick={(event) => event.stopPropagation()}
				role="dialog"
			>
				<div aria-hidden className="nb-modal__glow" />

				<h2 className="nb-modal__title" id="nb-modal-title">
					{inviting ? "Invite consumer" : "New entity"}
				</h2>
				<p className="nb-modal__sub">
					{inviting
						? "They get their own account inside the neobank — its own balance, cards and activity — owned by the email you enter, and referred by you."
						: "An entity is its own account inside the neobank — with its own balance, cards and activity. You stay in control of every one you create."}
				</p>

				<form
					className="nb-modal__form"
					onSubmit={async (event) => {
						event.preventDefault();
						if (!name.trim()) return;
						if (inviting && !email.trim()) return;
						const created = await onCreate(name.trim(), inviting ? email.trim() : undefined);
						if (created) onClose();
					}}
				>
					<label className="nb-modal__label" htmlFor="nb-entity-name">
						Name
					</label>
					<input
						autoComplete="off"
						className="nb-modal__input"
						disabled={creating}
						id="nb-entity-name"
						onChange={(event) => setName(event.target.value)}
						placeholder="Acme Holdings"
						ref={input}
						value={name}
					/>

					{inviting ? (
						<>
							<label className="nb-modal__label" htmlFor="nb-entity-email">
								Owner email
							</label>
							<input
								autoComplete="off"
								className="nb-modal__input"
								disabled={creating}
								id="nb-entity-email"
								onChange={(event) => setEmail(event.target.value)}
								placeholder="owner@example.com"
								type="email"
								value={email}
							/>
						</>
					) : null}

					{error ? (
						<p className="nb-modal__error">
							{error}
							{/* A missing permission is only fixable by re-consenting, so the way out
							    belongs next to the message rather than in a support article. */}
							{needsReauth ? (
								<>
									{" "}
									<a className="nb-modal__relink" href="/api/auth/login">
										Grant access
									</a>
								</>
							) : null}
						</p>
					) : null}

					<div className="nb-modal__actions">
						<button
							className="nb-modal__ghost"
							disabled={creating}
							onClick={onClose}
							type="button"
						>
							Cancel
						</button>
						<button
							className="nb-modal__primary"
							disabled={creating || !name.trim()}
							type="submit"
						>
							{creating ? "Creating…" : "Create entity"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
