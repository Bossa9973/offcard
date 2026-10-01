# Customer flow audit — 2026-09-22

Scope: local customer preview, current application code, and the official Elements implementation in the sibling Whop checkout. No navigation changes made as part of this audit. Real-account verification and transactions were not exercised.

## Recommendation

Use four primary destinations: Wallet, Cards, Payments, Reports. Keep Settings and Sign out in the profile menu. Invite users remains a copy-link utility; Create your own neobank remains the separate sidebar footer CTA.

Wallet contains the balance/trend, holdings, quick actions, and recent activity. Deposit, Send, Withdraw, and Convert are contextual tasks launched from Wallet or a holding/card. Use one flow for each task across every entry point. Keep details and creation screens beneath their owning destination.

The official Actions controller opens its own overlays; its requested events are notifications, not documented cancellation hooks. Prefer those native overlays while honoring the official-iframe constraint. Retire standalone money-task pages only after their extra behaviors have equivalents in the shared flow. Their direct URLs can remain as compatibility entry points.

## Current inventory

| Surface | Elements and app-owned UI | Current path/behavior | Proposed home |
| --- | --- | --- | --- |
| Overview | Official actions, balances.balance, balances.list, wallet.activity | Actions open Wallet overlays; holdings navigate to currency detail; activity opens detail overlay | Rename Wallet; primary destination |
| Holding detail | Official balances.breakdown, actions, currency-filtered activity; app back button | Nested under Overview; some action callbacks also navigate | Nested under Wallet; preserve selected currency |
| Deposit | Official deposit plus a separate deposit-filtered activity Element | Standalone sidebar page; separate instance from Overview overlay; explicit verification callback | Wallet task; retain deposit-history access through activity |
| Send | Official send; app completion/reset and refresh handling | Standalone sidebar page plus Overview overlay | Wallet task; one draft and completion path |
| Withdraw | Official withdraw; app readiness/verification gates and completion handling | Standalone sidebar page; holding action also available | Wallet action; preserve gates before removing page |
| Convert | Official convert overlay | Overview/holding action; no sidebar destination | Wallet/holding action |
| Accept | Official Actions controller | Navigates the top-level page to Whop's checkout-link creator for this biz_ account | Decide explicitly; current behavior leaves the neobank |
| Cards | Official cardsChart, cardsTable, cardDetails, cardTransactions; custom create-card form | Card drawer, filtered transaction page, creation page, verification gates | Primary destination; details/creation nested |
| Invoicing | Official dashboard.paymentsTable and paymentDetail; custom checkout-link list and creation dialog | The Create invoice form creates a hosted checkout link | Rename Payments; distinguish received payments and payment links |
| Reports | Official reports.balanceReport and reportActivity | Dedicated financial reports and activity surface | Keep for deeper history/export rather than repeat home summaries |
| Settings | Official verification capabilities and RFI; app sign-out form; owner-only markup editor | Both sidebar and profile entries | Profile menu; customer-facing account/verification settings |
| Verification | Official KYC surface plus app routing | Reached from account/card/deposit/withdraw readiness | Contextual flow; return to the initiating task |

## Verified findings

1. **Deposit has two presentations and instances.** Browser check: Overview opened `wallet/deposit/.../demo/modal/...`; the sidebar opened the inline `wallet/deposit/.../demo/...` and a separate activity frame. The standalone page therefore has additional history and wiring, even if the deposit form looks identical.
2. **Holding-detail actions can double-launch.** Browser check: pressing Deposit on USD detail navigated to `/deposit` while one deposit dialog remained open. The holding Actions callbacks navigate while the official Wallet controller also opens an overlay. Send and Withdraw share this code pattern and need the same review.
3. **Accept leaves the app.** Browser check intercepted the attempted top-level navigation to `https://whop.com/dashboard/biz_XXXXXXXXXXXX/links/checkout/create/?from=home`. No external checkout was created. The official controller uses `_top`, not a local create-invoice modal.
4. **Invoice language overstates the local flow.** The current app form creates products/plans and returns a hosted checkout link. It does not present a dedicated invoice-management workflow with due dates and invoice lifecycle tracking. Use Payments / Payment links / Create payment link unless fuller invoicing is intended.
5. **Task lifecycle wiring differs.** Inline Send and Withdraw notify the app on completion, refresh other screens, and return to Overview. Deposit handles identity-verification requests. Overview currently relies on the controller-owned overlays without those same host callbacks. Align these before consolidating entry points.
6. **The warm inline page is not the modal.** Background preloading currently mounts Deposit and Send pages. That does not make their separate official overlay instances already mounted. Align preloading with whichever presentation becomes canonical, without speculative mutations.
7. **Two creation forms are app-owned.** Create card and Create invoice/payment link are custom React forms calling server endpoints. The surrounding tables/detail surfaces are official iframes. This is a scope decision to resolve against the preference for official Elements before investing in their theme.
8. **The mock proves the funded, approved case.** It uses one existing customer account with approved cards. Empty balance, verification needed/pending, declined/failed actions, and interrupted drafts still need deliberate customer scenarios. Individual card fixtures do not by themselves prove the verification route is appropriate; some verification components currently initialize with `kind: business`.

## Suggested sequence before theming

