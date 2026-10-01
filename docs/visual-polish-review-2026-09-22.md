# Visual polish review — September 22, 2026

Read-only review of the local design build. Inspected Home, Cards, all three Payments tabs, invoice editor, Reports, Settings, Deposit overlay and payment-link creation dialog. Desktop viewport: 1440 × 1000; mobile: 390 × 844, plus Cards at 320 × 740. Screenshots are under `output/playwright/polish-*.png`. No application code changed during this review.

## 1. Unify surfaces and charts first

- Cards chart/table sit on near-black while Activity uses a visibly lighter panel. Home uses another apparent brightness because its chart iframe has a brightness filter. Adjacent sections should share a panel background, border, radius and padding treatment.
- Home's line is bright, Cards bars are medium grey, and Reports still uses green/orange. Define a bright neutral series, a secondary grey series and consistent grid/axis tones. Preserve currency flags, asset logos and card artwork in their original colors.
- Implement through supported Element appearance options and host wrappers. Avoid whole-page desaturation. Some native chart internals may require an SDK change; do not promise that every series can be controlled through the current appearance API.

Evidence: `polish-home.png`, `polish-cards.png`, `polish-reports.png`.

## 2. Fix small-screen information loss

- Home chart showed only its baseline/endpoint in repeated mobile captures, including a settled capture after revisiting. Desktop showed the full line. Investigate sizing/data/render behavior before reducing its height; root cause is not established by this audit.
- At 320 px, Cards' period picker is clipped and card names are nearly lost. At 390 px names still truncate heavily. Prioritize card name/last four/spend over repeated cardholder initials, using supported native responsive options. If unsupported, track as an Element limitation rather than silently hiding table internals.
- Payment history initially exposes Amount, Status and Product on mobile; customer/date are offscreen. It needs better column priority and a discoverable horizontal-scroll affordance. Current SDK column controls may limit the default ordering we can set.
- No outer horizontal overflow was measured on the four 390 px pages; this does not mean the content inside the iframes is usable.

Evidence: `polish-mobile-home-settled.png`, `polish-mobile-cards.png`, `polish-cards-320.png`, `polish-mobile-payments.png`.

## 3. Tighten Home while preserving the chosen order

Keep total balance → holdings → actions → infinite Activity. At the desktop review size, the actions start roughly 930 px down the page. Reduce chart/panel vertical space, top padding and holdings row spacing so primary money actions are visible earlier. Use separate mobile chart sizing rather than retaining desktop proportions. Do not turn Activity back into a preview with See all.

## 4. Establish one control hierarchy

New invoice/Create payment link in page headers are white, while Create virtual card and the payment-link dialog's primary action are medium grey. Establish white filled primary actions, dark-grey secondary actions and quiet text/outline utilities. Use consistent heights, radii, icon sizes and focus styles; distinguish disabled controls from enabled grey buttons. Preserve meaningful failure/disabled state communication.

Evidence: `polish-payments-invoices.png`, `polish-cards.png`, `polish-payment-dialog.png`, `polish-deposit-mobile.png`.

## 5. Strengthen typography and spacing consistency

The small shell navigation feels disconnected from larger content headings. Use a shared type scale for navigation, page headings, section headings, body and metadata, with white primary text and readable secondary grey. Align panel headings/table content/toolbar edges. Invoice editing shifts the Payments title and tab stack upward relative to the library; keep the common page header position stable.

## 6. Make Payments look like a finished product

- Payment links currently use long raw URLs as their main row label. Store/display a human-readable title, with a shortened domain/link as secondary text and a copy action.
- History remains a dense merchant-oriented table with Product/Plan and many statuses. Simplify default columns if the official SDK permits; otherwise retain its column chooser and expose the limitation clearly in engineering work.
- Match table padding and row treatment across the host-owned invoice/link lists and the native history Element as far as supported.
- Keep the existing Invoices → Payment links → History order.

## 7. Refine invoice editing

Keep Inter, compact desktop sizing and white PDF output. The editor currently shows textarea scrollbars/resize grips and uses very subtle borderless inputs beside strongly outlined number/currency fields. Make editable fields visually consistent; auto-grow textareas and avoid internal scrolling for ordinary addresses. On mobile, reduce unnecessary gaps and keep the total/generate action conveniently reachable without overlaying fields. Compress repeated payment-information copy into one useful sentence.

Evidence: `polish-invoice-editor.png`, `polish-invoice-mobile.png`.

## 8. Use coherent sample data for design judgment

Home's total and holdings do not reconcile; Alex's account, Timofey's featured card and Adam's table cards are mixed fixtures. Cards Activity also shows generic wallet deposits/transfers. These are mock issues, not evidence that real account data is wrong. A single coherent fixture set is necessary to judge the product convincingly.

## Scope and next verification

This pass prioritizes appearance and visible responsiveness. It does not certify live payment behavior, real-device keyboard behavior, every drawer/hover/error/loading state, or full accessibility. The next implementation pass should start with surfaces/charts/control hierarchy, then fix mobile layout and chart rendering, then refine density and copy. Verify loaded native iframes at 320, 390, 768 and 1440 px after changes, including hover/focus/disabled states and tab switching. Preserve iframe retention and the repaired handle lifecycle.
