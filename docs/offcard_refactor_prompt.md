# Agent Prompt: Refactor the Off-Card landing page to look designed, not generated

You are a senior product designer and front-end engineer working in an existing **React + TypeScript (TSX)** codebase. Your job is to rework the Off-Card marketing landing page so it stops looking like AI-generated "vibe code" and matches the **Moneta design system** (attached as `moneta_design.md`). If that file is not attached, use the tokens in section 3 of this prompt; they are the same values.

Read this entire prompt before touching any file. Then follow the workflow in section 12.

---

## 1. Context

**Product:** Off-Card. A business treasury and card-issuing platform: virtual and physical cards, multi-currency accounts (USD, EUR, GBP), accounting sync, treasury sweep yield, and a REST API. Footer legal line: "Off-Card is a financial technology platform, not a bank. Banking services provided by licensed partner financial institutions."

**Tagline:** "Banking built for modern business."

**Current page sections, in order:**
1. Nav (Features, Pricing, FAQ, wordmark, "Join now - It's free")
2. Hero ("NEW ERA OF BANKING.", paragraph, "How Off-Card works" pill, tilted card visual, two stat tiles: 10x and 30%)
3. Logo strip (Ohms, .inc, GREEN, NROK, CWBANK)
4. Headline ("FUELING INNOVATION GROWTH") + uppercase tagline
5. Feature bento: Instant provisioning, Multi-currency, Accounting, Treasury
6. Pricing: Starter $0, Growth $29 (most popular), Scale $99
7. FAQ (three questions)
8. Closing CTA ("READY TO MOVE CAPITAL FASTER?")
9. Footer

**Do not change:** routes, data fetching, auth links, analytics, form handlers, the information architecture above (section order and meaning), or any legal/regulatory text. You are changing presentation, structure of the markup, component quality, and copy polish only where this prompt says so.

---

## 2. Diagnosis: why it currently reads as vibe coded

Fix every item below. These are the root causes, not suggestions.

1. **Pixel display font with glowing text.** Headlines use a pixel font with a `text-shadow` glow. It reads as a crypto or arcade template and undermines trust for a finance product.
2. **Glow everywhere.** Colored halos around the hero headline, the CTA card, and the featured pricing card. The design system has **zero shadows**; depth comes from surface luminance and hairlines.
3. **One section formula repeated.** Every section is: tiny lime eyebrow, centered headline, grid of identical `#111` rounded cards. No rhythm, no scale change, no canvas change.
4. **Two-tone headline gimmick on every headline** (white line, then lime line). A signature used four times becomes a template.
5. **Dead tiles.** The "Virtual cards in under 30 seconds" tile is mostly empty with a small card in a corner. The hero card is flat grey with no texture.
6. **Placeholder content shipping as real content.** The cardholder name "Trailor Swift" (twice), a fake-looking logo strip, unsourced stats ("10x", "30%").
7. **Copy habits.** Every headline ends with a period. "Fueling innovation growth" does not parse as a sentence. Generic fintech phrases. The same figure (4.8%) is repeated in three places.
8. **Unfinished UI details.** Text-glyph checkmarks (`✓`) instead of icons; FAQ cards that look like accordions but have no chevron or interaction; a "Get Started" pill awkwardly overlapping the hero card edge; 11px low-contrast eyebrow text; arrows rendered as text glyphs.
9. **Everything is `#111` on `#000`.** One surface tone and one canvas for the whole page, so nothing has hierarchy.
10. **Uniform radius, uniform padding, uniform weights.** No considered scale.

---

## 3. Design tokens (source of truth)

Implement these as CSS variables and wire them into the existing styling system (Tailwind config, CSS modules, vanilla-extract, or styled-components; detect which one the repo uses and extend it, do not introduce a second system).

