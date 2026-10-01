# Customer experience review — September 22, 2026

Inspection and proposals only; no app behavior changed during this review.

## Recommended navigation

| Destination | Contents | Nested destinations |
| --- | --- | --- |
| Home | Total balance, money actions, holdings, six recent activities | Holding detail; official Deposit, Send, Convert and Withdraw overlays |
| Cards | Spend chart and selected card, cards list, six recent card activities | Card drawer, create card, card transactions |
| Payments | Received / Payment links / Invoices tabs | Payment detail, create link, invoice editor and saved documents |
| Reports | Financial summary / Activity tabs | Filtered activity and CSV export |

Settings stays in the profile menu. Invite users stays a copy-link utility; the blueprint CTA stays in the sidebar footer. Keep Home as the name. Payments is the parent because invoices are one way of collecting a payment, while payment links and received payments also exist independently.

Suggested URLs: `/payments`, `/payments/links`, `/payments/invoices`, `/payments/invoices/new`, `/reports`, `/reports/activity`. Redirect existing `/invoicing`, `/invoices`, and `/report` URLs. Preserve filters in URLs and drafts across subtab navigation; grouping should not recreate retained Elements on every switch.

## Priority 1 — remove ambiguity and broken paths

1. **One Reports activity destination.** The page currently mounts both balanceReport and reportActivity. Pressing View activity in balanceReport opens its own activity view, leaving the second complete activity table underneath. Remove the permanently appended table. Use an Activity subroute/tab, pass the exact date/currency/direction/type filters, and preserve browser Back. The official balanceReport exposes activityRequested; reportActivity accepts filters. Keep only the relevant view visible. Account for the report's own inline activity state when returning to Summary so two competing navigation states do not remain.
2. **Home needs a bounded preview and See all.** Home currently has neither maxItems nor onSeeAllRequested; Cards sets maxItems to six and wires See all. Give Home the same six-item preview and route its See all to Reports → Activity. Holding previews should carry their currency. Full filtering and pagination belong on the history page.
3. **Group collection tools under Payments.** Received, Payment links, and Invoices should be separate subtabs. The payment-link list is currently underneath a 20-row payment table; on mobile the links section is very far down. Each subtab gets its own primary action. Received gets an optional Create payment link action; Links gets Create payment link; Invoices gets New invoice.
4. **Repair local payment detail before styling it.** Clicking the first payment (pay_demo001) opens “This payment could not be loaded.” The official detail fixture returns pay_demoDetail for biz_demo, while the host requests the table ID under biz_XXXXXXXXXXXX. The Element deliberately validates both identity fields. Fix the design-mode fixture/integration without weakening production account validation. Do not treat this as evidence that live payment retrieval fails.
5. **Preserve card top-up context.** Top up card balance in the card drawer opens the general Deposit page, whose Back button returns Home. Return to Cards/the selected card instead, and verify whether the funding operation actually funds the card balance or the wallet balance. The label must match that behavior. Do not promise card funding based only on navigation to Deposit.

## Priority 2 — make everyday pages easier to use

- **Raise Home actions.** In the inspected layout the action row started around y=928 at 1440×900 and y=913 at 390px wide. Proposed order: total balance → actions → holdings → recent activity. This changes the previous requested order deliberately to make the common tasks easier to reach. If actions must be visible immediately, put them before the chart; merely moving above holdings is an improvement, not a guarantee for every screen height.
- **Keep card history specialized.** Cards' See all currently opens the full card-transactions page, which has card, cardholder and status filters. Keep that nested under Cards. Reports Activity is the all-money ledger. Clearly label the destination “Card transactions”; the current transaction page still has the generic Cards heading. There are currently two entries to the same page: header Transactions and feed See all. Retain the feed entry and remove the redundant header link unless frequent usage justifies it.
- **Define the featured card.** The top card preview should clearly represent the selected/default card. Selecting a row should update that card and open its detail drawer; closing the drawer should retain the selection. The official mock preview currently uses a different fixture from the cards table, so this continuity cannot be judged from the present data.
- **Give Invoices a document list.** Keep the existing editor, but make saved invoices a simple list above/alongside New invoice rather than only a select control. Useful fields: invoice number, recipient, total, issued/due date, Draft or Generated. Actions: edit draft, download PDF, copy payment link. Keep the current browser-only storage message. Do not show Paid, Overdue or Sent as verified states without payment reconciliation/delivery tracking.
- **Make invoice generation completion explicit.** A generated document should show Download PDF and Copy payment link as obvious separate actions, plus New invoice. The draft currently contains a button-looking “Preview payment link” span that does nothing; use explanatory text or a genuine PDF preview instead. Clarify that generating a PDF does not email it to the customer.
- **Consistent detail navigation.** Use visible, descriptive Back labels/breadcrumbs: Home → Bitcoin, Cards → Card transactions, Payments → Payment details. Verification launched from Settings correctly returned there in this pass; preserve that behavior for task entry points too. Avoid the generic Back to previous task label when the destination is known.
- **Settings scope.** Keep account verification and capability status here. Sign out already exists in the profile menu; the duplicate large settings action can be removed. Avoid adding operator controls to the consumer experience. Ads cannot currently be hidden alone through the supported capabilities API.

