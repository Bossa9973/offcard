# Agent Prompt, Pass 4: Fix the hero, and reposition Off-Card as a crypto card

Pass 3 added real depth and it is a big improvement. Two things remain:

1. **The hero composition is off** (details below).
2. **Off-Card is a crypto-funded card, not a traditional bank product.** The copy, demo data, FAQ, and some UI cues were written as if it were fiat banking. That is both a positioning problem and a **compliance risk**. Fix it here.

Keep everything from passes 1 to 3 (tokens, depth system, bento, pricing band, FAQ, accessibility, motion rules). Only change what this prompt lists.

---

## 1. Hero: what is wrong in the current build

Observed in the latest screenshot (1920px wide):

1. **The headline wraps to four lines** ("BANKING / BUILT FOR / MODERN / BUSINESS") at about 100px. It is taller than the card visual, pushes the buttons far down, and overpowers everything. The thin weight at that size also looks like a wireframe.
2. **The dark card is almost invisible against the black background.** After masking, the pinstripe nearly disappeared, so the card reads as a black slab on black. The bright light card is hidden behind it, showing only a sliver.
3. **The back card still leaks text.** An "rd" fragment is visible at the right edge, so `decorative` is not being applied to the card behind.
4. **The "Payment approved" toast is clipped** ("$1,240.0(") and sits on top of the card number and holder name, hiding them.
5. **Over-rotation.** Combined `rotateX/rotateY/rotateZ` plus perspective skews the text on the front card, so the balance and numbers look wobbly. It reads as a 3D mistake rather than a deliberate pose.
6. **The card is small and floating** with a lot of dead space around it, and the dots are a sparse uniform grid in the top right that is not connected to anything.
7. **Vertical balance:** the text column is much taller than the visual, so the two halves do not align.

---

## 2. Hero rebuild

### 2.1 Layout

- 12-column grid, `align-items: center`, `column-gap: 64px`.
- Left column: **6 columns**. Right column: **6 columns**.
- Hero `min-height: 680px` (desktop), padding `96px 0 88px`.
- Headline at most **3 lines**, at most **2 preferred** (see copy options in section 5).
- Headline: `font-size: clamp(40px, 5.4vw, 84px); line-height: 1.04; letter-spacing: -0.01em; font-weight: 400; text-transform: uppercase; text-wrap: balance; max-width: 14ch`.
- Paragraph: `max-width: 42ch`, 24px below the headline. Buttons: 32px below the paragraph.
- Stats tile row stays below the hero with 56px of space above it.

### 2.2 Card stack: put the LIGHT card in front

The Moneta brand board puts the light gradient card in front of the dark one. That is the fix for contrast. A light card pops on black; a black card on black does not.

Composition (left to right, back to front):
1. **Back card (dark, `decorative`)**: offset up-left of the front card, visible as a clear crescent (about 22% of its width shows). Pinstripe visible here.
2. **Front card (light gradient, full content)**: the hero of the visual.
3. Remove the third card unless it is clearly visible; two cards read cleaner than three.

Pose, calmer than before. Less distortion, more deliberate angle:

```css
.hero-stage   { perspective: 1800px; perspective-origin: 50% 45%; }
.hero-card--back  { transform: translate3d(-64px, -36px, -30px) rotateX(4deg) rotateY(-8deg) rotateZ(-9deg); }
.hero-card--front { transform: translate3d(20px, 24px, 40px)   rotateX(4deg) rotateY(-8deg) rotateZ(-3deg); }
```

- Front card width: `clamp(340px, 34vw, 560px)`. It should fill about 70% of the right column.
- Text on the front card must remain crisp: keep total skew under 8°, set `backface-visibility: hidden`, `-webkit-font-smoothing: antialiased`, and avoid `will-change` on text nodes (apply to the wrapper only).
- Pointer parallax stays but reduce max to `±4°` and keep the lerp factor at `0.08`.

### 2.3 Fixing the dark card so it is visible and attractive

- Fill: `linear-gradient(160deg, #1b1b1f 0%, #0b0b0d 60%, #060607 100%)` (not flat `#0a0a0a`).
- Pinstripe opacity `0.18 to 0.5`, still masked away from the top-left text zone, and visible enough that the texture reads at a glance. Add a faint olive-to-slate wash in the lower right (opacity 0.3).
- Rim: `inset 0 0 0 1px rgba(255,255,255,.14)`, `inset 0 1px 0 rgba(255,255,255,.30)`.
- It must be separable from the background at a glance. If you squint, there should be a visible edge all the way around.

### 2.4 Back-card text leak

