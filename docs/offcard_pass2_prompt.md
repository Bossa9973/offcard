# Agent Prompt, Pass 2: Off-Card landing page refinement

You already did a first pass on this React + TypeScript landing page using the Moneta design system (`moneta_design.md` and the earlier refactor prompt). The structure is now right. This pass is about **craft**: textures that are too loud, dead space, one broken asset, a few layout collisions, and typography scale.

I reviewed fresh screenshots of the current build. Everything below is an observed problem with a specific fix. Do them in the order given. Do not change copy except where stated.

---

## 0. Keep exactly as is (do not regress)

- Dark → white → dark band rhythm (dark hero and features, white pricing and FAQ, dark CTA and footer).
- Pricing section: three cards, gradient featured card, aligned CTAs, footnote.
- FAQ: two-column layout with working accordion and chevrons.
- Treasury tile: gradient fill, big "4.8%" with superscript footnote marker.
- Multi-currency tile: balance rows with currency chips.
- Nav and wordmark placement, white pill primary buttons, 28/20/12px radius scale, no shadows and no glow, no pixel font.
- All tokens from the design file.

---

## 1. P0: Broken or clearly wrong

### 1.1 Logo asset has a visible background box (footer, check nav too)

**Observed:** In the footer, the "off-card" logo sits on a lighter grey rectangle, so the asset is not transparent (or an `<img>` has a background/padding). It looks like a pasted screenshot.

**Fix:**
- Replace the mark with a **transparent SVG** (preferred: inline React component using `currentColor` for the wordmark and a `linearGradient` using `--primary`/`--lumen` for the ring on dark backgrounds). If only a PNG exists, remove the background properly (alpha PNG) or recreate as SVG.
- Ensure no `background`, `mix-blend-mode`, or `filter` is applied to the logo element or its wrapper.
- Use the same single `Wordmark` component in nav, footer, and any card face. Mark and wordmark vertically centered, gap 8px, mark height equals the wordmark x-height × 1.6.

**Accept:** On `#000` the logo shows no rectangle at any zoom level.

### 1.2 Hero card: stripes destroy the text, and the back card leaks text

**Observed:**
- Dark card stripes are high-contrast, almost white, and run straight through "$5,750.20", the "Current balance" label, and the card number. The label is unreadable.
- The card behind it shows clipped fragments ("rd", "/25") poking out the right edge. It reads as a bug.
- The same stripe texture is also overlaid on the light cards in the bento tile, turning the lime-lavender gradient into a grey-streaked mess.

**Fix, `Pinstripe` (dark card only):**
- Stroke width `0.5 → 1.1px` (currently looks 2px+). Opacity range `0.10 → 0.42`. Colors only from `--stripe-slate` and `--stripe-olive`. **No white or near-white lines.**
- Add a **mask so the top-left text zone stays clean**, with stripes fading in toward the lower right:

```css
.pinstripe {
  -webkit-mask-image: linear-gradient(135deg, transparent 0%, transparent 30%, #000 72%);
          mask-image: linear-gradient(135deg, transparent 0%, transparent 30%, #000 72%);
}
```

- Keep the soft olive radial glow in the lower right *inside* the card (opacity ≤ 0.3).
- Line length varies 120 → 480px, never full card width, so it reads as brushed speed lines, not hatching.

**Fix, light card:**
- **Remove the pinstripe entirely** from the light variant. It is the pure `--gradient-lumen` fill with `--on-primary` text. Nothing else.

**Fix, back card in the hero stack:**
- Add a `decorative` prop to `BankCard`. When `true`, render **only the surface** (gradient or pinstripe) with no text, no chip, no logo, and `aria-hidden`. Use it for every card that is partly covered.
- Position the stack so no card is cropped by its container unintentionally. The back card is offset about 36px right and 28px down, rotated about +4°. The front card rotated about -7°.

