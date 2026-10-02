# Agent Prompt, Pass 3: Depth, material, and "pop"

Pass 1 fixed structure, pass 2 fixed craft. This pass fixes the remaining problem: **the cards and tiles look flat.** The page is currently built from 2D rectangles with a hairline border. We want objects that feel physical: raised, layered, lit from above, with real materials on the bank cards.

## 0. Rule change (read first)

The design file said "zero shadows; depth from luminance only." **That rule is superseded by this prompt.** Moneta's own brand board shows overlapping cards with real depth, and a flat system is what we are fixing. The new rule:

- **Allowed:** physical elevation (tight, dark, neutral cast shadows), 1px edge highlights, inner gradients, specular sheen on cards, recessed "wells" for inner UI, overlap and layering, subtle 3D tilt, one ambient top light per band.
- **Still banned:** colored glow halos, neon outlines, blurred colored blobs, `text-shadow` glow, gradient text, bloom on buttons or headings. If an effect would look at home on a crypto landing page, it is banned.
- Test: *a shadow should look like a shadow (dark, offset down, tight), and a highlight should look like light hitting an edge (1px, from above).* Never a halo around an object.

Keep everything else: tokens, copy, layout from pass 2, textures budget, accessibility.

---

## 1. Why it looks flat (diagnosis)

1. Every tile is `#111` with a uniform 1px border. One surface tone, no gradient, no edge light, no shadow, so nothing separates from the black canvas.
2. The canvas itself is pure `#000` end to end, so there is no sense of a light source or space.
3. Bank cards are 2D fills with text on them. No gloss, no thickness, no chip material, no reflection, no contact shadow.
4. Inner elements (balance rows, ledger rows, chips) use the same fill as their parents, so there is no raised-versus-recessed hierarchy.
5. The white pricing band has white cards on a white background with a hairline, so cards do not lift off the page.
6. Nothing overlaps. Everything sits inside its box with padding, which reads as a wireframe.
7. Buttons are flat pills with no tactile cue.

---

## 2. Elevation tokens

Add to the existing token file. These are **neutral** shadows only.

```css
:root {
  /* ---------- lighting ---------- */
  --edge-highlight: rgba(255, 255, 255, 0.08);      /* 1px top inner light on dark */
  --edge-highlight-strong: rgba(255, 255, 255, 0.22);

  /* ---------- dark-canvas surfaces (gradient, not flat) ---------- */
  --tile-fill: linear-gradient(180deg, #181819 0%, #101011 55%, #0c0c0d 100%);
  --tile-fill-raised: linear-gradient(180deg, #1d1d1f 0%, #131315 60%, #0e0e10 100%);
  --well-fill: linear-gradient(180deg, #08080a 0%, #0d0d0f 100%);   /* recessed inner UI */

  /* gradient border: bright top edge fading down */
  --tile-border: linear-gradient(180deg,
      rgba(255,255,255,0.18) 0%,
      rgba(255,255,255,0.06) 35%,
      rgba(255,255,255,0.04) 70%,
      rgba(255,255,255,0.09) 100%);

  /* dark elevations (on black the shadow is subtle; edge light does the work) */
  --elev-dark-1: inset 0 1px 0 var(--edge-highlight), 0 1px 2px rgba(0,0,0,.7);
  --elev-dark-2: inset 0 1px 0 var(--edge-highlight), 0 2px 4px rgba(0,0,0,.6), 0 18px 36px -12px rgba(0,0,0,.9);
  --elev-dark-3: inset 0 1px 0 var(--edge-highlight-strong), 0 4px 8px rgba(0,0,0,.6), 0 32px 64px -16px rgba(0,0,0,.95);

  /* recessed wells */
  --well-shadow: inset 0 2px 4px rgba(0,0,0,.7), inset 0 0 0 1px rgba(255,255,255,.04), 0 1px 0 rgba(255,255,255,.05);

  /* ---------- light-canvas surfaces ---------- */
  --band-light-fill: #f4f4f5;                        /* use surface-soft as the band, white for cards */
  --card-light-border: 1px solid rgba(17,17,17,0.07);
  --elev-light-1: 0 1px 2px rgba(17,17,17,.05), 0 4px 12px -4px rgba(17,17,17,.06);
  --elev-light-2: 0 1px 2px rgba(17,17,17,.05), 0 10px 24px -8px rgba(17,17,17,.10), 0 28px 48px -24px rgba(17,17,17,.12);
  --elev-light-3: 0 2px 4px rgba(17,17,17,.06), 0 18px 36px -10px rgba(17,17,17,.16), 0 40px 72px -28px rgba(17,17,17,.22);

  /* ---------- bank card ground shadows (used on light bands only) ---------- */
  --card-shadow: 0 2px 4px rgba(0,0,0,.35), 0 14px 22px -8px rgba(0,0,0,.55), 0 36px 48px -24px rgba(0,0,0,.6);

  --ease-out: cubic-bezier(.22, .8, .24, 1);
}
```

