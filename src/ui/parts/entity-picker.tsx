import { useCallback, useEffect, useRef, useState } from "react";

import type { Entity } from "../../routes/api.entities";

export function useEntities(): {
	entities: Entity[];
	viewerName: string | null;
	error: string | undefined;
	isLoading: boolean;
	needsReauth: boolean;
	signedOut: boolean;
	create: (name?: string, email?: string) => Promise<Entity | null>;
	creating: boolean;
} {
	const [entities, setEntities] = useState<Entity[]>([]);
	const [viewerName, setViewerName] = useState<string | null>(null);
	const [error, setError] = useState<string | undefined>(undefined);
	const [isLoading, setIsLoading] = useState(true);
	const [signedOut, setSignedOut] = useState(false);
	const [creating, setCreating] = useState(false);
	const [needsReauth, setNeedsReauth] = useState(false);
	const createInFlight = useRef(false);

	useEffect(() => {
		let cancelled = false;
		void (async () => {
			try {
				const response = await fetch("/api/entities");
				const body = (await response.json()) as {
					entities?: Entity[];
					viewerName?: string | null;
					error?: { message?: string };
					signedIn?: boolean;
				};
				if (cancelled) return;
				if (!response.ok) {
					setError(body.error?.message ?? "Could not list your entities.");
					setSignedOut(body.signedIn === false || response.status === 401);
					return;
				}
				setEntities(body.entities ?? []);
				setViewerName(body.viewerName ?? null);
				// A partial list comes back 200 with the reason the rest is missing, so the
				// error is surfaced alongside whatever did load.
				if (body.error?.message) setError(body.error.message);
			} catch (cause) {
				if (!cancelled)
					setError(cause instanceof Error ? cause.message : "Request failed.");
			} finally {
				if (!cancelled) setIsLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	const create = useCallback(async (name?: string, email?: string): Promise<Entity | null> => {
		if (createInFlight.current) return null;
		createInFlight.current = true;
		setCreating(true);
		setError(undefined);
		setNeedsReauth(false);
		try {
			const response = await fetch("/api/entities", {
				body: JSON.stringify(email ? { email, name } : { name }),
				headers: { "Content-Type": "application/json" },
				method: "POST",
			});
			const body = (await response.json()) as {
				entity?: Entity;
				error?: { message?: string };
				needsReauth?: boolean;
			};
			if (!response.ok || !body.entity) {
				setError(body.error?.message ?? "Could not create the entity.");
				setNeedsReauth(body.needsReauth === true);
				setSignedOut(response.status === 401);
				return null;
			}
			setEntities((previous) => [...previous, body.entity as Entity]);
			return body.entity;
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : "Request failed.");
			return null;
		} finally {
			createInFlight.current = false;
			setCreating(false);
		}
	}, []);

	return { create, creating, entities, viewerName, error, isLoading, needsReauth, signedOut };
}

function Avatar({ entity }: { entity: Entity }) {
	if (entity.imageUrl)
		return <img alt="" className="nb-entity__avatar" src={entity.imageUrl} />;
	return (
		<span aria-hidden className="nb-entity__avatar nb-entity__avatar--blank">
			{entity.name.slice(0, 1).toUpperCase()}
		</span>
	);
}

export function EntityPicker({
	entities,
	onSelect,
	selectedId,
}: {
	entities: Entity[];
	onSelect: (id: string) => void;
	selectedId: string;
}) {
	const [open, setOpen] = useState(false);
	const root = useRef<HTMLDivElement>(null);
	const canSwitch = entities.length > 1;

	// A dropdown that only closes on re-click traps people who click elsewhere and then cannot
	// reach the page behind it.
	useEffect(() => {
		if (!open) return;
		function onPointer(event: MouseEvent) {
			if (!root.current?.contains(event.target as Node)) setOpen(false);
		}
		function onKey(event: KeyboardEvent) {
			if (event.key === "Escape") setOpen(false);
		}
		document.addEventListener("mousedown", onPointer);
		document.addEventListener("keydown", onKey);
		return () => {
			document.removeEventListener("mousedown", onPointer);
			document.removeEventListener("keydown", onKey);
		};
	}, [open]);

	const selected = entities.find((entity) => entity.id === selectedId);

	if (!canSwitch)
		return (
			<div className="nb-entity">
				<div className="nb-entity__trigger nb-entity__trigger--static">
					{selected ? <Avatar entity={selected} /> : null}
					<span className="nb-entity__name" title={selected?.name}>{selected?.name ?? "Select entity"}</span>
				</div>
			</div>
		);

	return (
		<div className="nb-entity" ref={root}>
			<button
				aria-expanded={open}
				aria-haspopup="listbox"
				className="nb-entity__trigger"
				onClick={() => setOpen((previous) => !previous)}
				type="button"
			>
				{selected ? <Avatar entity={selected} /> : null}
				<span className="nb-entity__name" title={selected?.name}>{selected?.name ?? "Select entity"}</span>
				<svg aria-hidden fill="none" height="14" viewBox="0 0 14 14" width="14">
					<path
						d="M3.5 5.5 7 9l3.5-3.5"
						stroke="currentColor"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="1.5"
					/>
				</svg>
			</button>

			{open ? (
				<ul className="nb-entity__menu" role="listbox">
					{entities.map((entity) => (
						<li key={entity.id} role="none">
							<button
								aria-selected={entity.id === selectedId}
								className="nb-entity__option"
								onClick={() => {
									onSelect(entity.id);
									setOpen(false);
								}}
								role="option"
								type="button"
							>
								<Avatar entity={entity} />
								<span className="nb-entity__name" title={entity.name}>{entity.name}</span>
								{entity.kind === "overview" ? (
									<span className="nb-entity__tag">Overview</span>
								) : null}
							</button>
						</li>
					))}
				</ul>
			) : null}
		</div>
	);
}