**Accept:** Every character on the front card is readable at 100% zoom; the back card shows no text.

### 1.3 Dot field is too loud, too uniform, and sits behind text

**Observed:**
- In the hero, dots cover the entire band, dense on the **left directly behind the headline and paragraph**, with large inconsistent blobs along the bottom edge. It competes with every element.
- In the CTA panel the dots crowd right up to the centered heading and paragraph ("five", "No credit").

**Fix, `DotField`:**
- Pitch 24px (hero), 20px (tiles). Max radius `1.8px` (never larger). Max opacity `0.4`. Minimum radius `0.5px`.
- Falloff must be smooth. Remove the random noise term that creates blobs; use `strength = edge^2.2` with a tiny jitter (≤ 8%) for organic feel.
- **Hero:** `density="right"` and apply a mask so dots vanish before they reach the text column:

```css
.dotfield--hero {
  -webkit-mask-image: linear-gradient(to left, #000 0%, rgba(0,0,0,.6) 35%, transparent 62%);
          mask-image: linear-gradient(to left, #000 0%, rgba(0,0,0,.6) 35%, transparent 62%);
}
```

- Bottom edge of the hero: fade dots to 0 in the last 96px (vertical mask) so there are no blobs at the band boundary.
- **CTA panel:** see 3.3 (layout change). Dots occupy only the rightmost 38% of the panel and never overlap text.
- Never put dots behind body copy, stat tiles, or buttons.

**Accept:** Headline, paragraph, and buttons sit on clean black. The dot field reads as atmosphere in the upper right of the hero, not wallpaper.

---

## 2. P1: Dead space and hierarchy

### 2.1 Two stacked headings with nothing between them

**Observed:** "Everything your finance team does, without the bank" (with a paragraph at right) is followed by a hairline and then **another** section heading, "Designed for modern capital flow". There are about 200px of empty space in between. Two H2s back to back is redundant.

**Fix:**
- **Merge** into one section. Keep "Everything your finance team does, without the bank" as the only heading. Delete "Designed for modern capital flow".
- Layout: heading left (spans 7 columns), paragraph right (5 columns), **aligned to the bottom of the heading's last line** (`align-items: end`), then 48px, then the bento. No hairline between heading and bento.
- Heading: `text-wrap: balance`, max-width `18ch`, so "bank" is not an orphan on line 3.

### 2.2 Hero scale is timid

**Observed:** The hero H1 is about 56px, thin-looking, in a canvas that could carry 100px+. The band has roughly 160px of empty space above the headline and 120px below the stat tiles.

**Fix:**
- H1: `font-size: clamp(44px, 7.4vw, 104px)`, `line-height: 1.02`, `letter-spacing: -0.01em`, weight 400 uppercase (as now), `text-wrap: balance`. Three lines max at 1440px: "BANKING BUILT / FOR MODERN / BUSINESS".
- Hero padding: `96px` top, `88px` bottom (desktop), `64px / 56px` mobile.
- Paragraph `max-width: 44ch`, `margin-top: 24px`. Buttons `margin-top: 32px`.
- Vertically center the card stack against the text block (`align-items: center`) and make it larger: stack width about 46% of the container, not about 36%.

### 2.3 Stat tiles are stretched and weak

**Observed:** Two full-width tiles with a small numeral ("30s", "0%") and one thin line of text. Lots of horizontal emptiness.

**Fix:**
- Combine into **one** tile (`--surface-elevated`, `--r-xl`, 1px hairline) with two columns divided by a 1px `--divider-soft` vertical rule.
- Numerals: `display-lg` (48px), tabular, white. Caption under it: `body-md`, `--on-dark-mute`, max 34ch.
- Add a `caption`-size footnote marker to each numeral. **VERIFY (compliance):** "0% foreign exchange markup" is a strong, regulated claim. Leave `// TODO(compliance): substantiate 0% FX markup claim` and the footnote text "See pricing terms." Do not change the wording of the claim.