---

## 3. The dark canvas needs a light source

On pure `#000` shadows are invisible, so the page needs **ambient light** to make anything look lit. Add one soft top light per dark band (not behind a specific object):

```css
.band--dark {
  background:
    radial-gradient(1100px 520px at 50% -8%, rgba(255,255,255,0.055), transparent 70%),
    #000;
}
```

Rules: opacity at most `0.06`, centered at the top of the band, never colored, never placed behind a single element. It should read as "the room is lit from above," not as a glow.

Also add **a faint floor reflection** under hero objects: a very soft white ellipse at `0.04` opacity beneath the card stack (`radial-gradient`, no blur filter), so the cards appear to hover over a surface.

---

## 4. Tile construction (dark)

Replace the flat `Tile` with a layered one. Use the gradient-border technique so the top edge catches light and the bottom edge falls off:

```css
.tile {
  position: relative;
  border-radius: var(--r-xl);
  border: 1px solid transparent;
  background:
    var(--tile-fill) padding-box,
    var(--tile-border) border-box;
  box-shadow: var(--elev-dark-2);
  overflow: hidden;
  transition: transform .25s var(--ease-out), box-shadow .25s var(--ease-out);
}

/* soft top-left sheen inside the tile, like light on a matte surface */
.tile::before {
  content: "";
  position: absolute; inset: 0;
  background: radial-gradient(120% 70% at 20% -10%, rgba(255,255,255,0.06), transparent 60%);
  pointer-events: none;
}

@media (hover: hover) {
  .tile:hover { transform: translateY(-3px); box-shadow: var(--elev-dark-3); }
}
@media (prefers-reduced-motion: reduce) {
  .tile { transition: none; }
  .tile:hover { transform: none; }
}
```

Variants: `tile--raised` uses `--tile-fill-raised` and `--elev-dark-3` (use for the hero stat tile and the main cards tile). `tile--gradient` (treasury) keeps `--gradient-lumen` but adds `inset 0 1px 0 rgba(255,255,255,.7)`, a 1px `rgba(255,255,255,.35)` border, and a top-left white sheen at 0.25.

### Inner elements are recessed wells (raised vs. recessed hierarchy)

Balance rows, ledger rows, the sample-balance list, FAQ answer panels on dark, and any "screen-like" UI inside a tile become **wells**:

```css
.well {
  border-radius: var(--r-md);
  background: var(--well-fill);
  box-shadow: var(--well-shadow);
  border: 0;
}
```

Raised tile, recessed rows inside it. That contrast is the core of the "pop."

Chips and badges (`Single-use`, `Recurring`, `Merchant-locked`, "Synced to QuickBooks and Xero") become small raised pills: `background: linear-gradient(180deg,#232326,#18181a)`, `box-shadow: inset 0 1px 0 rgba(255,255,255,.1), 0 1px 2px rgba(0,0,0,.6)`, `border-radius: 9999px`.

---

## 5. Bank card material system (highest priority)

Rebuild `BankCard` as a stack of layers. Z-order from bottom to top:

1. **Base fill** (dark: `--surface-deep`; light: `--gradient-lumen`).
2. **Texture** (dark only: masked pinstripe from pass 2).
3. **Sheen** (specular band across the face, see below).
4. **Edge and thickness** (inset highlights, 1px rim).
5. **Content** (balance, chip, number, logo) with subtle physical treatment.
6. **Ground shadow** (outside the card, light bands and any lighter backdrop).

```css
.bankcard {
  position: relative;
  aspect-ratio: 1.586 / 1;
  border-radius: var(--r-xl);
  isolation: isolate;
  transform-style: preserve-3d;
}

/* rim + thickness */
.bankcard::after {
  content: "";
  position: absolute; inset: 0;
  border-radius: inherit;
  pointer-events: none;
  box-shadow:
    inset 0 0 0 1px rgba(255,255,255,0.10),
    inset 0 1px 0 rgba(255,255,255,0.28),
    inset 0 -1px 0 rgba(0,0,0,0.45);
}

/* specular sheen: a soft diagonal band of light */
.bankcard__sheen {
  position: absolute; inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: linear-gradient(115deg,
    rgba(255,255,255,0) 28%,
    rgba(255,255,255,0.14) 42%,
    rgba(255,255,255,0.04) 52%,
    rgba(255,255,255,0) 64%);
  mix-blend-mode: soft-light;      /* falls back gracefully if unsupported */
}

/* dark card: slightly glossy top half */
.bankcard--dark .bankcard__gloss {
  position: absolute; inset: 0 0 45% 0;
  border-radius: var(--r-xl) var(--r-xl) 0 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0));
  pointer-events: none;
}

/* light card: soft inner light and a faint lower tint so it looks like coated metal */
.bankcard--light {
  background:
    radial-gradient(90% 70% at 20% 0%, rgba(255,255,255,.55), transparent 60%),
    var(--gradient-lumen);
}
```

### Card content materials

- **Chip:** replace the flat white rectangle with a metallic chip: `linear-gradient(135deg, #f4efe0 0%, #cfc7ae 45%, #f7f3e6 55%, #b9b095 100%)`, 6px radius, `inset 0 0 0 1px rgba(0,0,0,.18)`, with 4 to 6 etched contact lines drawn as an inline SVG at 25% opacity. Size about 15% of card width.
- **Logo and wordmark on dark cards:** foil look. `background: linear-gradient(135deg, var(--lumen), var(--primary))` clipped to the glyph, **only** on the card face (this is the one allowed use of gradient fill on a logo; no gradient text anywhere else).
- **Card number and balance on dark:** a tiny emboss: `text-shadow: 0 1px 0 rgba(0,0,0,.6), 0 -1px 0 rgba(255,255,255,.08);`. This is an engraving cue, not a glow. Allowed **only on card faces**.
- **Text on light card:** `--on-primary`, with `text-shadow: 0 1px 0 rgba(255,255,255,.5)` for a printed look.

### Ground shadow

- On the **white band** or any light backdrop: apply `var(--card-shadow)` to the card wrapper (not the clipped card), so it can fall outside the rounded rect.
- On the **black canvas**: use the faint floor reflection from section 3 plus a darker contact area, `box-shadow: 0 30px 40px -24px rgba(0,0,0,.95)`. Shadows barely register here; the rim light and gloss carry the depth.

---

## 6. Hero: make the card stack feel 3D

Compose the hero visual in real perspective:

```css
.hero-stage {
  perspective: 1400px;
  perspective-origin: 50% 40%;
}
.hero-stack { position: relative; transform-style: preserve-3d; }
.hero-card--front {
  transform: translateZ(60px) rotateX(10deg) rotateY(-16deg) rotateZ(-5deg);
}
.hero-card--back {
  transform: translate3d(48px, 34px, -10px) rotateX(10deg) rotateY(-16deg) rotateZ(4deg);
}
```