```css
:root {
  /* brand */
  --primary: #dfe1f8;          /* pale lavender */
  --primary-bright: #eeeffd;
  --primary-deep: #c4c7f2;
  --on-primary: #0a0a0a;       /* text on lavender/lime is NEAR-BLACK, never white */
  --lumen: #f2f2c6;            /* pale lime */
  --lumen-deep: #d8d89a;
  --gradient-lumen: linear-gradient(135deg, #f2f2c6 0%, #f8f8f8 50%, #dfe1f8 100%);
  --stripe-olive: #5a5942;
  --stripe-slate: #474656;

  /* neutrals (text on light) */
  --ink: #111111;
  --body: #1a1a1c;
  --charcoal: #3a3a3e;
  --mute: #5a5a60;
  --ash: #6e6e74;
  --stone: #9a9aa0;
  --faint: #c9c9cf;

  /* on dark */
  --on-dark: #ffffff;
  --on-dark-mute: rgba(255, 255, 255, 0.72);
  --on-dark-faint: rgba(255, 255, 255, 0.40);

  /* canvases and surfaces */
  --canvas-dark: #000000;
  --canvas-light: #ffffff;
  --surface-soft: #f4f4f5;
  --surface-card: #ffffff;
  --surface-deep: #0a0a0a;
  --surface-elevated: #111111;
  --surface-raised: #141414;

  /* lines */
  --hairline-light: #e2e2e7;
  --hairline-dark: rgba(255, 255, 255, 0.12);
  --divider-soft: rgba(255, 255, 255, 0.06);
  --dot-field: #9a9aa0;

  /* semantic (status only, never decoration) */
  --success: #00a87e;
  --warning: #ec7e00;
  --danger: #e23b4a;
  --link: #376cd5;
  --link-on-dark: #dfe1f8;

  /* radius */
  --r-sm: 8px;
  --r-md: 12px;
  --r-lg: 20px;
  --r-xl: 28px;
  --r-full: 9999px;

  /* spacing */
  --s-xxs: 4px;  --s-xs: 6px;   --s-sm: 8px;   --s-md: 14px;
  --s-lg: 16px;  --s-xl: 24px;  --s-xxl: 32px; --s-xxxl: 48px;
  --s-block: 80px; --s-section: 88px; --s-band: 120px;
}
```

### Typography

Two families only.

- **Display:** `Space Grotesk` (500 for lowercase headings, 400 for the uppercase style). Self-host via `@fontsource-variable/space-grotesk` or `next/font`; whichever matches the repo. Provide a real fallback stack: `"Space Grotesk", "Inter", system-ui, sans-serif`.
- **Body/UI:** `Inter` (400 body, 600 buttons, 700 emphasized links).

| Token | Family | Size | Weight | Line height | Letter spacing | Notes |
|---|---|---|---|---|---|---|
| display-xxl | Space Grotesk | 136px | 500 | 1.0 | -2.72px | hero only, desktop |
| display-xl | Space Grotesk | 80px | 500 | 1.0 | -0.8px | |
| display-caps | Space Grotesk | 48px | 400 | 1.1 | 0.01em | `text-transform: uppercase` |
| display-lg | Space Grotesk | 48px | 500 | 1.21 | -0.48px | |
| display-md | Space Grotesk | 40px | 500 | 1.2 | -0.4px | |
| heading-lg | Space Grotesk | 32px | 500 | 1.19 | -0.32px | |
| heading-md | Space Grotesk | 24px | 500 | 1.33 | 0 | |
| heading-sm | Space Grotesk | 20px | 500 | 1.4 | 0 | |
| body-lg | Inter | 18px | 400 | 1.56 | -0.09px | |
| body-md | Inter | 16px | 400 | 1.5 | 0.24px | |
| body-sm | Inter | 14px | 400 | 1.43 | 0 | |
| button-md | Inter | 16px | 600 | 1.5 | 0.24px | |
| button-sm | Inter | 14px | 600 | 1.43 | 0 | |
| caption | Inter | 13px | 400 | 1.4 | 0 | minimum size anywhere on the page |
| card-balance | Space Grotesk | 32px | 500 | 1.19 | -0.32px | tabular numerals |
| card-number | Space Grotesk | 16px | 400 | 1.5 | 0.08em | tabular numerals |

Rules:
- Use `clamp()` so display sizes scale: `display-xxl` becomes `clamp(56px, 11vw, 136px)`, `display-xl` becomes `clamp(40px, 7vw, 80px)`, and so on. Never drop below 13px for any text.
- Enable `font-variant-numeric: tabular-nums` on every number: prices, balances, stats, card numbers.
- **No pixel font anywhere.** Remove it from the bundle. (If the owner later wants a pixel accent, it may only be used on large stat numerals, never headlines.)
- Remove every `text-shadow`.

---

## 4. Global look rules

**Do**
- Alternate canvases in full-bleed bands: dark → dark → **white** → dark. Pricing and FAQ move to a white catalogue band (`--canvas-light`), which is the Revolut-style structure we are keeping.
- Separate dark surfaces by luminance steps (`#000` → `#111` → `#141414`) and a 1px `--hairline-dark` border.
- Use `--r-xl` (28px) for bento tiles, bank cards, and the CTA panel; `--r-lg` (20px) for plan cards and feature cards; `--r-md` (12px) for inputs, FAQ rows, and small tiles; `--r-full` for every button and badge.
- Keep the accent scarce. The lavender-lime gradient appears on: the light bank card, the featured plan card, the brand mark, and badges. Nowhere else.
- Left-align body sections. Center only the hero and the closing CTA.
- Give each section a different layout (see section 7).