### 2.3b Section spacing audit

Run through every section and enforce one rule: **one** vertical padding per band (`88px` desktop / `56px` mobile), never stacked padding plus margin. Gap between CTA panel and footer hairline: `64px` (currently about 120px+). Gap between section heading and its subhead: `16px` (see 3.1). Gap between a section's heading block and its content: `48px`.

---

## 3. P2: Component-level polish

### 3.1 Heading-to-subhead gaps are too big (pricing and FAQ)

**Observed:** "Simple pricing. No hidden spreads" and its subhead have about 60px between them. In the FAQ, "Common questions" and "Can't find your answer?" have about 70px between them.

**Fix:** `margin-top: 16px` for subheads; `h2` has `margin-bottom: 0`. The FAQ left column is `position: sticky; top: 96px`.

### 3.2 "Cards in under 30 seconds" tile has half its area empty

**Observed:** The card pair is small and left-aligned. The right half of the tile is empty. The dark card behind the light one is cropped with a stray "$" visible at the left edge.

**Fix:**
- Tile gets `overflow: hidden; position: relative`.
- Text block top-left, max-width `34ch`. Chips pinned bottom-left.
- Card pair: **scaled up about 1.35×, anchored to the bottom-right and bleeding off the tile's right and bottom edges** by about 12%. Light card in front rotated about -6°; dark `decorative` card behind, offset up-right, rotated about +5°.
- The dark card behind uses `decorative` (no text), so there is no stray "$".
- Light card shows: balance, chip, `•••• 7474`, expiry, holder. Nothing else.

```css
.cards-tile__visual {
  position: absolute;
  right: -8%;
  bottom: -14%;
  width: 62%;
  transform-origin: 100% 100%;
}
```

### 3.3 CTA panel layout collides with the dot field and orphans a word

**Observed:** Centered "Open your account in five / minutes" leaves "minutes" alone on line 2, and the dot field runs into the text.

**Fix:**
- Change to a **two-zone layout**: content **left-aligned** in the left 58% of the panel (heading, one-line body, button), dot field confined to the right 38% with a left-fading mask. Padding `64px`.
- Heading: `display-lg`, `max-width: 16ch`, `text-wrap: balance`. Result: "Open your account / in five minutes".
- Panel min-height about 360px (currently feels about 515px). Remove excess vertical padding.
- Optional but recommended: place the light `BankCard` (decorative, no text) cropped at the panel's lower right, overlapping the dots, to tie the CTA to the product. Skip if it competes with the headline.

### 3.4 Treasury and Accounting tiles feel thin

**Treasury (gradient tile):**
- Move the "APY on unallocated balances" caption so its baseline aligns with the numeral's baseline (`align-items: baseline`).
- Add the decorative **sparkline** (inline SVG path, `--on-primary` at 28% opacity, 1.5px stroke, no fill) spanning the lower right of the tile, `aria-hidden`.
- Footnote marker stays; the pricing-section footnote covers it.

**Accounting (dark tile):**
- Show **three** ledger rows, not one: date, merchant, tax code, amount, each in a `--surface-deep` row (`--r-md`, 1px hairline, 12px 16px padding). Use plausible demo merchants stored in `demoData.ts`. Keep the "Synced to QuickBooks and Xero" pill with its `--success` dot.

**Multi-currency:** keep. The gap above "Sample balances" is acceptable because the tile stretches, but align the rows to the bottom with `margin-top: auto`, and add a small mid-market line under the rows: "1 USD = 0.92 EUR · mid-market rate" in `caption` (demo data, labeled).

### 3.5 Buttons

