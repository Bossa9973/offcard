import { Checkmark12, ChevronDown20, CreditCardPictogram } from "@frosted-ui/icons";
import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { CardTeamMember } from "../../routes/api.cards.create";

type SpendLimitFrequency =
	| "daily"
	| "monthly"
	| "one_time"
	| "per_authorization"
	| "weekly";

type CreateResult =
	| { kind: "application" }
	| { cardId: string | null; kind: "created" }
	| { kind: "invitation" }
	| { kind: "provisioning" };

function memberLabel(member: CardTeamMember | undefined): string {
	return member?.name ?? member?.username ?? "Select team member";
}

function MemberAvatar({ member }: { member: CardTeamMember | undefined }) {
	const label = memberLabel(member);
	if (member?.imageUrl)
		return <img alt="" className="nb-card-create__avatar" src={member.imageUrl} />;
	return (
		<span aria-hidden className="nb-card-create__avatar nb-card-create__avatar--blank">
			{label.slice(0, 1).toUpperCase()}
		</span>
	);
}

function TeamMemberPicker({
	error,
	isLoading,
	members,
	onSelect,
	selected,
}: {
	error: string | undefined;
	isLoading: boolean;
	members: CardTeamMember[];
	onSelect: (member: CardTeamMember) => void;
	selected: CardTeamMember | undefined;
}) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const root = useRef<HTMLDivElement>(null);
	const filtered = useMemo(() => {
		const query = search.trim().toLowerCase();
		if (!query) return members;
		return members.filter((member) =>
			[member.name, member.username].some((value) => value?.toLowerCase().includes(query)),
		);
	}, [members, search]);

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

	return (
		<div className="nb-card-create__field">
			<span>Issue card to</span>
			<div className="nb-card-create__member-picker" ref={root}>
				<button
					aria-expanded={open}
					aria-haspopup="listbox"
					aria-label="Issue card to"
					className="nb-card-create__member-trigger"
					disabled={isLoading || Boolean(error)}
					onClick={() => setOpen((value) => !value)}
					type="button"
				>
					<MemberAvatar member={selected} />
					<span className="nb-card-create__member-copy">
						<strong>{isLoading ? "Loading team members…" : memberLabel(selected)}</strong>
						{selected ? <small>@{selected.username}</small> : null}
					</span>
					<ChevronDown20 aria-hidden />
				</button>

				{open ? (
					<div className="nb-card-create__member-menu">
						<input
							autoFocus
							aria-label="Search team members"
							onChange={(event) => setSearch(event.target.value)}
							placeholder="Issue card to…"
							value={search}
						/>
						<div className="nb-card-create__member-list" role="listbox">
							{filtered.length === 0 ? (
								<p>No team members found</p>
							) : (
								filtered.map((member) => (
									<button
										aria-selected={member.id === selected?.id}
										key={member.id}
										onClick={() => {
											onSelect(member);
											setOpen(false);
											setSearch("");
										}}
										role="option"
										type="button"
									>
										<MemberAvatar member={member} />
										<span className="nb-card-create__member-copy">
											<strong>{memberLabel(member)}</strong>
											<small>@{member.username}</small>
										</span>
										{member.id === selected?.id ? <Checkmark12 aria-hidden /> : null}
									</button>
								))
							)}
						</div>
					</div>
				) : null}
			</div>
			{error ? <small className="nb-card-create__error">{error}</small> : null}
		</div>
	);
}

function ResultScreen({
	cardName,
	onClose,
	result,
}: {
	cardName: string;
	onClose: () => void;
	result: CreateResult;
}) {
	const copy =
		result.kind === "created"
			? { detail: `${cardName} is ready to use.`, title: "You're all set" }
			: result.kind === "invitation"
				? {
						detail: "The team member needs to finish card setup before they can spend.",
						title: "Card invitation sent",
					}
				: result.kind === "application"
					? {
							detail: "You can create cards once the issuing application is approved.",
							title: "Application submitted",
						}
					: {
							detail: "The team member will be notified when their card is ready.",
							title: "Card is being provisioned",
						};

	return (
		<div className="nb-card-create__result">
			<CreditCardPictogram aria-hidden className="nb-card-create__result-pictogram" />
			<h2>{copy.title}</h2>
			<p>{copy.detail}</p>
			<div className="nb-card-create__result-actions">
				<button className="nb-button nb-button--primary nb-card-create__primary" onClick={onClose} type="button">
					{result.kind === "created" ? "View cards" : "Done"}
				</button>
			</div>
		</div>
	);
}