- Add a **third card** (dark, `decorative`) peeking from behind the stack, so there is a fan of three, not two.
- **Pointer parallax:** a small `useTilt` hook (no animation library). On `pointermove` over the hero, rotate the stack by at most ±6° on each axis and shift each card's `translateZ` by its depth factor. Smooth with `requestAnimationFrame` lerp (factor 0.08). Disable on touch devices and under `prefers-reduced-motion`. Reset gently on `pointerleave`.
- Keep the 6s idle float from before only when the pointer is not over the stage.
- Add **overlapping UI elements** to break the box: a small floating "Card frozen" or "Payment approved · $1,240.00" toast overlapping the stack's lower left, built as a raised pill (`--tile-fill-raised`, `--elev-dark-3`, recessed status dot). Demo data only, in `demoData.ts`, and `aria-hidden` since it is decorative.

```ts
// hooks/useTilt.ts (sketch; implement fully)
export function useTilt(ref: RefObject<HTMLElement>, max = 6) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (matchMedia("(hover: none)").matches) return;
    let raf = 0, tx = 0, ty = 0, x = 0, y = 0;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2 * max;
      ty = ((e.clientY - r.top) / r.height - 0.5) * -2 * max;
    };
    const onLeave = () => { tx = 0; ty = 0; };
    const tick = () => {
      x += (tx - x) * 0.08; y += (ty - y) * 0.08;
      el.style.setProperty("--tilt-x", `${y.toFixed(2)}deg`);
      el.style.setProperty("--tilt-y", `${x.toFixed(2)}deg`);
      raf = requestAnimationFrame(tick);
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); el.removeEventListener("pointermove", onMove); el.removeEventListener("pointerleave", onLeave); };
  }, [ref, max]);
}
```

---

## 7. Bento tiles: layering and overlap

- **Cards tile:** the card pair bleeds off the lower right (from pass 2) and now has full material treatment. Add the "frozen/approved" toast **overlapping the tile's inner edge** so it straddles two zones. Cards cast `--card-shadow` onto the tile surface (visible because the tile is `#101011`, not black).
- **Multi-currency tile:** rows are wells (section 4). Currency chips become small raised discs with a 1px top highlight. Add a faint recessed divider between rows.
- **Accounting tile:** three wells for ledger rows; the "Synced" pill is a raised pill with a `--success` dot that has a 1px inner highlight.
- **Treasury tile:** gradient surface, white top highlight, sparkline in `--on-primary` at 28% opacity, and a **recessed** pill showing "Variable APY, see terms" so there is raised-versus-recessed contrast on the light tile too (`inset 0 1px 2px rgba(17,17,17,.15)`).
- Tile gap stays 16px so shadows and highlights have room to read.

---

## 8. White band (pricing and FAQ): make cards lift

1. Change the band background from `#fff` to `--band-light-fill` (`#f4f4f5`). **Cards stay white** and now visibly sit on top.
2. `PlanCard` (standard): white, `--card-light-border`, `--elev-light-2`. Hover: `translateY(-4px)` and `--elev-light-3`, 250ms.
3. **Featured Growth card:** gradient fill, `--elev-light-3`, `translateY(-8px)` at rest (it stands taller than its neighbors), `inset 0 1px 0 rgba(255,255,255,.8)`, and a **neutral-tinted** cast shadow only: `0 24px 48px -20px rgba(120,125,200,.28)` added to the stack. This is the single allowed tinted shadow. Cards must keep equal height; the lift is a transform, not a height change.
4. "Most popular" badge: raised dark pill (`#0a0a0a`, `inset 0 1px 0 rgba(255,255,255,.15)`, `0 2px 6px rgba(0,0,0,.25)`), inset 16px from the card edge.
5. FAQ rows: white, `--elev-light-1`; the open row uses `--elev-light-2`. Chevron sits in a small `--surface-soft` circle.
6. Pricing CTA buttons: see section 9.

---

## 9. Buttons: tactile, not glowing