- `outline-light` (Starter and Scale CTAs on white): currently a heavy 1px black outline. Change to a `1px solid var(--faint)` border with `--ink` text, and on hover `--ink` border. The featured card's black pill stays as the single strong CTA.
- `outline-dark` ("How it works" in the hero): the border is nearly invisible. Use `1px solid rgba(255,255,255,0.28)`, hover `rgba(255,255,255,0.5)`.
- Label consistency: primary action is **"Open account"** everywhere, including the nav (currently "Join now"). Secondary: "How it works", "Talk to sales", "Contact support".

### 3.6 Pricing card details

- Check icons sit slightly above the text baseline. Align by setting the `li` to `display: grid; grid-template-columns: 20px 1fr; align-items: start;` and nudging the icon with `margin-top: 0.2em`, or by using `align-items: baseline` on a flex row with a 16px icon wrapper of `height: 1lh`.
- "MOST POPULAR" badge touches the card's top and right border. Give it `top: 16px; right: 16px`.
- Equalize the description block height (`min-height: 2.8em`) so all three feature lists start on the same y.

### 3.7 Edge and overflow check

A thin light vertical line is visible at the far right edge of the dark and white bands. Check for horizontal overflow (`100vw` usage, negative margins, or an element wider than the viewport). Set `html, body { background: var(--canvas-dark); overflow-x: clip; }` and remove any `100vw` widths in favor of `100%`.

---

## 4. Typography and copy micro-fixes

- Apply `text-wrap: balance` to every heading and `text-wrap: pretty` to paragraphs.
- Make the heading scale actually differ by section: hero H1 about 104px, section H2 `display-md` 40px (currently every H2 is the same size as everything else), tile titles `heading-md` 24px, body 16/18px. Keep the scale from the design file; do not invent sizes.
- Tabular numerals (`font-variant-numeric: tabular-nums`) on all prices, balances, stats, and card numbers (verify, some look proportional).
- Footer: keep the compliance line verbatim. Raise to `--on-dark-mute`.
- No new copy beyond: removal of the "Designed for modern capital flow" heading, the "1 USD = 0.92 EUR · mid-market rate" demo caption, and the "See pricing terms." footnote.

---

## 5. Texture budget (rule of thumb the agent must follow)

Textures are seasoning. Across the whole page:
- **Dot field:** max three places (hero upper right, CTA panel right, optionally one bento tile). Never full-bleed behind text.
- **Pinstripe:** dark cards only, always masked away from text.
- **Gradient (`--gradient-lumen`):** light card, featured plan, treasury tile, badges, and the logo ring. Nowhere else.
- If a screen has more than one texture competing in the same viewport, remove one.

---

## 6. QA procedure (required before reporting done)

1. Run typecheck, lint, tests. Fix all errors without suppression.
2. Take screenshots at **1440, 1024, 768, and 390** widths of: hero, bento, pricing, FAQ, CTA plus footer.
3. Verify each acceptance item:
   - [ ] Logo has no background box anywhere.
   - [ ] All text on the hero card is readable; back card shows no text; light cards have no stripes.
   - [ ] Hero headline, paragraph, and buttons sit on clean black (no dots behind them).
   - [ ] No dot larger than 3.6px diameter; no blobs at band edges.
   - [ ] One section heading for the features block; "Designed for modern capital flow" is gone.
   - [ ] No orphaned single-word last lines in any heading at 1440 or 390.
   - [ ] Cards tile visual fills and bleeds off the lower right; no big empty half.
   - [ ] CTA panel is left-aligned with dots confined to the right 38%.
   - [ ] Pricing check icons aligned to text; badge inset from the border; list starts aligned.
   - [ ] Outline buttons are visible on both canvases but not heavy.
   - [ ] No horizontal scroll and no stray edge line.
   - [ ] Contrast and focus rings still pass; `prefers-reduced-motion` still respected.
4. Report: list what changed, list every `VERIFY` / `TODO(compliance)` item (0% FX markup, 30s issuance, 4.8% APY wording, "government-backed securities" wording), and flag anything you could not fix.

If a fix conflicts with something in the codebase, stop and report instead of guessing.