1. Agree on Wallet / Cards / Payments / Reports and task presentation.
2. Fix holding-detail double launch and establish consistent verification/completion/return handling.
3. Decide Accept's external destination versus keeping payment creation within Payments. For a self-contained wallet, prefer Deposit / Send / Withdraw / Convert; Accept can remain a temporary evaluation button until that choice is made.
4. Remove task items from the sidebar only after their shared equivalents work; preserve contextual currency and usable direct links.
5. Rename checkout-link creation accurately and resolve the two custom form exceptions.
6. Review fresh-account, funded-account, verification, error, and success states. Then theme the agreed surfaces.

Evidence: `output/playwright/flow-audit.json` (local browser checks); `src/ui/app.tsx`; `src/ui/parts/overview.tsx`, `balance.tsx`, `add-money.tsx`, `send.tsx`, `withdraw.tsx`, `cards.tsx`, `invoicing.tsx`, `create-invoice.tsx`, `reports.tsx`, `settings.tsx`, `verify-gate.tsx`; sibling `whop-monorepo/frontend/apps/web/src/elements/wallet/actions.tsx` and `controller.tsx`.

## Implementation follow-up — keep Overview (2026-09-22)

The approved primary navigation is **Overview / Cards / Payments / Reports**. Overview keeps its name. Settings is available through the profile menu. Invite users and the separate blueprint footer remain. Overview's official action row now exposes Deposit / Send / Convert / Withdraw; Accept's external checkout-creation jump is hidden.

Removed the holding-detail action callbacks that also navigated to standalone pages. Official Actions remains responsible for its overlays, so opening a money task stays on the selected holding. Renamed customer-visible invoice creation language to Payment links / Create payment link, including the skeleton, command menu, and payment detail breadcrumb. Existing `/invoicing` URLs remain compatible.

Standalone Deposit / Send / Withdraw URLs remain available, with a Back to Overview control, to preserve existing gates and completion handling. Deposit and Send are no longer speculatively mounted by the background warming queue: those frames did not warm the native action overlays. Existing visited-screen retention is preserved. Host-owned verification entry points remember their initiating section and return there on completion or Back; direct verification entry falls back to Overview.

### Elements boundary confirmed

The installed `@whop/elements` 1.0.0 declarations and current sibling checkout expose `dashboard.paymentsTable` and `dashboard.paymentDetail`, with host-handled `invoiceRequested` callbacks. Neither the package namespace inventory nor the local Elements source includes an invoice composer or invoice-management Element. Existing payment-link and card creation forms remain app-owned; no new custom creation UI was introduced.

`wallet.actions` requested callbacks observe built-in controller opens; they are not cancellation hooks. `WalletOptions` does not expose callbacks for the controller-created Deposit/Send/Withdraw overlays. `createOverlay` supports callbacks for overlays created by the host, but does not configure the ones opened by Actions. Full consolidation of the direct routes, shared mutation invalidation, and native-modal verification therefore remains pending a supported SDK integration. Do not use duplicate open callbacks, private transport interception, or change upstream Element source to claim this is solved.

The local overlay implementation also tears down its frame on close, despite the installed handle declaration describing reuse. Modal reuse/preloading must be checked against actual runtime behavior before making performance claims.

Validation: typecheck, production build, and 19 existing tests passed. Local Chrome checks passed for all four Overview overlays, single-overlay holding actions without route changes, profile Settings, payment-link dialog, compatibility task Back controls, and 390px/320px navigation and form layouts. No runtime page errors were recorded. The 320px Actions frame and each button fit without horizontal overflow. Evidence: `output/playwright/navigation-cleanup.json`, `navigation-cleanup-320.png`. Real transactions and real verification completion were not exercised.

## Invoice and Cards follow-up

- Added Invoices as a separate document editor, with Inter, monochrome styling and a compact desktop layout. Invoices are local-browser drafts/snapshots, not a synced receivables ledger. Sample mode cannot charge money.
- The invoice API recalculates totals, uses authenticated idempotent checkout creation, pins a single-purchase plan and includes tax within the stated price. No live financial operation was performed during validation.
- PDF exports now embed complete Inter fonts. A real user export had correct extractable text but missing visible glyphs with font subsetting; corrected user and browser-generated PDFs were rendered and visually reviewed.
- Cards now shows spend chart + compact activity above the full cards table. Clicking a row uses the official details drawer. The native demo activity fixture ignores its requested card filters; production filtering needs authenticated validation.
- Reproduced the exact `this handle was torn down` page error during Fast Refresh, then confirmed it after a fresh load in the user's existing Opera tab. The stack points to React passive-effect reconnect using a destroyed Wallet namespace. A full-reload-only workaround was insufficient. The final fix owns the React lifecycle around the official SDK, recreates Wallet/card subcontrollers after disconnect, and blocks use after unmount; iframe internals are unchanged.
- Local checks include 25 tests (including disconnect/reconnect regressions), TypeScript/build, desktop/320px/390px browser flows, invoice reload/re-export, repeat drawer opens, and the existing Opera session. Earlier reproduction logs are in `output/playwright/lifecycle-before.log`; final lifecycle evidence is in `output/playwright/lifecycle-provider.log`.

## Home and Cards layout follow-up

Primary navigation is now Home / Cards / Payments / Invoices / Reports. Home uses full-width total balance, content-height holdings (including BTC and gold), official actions, then activity. Cards pairs spending with the official WhopCard preview, followed by the cards table and the simpler activity Element. Its See all link opens full card transactions. The official demo card uses its own fixture ID; production uses the selected account card ID.

Verification has no supported per-capability Ads visibility option. Ads remains visible; hiding all capabilities would also hide relevant banking/card capabilities.