`decorative` must render **no text, no chip, no logo**. Audit every `BankCard` usage; any partly covered card gets `decorative`. Add a unit test that renders `<BankCard decorative />` and asserts no text nodes are present.

### 2.5 Toast

- Not clipped: the stage has `overflow: visible`; the toast has `white-space: nowrap`, `min-width: max-content`, padding `10px 16px`.
- Position it **below and left of the front card**, overlapping only the card's outer edge, **never covering the card number, expiry, or holder name**. At 1440px: `left: -8%; bottom: -6%`.
- Content: status dot, "Paid $1,240.00", then a separator and a muted second line "1,240.00 USDC" (demo data, see section 4). Raised pill styling from pass 3.
- Slide-in on first view only; static afterwards. Reduced motion: static.

### 2.6 Dot field behind the card

- Replace the sparse top-right grid with a **radial field centered behind the card stack**: pitch 22px, radius `0.8 → 1.8px`, opacity at most `0.35`, radial falloff to zero at about 520px from the stack's center. The card should look like it sits *inside* the dots, as in the Moneta mission tile.
- No dots behind the headline, paragraph, or buttons.
- Keep the floor reflection under the stack from pass 3 (very soft, 4% white).

### 2.7 Acceptance for the hero

- [ ] Headline is 2 to 3 lines at 1440px and 1920px, 3 to 4 lines max at 390px, with no orphans.
- [ ] Light card is in front and fully legible; dark card behind has a visible edge and visible stripes.
- [ ] No text from the back card is visible anywhere.
- [ ] Toast is fully visible, not clipped, and does not cover any card text.
- [ ] Card stack height roughly matches the text column; both are vertically centered.
- [ ] Skew is subtle; all card text is crisp at 100% zoom.

---

## 3. Crypto positioning: what must change

**Assumed product (confirm with the owner and mark with `// VERIFY`):** a card that lets businesses spend crypto (stablecoins and possibly other assets) at ordinary merchants, funded from crypto balances, with a dashboard for spend controls, a REST API, and accounting export. Settlement and conversion happen at or before the point of sale.

Do **not** invent features, supported assets, chains, yields, or regulatory statuses. Anything not in the existing copy or supplied by the owner is a placeholder that must be marked `// VERIFY` and kept in a single file, `src/content/productFacts.ts`, so the owner can fill it in.

### 3.1 Compliance problems in the current copy

These are wrong or risky for a crypto product. Flag each in your report.

1. **FAQ: "Are deposits insured? … FDIC-insured partner banks."** Crypto assets are generally **not** FDIC-insured. Remove this answer. Replace the question with "How are my funds held?" and an answer that the owner supplies (custodial or self-custody, who the custodian is). Leave the answer as `// TODO(compliance)` placeholder text: *"Details on custody and protection of funds will be provided here."* Never imply deposit insurance.
2. **Treasury tile: "4.8% APY … government-backed securities."** This is a fiat treasury claim. It almost certainly does not describe a crypto product. **Remove the tile content and the "4.8% treasury sweep yield" line in the Growth plan** unless the owner confirms a real, compliant yield product. If removed, replace the tile with a different real feature (see 4.4). Do not keep a yield figure as filler.
3. **"Banking built for modern business" and "Everything your finance team does, without the bank."** Calling it "banking" while the footer says "not a bank" is a mismatch, and crypto card issuers get extra scrutiny for it. Replace with card and spend language (options in section 5).
4. **Footer disclosure.** Keep "not a bank" and add a crypto risk line placeholder: `// TODO(compliance): Crypto assets are volatile and not insured by FDIC or SIPC. Cards are issued by [issuer] pursuant to a license from [network].` Do not invent the issuer or network.
5. **"0% foreign exchange markup"** and **"30s card issuance"**: keep flagged as VERIFY. A crypto-to-fiat conversion normally has a spread or fee, so "0%" needs careful substantiation.
6. **Plan features that sound like bank rails** ("Domestic ACH & SEPA transfers", "Multi-currency accounts (USD, EUR, GBP)", "Automated batch wire payments") may not apply. Keep them only if the owner confirms. Otherwise mark with `// VERIFY` and ask in your report.

### 3.2 Voice

Still premium, restrained, and monochrome. **No neon, no glow, no pixel type, no rocket or coin emoji, no "to the moon" tone.** Crypto-native users respond to precision: real figures, real units, truncated addresses, short sentences. Keep the Moneta look. Crypto is expressed through *content and detail*, not through crypto-aesthetic decoration.

---

## 4. UI cues that make it credible as a crypto card

All demo values live in `demoData.ts`, labeled `// DEMO DATA`.

