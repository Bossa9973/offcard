import { monochromeAppearance, monochromeTheme, compactCardTableClasses } from "./theme";
import { loadWhop } from "@whop/elements";
import { DESIGN_MODE } from "../design-mode";
import { WhopElements } from "@whop/elements-react";
import { Wallet } from "./parts/wallet-provider";
import { ChevronRight16 } from "@frosted-ui/icons";
import { Link, useNavigate, useRouter, useRouterState } from "@tanstack/react-router";
import { resolveAPI, WhopAPIProvider } from "@whop/template-kit";
import { Theme } from "frosted-ui";
import type { ComponentProps, ComponentType } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { AddMoney } from "./parts/add-money";
import { AppSkeleton } from "./parts/app-skeleton";
import { CardTransactionsScreen } from "./parts/card-transactions";
import { CreateCardScreen } from "./parts/create-card";
import { useCardApplication } from "./parts/card-application";
import { CardsScreen } from "./parts/cards";
import { CommandMenu } from "./parts/command-menu";
import { EntityPicker, useEntities } from "./parts/entity-picker";
import { InviteUsers } from "./parts/invite-users";
import { ResponsiveShell } from "./parts/responsive-shell";
import { BalanceScreen } from "./parts/balance";
import { Overview } from "./parts/overview";
import { RetainedScreen } from "./parts/retained-screen";
import { ReportsScreen } from "./parts/reports";
import { activityFilters, activitySearch, type ActivityFilters } from "./report-navigation";
import { CheckoutLinks } from "./parts/checkout-links";
import { InvoicesScreen } from "./parts/invoices";
import { InvoicingScreen } from "./parts/invoicing";
import { PaymentDetailScreen } from "./parts/payment-detail";
import { CreateInvoiceButton } from "./parts/create-invoice";
import { SendMoney } from "./parts/send";
import { Settings } from "./parts/settings";
import { SignIn } from "./parts/sign-in";
import type { VerificationKind } from "./parts/verify-gate";
import { VerificationSurface } from "./parts/verify-gate";
import { Withdraw } from "./parts/withdraw";
import type { TabKey } from "./tabs";
import { loginHref } from "../lib/login";
import { getWithdrawalReadiness, type WithdrawalReadiness } from "../lib/withdraw-readiness";
import { getSettingsReadiness, type SettingsReadiness } from "../lib/settings-readiness";
import { DeferredSwap } from "./parts/deferred-swap";
import { SLUG_FOR_TAB, TAB_SLUGS, TAB_TITLES, TABS } from "./tabs";
import { useReadiness } from "./use-readiness";
import { useWarmScreens } from "./use-warm-screens";
import { useElementsToken } from "./use-elements-token";

const elements = typeof window === "undefined" ? null : loadWhop();

const MergedWallet = Wallet as ComponentType<
	ComponentProps<typeof Wallet> & {
		accessToken?: string;
	}
>;

const ACCOUNT_ROUTE = /^\/account\/([^/]+)(?:\/(.*?))?\/?$/;

