# Neobank

Live at **https://neobank-elements.whop.app**

A neobank built from [Whop Elements](https://docs.whop.com/elements/latest). The `wallet`
namespace supplies the balance, activity, cards, deposit, send and withdraw surfaces; this app
supplies the chrome, the credential, and the one data layer an element does not fetch for
itself.

TanStack Start on Cloudflare Workers, deployed to `*.whop.app` with the Whop CLI.

## Getting started

### Local design preview (no login or API key)

```bash
pnpm dev:design
```

Open **http://localhost:5180**. The homepage's **Sign up** button opens a sample
neobank account immediately. The layout, routes, and styles are the real app;
Elements use their own sample-data fixtures from the local Whop monorepo.
The default preview is Alex Morgan with one customer account, **Alex’s account**.
The profile menu offers **Settings** and **Sign out**; sign out returns to the homepage.
**Home** in the header returns to the current account dashboard.

The app uses a navigation drawer below 64rem and sizes layouts against the main
content container. Home stacks full-width total balance, content-height holdings, a compact
Deposit/Send/Convert/Withdraw row, and activity. A larger gap separates the action row from
Activity. Cards stacks its summary at narrow container widths. Keep iframe Elements mounted across width changes; use
their supported appearance options and built-in responsive behavior. Check narrow
desktop windows as well as phone widths when changing spacing or typography.

The launcher expects `../whop-monorepo` beside this checkout; set
`WHOP_MONOREPO_PATH` to use a different location. It reuses Elements on port 8788
or starts `mise exec node@22 pnpm@10.12.4 -- pnpm elements:dev --port 8788` in
`frontend/apps/web`. Install that workspace's dependencies first if needed:
`mise exec node@22 pnpm@10.12.4 -- pnpm --filter @whop/web... install --frozen-lockfile`.
The initial Elements build can take a few minutes. App edits hot reload; Element
edits rebuild and reload. Restart Elements after editing its framework/codegen.

Local `/api/*` requests are answered by `dev/design-api.ts`, including sample
accounts, card approval/team members, and fees. App-created entities and fee changes
last until the design server restarts. Elements have their own fixtures, so simulated
app changes do not create corresponding records in Elements. Checkout submission
shows a preview message and does not create a real link.

The Vite design mode serves Elements through `/__elements/` on the app's own origin
to share one live-reload connection across the embedded frames. The signup shortcut
and API fixtures are enabled only by `vite serve --mode design`; **all builds,
including `vite build --mode design`, keep real authentication**. `pnpm dev` continues
to use the normal authenticated flow.

### Authenticated development

```bash
pnpm install
pnpm dev
```

Note `pnpm run deploy`, not `pnpm deploy` — the latter is a pnpm builtin that shadows the
script and fails with `ERR_PNPM_CANNOT_DEPLOY`.

`vite dev` has no Whop edge in front of it, so local runs need a company API key:

```bash
echo 'WHOP_API_KEY=your_key_here' > .dev.vars
```

Deployed, that variable should be **unset** — the hosted runtime injects the deployed app's
business key into parent-account API requests. No `NEOBANK_PARENT_KEY` secret is needed.
The local company key must belong to the neobank parent and include `company:create_child`
along with the account and company read permissions used by the entity picker.
`whop apps dev` injects `WHOP_API_KEY`, but when the CLI is signed in with user OAuth,
that token is user-scoped and cannot resolve `/accounts/me` as the neobank parent.
Use a parent business API key for local entity operations; hosted deployments use automatic injection.

## How the credential works

Users sign in with Whop (OAuth 2.1 + PKCE), and the app acts on their behalf. Elements talk to
`api.whop.com` directly rather than through this app, so each needs a scoped token:

- `/api/auth/login` starts the flow. The PKCE verifier and state go into an **httpOnly** cookie,
  so a stolen authorization code cannot be redeemed from anywhere but this server.
- `/api/auth/callback` exchanges the code and stores the tokens httpOnly too. An OAuth token the
  browser's JS can read is one XSS away from being someone else's withdrawal.
- Each entity is authorized as its own company-scoped OAuth grant. Its refresh token is stored in
  a separate httpOnly cookie, so switching accounts cannot reuse a personal token for a company
  or replace the personal session needed to switch back.
- `POST /api/token` mints a short-lived element token from the user's OAuth token. The browser
  names an account and a **purpose** (`read`, `cards`, `deposit`, or `send`), never a scope list — a client
  that could name its own scopes could mint itself money-out access. Refusals come back as 403
  `insufficient_scope`.
- Access tokens last an hour and refresh tokens rotate on every use, so the route refreshes
  within a 5-minute margin and always stores the new refresh token.

**Why OAuth rather than the app's own key.** The key the hosted runtime injects is minted through
the AI-agent path, which rejects every action flagged `disallow_ai_agent` — and
`payout:withdraw_funds` is one. No hosted Whop app can send money with it. That flag does not
apply to user OAuth, so a user consenting to `payout:withdraw_funds` on their own account is the
supported way to turn sending on.

User OAuth calls set `x-whop-inject-key: none` so the hosting edge cannot overwrite the user's
bearer with the app's restricted company key. Parent-account requests in `/api/entities`
allow injection instead: parent discovery, company listing, operator account listing, and
child-account creation use the deployed app's business key. Viewer membership and operator
authorization checks still use the viewer's OAuth token.

## What each surface needs

| Surface | Element | Credential |
| --- | --- | --- |
| Balance + holdings | `BalanceElement`, `ListElement` | `read` token |
| Activity | `ActivityElement` | `read` token |
| Cards | `CardsElement` | `cards` token |
| Add money | `DepositElement` | `read` token for personal accounts; session auth for entities |
| Send | `SendElement` | `send` token |
| Withdraw | `WithdrawElement` | user OAuth via `GET`/`POST /api/withdraw` |

`SendElement` needs `payout:withdraw_funds`. Recipient search additionally needs
`company:authorized_user:read` and `member:basic:read` for entity accounts. The app obtains all
three through user OAuth and mints a short-lived `send` token; an older grant prompts the user
to sign in again and approve the expanded scope. Claim links are enabled for personal accounts.
Entity claim links require `airdrop_link:manage`, which is not user-grantable through OAuth, so
the app leaves that action disabled when an entity is selected.

`WithdrawElement` is the same story on the write path — `POST /payouts` is
`payout:withdraw_funds` — and it also needs `payout:destination:read` to list saved
methods. Both come from the user's OAuth grant, not the injected company key. Entity
withdraws use that entity's own OAuth cookie, the same way `/api/token` does.

## WithdrawElement is controlled

Every data prop on `WithdrawElement` is host-supplied — it makes no API calls of its own. That
is why this app still has a REST layer. `GET`/`POST /api/withdraw` authenticate as the signed-in
user (`x-whop-inject-key: none`), use `user_id` for a personal account and `account_id` for an
entity, map the REST payout method onto the element's `WithdrawalMethod`, and turn
`onWithdrawalRequested` into `POST /payouts` with speed and the bank-warning ack.

Wired: personal and entity balances, saved methods, live quotes, limits, submit, in-flight,
bank-warning and error states.

Not wired yet, and visible as missing in the UI:

- **Adding a payout method.** `supportedMethods` is `GET /payouts/supported_methods`, and
  `onAddMethodRequested` / `onPlaidLinkRequested` have nothing to answer with until that
  call and Plaid Link are hosted here.
- **Rename and remove.** `onRenameMethodRequested` / `onRemoveMethodRequested` map to
  `PATCH`/`DELETE /payouts/methods/:id`.

## Deploying

The app is already registered (`app_EtrVTHbuydoOk6`, route `neobank-elements`), so shipping a
change is two commands:

```bash
pnpm exec whop auth login
pnpm run deploy
```

Deploy builds, typechecks, uploads and promotes in one step. Routes are global across Whop —
`neobank` was already taken, hence `neobank-elements`.

## Theming

The app uses an explicit dark theme for both the host and official Elements. A shared token
source drives host CSS variables, Tailwind semantic utilities, and iframe appearance rules.
See [Appearance](#appearance) and the [design-system guide](docs/design-system.md).

## Notes

Elements load from `https://cdn.whop.com/elements/amber/elements.js` through the
`@whop/elements` loader. Keep `@whop/elements` and `@whop/elements-react` on the same
stable version (currently `1.0.0`). If you put this behind a Content Security Policy, allow
`https://cdn.whop.com` in both `script-src` and `frame-src`.

The stable packages still use hosted iframes; upgrading does not enable direct rendering.

### Payment links

On an entity's Payments page, **Create payment link** opens a dialog for a title,
description, amount, currency, billing interval, and optional HTTPS redirect after
payment. It creates a reusable hosted checkout link through
[`POST /checkout_configurations`](https://docs.whop.com/api-reference/beta/checkout-configurations/create-a-checkout-configuration)
with an inline plan attached to a hidden product; the returned `purchase_url` is available to copy or open.
One-time payments are the default. Recurring links charge the entered amount
immediately and every 30 or 365 days thereafter.

Creation uses the viewer's OAuth token, scoped to the selected entity, with
`checkout_configuration:create`, `plan:create`, and `access_pass:create`. Existing sessions are prompted
to reconnect when these permissions are missing. The dialog retains the current
payment-link draft and retry identifier in per-entity session storage across reconnection.
The endpoint pins API version `2026-09-13`, validates input and the returned hosted
URL, and uses separate idempotency keys for product and checkout creation so retries
recover both resources. Products and plans use `hidden` visibility to match
dashboard-created checkout links and appear in the default Payment links list.

Run `pnpm test` for checkout validation and mocked API tests. For a clean checkout,
run `pnpm build` before `pnpm typecheck` to generate the route tree.

## Element loading and navigation

Primary navigation is Home, Cards, Payments and Reports. Settings is in the profile menu.
Payments opens Invoices, with tabs ordered Invoices, Payment links and History. Reports contains Summary and
Activity; only one report Element is mounted at a time. Report drilldowns preserve supported
filters in the Activity URL. Old invoicing, invoices and report URLs redirect to these routes.
Home keeps total balance, holdings, actions and recent activity in that order. Home uses the full official activity feed with filters and infinite scrolling. Holding
previews show six activities and link to Reports Activity with the currency preserved.
Deposit, Send, Convert and Withdraw launch from Home's official Actions Element. The old
money-task URLs remain available with their existing verification gates. Native action overlays
and inline pages do not share frame instances; warming the latter does not preload the former.
See [the customer flow audit](docs/customer-flow-audit.md) for the remaining SDK integration limits.

The official SDK loads asynchronously with its resource hints. Screen retention and preloading
stay entirely in the host app; no Element source, hosted URLs, or internal requests are patched.

- Overview and approved Cards stay mounted for up to five minutes after use. Payment history
  and links remain mounted for the account session, preserving native table settings while navigating.
  Reports retains its active view; switching Summary/Activity replaces its single Element.
- Compatibility Deposit and Send pages stay mounted for the account/token session. Deposit and its activity feed load
  together. These money screens use a separate official Wallet instance so their activity slot and
  the Overview action overlays cannot collide.
- Withdraw keeps its frame for up to five minutes after a visit. Hover/idle work prefetches its
  readiness check, but does not open its transaction form before the user visits.
- Settings stays mounted for up to one minute. Capabilities, fees and information-request checks
  start independently; Sign out is immediately available.
- Hover (120ms) and keyboard focus warm screens. After two seconds, an idle queue warms
  Cards, Payments, Reports, Settings and withdrawal readiness, one at a time. It pauses for
  input and hidden tabs, and is disabled on Save-Data, 2G and devices with at most two CPU threads.
- Inactive frames are hidden, inert and parked offscreen at the normal content width. This keeps
  charts and tables from resizing from zero width on each tab change. Timers bound retained memory.

Data freshness is separate from iframe lifetime. Send and Withdraw use their official `refresh()`
actions on return; Cards, Reports, payments and checkout links refresh on activation/focus after
15 seconds. Deposit rails refresh after five minutes or an in-app invalidation. Overview balance
Elements use their own official 30-second polling; successful in-app money changes also reset
Overview. Verification and fee changes invalidate affected data. Completed Send/Withdraw flows
reset when hidden, while unfinished drafts survive ordinary navigation.

Account changes, sign out and token rotation release the account's frames. Detail/creation flows
release conflicting browsing slots, and verification clears Settings/Withdraw. Readiness reads
are scoped to the current account/token, deduplicated in memory for ten seconds, and do not block
route navigation. Backend authentication, payout availability and confirmation remain authoritative.

The same loading policy applies to design mode and the production blueprint. Local sample-data
measurements do not measure live Whop API latency. Keeping more frames uses more memory and some
Elements continue their official polling while hidden; the bounded cache and staggered queue trade
that cost for faster navigation.

## Invoice documents and Cards

Invoices includes a browser-local document list with Draft and Generated states, download and
copy-link actions, and a compact monochrome Inter editor with sender/customer details, line items, discount,
tax, dates and memo. It creates an amount-matched, single-purchase Whop checkout and downloads a
PDF with a clickable payment link. The server recalculates the total in cents and retries reuse
the same idempotency key. Generated invoices are immutable snapshots; downloading again reuses
the payment link. Invoice creation refreshes the payment-link list, not the wallet's balance.

Drafts and up to 100 generated invoices are stored per account in this browser's local storage.
They are not synced or backed up to a server, and invoice paid/overdue status is not tracked.
Design mode creates clearly marked sample PDFs and non-payable local preview links. Live checkout
creation still needs the customer's OAuth grant; it has only been tested with mocked API responses.
PDF fonts are embedded in full because subsetting these Inter files dropped visible glyphs.

Cards pairs the official spend chart with WhopCard, followed by the cards table and a simple
activity feed. Table rows open the official card-details drawer. A separate Wallet hosts the
activity feed with card line-type filters so it cannot take Home's activity slot. Live previews
resolve a card ID through an authenticated server route; the local preview uses WhopCard's
own demo fixture because it differs from the table fixture. The SDK's local activity demo fixture ignores those filters and contains general
account activity; live card-only filtering is not proven by that fixture.

The app owns the React lifecycle around official `whop.wallet.create()` handles. React can
clean up effects and then reconnect the same tree with its refs still intact; the pinned React
Wallet wrapper reused a destroyed handle in that case. Our provider releases the old handle,
then creates a fresh official handle on the next active mount. Card subcontrollers follow the
same rule, and stale calls after unmount cannot resurrect an account. Normal tab retention and
CSS/source hot reload remain enabled.

Payment history hides status summary tabs and tracking controls. The official native table
settings can hide the Status column; the current Element has no initial column-visibility prop.
Design-mode payment details use the official standalone demo fixture with a visible notice;
real payment details continue to use the selected account and payment ID.

## Appearance

The app is forced dark with a neutral grey accent. Tune colors, typography, radii and control
sizes in `src/ui/tokens.ts`. `src/ui/components.css` defines shared host controls, while
`src/ui/theme.ts` maps those tokens to official Element appearance settings. Tailwind semantic
utilities and the shared `Button` component use the same values.

Currency flags, asset icons and card branding retain their colors. Narrow chart-only filters
neutralize native SVG colors or lift their contrast where the official appearance API cannot
reach them. The invoice editor follows the dark shell; exported PDFs retain white paper.
See the [design-system guide](docs/design-system.md) for component usage and SDK boundaries.

### Asset pages

Bitcoin (`btc`/`cbBTC`) and Gold (`xaut`) click-throughs use a host-rendered SVG
price chart backed by Whop's public `stats/market_prices` endpoint. The allowlisted
`/api/market-prices` proxy supports 1D/1W/1M/1Y, caches for 60 seconds, validates
points, and never forwards account IDs, cookies, or tokens. The chart is informational;
quotes, fees, review, and execution remain inside the official inline Convert Element.
Holdings and unlimited asset-filtered activity also remain official Elements.

Design mode uses live public market prices alongside official sample wallet data.
`dev/asset-demo.ts` adapts the served Activity demo fixture's currency filtering,
without changing the monorepo or production Elements. It is excluded from production
builds. The current sample has a Bitcoin activity row and no Gold activity. Sample
holdings and Convert balances are independent fixtures, so they may differ.