**Don't**
- No `box-shadow` for glow or depth. No `filter: drop-shadow` glows. No `text-shadow`. No blurred colored blobs. (A 1px inset hairline is fine.)
- No gradient text.
- No emoji. No unicode glyph icons (`✓`, `↗`); use an SVG icon set already in the repo (lucide-react is fine) at a consistent 16 or 20px size and 1.5px stroke.
- No more than **one** two-tone headline on the page (the hero). Everything else is a single color.
- No eyebrow above every headline. Use an eyebrow on at most two sections, and when you do, make it 13px, uppercase, `letter-spacing: 0.08em`, in `--on-dark-mute` (dark) or `--mute` (light), not lime.
- No headline ending in a period unless it is a full sentence of body copy.
- No identical card grids back to back.

---

## 5. Textures (these carry the brand; implement them as real components)

### 5.1 `DotField`: halftone dots

A decorative SVG layer. Dots in `--dot-field`, varying in radius and opacity, dense near one edge and fading to nothing across the tile, loosely suggesting a world map. It must be `aria-hidden`, `pointer-events: none`, and positioned absolutely behind content. Never put text over the dense area.

```tsx
// components/texture/DotField.tsx
import { useMemo } from "react";

type Side = "left" | "right" | "top" | "bottom";

interface DotFieldProps {
  /** Edge where dots are densest. */
  density?: Side;
  /** Grid pitch in px. */
  pitch?: number;
  /** Deterministic seed so SSR and client match. */
  seed?: number;
  className?: string;
}

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function DotField({
  density = "left",
  pitch = 18,
  seed = 7,
  className,
}: DotFieldProps) {
  const W = 800;
  const H = 480;

  const dots = useMemo(() => {
    const rand = mulberry32(seed);
    const out: { x: number; y: number; r: number; o: number }[] = [];
    for (let y = pitch / 2; y < H; y += pitch) {
      for (let x = pitch / 2; x < W; x += pitch) {
        const nx = x / W;
        const ny = y / H;
        const edge =
          density === "left" ? 1 - nx
          : density === "right" ? nx
          : density === "top" ? 1 - ny
          : ny;
        // organic falloff plus noise so it never looks like a plain grid
        const strength = Math.max(0, edge * edge - rand() * 0.35);
        if (strength < 0.06) continue;
        out.push({ x, y, r: 0.6 + strength * 2.4, o: 0.15 + strength * 0.75 });
      }
    }
    return out;
  }, [density, pitch, seed]);

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={className}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    >
      <g fill="var(--dot-field)">
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} opacity={d.o} />
        ))}
      </g>
    </svg>
  );
}
```

Usage: hero band (`density="left"`), the brand/CTA panel (`density="right"`), and one feature tile. Do not use it on every tile.

### 5.2 `PinstripeCard`: diagonal speed-line surface for dark cards

Fine parallel lines at about -20°, with varying length and thickness so it reads as a brushed surface. Base `--surface-deep`. Lines shift from `--stripe-slate` (center) to `--stripe-olive` (lower right). Contrast stays low so white card text remains legible.

```tsx
// components/texture/Pinstripe.tsx
import { useMemo, useId } from "react";

interface PinstripeProps {
  seed?: number;
  className?: string;
}

function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
}

export function Pinstripe({ seed = 3, className }: PinstripeProps) {
  const id = useId();
  const lines = useMemo(() => {
    const r = rng(seed);
    const out: { x1: number; y1: number; x2: number; y2: number; w: number; o: number; t: number }[] = [];
    const count = 90;
    for (let i = 0; i < count; i++) {
      const y = (i / count) * 420 - 40;
      const len = 120 + r() * 520;
      const x1 = r() * 640 - 80;
      const dx = Math.cos((-20 * Math.PI) / 180) * len;
      const dy = Math.sin((-20 * Math.PI) / 180) * len;
      out.push({ x1, y1: y, x2: x1 + dx, y2: y + dy, w: 0.5 + r() * 1.6, o: 0.25 + r() * 0.55, t: (x1 + 80) / 720 });
    }
    return out;
  }, [seed]);

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={className}
      viewBox="0 0 560 350"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    >
      <defs>
        <linearGradient id={`${id}-tone`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--stripe-slate)" />
          <stop offset="1" stopColor="var(--stripe-olive)" />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="0.85" cy="0.9" r="0.6">
          <stop offset="0" stopColor="var(--stripe-olive)" stopOpacity="0.35" />
          <stop offset="1" stopColor="var(--stripe-olive)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="560" height="350" fill="var(--surface-deep)" />
      <rect width="560" height="350" fill={`url(#${id}-glow)`} />
      <g stroke={`url(#${id}-tone)`} strokeLinecap="round">
        {lines.map((l, i) => (
          <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} strokeWidth={l.w} opacity={l.o} />
        ))}
      </g>
    </svg>
  );
}
```

(The olive glow here is a soft radial fill *inside* the card artwork, not an outer halo. That is allowed. No outer glow.)

### 5.3 `BankCard`: dark and light variants

Aspect ratio 1.586:1 (ISO card). Radius `--r-xl`. Layout:

- Top-left: "Current balance" label (`caption`, `--on-dark-faint`), balance below (`card-balance`).
- Top-right: wordmark.
- Mid-left: EMV chip. Pale warm white `#fefdf9`, 6px radius, about 14% of card width.
- Bottom-left: card number (`card-number`). Bottom-right: expiry `MM/YY`.
- **Dark variant:** `<Pinstripe />` background, white text.
- **Light variant:** `background: var(--gradient-lumen)`, text `--on-primary`.