export function NeobankApp() {
 const [compactElements, setCompactElements] = useState(false);
 const measureMain = useCallback((node: HTMLElement | null) => {
  if (!node) return;
  const observer = new ResizeObserver(([entry]) => {
   if (entry && entry.contentRect.width > 0) setCompactElements(entry.contentRect.width < 480);
  });
  observer.observe(node);
  return () => observer.disconnect();
 }, []);
	const navigate = useNavigate();
	const router = useRouter();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const route = ACCOUNT_ROUTE.exec(pathname);
	const routeAccountId = route?.[1] ? decodeURIComponent(route[1]) : null;
	const tail = route?.[2] ?? "";
	const balance = /^balance\/([^/]+)$/.exec(tail);
	const holding = balance?.[1] ? decodeURIComponent(balance[1]) : null;
	const cardsTransactions = tail === "cards/transactions";
	const cardsCreate = tail === "cards/create";
	const paymentMatch = /^payments\/detail\/([^/]+)$/.exec(tail);
	const paymentLinks = tail === "payments/links";
	const invoiceEditor = tail === "payments/invoices/edit";
	const reportActivity = tail === "reports/activity";
	const paymentId = paymentMatch?.[1] ? decodeURIComponent(paymentMatch[1]) : null;
	const search = useRouterState({ select: (state) => state.location.searchStr });
	const query = new URLSearchParams(search);
	const cardFilter = query.get("card") ?? undefined;
	const invoiceDocument = query.get("document") ?? undefined;
	const fromCard = query.get("from") === "cards";
	const reportFilters = activityFilters(search);
	const tab: TabKey =
		cardsTransactions || cardsCreate ? "cards" : paymentId ? "invoicing" : (TAB_SLUGS[tail] ?? "overview");
	const entityId = routeAccountId;
	const reportDestination = useRef({ accountId: entityId, view: "summary" as "summary" | "activity", filters: {} as ActivityFilters });
	if (reportDestination.current.accountId !== entityId || tab === "report") reportDestination.current = {
		accountId: entityId, view: reportActivity ? "activity" : "summary", filters: reportFilters,
	};
	const [readinessRevision, setReadinessRevision] = useState(0);
	const [dataRevision, setDataRevision] = useState(0);
	const changed = () => setDataRevision((value) => value + 1);
	const [warmScreen, setWarmScreen] = useState<{ scope: string; tab: TabKey; request: number } | null>(null);
	const intentTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	const [verifyKind, setVerifyKind] = useState<VerificationKind>("individual");
	const settledOnEntry = useRef(false);
	const verificationOrigin = useRef<{ accountId: string; tab: TabKey; path: string; search: string } | null>(null);
	const [commandOpen, setCommandOpen] = useState(false);
	const [checkoutRevision, setCheckoutRevision] = useState(0);
	const [invoiceDialogAccount, setInvoiceDialogAccount] = useState<string | null>(null);
	const {
		create,
		creating,
		entities,
		viewerName,
		error: entitiesError,
		isLoading: entitiesLoading,
		needsReauth,
		signedOut: entitiesSignedOut,
	} = useEntities();

	useEffect(() => {
		if (entityId || entities.length === 0) return;
		void navigate({
			params: { accountId: entities[0]!.id },
			replace: true,
			to: "/account/$accountId",
		});
	}, [entities, entityId, navigate]);

	const cardApplication = useCardApplication(
		entityId ?? "",
		entityId?.startsWith("biz_") ?? false,
	);
	const cardsApproved = cardApplication.scene === "approved";
	const showingCardCreate = cardsCreate && cardsApproved;

	const hasAccount = entityId !== null;
	const token = useElementsToken(entityId ?? undefined, hasAccount);
	const needsSignIn = entitiesSignedOut || token.needsSignIn;
	const autoCreateAttempted = useRef(false);

	useEffect(() => {
		if (
			hasAccount || entitiesLoading || entities.length > 0 || entitiesError ||
			needsSignIn || creating || autoCreateAttempted.current
		) return;
		autoCreateAttempted.current = true;
		void create();
	}, [hasAccount, entitiesLoading, entities.length, entitiesError, needsSignIn, creating, create]);

	// The money tabs use a separate official Wallet instance. Their activity and overlays
	// therefore do not compete with Overview for the primary wallet’s consumer slots.
	const browsing = !holding && !cardsTransactions && !cardsCreate && !paymentId &&
		invoiceDialogAccount === null &&
		(tab === "overview" || tab === "cards" || tab === "invoicing" || tab === "invoices" || tab === "report" || tab === "deposit" || tab === "send" || tab === "settings" || tab === "withdraw");
	const sessionScope = `${entityId}:${token.token}`;
	const backgroundWarm = useWarmScreens(sessionScope, !!token.accountId && !needsSignIn, entityId?.startsWith("biz_") ?? false, cardsApproved);
	const warmScope = `${sessionScope}:${pathname}`;
	const warming = (key: TabKey) => browsing && warmScreen?.scope === warmScope && warmScreen.tab === key ? warmScreen.request : (browsing ? backgroundWarm[key] ?? 0 : 0);
	const withdrawalReadiness = useReadiness<WithdrawalReadiness>(sessionScope,
		!!token.accountId && (tab === "withdraw" || !!warming("withdraw")), tab === "withdraw", readinessRevision,
		async () => DESIGN_MODE
			? { verificationRequired: false, payoutActive: true, source: "account", verificationKind: "individual" }
			: getWithdrawalReadiness({ data: { accountId: entityId! } }).catch(() => ({ verificationRequired: false, payoutActive: false, source: "fallback", verificationKind: "individual" })));
	const settingsReadiness = useReadiness<SettingsReadiness>(sessionScope,
		!!token.accountId && (tab === "settings" || !!warming("settings")), tab === "settings", readinessRevision,
		async () => DESIGN_MODE ? { hasInformationRequests: false, source: "verifications" }
			: getSettingsReadiness({ data: { accountId: entityId! } }).catch(() => ({ hasInformationRequests: false, source: "fallback" })));

	function cancelIntent() {
		clearTimeout(intentTimer.current);
	}
	useEffect(() => cancelIntent, [pathname, entityId, token.token]);
	function prepare(key: TabKey, immediate = false) {
		cancelIntent();
		if (!entityId || key === tab) return;
		const run = () => {
			const slug = SLUG_FOR_TAB[key];
			// Warm route code and compatible screens on intent; Withdraw only warms its readiness read.
			void router.preloadRoute({
				to: slug ? `/account/$accountId/${slug}` : "/account/$accountId",
				params: { accountId: entityId },
			}).catch(() => undefined);
			if (browsing && (key === "overview" || key === "invoicing" || key === "report" || key === "deposit" || key === "send" || key === "withdraw" || key === "settings" || (key === "cards" && cardsApproved)))
				setWarmScreen({ scope: warmScope, tab: key, request: Date.now() });
		};
		if (immediate) run();
		else intentTimer.current = setTimeout(run, 120);
	}

	const lastTab = useRef(tab);
	useEffect(() => {
		if (lastTab.current !== tab && lastTab.current === "verification") { changed(); setReadinessRevision((value) => value + 1); }
		lastTab.current = tab;
	}, [tab]);

	function show(key: TabKey): void {
		if (!entityId) return;
		const slug = SLUG_FOR_TAB[key === "invoicing" ? "invoices" : key];
		void navigate({
			params: { accountId: entityId },
			to: slug ? `/account/$accountId/${slug}` : "/account/$accountId",
		});
	}

	function openActivity(filters: ActivityFilters = {}) {
		if (!entityId) return;
		void navigate({ to: "/account/$accountId/reports/activity", params: { accountId: entityId }, search: activitySearch(filters) });
	}

	function beginVerification(kind: VerificationKind) {
		if (!entityId) return;
		verificationOrigin.current = { accountId: entityId, tab: tab === "verification" ? "overview" : tab, path: pathname, search };
		setVerifyKind(kind);
		settledOnEntry.current = false;
		show("verification");
	}

	function returnFromVerification() {
		const origin = verificationOrigin.current;
		if (origin?.accountId === entityId && origin.tab !== "verification") void navigate({ to: origin.path, search: Object.fromEntries(new URLSearchParams(origin.search)) });
		else show("overview");
	}

	function selectAccount(id: string): void {
		void navigate({ params: { accountId: id }, to: "/account/$accountId" });
	}

	// The callback bounces failures back to / with a reason; surfacing it here is the only
	// place the user ever sees why a sign-in did not take.
	if (needsSignIn)
		return (
			<SignIn
				href={loginHref(entityId ?? undefined, pathname)}
				label={entityId ? "Connect this entity" : "Sign in with Whop"}
				error={
					typeof window === "undefined"
						? undefined
						: (new URLSearchParams(window.location.search).get("auth_error") ?? undefined)
				}
			/>
		);

	if ((!hasAccount && entitiesLoading) || (hasAccount && token.isLoading))
		return <AppSkeleton tab={tab} />;

	if (!hasAccount && !entitiesError) return <AppSkeleton tab={tab} />;

	if (!hasAccount)
		return (
			<SignIn
				error={entitiesError}
				href={needsReauth ? loginHref(undefined) : "/"}
				label={needsReauth ? "Grant access" : "Try again"}
				subtitle="We couldn’t open your account. Please try again."
				title="Let’s get you connected."
			/>
		);

	if (!token.accountId)
		return (
			<div className="nb-status nb-status--error">
				<p>Could not open your account.</p>
				{token.error ? <p className="nb-status__detail">{token.error}</p> : null}
				<a className="nb-button nb-button--primary nb-signin" href="/api/auth/login">
					Try signing in again
				</a>
			</div>
		);

	const accountId = entityId;
	const isEntity = accountId.startsWith("biz_");
	const account = entities.find((entity) => entity.id === accountId);
	const accountName = account?.name;
	const brand = isEntity ? account : undefined;
	const showNeobankCta =
		!entitiesLoading &&
		!entitiesError &&
		account?.kind === "entity" &&
		!entities.some((entity) => entity.kind === "overview");

	return (
		<Theme {...monochromeTheme} hasBackground={false}>
		<WhopAPIProvider endpoints={resolveAPI()}>
			<WhopElements
				appearance={monochromeAppearance}
				elements={elements}
				key={accountId}
			>
				<MergedWallet
					accessToken={token.token}
					accountId={accountId}
					appearance={{
						classes: compactElements ? compactCardTableClasses : {},
						// The report page already supplies its gutter outside the element frames.
						variables: tab === "report" ? {
							"--gutter-width-lg": "0",
							"--gutter-width-md": "0",
							"--gutter-width-sm": "0",
						} : {},
						theme: monochromeTheme,
					}}
					currency={holding ?? "usd"}
					key={accountId}
				>
					<ResponsiveShell accountId={accountId} viewerName={viewerName} onSettings={() => show("settings")} sidebar={<>

							{entitiesLoading || entities.length > 1 ? (
							<div className="nb-sidebar__header">
								{entitiesLoading ? (
									<div
										className="nb-skeleton-picker"
										aria-label="Loading accounts"
										aria-busy="true"
									>
										<div className="nb-skeleton nb-skeleton--avatar" />
										<div className="nb-skeleton nb-skeleton--picker-name" />
									</div>
								) : entities.length > 0 ? (
									<EntityPicker
										entities={entities}
										onSelect={selectAccount}
										selectedId={accountId}
									/>
								) : null}
							</div>
							) : null}
							<nav className="nb-nav">
								{TABS.filter(
									({ key }) => (key !== "cards" && key !== "report" && key !== "invoicing") || isEntity,
								).map(({ key, label }) => (
									<button
										aria-current={((tab === "invoices" ? "invoicing" : tab) === key) ? "page" : undefined}
										className="nb-nav__item"
										key={key}
										onClick={() => { cancelIntent(); show(key); }}
										onPointerEnter={() => prepare(key)}
										onPointerLeave={cancelIntent}
										onFocus={() => prepare(key, true)}
										onBlur={cancelIntent}
										type="button"
									>
										{label}
									</button>
								))}
								<InviteUsers />
							</nav>
							{showNeobankCta ? (
								<div className="nb-sidebar__footer">
								<a
									className="nb-blueprint-button"
									href="https://whop.com/blueprints/app_EtrVTHbuydoOk6/?a=timofeyobraz"
								>
									<span>Create your own neobank</span>
									<ChevronRight16 aria-hidden />
								</a>
								</div>
							) : null}

					</>}>
						<div className="nb-workspace">
							<main className="nb-main" ref={measureMain}>
								{["deposit", "send", "withdraw", "verification"].includes(tab) ? (
									<button type="button" className="nb-button nb-button--ghost nb-balance-back"
										aria-label={tab === "verification" ? `Back to ${TAB_TITLES[verificationOrigin.current?.tab ?? "overview"]}` : fromCard ? "Back to Cards" : "Back to Home"}
										onClick={tab === "verification" ? returnFromVerification : () => { if (fromCard) void navigate({ to: "/account/$accountId/cards", params: { accountId }, search: { card: cardFilter } }); else show("overview"); }}>
										<span aria-hidden>‹</span> {tab === "verification" ? `Back to ${TAB_TITLES[verificationOrigin.current?.tab ?? "overview"]}` : fromCard ? "Back to Cards" : "Back to Home"}
									</button>
								) : null}
								{(tab === "overview" && holding) || paymentId ? null : (
									<header className="nb-main__header">
										<h1 className="nb-main__title">
											{showingCardCreate
												? "Create virtual card"
												: cardsTransactions ? "Card transactions" : tab === "invoices" ? "Payments" : TAB_TITLES[tab]}
										</h1>
										{showingCardCreate ? (
											<Link
												className="nb-button nb-button--secondary nb-main__action"
												params={{ accountId }}
												to="/account/$accountId/cards"
											>
												Cards
												<ChevronRight16 aria-hidden />
											</Link>
										) : tab === "cards" && cardsApproved && cardsTransactions ? (
											<Link
												className="nb-button nb-button--secondary nb-main__action"
												params={{ accountId }}
												to={
													cardsTransactions
														? "/account/$accountId/cards"
														: "/account/$accountId/cards/transactions"
												}
											>
												Back to Cards
												<ChevronRight16 aria-hidden />
											</Link>
										) : null}
									</header>
								)}
								{(tab === "invoicing" || tab === "invoices") && !paymentId ? <nav className="nb-subnav" aria-label="Payments sections">
									<Link to="/account/$accountId/payments/invoices" params={{ accountId }} aria-current={tab === "invoices" ? "page" : undefined}>Invoices</Link>
									<Link to="/account/$accountId/payments/links" params={{ accountId }} aria-current={paymentLinks ? "page" : undefined}>Payment links</Link>
									<Link activeOptions={{ exact: true }} to="/account/$accountId/payments" params={{ accountId }} aria-current={tab === "invoicing" && !paymentLinks ? "page" : undefined}>History</Link>
								</nav> : null}
								{tab === "invoicing" && !paymentId ? <div className="nb-section-heading">
									<h2>{paymentLinks ? "Payment links" : "History"}</h2>
									<CreateInvoiceButton key={accountId} accountId={accountId} open={invoiceDialogAccount === accountId} onOpenChange={(open) => setInvoiceDialogAccount(open ? accountId : null)} onCreated={() => { setCheckoutRevision((value) => value + 1); changed(); }} />
								</div> : null}
								{tab === "report" ? <nav className="nb-subnav" aria-label="Reports sections">
									<Link activeOptions={{ exact: true }} to="/account/$accountId/reports" params={{ accountId }} aria-current={!reportActivity ? "page" : undefined}>Summary</Link>
									<Link to="/account/$accountId/reports/activity" params={{ accountId }} aria-current={reportActivity ? "page" : undefined}>Activity</Link>
								</nav> : null}
								<RetainedScreen key={`overview:${token.token}:${dataRevision}`} name="overview"
									active={tab === "overview" && !holding} retain={browsing} preload={warming("overview")}>
									<Overview
										accountName={accountName}
										accessToken={token.token}
										onHoldingChange={(next) => {
											if (!next || !entityId) return;
											void navigate({
												params: { accountId: entityId, currency: next },
												to: "/account/$accountId/balance/$currency",
											});
										}}
									/>
								</RetainedScreen>
								<RetainedScreen revision={dataRevision} key={`cards:${token.token}`} name="cards"
									active={tab === "cards" && !showingCardCreate && !(cardsTransactions && cardsApproved)}
									retain={browsing && cardsApproved} preload={warming("cards")}>
									<CardsScreen
										accountId={accountId}
										accessToken={token.token}
										application={cardApplication}
										enabled={isEntity}
										error={token.error}
										onAddInformation={() => show("settings")}
										onCreateCard={() =>
											void navigate({
												params: { accountId },
												to: "/account/$accountId/cards/create",
											})
										}
										initialCardId={cardFilter}
										onTopUp={(cardId) => void navigate({ to: "/account/$accountId/deposit", params: { accountId }, search: { from: "cards", card: cardId } })}
										onViewTransactions={(cardId) =>
											void navigate({
												params: { accountId },
												search: { card: cardId },
												to: "/account/$accountId/cards/transactions",
											})
										}
										onVerify={beginVerification}
									/>
								</RetainedScreen>
								<RetainedScreen revision={dataRevision} key={`reports:${token.token}`} name="report"
									active={tab === "report"} retain={browsing && isEntity} preload={isEntity ? warming("report") : 0}>
									<ReportsScreen view={reportDestination.current.view} filters={reportDestination.current.filters} onActivity={openActivity} />
								</RetainedScreen>
								<RetainedScreen revision={dataRevision} key={`invoicing:${token.token}`} name="invoicing"
									active={tab === "invoicing" && !paymentId && !paymentLinks} retain={isEntity} preload={isEntity ? warming("invoicing") : 0}>
									<InvoicingScreen accountId={accountId} accessToken={token.token} canReadPayments={token.canReadPayments} />
								</RetainedScreen>
								<RetainedScreen name="payment-links" key={`links:${accountId}:${checkoutRevision}`} active={tab === "invoicing" && paymentLinks} retain={isEntity}>
									<CheckoutLinks accountId={accountId} />
								</RetainedScreen>
								{tab === "invoices" && isEntity ? <InvoicesScreen key={accountId} accountId={accountId} editor={invoiceEditor} documentId={invoiceDocument}
									onOpen={(document) => void navigate({ to: "/account/$accountId/payments/invoices/edit", params: { accountId }, search: document ? { document } : {} })}
									onBack={() => void navigate({ to: "/account/$accountId/payments/invoices", params: { accountId } })}
									onCreated={() => setCheckoutRevision(value => value + 1)} /> : null}
								<RetainedScreen name="settings" key={`settings:${token.token}:${readinessRevision}`} active={tab === "settings"}
									retain={tab !== "verification"} retainMs={60_000} preload={warming("settings")}>
									<Settings
											key={accountId}
											onChanged={changed}
											isNeobankOwner={entities.some((entity) => entity.kind === "overview" && entity.id === accountId)}
											accessToken={token.token}
											accountId={accountId}
											hasInformationRequests={
												settingsReadiness?.source === "verifications" &&
												settingsReadiness.hasInformationRequests
											}
											onVerify={beginVerification}
										/>
								</RetainedScreen>
								<MergedWallet key={`money:${token.token}`} accountId={accountId} accessToken={token.token}>
									<RetainedScreen name="deposit" active={tab === "deposit"} retain retainMs={null}
										preload={warming("deposit")} revision={dataRevision}>
										{fromCard ? <p className="nb-section-note">Add money to your account. Return to Cards to check your card balance.</p> : null}
										<AddMoney onVerify={() => beginVerification("individual")} accountId={accountId} accessToken={token.token} error={token.error} isLoading={token.isLoading} />
									</RetainedScreen>
									<RetainedScreen name="send" active={tab === "send"} retain retainMs={null}
										preload={warming("send")} revision={dataRevision}>
										<SendMoney accessToken={token.token} error={token.error} isEntity={isEntity}
											onDone={() => show("overview")} onChanged={changed} />
									</RetainedScreen>
									<RetainedScreen name="withdraw" active={tab === "withdraw"} retain={tab !== "verification"}
										revision={dataRevision}>
										<Withdraw
											onChanged={changed}
											onDone={() => show("overview")}
											readiness={withdrawalReadiness}
											onOpenSettings={() => show("settings")}
											onVerify={() => beginVerification(withdrawalReadiness?.verificationKind ?? "individual")}
											verifyToken={token.token}
										/>
									</RetainedScreen>
								</MergedWallet>
								<DeferredSwap
									key={`${tab}:${holding ?? ""}:${cardsTransactions ? "tx" : cardsCreate ? "create" : ""}`}
								>
								{tab === "overview" && holding ? (
									<div>
										<MergedWallet accountId={accountId} accessToken={token.token} currency={holding} key={`holding:${holding}`}><BalanceScreen accountId={accountId} onChanged={changed}
											onSeeAll={() => openActivity({ currency: holding })}
											accessToken={token.token}
											holding={holding}
											onBack={() =>
												void navigate({
													params: { accountId },
													to: "/account/$accountId",
												})
											}
										/></MergedWallet>
									</div>
								) : null}
								{tab === "cards" && cardsTransactions && cardsApproved ? (
									<div>
										<CardTransactionsScreen accessToken={token.token} cardId={cardFilter} />
									</div>
								) : null}
								{tab === "cards" && showingCardCreate ? (
									<CreateCardScreen
										accountId={accountId}
										applicationKind={cardApplication.application?.kind}
										entityName={accountName ?? "Account"}
										onClose={() =>
											void navigate({
												params: { accountId },
												to: "/account/$accountId/cards",
											})
										}
									/>
								) : null}

								{tab === "invoicing" && paymentId ? <PaymentDetailScreen key={`${accountId}:${paymentId}`} accountId={accountId} paymentId={paymentId} accessToken={token.token} canReadPayments={token.canReadPayments} /> : null}

								{tab === "verification" && token.token ? (
										<div>
											<VerificationSurface
												accessToken={token.token}
												accountId={accountId}
												kind={verifyKind}
												onStatus={(status) => {
													// The element reports its standing on mount, so an already-approved
													// kind would bounce straight back out before anything was verified.
													if (status !== "approved") {
														settledOnEntry.current = true;
														return;
													}
													if (settledOnEntry.current) {
														void cardApplication.refresh();
														returnFromVerification();
													}
												}}
												visible
											/>
										</div>
									) : null}

								</DeferredSwap>
							</main>
						</div>
					</ResponsiveShell>
				</MergedWallet>
			</WhopElements>
			<CommandMenu
				actions={[
					{
						description: "See balances and recent activity",
						keywords: "home dashboard",
						label: "Home",
						onSelect: () => show("overview"),
					},
					{
						description: "Deposit funds into this account",
						keywords: "bank transfer deposit fund",
						label: "Deposit",
						onSelect: () => show("deposit"),
					},
					...(isEntity
						? [
								{
									description: "Review balance history and financial activity",
									keywords: "report balance activity export csv",
									label: "Reports",
									onSelect: () => show("report"),
								},
								{
									description: "Review payments and payment links",
									keywords: "invoicing invoice payments billing",
									label: "Payments",
									onSelect: () => show("invoicing"),
								},
							]
						: []),
					{
						description: "Pay a person or business",
						keywords: "transfer payment",
						label: "Send money",
						onSelect: () => show("send"),
					},
					{
						description: "Move funds to an external account",
						keywords: "payout cash out",
						label: "Withdraw",
						onSelect: () => show("withdraw"),
					},
				]}
				onOpenChange={setCommandOpen}
				open={commandOpen}
			/>
		</WhopAPIProvider>
		</Theme>
	);
}