### 4.1 Cards
- Light front card (hero): small `USDC` pill (circle glyph + text, no real brand logos) near the top-left, balance `$5,750.20` large, and a second muted line `5,750.20 USDC` under it. The network can appear as a tiny label ("Settles in seconds" is a claim; use "Funded by USDC" instead).
- Dark back card: no text (decorative).

### 4.2 Toast
"Paid $1,240.00 · 1,240.00 USDC" with a status dot.

### 4.3 Multi-currency tile becomes "Assets"
- Heading: **"Spend what you hold"** (or the owner's wording).
- Wells (recessed rows), each with an asset disc (letters in a circle, no brand logos), asset name, and balance, for example: `USDC · USD Coin  $428,950.00`, `USDT · Tether  $185,240.00`, `ETH · Ether  $94,110.00`. Right-aligned amounts are fiat-equivalent, tabular. Label the block "Sample balances".
- Small line under the rows: `Converted at spend` in `caption` (only if the owner confirms that is how it works).

### 4.4 Treasury tile becomes a real crypto feature (pick one the owner confirms, otherwise show "Settlement")
Default if unconfirmed, with all figures as demo data:
- Heading: **"Every spend, settled on-chain"** (VERIFY).
- Body: one sentence.
- Visual: a recessed well showing a transaction line: merchant, amount, and a truncated hash like `0x7a3f…91c4` in the monospace stack, with a small "Settled" status pill.
- Keep the lavender-lime gradient surface and sparkline texture from pass 3. No yield number.

### 4.5 Accounting tile
Keep the ledger wells; add a column or line for the truncated reference (`0x…`) next to the amount. Keep the "Synced to QuickBooks and Xero" pill only if that integration is real (VERIFY).

### 4.6 Monospace
Add one monospace face for hashes, addresses, and asset codes: **JetBrains Mono** or **IBM Plex Mono**, weight 400, 13px, `font-variant-numeric: tabular-nums`. Used **only** for on-chain identifiers.

---

## 5. Copy options (owner picks; agent implements the first as default)

Hero headline (uppercase, 2 lines):

| Option | Headline | Notes |
|---|---|---|
| A (default) | SPEND CRYPTO / LIKE CASH | Clear, short, fits the 14ch width |
| B | YOUR CRYPTO, / ACCEPTED EVERYWHERE | "Everywhere" is a claim; VERIFY |
| C | CRYPTO-FUNDED CARDS / FOR BUSINESS | Descriptive, less punchy |

Hero paragraph (default): "Issue cards your team can use anywhere, funded from your crypto balance. Set limits, track every payment, and export clean records."

Nav CTA and primary buttons: keep "Open account".

Section heading above the bento (replaces "Everything your finance team does, without the bank"): **"Everything you need to spend crypto at work"** with the right-hand paragraph: "One dashboard for cards, balances, limits, and reporting."

Closing CTA headline: **"Open your account in five minutes"** (keep, VERIFY the time claim) with body "Verify your business and issue your first virtual card." Remove "No credit check required" only if it is not accurate for this product (VERIFY).

Pricing: keep the structure. Remove any line that implies bank deposits, ACH/SEPA, wires, or yield unless confirmed. Replace with owner-supplied features or `// VERIFY` placeholders.

---

## 6. Do this in order

1. Create `src/content/productFacts.ts` and `demoData.ts`; move all claims and demo values there.
2. Rebuild the hero (section 2).
3. Apply the compliance removals and placeholders (section 3.1).
4. Update the tile contents and card faces (section 4) and add the mono font.
5. Apply the copy defaults (section 5).
6. Run typecheck, lint, tests (including the `decorative` no-text test). Screenshot hero at 1920, 1440, 1024, 768, 390.
7. Report: before and after hero screenshots; every `VERIFY` and `TODO(compliance)` item; anything you could not do. **Do not claim compliance; this is a presentation change only.**

---

## 7. Final checklist

- [ ] Hero meets every item in section 2.7.
- [ ] No FDIC or deposit-insurance language anywhere.
- [ ] No yield figure or "government-backed securities" claim unless the owner confirmed it.
- [ ] No "banking" language in headlines.
- [ ] Footer has the "not a bank" disclosure plus the crypto risk placeholder.
- [ ] All unconfirmed facts are in `productFacts.ts` with `VERIFY` markers.
- [ ] No neon, glow, pixel type, coin or rocket icons, or crypto clichés.
- [ ] Monospace used only for hashes and asset codes.
- [ ] Depth system from pass 3 intact; contrast and reduced-motion rules intact.