## Official Element limits and mock-data issues

- **Payments columns:** the mobile table shows Amount, Status and an empty Product column before customer/date information. Prefer Customer, Amount, Status, Date, with optional columns in settings. The current Element does not expose host-controlled initial column order/visibility props; it does have native column settings behind showActions. Check those controls first. A different default column set requires upstream support, not brittle CSS hiding or replacing the financial table.
- **Report labels:** the activity table displays raw identifiers such as payment_gross and platform_balance_transfer_incoming. Customer-facing labels should be Payment and Transfer in. This is rendered inside the official Element; request an upstream labeling fix if no supported formatter becomes available.
- **Holding context:** clicking Bitcoin produced `/balance/cbBTC` but the breakdown said USD balance. The demo defines its own currency controls/defaults. Verify currency propagation and fix the local demo configuration before evaluating asset-specific actions; live correctness is unproven.
- **Inconsistent fixtures:** total balance, holdings, reports and action balances differ; Cards activity includes transfers/deposits despite supplied card line-type filters. Settings shows Whop Card Pending while Cards is usable. Use coherent scenarios if supported, or clearly document the sample limitations. Never infer live balances or eligibility from these fixtures.
- **Element console issues:** this pass recorded invalid table markup warnings and negative SVG rectangle heights in official Element bundles. No full-page torn-down-handle screen was observed, but console cleanliness is not yet achieved. Capture upstream reproductions instead of masking errors.
- **Narrow layouts:** at 390px there was no document-wide horizontal overflow on the five primary pages, but table information remains difficult to scan. Earlier 320px screenshots also show a cramped card-chart period control. Test Element internals visually; document-width checks alone do not prove responsiveness.

## Coverage and evidence

Clicked: landing Sign up → local Home; Home Deposit/Send/Convert/Withdraw open and close; Bitcoin holding detail; activity detail open and close; Cards See all → card transactions → browser Back; cards-table row → detail drawer → Top up; card creation and spending-limit toggle; Payments row → error → breadcrumb return; payment-link creation form and Cancel; invoice editor; Reports View activity and Export CSV initiation; profile Settings → verification → Back; mobile navigation through all five destinations; Sign out → landing.

Report export reached Preparing your CSV file; download completion was not verified. No real card issuance, money movement, verification submission, customer message or live payment was performed. Invoice PDF generation was not repeated in this pass. Empty/new-account, declined, expired-session and interrupted-payment scenarios remain to be exercised deliberately before production.

Snapshots/screenshots are in `output/playwright/audit-*`, including reports duplication, payment detail failure, card top-up destination and mobile layouts. Sources checked: overview.tsx, cards.tsx, reports.tsx, invoicing.tsx, payment-detail.tsx, invoices.tsx, settings.tsx, balance.tsx, plus the corresponding official Element implementations in the sibling Whop checkout.

## Proposed implementation order

1. Navigation and routing: Payments subtabs, Reports Activity subpage, history links and return destinations.
2. Fix payment-detail demo and holding/card context; retain account security checks and official iframes.
3. Bounded Home/Card previews, action placement, invoice document list and completion state.
4. Verify desktop/narrow/mobile, browser Back, filters, draft retention, keyboard dismissal and relevant empty/error states.
5. Theme the resulting stable page structure. Keep unsupported Element improvements separately tracked.

## Implemented follow-up

The approved flow cleanup is implemented locally. Home keeps total balance → holdings → actions
→ six recent activities, per the user's updated preference. Payments now has Payment history,
Payment links and Invoices with consistent subsection headings and primary actions. Only the
current tab is active; keyboard focus remains visible. Invoice documents have Draft/Generated
states and support reopening, downloading and copying their payment link.

Reports uses one Summary or Activity Element. Home and holding previews link to Activity, and
report category drilldowns carry currency, date range, direction, line types and resource ID.
Card top-up returns to Cards with the selected card context; card transactions have their own
heading and wired transaction detail. Bitcoin now receives a correctly scoped Wallet. Sample
payment details use the official standalone fixture with an explanatory notice.

The official payment table's column chooser is enabled, including its Status toggle. Its default
columns cannot be configured through the current API. Unsupported iframe changes, Ads row hiding,
raw report enum labels and inconsistent card demo fixtures remain upstream limitations.

Validation: 31 unit tests, TypeScript checks, local browser flows for report navigation and filters,
payment details and column visibility, invoice draft retention/PDF generation/reopening, card
return navigation, legacy redirects, and 390/320px host overflow. No real money moved. Browser
page-exception checks are separate from existing official Element console warnings.

Later preference: Home now uses the full official Activity Element with filters and infinite
scrolling, replacing its six-row preview and See all link. Holding and Cards previews are unchanged.
