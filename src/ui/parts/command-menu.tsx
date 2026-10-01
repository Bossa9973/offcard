import { Dialog, TextField } from "frosted-ui";
import { useEffect, useRef, useState } from "react";

export interface CommandAction {
	description: string;
	keywords: string;
	label: string;
	onSelect: () => void;
}

export function CommandMenu({
	actions,
	onOpenChange,
	open,
}: {
	actions: CommandAction[];
	onOpenChange: (open: boolean) => void;
	open: boolean;
}) {
	const [query, setQuery] = useState("");
	const input = useRef<HTMLInputElement>(null);

	useEffect(() => {
		function onKeyDown(event: KeyboardEvent) {
			if (event.key.toLowerCase() !== "k" || (!event.metaKey && !event.ctrlKey)) return;
			event.preventDefault();
			onOpenChange(!open);
		}
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [onOpenChange, open]);

	useEffect(() => {
		if (!open) {
			setQuery("");
			return;
		}
		requestAnimationFrame(() => input.current?.focus());
	}, [open]);

	const normalizedQuery = query.trim().toLowerCase();
	const visibleActions = actions.filter((action) =>
		`${action.label} ${action.description} ${action.keywords}`
			.toLowerCase()
			.includes(normalizedQuery),
	);

	function select(action: CommandAction) {
		onOpenChange(false);
		action.onSelect();
	}

	return (
		<Dialog.Root onOpenChange={onOpenChange} open={open}>
			<Dialog.Content className="nb-command" size="2">
				<Dialog.Title className="nb-command__title">Quick actions</Dialog.Title>
				<TextField.Root className="nb-command__search" size="3" variant="surface">
					<TextField.Slot>
						<svg aria-hidden fill="none" height="18" viewBox="0 0 16 16" width="18">
							<circle cx="7" cy="7" r="4.5" stroke="currentColor" />
							<path d="m10.5 10.5 3 3" stroke="currentColor" strokeLinecap="round" />
						</svg>
					</TextField.Slot>
					<TextField.Input
						aria-label="Search actions"
						onChange={(event) => setQuery(event.target.value)}
						placeholder="Search actions"
						ref={input}
						value={query}
					/>
					<TextField.Slot>
						<kbd>Esc</kbd>
					</TextField.Slot>
				</TextField.Root>

				<div className="nb-command__list">
					{visibleActions.map((action) => (
						<button
							className="nb-command__action"
							key={action.label}
							onClick={() => select(action)}
							type="button"
						>
							<span>
								<strong>{action.label}</strong>
								<small>{action.description}</small>
							</span>
							<span aria-hidden className="nb-command__arrow">→</span>
						</button>
					))}
					{visibleActions.length === 0 ? (
						<p className="nb-command__empty">No matching actions</p>
					) : null}
				</div>
			</Dialog.Content>
		</Dialog.Root>
	);
}
