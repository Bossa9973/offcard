# Visual system

The host and official Elements share a dark, neutral palette. Keep financial interfaces in
official iframes; style them through supported appearance options. Currency flags, asset icons,
and card artwork retain their native colors.

## Where to tune

| File | Responsibility |
| --- | --- |
| `src/ui/tokens.ts` | Colors, spacing scale, typography, radii, control height, motion |
| `src/ui/components.css` | Shared host buttons, tables, forms, and responsive component rules |
| `src/ui/parts/ui.tsx` | `Button`, `buttonClassName`, and growing `AutoTextarea` |
| `src/ui/theme.ts` | Official Element theme, variables, and supported class overrides |
| `src/ui/styles.css` | Page layout, Tailwind semantic mappings, and chart-only compatibility rules |

Tokens are emitted in the document head for the first render. Tailwind v4 utilities such as
`bg-canvas`, `bg-panel`, `text-content`, `text-muted`, and `border-line` reference those tokens.
Layout-specific classes remain useful; avoid adding per-page button colors or radii.

## Buttons and forms

```tsx
import { Button, buttonClassName, AutoTextarea } from "./ui";

<Button variant="primary" onClick={save}>Save changes</Button>
<Button variant="secondary" onClick={cancel}>Cancel</Button>
<Button variant="ghost" onClick={back}>Back</Button>
<a className={buttonClassName("secondary")} href={url}>Open payment link</a>
<AutoTextarea value={memo} onChange={(event) => setMemo(event.target.value)} />
```

Use the shared class helper with existing Frosted controls to preserve their dialog behavior
and semantics. Primary actions are white; secondary actions use the raised grey surface;
ghost actions remain quieter. Buttons share a 44px minimum height, focus ring, disabled state,
and hover treatment. A regular `Button` defaults to `type="button"`; use `type="submit"` for
form submission. Growing textareas keep addresses and descriptions visible without nested
scrollbars. Invoice fields use larger touch targets at narrow widths.

## Responsive Elements

The host observes actual main-content width. Below 480px, supported appearance rules stack
card rows and the chart period control. Appearance changes call the existing handles'
`update()` methods; they must not recreate an iframe or change its React key. The wallet
provider merges rules per selector so a local size override preserves shared colors.

The SDK sanitizes appearance CSS. Not all browser-valid declarations are accepted, including
several flex values and SVG properties. Verify changes in the rendered iframe, not just the
source object. Keep selectors rooted in supported `whop-*` hooks. Current compatibility
selectors that depend on child structure live together in `theme.ts` and need rechecking on
SDK upgrades.

## Charts

Home, Cards, and Reports share `chart-height` (240px), `chart-value-size` (32px),
Inter typography, black surfaces, and panel borders. Appearance rules in `theme.ts`
align headings, range controls, and Reports chart framing. Cards retains a scoped
neutralizing filter; its gridline and label opacity compensate for the brightness lift.
Keep Reports series green/red and keep the original chart interactions and data.

## Known boundaries

- Native chart themes override some series colors. Chart-only host filters currently make
  Cards neutral. Home uses its native neutral accent line. Reports keeps its native green incoming and red
  outgoing series so direction remains clear. The filters affect the whole chart frame,
  so they are an approximation; changing chart tokens alone cannot fully restyle those SVGs.
- Payment history uses the official table and horizontal scrolling when narrow. Its column
  chooser is available, but this SDK has no initial column-visibility option.
- The invoice PDF has its own white-paper layout; host dark styling must not tint exports.
- Sample Elements use independent fixtures. Visual standardization does not reconcile their
  names, balances, or activity records.

## Verification

Check Home, Cards, all Payments tabs, Reports, Settings, and their dialogs. Include 320px,
390px, 768px, and desktop widths. Confirm keyboard focus, no outer horizontal overflow,
readable amounts, growing text fields, retained iframes after resizing/navigation, and a
successful sample invoice export. Run `pnpm typecheck`, `pnpm test`, and `pnpm build` before
shipping. Browser QA screenshots and scripts for this pass are in `output/playwright/`.

## Asset detail pages

`src/ui/asset.css` styles the Bitcoin/Gold page grid and read-only market chart.
`AssetPriceChart` renders Whop public price history with accessible keyboard scrubbing,
range controls, cache reuse, and explicit loading/error/retry states. `AssetScreen`
composes the official inline Convert, balance breakdown, and currency-filtered Activity
Elements; range changes and resizing must preserve the Convert iframe and its input.