```tsx
// components/card/BankCard.tsx
import { Pinstripe } from "../texture/Pinstripe";

interface BankCardProps {
  variant: "dark" | "light";
  balance?: string;       // e.g. "$128,430.00"
  last4: string;          // e.g. "7474"
  expiry: string;         // "08/28"
  holder?: string;
  className?: string;
}

export function BankCard({ variant, balance, last4, expiry, holder, className }: BankCardProps) {
  const dark = variant === "dark";
  return (
    <div
      className={className}
      role="img"
      aria-label={`${dark ? "Dark" : "Light"} Off-Card business card ending in ${last4}`}
      style={{
        position: "relative",
        aspectRatio: "1.586 / 1",
        borderRadius: "var(--r-xl)",
        overflow: "hidden",
        color: dark ? "var(--on-dark)" : "var(--on-primary)",
        background: dark ? "var(--surface-deep)" : "var(--gradient-lumen)",
        border: dark ? "1px solid var(--hairline-dark)" : "none",
        padding: "clamp(16px, 2.2vw, 24px)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        fontFamily: "var(--font-display)",
      }}
    >
      {dark && <Pinstripe />}
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          {balance && (
            <>
              <div style={{ font: "400 13px/1.4 var(--font-body)", opacity: dark ? 0.4 : 0.6 }}>Current balance</div>
              <div style={{ font: "500 clamp(22px,2.4vw,32px)/1.19 var(--font-display)", letterSpacing: "-0.32px", fontVariantNumeric: "tabular-nums" }}>
                {balance}
              </div>
            </>
          )}
        </div>
        <span style={{ font: "500 18px/1 var(--font-display)", letterSpacing: "-0.02em" }}>off-card</span>
      </div>
      <div style={{ position: "relative" }}>
        <div aria-hidden style={{ width: "14%", aspectRatio: "1.3/1", background: "#fefdf9", borderRadius: 6, marginBottom: 16, border: "1px solid rgba(0,0,0,0.08)" }} />
        <div style={{ display: "flex", justifyContent: "space-between", font: "400 16px/1.5 var(--font-display)", letterSpacing: "0.08em", fontVariantNumeric: "tabular-nums" }}>
          <span>•••• •••• •••• {last4}</span>
          <span>{expiry}</span>
        </div>
        {holder && <div style={{ font: "500 11px/1.4 var(--font-body)", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 6 }}>{holder}</div>}
      </div>
    </div>
  );
}
```