```css
/* primary: white pill on dark */
.btn--primary {
  background: linear-gradient(180deg, #ffffff 0%, #f1f1f2 100%);
  color: #000;
  box-shadow:
    inset 0 1px 0 #fff,
    inset 0 -1px 0 rgba(0,0,0,.10),
    0 1px 2px rgba(0,0,0,.5),
    0 6px 14px -6px rgba(0,0,0,.6);
  transition: transform .15s var(--ease-out), box-shadow .15s var(--ease-out), background .15s;
}
.btn--primary:hover  { transform: translateY(-1px); }
.btn--primary:active { transform: translateY(0); box-shadow: inset 0 1px 2px rgba(0,0,0,.15), 0 1px 1px rgba(0,0,0,.4); background: var(--faint); }

/* dark pill on white band */
.btn--dark {
  background: linear-gradient(180deg, #1c1c1e 0%, #000 100%);
  color: #fff;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.18), 0 1px 2px rgba(0,0,0,.3), 0 8px 16px -8px rgba(0,0,0,.45);
}

/* outline on dark */
.btn--outline-dark {
  background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02));
  border: 1px solid rgba(255,255,255,.22);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.08);
}
```

Focus rings remain: 2px `--primary` outline on dark, `--ink` on light, 2px offset.

---

## 10. Nav and footer

- Nav: sticky with `backdrop-filter: blur(14px) saturate(120%)`, `background: rgba(0,0,0,.65)`, and a 1px bottom border using `linear-gradient` from transparent to `rgba(255,255,255,.10)` to transparent. This is the only place `backdrop-filter` is allowed (performance).
- "Open account" in the nav uses `.btn--primary` at `sm`.
- Footer: keep flat. It is the quiet end of the page; depth there would look noisy.

---

## 11. Performance and accessibility guardrails

- No `filter: blur()` and no `backdrop-filter` except the nav. Shadows only (cheap).
- `will-change: transform` only on `.hero-stack` and only while the pointer is over the stage.
- Max 3 simultaneously animating elements. Everything respects `prefers-reduced-motion` (no tilt, no float, no hover lift).
- Gradient borders and sheens are pure CSS; no raster images for depth.
- Contrast: text on gradient tiles and cards must still meet 4.5:1. The sheen and gloss layers must not drop text below that (verify on the light card at its brightest band).
- All decorative layers (`__sheen`, `__gloss`, floor reflection, toast) are `aria-hidden` with `pointer-events: none`.
- Test on a low-end device profile (CPU 4× throttle): hero scroll must stay smooth.

---

## 12. Do this in order

1. Add elevation tokens and the dark band ambient light (sections 2 and 3).
2. Rebuild `Tile`, `well`, and chip/pill primitives (section 4).
3. Rebuild `BankCard` layers and materials (section 5), then the hero 3D stage, third card, and toast (section 6).
4. Update every bento tile to use wells, raised pills, and overlaps (section 7).
5. Convert the white band to `#f4f4f5` with lifted white cards and the featured card (section 8).
6. Update all buttons (section 9) and the nav (section 10).
7. Run typecheck, lint, tests. Screenshot at 1440, 1024, 768, and 390.

---

## 13. Acceptance checklist

**Depth**
- [ ] Every dark tile has a gradient fill, a bright-top gradient border, and an inset top highlight; none is a flat `#111`.
- [ ] Inner rows (balances, ledger, chips) are visibly recessed or raised relative to their parent tile.
- [ ] Bank cards show: gloss/sheen, rim light, metallic chip, embossed numerals, and (on light backdrops) a ground shadow.
- [ ] The hero card fan sits in perspective with three cards, and tilts subtly with the pointer on desktop.
- [ ] At least two elements overlap a container edge (cards tile visual, hero toast).
- [ ] The white band is `#f4f4f5` with white cards that clearly lift; the Growth card sits higher and has the strongest shadow.
- [ ] Buttons have tactile highlights and pressed states.

**Restraint**
- [ ] No colored glow, neon outline, blur blob, bloom, or gradient text anywhere.
- [ ] Only one tinted shadow exists (the Growth card).
- [ ] No `backdrop-filter` outside the nav; no `filter: blur()`.
- [ ] `prefers-reduced-motion` disables tilt, float, and hover lifts.

**Quality**
- [ ] All text still passes contrast on gradients and cards.
- [ ] Typecheck, lint, and tests pass; no layout shift; smooth scroll under 4× CPU throttle.

If something here conflicts with the existing code or a previous rule you cannot reconcile, stop and report it instead of guessing. Include before and after screenshots in your report.