export function CreateCardScreen({
	accountId,
	applicationKind,
	entityName,
	onClose,
}: {
	accountId: string;
	applicationKind: string | null | undefined;
	entityName: string;
	onClose: () => void;
}) {
	const isIndividualCardAccount = applicationKind === "individual";
	const canAssignTeamMember = !isIndividualCardAccount;
	const [cardName, setCardName] = useState("");
	const [members, setMembers] = useState<CardTeamMember[]>([]);
	const [viewerId, setViewerId] = useState<string | null>(null);
	const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
	const [membersLoading, setMembersLoading] = useState(canAssignTeamMember);
	const [membersError, setMembersError] = useState<string | undefined>();
	const [limitEnabled, setLimitEnabled] = useState(false);
	const [limitAmount, setLimitAmount] = useState("");
	const [limitFrequency, setLimitFrequency] = useState<SpendLimitFrequency>("monthly");
	const [submitting, setSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | undefined>();
	const [result, setResult] = useState<CreateResult | null>(null);
	const selectedMember = members.find((member) => member.id === selectedMemberId);

	useEffect(() => {
		if (!canAssignTeamMember) {
			setMembersLoading(false);
			return;
		}
		let cancelled = false;
		void (async () => {
			try {
				const response = await fetch(
					`/api/cards/create?accountId=${encodeURIComponent(accountId)}`,
				);
				const body = (await response.json().catch(() => null)) as
					| {
							error?: { message?: string };
							members?: CardTeamMember[];
							viewerId?: string | null;
					  }
					| null;
				if (cancelled) return;
				if (!response.ok) {
					setMembersError(body?.error?.message ?? "Could not load team members.");
					return;
				}
				const nextMembers = body?.members ?? [];
				setMembers(nextMembers);
				setViewerId(body?.viewerId ?? null);
				const preferred =
					nextMembers.find((member) => member.id === body?.viewerId) ?? nextMembers[0];
				setSelectedMemberId(preferred?.id ?? null);
			} catch (cause) {
				if (!cancelled)
					setMembersError(cause instanceof Error ? cause.message : "Could not load team members.");
			} finally {
				if (!cancelled) setMembersLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [accountId, canAssignTeamMember]);

	const sortedMembers = useMemo(
		() =>
			[...members].sort((a, b) => {
				if (a.id === viewerId) return -1;
				if (b.id === viewerId) return 1;
				return memberLabel(a).localeCompare(memberLabel(b));
			}),
		[members, viewerId],
	);

	async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
		event.preventDefault();
		if (canAssignTeamMember && !selectedMember) {
			setSubmitError("Choose a team member for this card.");
			return;
		}
		const parsedLimit = Number.parseFloat(limitAmount);
		const hasLimit = limitEnabled && Number.isFinite(parsedLimit) && parsedLimit > 0;
		if (limitEnabled && !hasLimit) {
			setSubmitError("Enter a spending limit greater than zero.");
			return;
		}

		setSubmitting(true);
		setSubmitError(undefined);
		try {
			const perAuthorization = limitFrequency === "per_authorization";
			const response = await fetch("/api/cards/create", {
				body: JSON.stringify({
					accountId,
					assignedUserId: canAssignTeamMember ? selectedMember?.id : undefined,
					name: cardName.trim(),
					spendLimit: hasLimit && !perAuthorization ? parsedLimit : undefined,
					spendLimitFrequency: hasLimit && !perAuthorization ? limitFrequency : undefined,
					transactionLimit: hasLimit && perAuthorization ? parsedLimit : undefined,
				}),
				headers: { "Content-Type": "application/json" },
				method: "POST",
			});
			const body = (await response.json().catch(() => null)) as
				| {
						error?: { message?: string };
						id?: string;
						object?: string;
					  }
				| null;
			if (!response.ok) {
				setSubmitError(body?.error?.message ?? "Failed to create card.");
				return;
			}
			if (response.status === 201)
				setResult({ cardId: body?.id ?? null, kind: "created" });
			else if (body?.object === "card_invitation") setResult({ kind: "invitation" });
			else if (body?.object === "card_application") setResult({ kind: "application" });
			else setResult({ kind: "provisioning" });
		} catch (cause) {
			setSubmitError(cause instanceof Error ? cause.message : "Failed to create card.");
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="nb-card-create">
			<section className="nb-card-create__form-panel">
				{result ? (
					<ResultScreen cardName={cardName} onClose={onClose} result={result} />
				) : (
					<form className="nb-card-create__form" onSubmit={(event) => void submit(event)}>
						<div className="nb-card-create__intro">
							<h2>New card</h2>
							<p>Issue a new card and set spending rules.</p>
						</div>

						<label className="nb-card-create__field">
							<span>Card name</span>
							<div className="nb-card-create__name-input">
								<input
									autoComplete="off"
									autoFocus
									maxLength={30}
									onChange={(event) => setCardName(event.target.value)}
									placeholder="Friday team dinners"
									required
									value={cardName}
								/>
								<small>{cardName.length} / 30</small>
							</div>
						</label>

						{canAssignTeamMember ? (
							<TeamMemberPicker
								error={membersError}
								isLoading={membersLoading}
								members={sortedMembers}
								onSelect={(member) => setSelectedMemberId(member.id)}
								selected={selectedMember}
							/>
						) : null}

						<div className="nb-card-create__divider" />

						<div className="nb-card-create__limit">
							<label className="nb-card-create__limit-toggle">
								<span>Spending limit</span>
								<input
									checked={limitEnabled}
									onChange={(event) => setLimitEnabled(event.target.checked)}
									role="switch"
									type="checkbox"
								/>
							</label>
							{limitEnabled ? (
								<div className="nb-card-create__limit-fields">
									<label>
										<span aria-hidden>$</span>
										<input
											autoComplete="off"
											inputMode="decimal"
											onChange={(event) => {
												const raw = event.target.value.replace(/[^0-9.]/g, "");
												if (raw === "" || /^\d*\.?\d{0,2}$/.test(raw)) setLimitAmount(raw);
											}}
											placeholder="0"
											value={limitAmount}
										/>
									</label>
									<select
										aria-label="Spending limit frequency"
										onChange={(event) =>
											setLimitFrequency(event.target.value as SpendLimitFrequency)
										}
										value={limitFrequency}
									>
										<option value="per_authorization">Per transaction</option>
										<option value="daily">Daily</option>
										<option value="weekly">Weekly</option>
										<option value="monthly">Monthly</option>
										<option value="one_time">Lifetime</option>
									</select>
								</div>
							) : null}
						</div>

						<div className="nb-card-create__divider" />
						{submitError ? <p className="nb-card-create__submit-error">{submitError}</p> : null}
						<button
							className="nb-button nb-button--primary nb-card-create__primary"
							disabled={
								submitting ||
								membersLoading ||
								Boolean(membersError) ||
								(canAssignTeamMember && !selectedMember)
							}
							type="submit"
						>
							{submitting ? "Creating card…" : "Create virtual card"}
						</button>
					</form>
				)}
			</section>

			<section className="nb-card-create__preview-panel" aria-label="Virtual card preview">
				<div className="nb-card-create__preview">
					<strong className="nb-card-create__preview-entity">{entityName}</strong>
					<span>{cardName || "Card name"}</span>
				</div>
			</section>
		</div>
	);
}