(Replace inline styles with the repo's styling approach when implementing. They are shown inline only to keep this prompt self-contained. The 11px holder-name line is the only exception to the 13px minimum, because it mimics real card embossing.)

---

## 6. Components to build or rebuild

Create these as typed, reusable components. Put them in the repo's existing component directory and follow its naming and export conventions.

### 6.1 `Button`
Props: `variant: "primary" | "dark" | "soft" | "outline-light" | "outline-dark"`, `size: "md" | "sm"`, `icon?: ReactNode`, `as?: "button" | "a"`.

| Variant | Background | Text | Use |
|---|---|---|---|
| primary | `#ffffff` | `#000000` | The CTA on dark bands. Pressed: `--faint` |
| dark | `#000000` | `#ffffff` | On white bands |
| soft | `--surface-soft` | `--ink` | Secondary on white bands |
| outline-light | `#ffffff`, 1px `--ink` border | `--ink` | Tertiary on white |
| outline-dark | `#000000`, 1px `--hairline-dark` border | `#ffffff` | Secondary on dark |

All pills (`--r-full`). `md`: height 48px, padding `14px 28px`, `button-md` type. `sm`: height 36px, padding `8px 16px`, `button-sm` type. Icon (lucide `ArrowUpRight`, 16px) sits after the label with an 8px gap. Required states: hover (background shifts one luminance step, 120ms), `:focus-visible` (2px outline in `--primary`, 2px offset, on white bands use `--ink`), active/pressed, disabled (50% opacity, `cursor: not-allowed`). No glow, no scale-up on hover.

### 6.2 `Section`
Props: `canvas: "dark" | "light"`, `bleed?: boolean`, children. Handles full-bleed band background, vertical padding (`--s-section` 88px desktop, 56px mobile; hero uses `--s-band` 120px desktop), and an inner container `max-width: 1216px; padding-inline: 24px`.

### 6.3 `Tile`
Props: `tone: "elevated" | "raised" | "deep" | "gradient"`, `radius: "lg" | "xl"`, `padding?`. Dark tiles: background token, 1px `--hairline-dark` border, no shadow. Gradient tile: `--gradient-lumen`, text `--on-primary`.

### 6.4 `StatTile`
Big numeral (`display-md`, tabular), caption beneath (`body-sm`, `--on-dark-mute`), optional footnote marker. Stats must have a source footnote (see section 9).

### 6.5 `PlanCard`
- Standard plan: dark `Tile` (`elevated`, `--r-lg`, padding 32px) on the dark band, or `feature-card-light` (white, hairline border) on the white band.
- **Featured plan (Growth):** `--gradient-lumen` fill, text `--on-primary`, no outer glow, "Most popular" as a `badge-feature` pill (background `--on-primary`, text `--lumen`, pill radius, 13px, uppercase, `letter-spacing: 0.06em`) sitting **inside** the card top edge, not straddling the border.
- Price: `display-md`, tabular. "/month" in `body-sm`, `--mute`.
- Feature list: SVG `Check` icon (16px, stroke 1.5) in `--success` on white bands or `--on-dark-mute` on dark; text `body-md`. Each item is a `<li>` in a `<ul>`.
- CTA button pinned to card bottom with `margin-top: auto`; the three cards must have equal heights and aligned CTAs (use CSS grid with `grid-template-rows: subgrid` or flex column + `margin-top: auto`).

### 6.6 `FaqItem`
Real accordion: `<button aria-expanded aria-controls>` + panel. Chevron icon rotates 180° on open (200ms). Row: `--r-md`, 1px `--hairline-light` border on the white band, padding 20px 24px, question `heading-sm`, answer `body-md` in `--charcoal`. First item open by default. Keyboard: Enter/Space toggles, focus ring visible. Respect `prefers-reduced-motion` (no rotation animation).

### 6.7 `Wordmark`
Lowercase "off-card" in Space Grotesk 500. **Drop the trailing period** from the wordmark. If there is an SVG logo mark in the repo, use it; otherwise create a simple mark: a ring of vertical bars cut diagonally, filled with `--gradient-lumen` on dark and solid `--ink` on light. Provide it as a React component with `size` and `variant` props so the nav, footer, and card all use one source.

### 6.8 `Eyebrow`
13px, uppercase, `letter-spacing: 0.08em`, 600 weight. Dark band color: `--on-dark-mute`. Light band color: `--mute`. Use sparingly (max two on the page).

---

## 7. Section-by-section specification

### 7.1 Nav
- Dark, 64px, sticky, `background: rgba(0,0,0,0.8)` with `backdrop-filter: blur(12px)` and a 1px bottom `--divider-soft` once scrolled.
- Left: Wordmark. Center-right: links Features, Pricing, FAQ (`button-md` weight 500, `--on-dark-mute`, hover `--on-dark`). Right: `Button primary sm` "Open account". (Replace "Join now - It's free" with this; see copy table.)
- Mobile (<768px): hamburger toggles a full-width sheet; focus trapped while open; `Escape` closes.

### 7.2 Hero (dark band, 120px padding)
- `DotField density="left"` behind the whole band, faded out by 60% width.
- Headline: `display-caps` at hero scale, uppercase, left-aligned on desktop, centered on mobile. Text: **"Banking built for modern business."** one color, white. No glow.
- Left column: body paragraph (`body-lg`, `--on-dark-mute`, max-width 44ch). Two buttons: `primary` "Open account" and `outline-dark` "How it works" (the old pill with the sunburst icon is removed).
- Right column: **card stack**. The dark `BankCard` rotated about -8° and overlapping the light `BankCard` rotated about +4° behind it (the light card is lower and offset right). The stack sits on the black canvas with no tray and no glow. Subtle float animation: `translateY(0 → -6px)` over 6s `ease-in-out` infinite, disabled under `prefers-reduced-motion`.
- Remove the overlapping "Get Started" pill from the card.
- Below, a single row of two `StatTile`s on `--surface-elevated` (`--r-xl`), side by side on desktop and stacked on mobile.

### 7.3 Logo strip
- **If you do not have real, permissioned customer logos, delete this entire section.** Do not keep fake logos.
- If real logos exist: grayscale SVGs at 60% opacity, equal visual height (24px), a single row on desktop that wraps to two rows on mobile, with a single caption in `caption` size: "Trusted by teams at".

### 7.4 Positioning band (dark)
- Replace "FUELING INNOVATION GROWTH" plus the uppercase tagline with a single left-aligned statement using `display-lg`, sentence case, one color. Max-width 18ch per line feel. Copy in the table below.
- A short `body-lg` paragraph in `--on-dark-mute` to the right on desktop (two-column).

### 7.5 Feature bento (dark band)
A **bento grid with unequal tiles**, 12-column grid, 16px gap, all `--r-xl`:

1. **Cards** (span 7 columns, tall). Tone `elevated`. Title + one-line body at top-left. The visual is the **real-size light `BankCard`** plus a second dark card peeking behind it, filling the lower two-thirds of the tile. Add a small spend-limit chip row ("Single-use", "Recurring", "Merchant-locked") as `badge-tag` pills at the bottom. No empty space.
2. **Multi-currency** (span 5 columns). Tone `raised`. Three balance rows: currency code in a circle at left, name, amount right-aligned, tabular. Rows are `--r-md`, `--surface-deep`, 1px hairline. Use plausible demo values and label the block "Sample balances" in `caption`.
3. **Accounting** (span 5 columns). Tone `elevated`. A small mock ledger row: date, merchant, VAT code, category, amount. Under it, a status pill "Synced to QuickBooks and Xero" with a `--success` dot (this is a legitimate status use).
4. **Treasury** (span 7 columns). Tone `gradient` (lavender-lime fill, `--on-primary` text), the **one** place the big yield figure appears: "4.8%" in `display-xl` with caption "APY on unallocated balances" and a footnote marker. A simple SVG sparkline or flat line chart in `--on-primary` at 30% opacity as texture (decorative, `aria-hidden`).
- Section heading is left-aligned `display-md` with no eyebrow.
- Each tile heading is `heading-md`, body `body-md` `--on-dark-mute`. No lime micro-eyebrows inside tiles; if a category label is needed, use `Eyebrow` in `--on-dark-faint` sparingly.
- At <1024px: 2 columns; at <640px: 1 column.

### 7.6 Pricing (WHITE band)
- `Section canvas="light"`. Heading `display-md` left-aligned in `--ink`, with a one-line `body-lg` subhead in `--mute`.
- Three `PlanCard`s on white (`feature-card-light`: white, 1px `--hairline-light`, `--r-lg`). The Growth card is the gradient featured card. Cards equal height, CTAs aligned to bottom.
- Below the cards, one line of `caption` text in `--mute` for pricing terms and the yield footnote.
- Plan CTAs: Starter `outline-light`, Growth `dark`, Scale `outline-light`.

### 7.7 FAQ (white band continues, or `--surface-soft` band)
- Two-column on desktop: left column (sticky) has the heading "Common questions" and a line "Can't find your answer? Talk to us" with a `soft` button; right column has the `FaqItem` list.
- Add 2 to 3 more real questions if the owner supplies them; do not invent compliance answers.

### 7.8 Closing CTA (dark band)
- `Tile` with `--surface-elevated`, `--r-xl`, 1px hairline, padding `--s-band`. `DotField density="right"` inside the tile.
- Headline `display-lg`, centered, white, single color, no glow.
- Body `body-lg` `--on-dark-mute`, centered, one line. One `Button primary` "Open account".
- No halo, no outer shadow.

### 7.9 Footer (dark)
- Top hairline `--divider-soft`. Left: Wordmark + tagline in `body-sm` `--on-dark-mute`. Right: links (Privacy Policy, Terms of Service, Security) in `body-sm`, hover underline, 44px min touch target on mobile.
- Legal line in `caption` `--on-dark-faint`: keep the existing "not a bank" disclosure verbatim. Raise its contrast to at least `--on-dark-mute` at 13px; it is a regulatory statement and must be readable.
- Add `© {year} Off-Card` computed from `new Date().getFullYear()`.

---

## 8. Copy changes (apply exactly; flag anything marked VERIFY)

| Where | Current | Replace with |
|---|---|---|
| Nav CTA | Join now - It's free | Open account |
| Hero H1 | NEW ERA OF BANKING. | Banking built for modern business. |
| Hero body | Direct treasury accounts, automated spend controls, and multi-currency virtual cards. Built for teams that move capital fast. | Treasury accounts, spend controls, and multi-currency cards in one place. Built for teams that move money every day. |
| Hero secondary | How Off-Card works / In 3 simple steps | How it works |
| Stat 1 | 10x Faster domestic settlement with zero middleman wire fees. | VERIFY with owner. If it cannot be sourced, replace with a verifiable fact such as "Virtual cards issued in under 30 seconds". |
| Stat 2 | 30% Average reduction in annual foreign exchange spreads. | VERIFY with owner. If unsourced, replace with "Interbank mid-market rates on conversions" (only if true). |
| Positioning | FUELING INNOVATION GROWTH / BANKING BUILT FOR MODERN BUSINESS. | Everything your finance team does, without the bank. |
| Positioning body | (none) | One account for cards, currencies, accounting, and yield. Issue a card in seconds, close the books automatically, and put idle cash to work. |
| Cards tile | Virtual cards in under 30 seconds. | Cards in under 30 seconds |
| Cards body | Issue single-use or recurring cards for team members. Enforce strict spend caps and lock merchants automatically. | Issue single-use or recurring cards for anyone on your team. Set spend caps and lock cards to specific merchants. |
| Multi-currency tile | Hold USD, EUR, and GBP. | Hold dollars, euros, and pounds |
| Multi-currency body | Direct ACH and SEPA routing numbers for local collection. Convert balances at interbank mid-market rates. | Get local ACH and SEPA details to collect payments. Convert balances at mid-market rates. |
| Accounting tile | Real-time ledger sync. | Books that close themselves |
| Accounting body | Every transaction is enriched with VAT codes, receipts, and line-item categorization before it hits your ledger. | Every transaction arrives in your ledger with VAT code, receipt, and category already attached. |
| Treasury tile | Earn 4.8% APY on liquid deposits. | Put idle cash to work |
| Treasury body | Automated overnight sweeps into government-backed securities. Fully liquid, zero lock-up penalty. | Balances sweep overnight into government-backed securities. Withdraw any time, no lock-up. VERIFY wording with compliance. |
| Pricing H2 | Clear pricing with zero hidden spreads. | Simple pricing. No hidden spreads. |
| Pricing subhead | (none) | Start free. Upgrade when you need more cards, currencies, or API access. |
| FAQ H2 | Common questions. | Common questions |
| CTA H2 | READY TO MOVE CAPITAL FASTER? | Open your account in five minutes |
| CTA body | Set up your business treasury account in under five minutes. No credit check required. | Verify your business, issue your first virtual card instantly. No credit check required. |
| CTA button | Open Account Now | Open account |
| Wordmark | Off-Card. | off-card (no period) |

**Placeholder cleanup:** Replace "Trailor Swift" everywhere with a neutral demo holder such as "ALEX MORGAN" (or the company name "ACME LTD" for a business card). Mark demo data clearly in code with a `// DEMO DATA` comment and centralize it in one `demoData.ts` file so it is easy to replace.

**Copy rules:** sentence case for all headings except the uppercase hero; no trailing periods on headings; one idea per heading; numbers as numerals; the 4.8% figure appears **once** prominently (treasury tile) and in the Growth plan feature list, with a single footnote that covers it.

---

## 9. Claims and compliance guardrails

This is a regulated product category. Do not weaken or remove disclosures.

- Keep the "not a bank / licensed partner financial institutions" statement in the footer verbatim.
- Any rate (4.8% APY) needs a footnote: "APY is variable and subject to change. Yield is provided through partner institutions. See Terms." Mark the footnote text VERIFY and leave a `// TODO(compliance)` comment. Do not invent legal wording; use the placeholder and tell the owner it needs review.
- "Deposits insured" claims in the FAQ stay as written by the owner; do not rephrase them.
- Any statistic with no source must either be removed or carry a footnote with the methodology. Do not fabricate sources.

---

## 10. Responsive, accessibility, performance

**Breakpoints:** 390 (mobile), 768 (tablet), 1024, 1440. Test all four. No horizontal scroll at any width. Hero headline must not overflow at 390px.

**Accessibility (WCAG 2.2 AA minimum)**
- Contrast: body text on dark must be at least 4.5:1 (`--on-dark-mute` on `#111` passes; `--on-dark-faint` is allowed only for non-essential labels at 13px+ and large text). Text on the gradient uses `--on-primary`.
- All interactive elements keyboard reachable, visible `:focus-visible` rings, minimum 44x44px touch targets on mobile.
- Semantic landmarks: `<header>`, `<nav aria-label="Primary">`, `<main>`, `<section aria-labelledby>`, `<footer>`.
- One `<h1>`. Headings strictly ordered.
- Decorative SVG (`DotField`, `Pinstripe`, sparkline) is `aria-hidden`. The `BankCard` has a descriptive `aria-label`.
- Skip-to-content link as the first focusable element.
- `prefers-reduced-motion: reduce` disables the card float and chevron rotation.

**Performance**
- Self-host fonts, `font-display: swap`, preload only the display 500 and body 400 weights, subset to Latin.
- No images are required for the textures (all SVG/CSS). Keep total added JS minimal; no animation library for this page.
- Lighthouse targets: Performance 90+, Accessibility 100, no layout shift from font loading (use `size-adjust` fallback or the framework's font optimization).

---

## 11. Motion

Restrained. Allowed: hover background shifts (120ms), accordion chevron (200ms), hero card float (6s), section fade-up on first view (opacity 0 → 1 and `translateY(12px → 0)` over 400ms, once, via `IntersectionObserver`). Not allowed: parallax, glow pulses, typing effects, scroll-jacking, scale-on-hover, spinning anything.

---

## 12. Workflow (follow in order)

1. **Audit.** Read the existing page and component files. List every instance of: `text-shadow`, `box-shadow` or `drop-shadow` used as glow, the pixel font family, `✓` and other glyph icons, repeated eyebrows, fake data, and unsourced stats. Output this list before changing anything.
2. **Tokens.** Add the CSS variables and font setup. Remove the pixel font from the bundle. Confirm the page still builds.
3. **Primitives.** Build `Button`, `Section`, `Tile`, `Eyebrow`, `Wordmark`, `DotField`, `Pinstripe`, `BankCard`.
4. **Compose sections** in page order (7.1 to 7.9), replacing existing markup. Keep existing data hooks and links.
5. **Copy pass** using the table in section 8. Centralize demo data.
6. **A11y and responsive pass** at 390 / 768 / 1024 / 1440.
7. **Cleanup.** Delete dead CSS, unused font files, and unused components. Run the repo's typecheck, lint, and tests. Fix all errors; do not suppress them with `any` or `@ts-ignore`.
8. **Report.** Summarize what changed, list every VERIFY and `TODO(compliance)` item for the owner, and note anything you could not do.

---

## 13. TypeScript and code quality requirements

- Strict types: no `any`, no non-null assertions unless justified in a comment. Props interfaces exported next to components.
- Components are pure and presentational where possible; data lives in typed constants (`as const` where appropriate) in a sibling data file, not inline in JSX.
- No inline style objects in the final code unless the repo's convention is inline styles; the snippets above use inline styles only to be self-contained. Translate them into the repo's styling method.
- Use `clsx` (or the repo's equivalent) for conditional classes. No magic numbers: spacing and radius come from tokens.
- Each component in its own file with a clear name; no 500-line page component. Keep the page file as a thin composition of sections.
- Add a short JSDoc on each shared primitive describing its variants.
- Keep everything SSR-safe (no `window` access during render; the `DotField` and `Pinstripe` use seeded PRNGs for that reason).

---

## 14. Acceptance checklist (all must be true)

**Look**
- [ ] No pixel font, no `text-shadow`, no glow halos, no gradient text anywhere.
- [ ] Page alternates dark and white bands; pricing and FAQ are on white.
- [ ] Only one two-tone headline (or none).
- [ ] The lavender-lime gradient appears only on the light card, featured plan, treasury tile, brand mark, and badges.
- [ ] Hero shows a dark pinstriped card overlapping a gradient card, with no outer glow.
- [ ] The feature bento has unequal tile sizes with no empty dead space.
- [ ] Dots and pinstripes render from SVG, with no raster images.

**Content**
- [ ] No "Trailor Swift"; demo data is centralized and labeled.
- [ ] Fake logo strip removed or replaced with real, permissioned logos.
- [ ] Unsourced stats removed or flagged for the owner.
- [ ] No headline ends in a period; the copy table has been applied.
- [ ] "Not a bank" disclosure is present and readable.

**Behavior**
- [ ] FAQ is a working accessible accordion with chevrons.
- [ ] Mobile nav works, traps focus, closes on Escape.
- [ ] All icons are SVG; no glyph checkmarks or arrows.
- [ ] Pricing cards are equal height with aligned CTAs.

**Quality**
- [ ] Typecheck, lint, and tests pass.
- [ ] No horizontal scroll at 390, 768, 1024, or 1440 px.
- [ ] Contrast and keyboard checks pass; reduced-motion respected.
- [ ] Lighthouse accessibility 100; performance 90+.

If any instruction here conflicts with something in the existing codebase that you cannot change safely, stop and report the conflict instead of guessing.
