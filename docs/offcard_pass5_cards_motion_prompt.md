# Agent Prompt, Pass 5: Restore the Moneta card artwork, fix overlaps, add motion and a living background

The current build is strong and the owner loves the depth system and overall look. **Do not redesign anything.** Same design language, same tokens, same layout. This pass does four things:

1. **Restore the bank card artwork to match the Moneta reference photo.** It drifted during earlier passes.
2. **Fix overlaps and cropping** where floating UI covers real information.
3. **Add a dynamic background and a coherent animation system**, because the page feels static.
4. **A professional refinement sweep** (alignment, nav, footer, microcopy, small bugs).

The Moneta reference image (dark pinstripe card with "Current Balance $5,750,20", the pale lime-to-lavender card, and the stacked "Premium Banking" tray) is the **source of truth for card design**. If it is not attached to this prompt, ask the owner for it. Keep it open and compare against it visually while working.

---

## 1. Card artwork (highest priority)

### 1.1 What is wrong now

- The dark card in the hero and in the bento tile is a **plain dark slab with barely visible streaks**. The reference card is covered edge to edge in a dense, crisp, diagonal pinstripe pattern in olive-gold and slate-blue, with a warm olive glow toward the lower right. That signature texture is what makes it a Moneta card, and it is gone.
- Over-masking in earlier passes removed the stripes from the text zone. The reference does not hide the stripes; the text simply sits on top of them and stays readable.
- The dark card behind the light card is rendered without content (decorative), so the design reads as a black rectangle.
- Card faces are cropped so that the wordmark and expiry are cut off in the bento tile.

### 1.2 Restore the original artwork first

An earlier build of this project (the owner's custom-asset version) had the olive and lime pinstripe cards much closer to the reference. **Check git history / the assets folder for that artwork** (the version where the hero card showed olive-lime stripes fading to lavender at the lower right) and reuse it as the base if it exists. Then apply the depth system (rim light, sheen, shadows) on top. If the artwork no longer exists, rebuild it per the spec below.

### 1.3 Dark card spec (match the reference)

**Surface**
- Base: `linear-gradient(160deg, #141416 0%, #0a0a0c 55%, #050506 100%)`.
- **Pinstripe layer, visible across the whole face.** 150 to 190 line segments, each:
  - angle: measure it from the reference image and match it exactly (shallow diagonal, roughly 18° to 24° off horizontal; the reference descends left to right). Do not guess; overlay the reference at 50% opacity in a scratch page to verify the angle.
  - width `0.6 to 1.1px`, `stroke-linecap: round`.
  - length varies from 15% to 70% of the card width; starts are staggered so the lines form soft banded streaks, not a uniform hatch.
  - color follows a diagonal gradient across the card: `--stripe-slate` (`#474656`) toward the upper left and center, shifting to `--lumen-deep` / olive-gold (`#8c8a4a`) toward the lower right.
  - opacity `0.35 to 0.75`, so the texture is clearly visible at a glance.
- **Olive glow:** a radial gradient inside the card at the lower right (`rgba(140,138,74,0.35)` fading to transparent over about 55% of the card). This is internal card artwork, not an outer halo.
- **Text legibility without removing stripes:** put a soft dark **scrim** behind each text block instead of masking the stripes away: `radial-gradient(closest-side, rgba(0,0,0,0.55), transparent)` sized to the block, placed under the text but above the stripes. Contrast of white text must stay at 4.5:1 or better.

**Content (exactly as in the reference)**
- Top-left: label "Current balance" (13px, `rgba(255,255,255,0.45)`), then the balance (32px, Space Grotesk 500, tabular): `$5,750.20`.
- Top-right: the off-card logo mark and wordmark.
- Left-middle: metallic EMV chip (from pass 3).
- Bottom-left: full demo card number `5282 3456 7890 2343` in Space Grotesk, `letter-spacing: 0.08em`, tabular. `// DEMO DATA`.
- Bottom-right: expiry `08/28`.
- Depth layers from pass 3 stay: rim light, top gloss, a slow specular sheen (see animation section), engraved text-shadow.

### 1.4 Light card spec (keep close to the reference)

- Fill: `--gradient-lumen` (pale lime top-left, near-white middle, pale lavender bottom-right) with the soft top-left inner light from pass 3. **No pinstripes** on the light card.
- Layout like the reference: wordmark top-right, `USDC` pill and "Funded by USDC" top-left, balance large at the lower left with a small caption beneath, chip, expiry bottom-right.
- Keep its glossy coating and rim light.

### 1.5 Hero composition

Keep the composition the owner approved (light card in front, dark card behind and up-left), with these corrections:

- The back dark card is now **fully rendered** (stripes plus its content). Offset it so its **top-left text block (label, balance) and its wordmark stay fully visible** and only its lower-right area is covered by the light card. Natural card-on-card overlap is fine. Floating UI is not allowed to cover any text (see section 2).
- Dark card pose: `translate3d(-16%, -22%, -30px) rotateZ(-9deg) rotateY(-8deg) rotateX(4deg)`. Light card: `translate3d(10%, 8%, 40px) rotateZ(-3deg) rotateY(-8deg) rotateX(4deg)`. Adjust offsets until the dark card's balance is not covered; verify in a screenshot.
- Both cards use the same `BankCard` component with `variant`. The `decorative` mode is only for a third, purely decorative card, if you add one.

### 1.6 Where else cards appear

Every card on the page (hero, "Cards in under 30 seconds" tile, any CTA panel card) must be generated from the same `BankCard` component and the same artwork, so they cannot drift again. Add a visual regression test (Playwright screenshot of an isolated `BankCard` dark and light variant) so future edits that change the artwork are caught.

---

## 2. Fix overlaps, cropping, and text collisions

### 2.1 "Cards in under 30 seconds" tile

Observed problems:
- The "Paid $1,240.00 · 1,240.00 USDC" toast sits on top of the chip row, hiding the "Single-use" and "Recurring" chips and clipping "Merchant-locked".
- The card visual bleeds so far off the right and bottom edges that the wordmark ("off-ca…") and expiry are cut off.
- The dark card behind sits under the paragraph, so body text runs across the card edge.
- A large empty area sits between the paragraph and the chips.

Fix:
- **Remove the toast from this tile.** The toast belongs only in the hero (one signature element, not repeated).
- Tile layout: CSS grid with two zones. Text block top-left with `max-width: 30ch`. Visual **right and bottom**, width 58%, bleeding off the lower right corner by **at most 6%**, so the wordmark, balance, number, and expiry of the front card are all fully visible. The dark card behind is fully rendered per section 1.
- **Chips row** pinned bottom-left (`bottom: 32px; left: 32px`), z-index above the background but no overlap with the card visual (`max-width: 52%` so it cannot reach the card).
- **Fill the empty left-middle** with a recessed well "spend limit" meter: label "Marketing team card", "$1,240 of $5,000 this month", a progress bar (raised track, `--gradient-lumen` fill at 25%). Demo data.
- Below 1024px the tile stacks: text, meter, card visual, chips. No overlaps at any width.

### 2.2 "Every spend, settled on-chain" tile (treasury, gradient)

The lower half is empty. Add a vertical **settlement timeline** of three recessed wells (each `--r-md`): `Authorized  14:02:11` → `Converted  14:02:12` → `Settled  14:02:14`, with a tiny status dot each and the truncated hash `0x7a3f…91c4` (mono) on the last row. Demo data, marked `// VERIFY` for the "seconds" timing. Keep the sparkline texture. Animate the steps in sequence on first view (see section 4).

### 2.3 Systemic rule: floating UI never covers information

Any floating element (toast, badge, chip, tooltip) must sit in a **reserved safe zone** and never intersect text, numbers, or card faces.

Implementation:
- Mark every text or data element that must stay visible with `data-keep-clear`.
- Add a Playwright test that, at 1920, 1440, 1024, 768, and 390px, asserts that the bounding box of each `[data-floating]` element does not intersect any `[data-keep-clear]` element:

```ts
// e2e/no-overlap.spec.ts (sketch)
for (const width of [1920, 1440, 1024, 768, 390]) {
  test(`floating UI does not cover content @${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const floats = await page.locator("[data-floating]").all();
    const keeps = await page.locator("[data-keep-clear]").all();
    for (const f of floats) {
      const fb = await f.boundingBox(); if (!fb) continue;
      for (const k of keeps) {
        const kb = await k.boundingBox(); if (!kb) continue;
        const hit = fb.x < kb.x + kb.width && fb.x + fb.width > kb.x &&
                    fb.y < kb.y + kb.height && fb.y + fb.height > kb.y;
        expect(hit, `${await f.getAttribute("data-floating")} overlaps ${await k.textContent()}`).toBe(false);
      }
    }
  });
}
```

### 2.4 Hero toast (the one that stays)

Keep it below-left of the stack, outside the card faces, `white-space: nowrap`. It now **cycles** through three demo payments (see section 4.6) in the same safe zone, one at a time.

---

## 3. A living background (replace the static dots)

The static dot grid reads as wallpaper. Replace it with a **halftone flow field**: the same dot language as the Moneta brand board, but slowly moving, reacting gently to the pointer. Professional, not flashy.

### 3.1 Behavior
- Dots on a 22px grid. Each dot's radius and opacity come from two layers of smooth value noise that drift slowly (a full cycle takes about a minute), so soft clouds of larger dots move across the field like a gradient.
- A **mask** keeps dots out from behind the headline, paragraph, and buttons: strongest at the right and upper right behind the card stack, fading to nothing toward the left and at the bottom of the band.
- **Pointer reaction:** within 150px of the cursor, dots swell slightly (radius +0.8px max, eased). It should feel like light passing over a surface, not a gimmick. No ripples, no trails.
- **Variants:** `hero` (as above), `panel` (CTA panel: right 40% only). Optional later: `map`.
- Monochrome only: `rgb(154,154,160)` at alpha `0.12 to 0.5`. No color, no glow.

### 3.2 Implementation (canvas 2D, no libraries)

```tsx
// components/texture/HalftoneField.tsx
import { useEffect, useRef } from "react";

interface HalftoneFieldProps {
  variant?: "hero" | "panel";
  pitch?: number;
  className?: string;
}

const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

function hash(x: number, y: number) {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
function vnoise(x: number, y: number) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const u = smooth(x - xi), v = smooth(y - yi);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

export function HalftoneField({ variant = "hero", pitch = 22, className }: HalftoneFieldProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, raf = 0, last = 0, visible = true;
    const t0 = performance.now();
    const pointer = { x: -9999, y: -9999 };

    const mask = (nx: number, ny: number) => {
      if (variant === "hero") {
        const horiz = smooth(clamp01((nx - 0.38) / 0.5));
        const vert = 1 - smooth(clamp01((ny - 0.7) / 0.3));
        return horiz * vert;
      }
      return smooth(clamp01((nx - 0.6) / 0.4));
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, w, h);
      const t = (now - t0) * 0.00011;
      const cols = Math.ceil(w / pitch), rows = Math.ceil(h / pitch);
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const x = i * pitch + pitch / 2, y = j * pitch + pitch / 2;
          const m = mask(x / w, y / h);
          if (m < 0.02) continue;
          const n = vnoise(i * 0.11 + t * 3.2, j * 0.11 - t * 2.1) * 0.65
                  + vnoise(i * 0.27 - t * 4.5, j * 0.27 + t * 1.7) * 0.35;
          let level = m * (0.3 + 0.7 * n);
          const dx = x - pointer.x, dy = y - pointer.y, d = Math.hypot(dx, dy);
          if (d < 150) level = Math.min(1, level + smooth(1 - d / 150) * 0.5);
          const r = 0.5 + level * 1.5;
          ctx.fillStyle = `rgba(154,154,160,${(0.12 + level * 0.38).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width; h = rect.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(performance.now());
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || document.hidden || now - last < 33) return; // about 30fps is plenty
      last = now;
      draw(now);
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top;
    };

    const ro = new ResizeObserver(resize); ro.observe(canvas);
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; });
    io.observe(canvas);
    resize();
    if (!reduce) {
      window.addEventListener("pointermove", onMove, { passive: true });
      raf = requestAnimationFrame(loop);
    }
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [variant, pitch]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={className}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
}
```

### 3.3 Where it goes
- Hero band: `variant="hero"`, behind everything.
- CTA panel: `variant="panel"` (replaces the faint static dots), content stays left-aligned and clear of the dots.
- Optionally the features band: a very low-density static render (no animation) as a continuity cue. Do not run more than **two** animated canvases on screen at once; the `IntersectionObserver` already pauses off-screen ones.

### 3.4 Performance budget
- Canvas DPR capped at 2, about 30fps, paused when off-screen or tab hidden, no work under `prefers-reduced-motion` (one static frame).
- Main-thread cost per frame under 4ms on a mid-range laptop (about 2,500 dots). Verify with the Performance panel and throttle CPU 4× once; scrolling must stay smooth.

---

## 4. Animation system

Restrained, physical, and consistent. No bounce, no glow pulses, no parallax-heavy scroll jacking. **No animation library**; use CSS, `IntersectionObserver`, and `requestAnimationFrame`.

### 4.1 Tokens

```css
:root {
  --dur-fast: 150ms;
  --dur-base: 250ms;
  --dur-slow: 500ms;
  --dur-hero: 900ms;
  --ease-out: cubic-bezier(.22, .8, .24, 1);
  --ease-in-out: cubic-bezier(.65, 0, .35, 1);
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .001ms !important; animation-iteration-count: 1 !important; transition-duration: .001ms !important; scroll-behavior: auto !important; }
}
```

### 4.2 Page load (hero)
Staggered entrance, once: eyebrow/headline lines fade up 16px (each headline line 80ms after the previous), paragraph and buttons follow at 300ms and 380ms, then the **card stack enters**: the dark card slides in from the left and the light card from the right, rotating into their final poses over `--dur-hero` with `--ease-out`, then the idle float begins. The halftone field fades in over 1.2s.

### 4.3 Card behaviors
- **Idle float:** `translateY(0 → -6px)` over 6s `--ease-in-out`, alternate, only when the pointer is not over the stage.
- **Pointer tilt:** keep the pass 3 `useTilt` at max ±4°, plus a **specular sheen** that tracks the tilt (sheen gradient position shifts with `--tilt-y`).
- **Auto sheen sweep:** every 7s a soft diagonal highlight passes across each card face over 1.4s (animate `background-position` of the sheen layer). Offset the two cards by 1s.
- **Stripe drift:** the pinstripe layer translates 0 → 6px along its angle over 14s, alternate, giving the metal a subtle live shimmer. (Keep it under 6px so text legibility is unaffected.)

### 4.4 Scroll reveals
`useReveal(ref)` with one shared `IntersectionObserver`: elements start at `opacity: 0; transform: translateY(16px)` and transition to visible over `--dur-slow` with `--ease-out`, `threshold: 0.15`, once. Stagger siblings by 80ms (set `--i` and use `transition-delay: calc(var(--i) * 80ms)`). Apply to: section headings, bento tiles, pricing cards (stagger left to right), FAQ rows, CTA panel. The featured Growth card keeps its `-8px` lift as the final state.

### 4.5 Numbers
- `CountUp` for hero stats (`30` and `0`), balances, and the pricing figures: ease-out over 900ms the first time they enter view, tabular numerals so width does not jitter. Hero card balance counts up once on load.
- Balance rows in the assets tile **tick** occasionally: every 6 to 9s, one row's value changes by a tiny amount with a 250ms digit roll. Pure demo behavior; `aria-hidden` on the animated copy, and the static value stays in the accessible text.

### 4.6 Hero toast
Cycles through three demo payments every 5.5s: slide in from the left (`--dur-base`), hold 4s, fade out, next. Demo data in `demoData.ts`. Pauses while the tab is hidden.

### 4.7 Tile interactions
- **Cursor spotlight:** on `.tile:hover`, a faint radial highlight follows the cursor inside the tile (`radial-gradient(260px at var(--mx) var(--my), rgba(255,255,255,0.06), transparent)`; update `--mx`/`--my` via `pointermove` in rAF). Desktop only.
- Hover lift stays as in pass 3.
- Settlement timeline steps (section 2.2) animate in sequentially: dot fills, row slides 8px, 180ms apart, once.

### 4.8 Pricing and FAQ
- Plan cards lift on hover (pass 3). The featured card has a **slow light pass** along its top edge every 8s (a 1px highlight gliding left to right, 1.2s). Subtle, no color.
- Accordion opens with a real height transition (`grid-template-rows: 0fr → 1fr`, 250ms) and the chevron rotates 180°.
- Buttons: the arrow glyph nudges 2px up-right on hover; primary buttons already lift 1px.

### 4.9 Navigation
- Becomes slightly more compact after 24px of scroll (64px → 56px), 200ms.
- Active-section link underline follows scroll position (`IntersectionObserver` on sections), 2px, `--primary` on dark, `--ink` on light.

### 4.10 Guardrails
- At most three concurrently running ambient animations in any viewport (halftone, card float, sheen). Anything else is one-shot.
- Every animation honors `prefers-reduced-motion` (static final state).
- Animate only `transform` and `opacity` (plus `background-position` for sheen). No layout-affecting animation.
- No animation may delay content: text is in the DOM and readable from the first paint; reveals must never hide content from users with JS disabled (start hidden only after hydration with a `.js` class on `<html>`).

---

## 5. Professional refinement sweep

**Bugs seen in the latest screenshots**
1. **Nav over the white band:** the translucent nav turns muddy grey over light sections, and underlying text bleeds through (the logo overlaps "Common questions"). There is also a grey strip under the nav at the top of the white band. Fix: nav `background: rgba(0,0,0,0.92)` with `backdrop-filter: blur(16px) saturate(120%)`; confirm the strip is gone; nav height and the section's top padding must match so nothing scrolls under a half-transparent edge.
2. **Right-edge line:** a thin light vertical line is still visible at the far right of the viewport. Track down horizontal overflow (`100vw`, negative margins, an oversized absolutely positioned element such as the bleeding card). Set `html, body { overflow-x: clip; background: #000; }` and replace `100vw` with `100%`.
3. **Hero stat footnote markers** are tiny colored dots. Render them as real superscript numerals (`<sup>`), 11px, `--on-dark-mute`, matching footnote text below the tile.
4. **Footer disclosures:** two paragraphs both say "not a bank" with different wording, and the second shows raw placeholders (`[issuer]`, `[network]`). Merge into **one** disclosure block. Add a CI check that **fails the production build** if any string matching `\[(issuer|network)\]` or `TODO(compliance)` renders in production, so placeholders can never ship by accident.
5. **Demo data:** replace real brand names in sample transactions (Figma, AWS, Linear) with neutral ones ("Design software", "Cloud hosting", "Project tools") to avoid implying relationships.

**Alignment and rhythm**
- Section headers: one `SectionHeader` component for heading plus supporting paragraph. Heading left, paragraph right, **bottom-aligned to the heading's last baseline**; same top and bottom spacing everywhere.
- Everything on the 1168px container; verify left and right edges align across hero, bento, pricing, FAQ, CTA, and footer.
- Tile titles all `heading-md` 24px; body copy 15 or 16px; mono text never below 12px.
- Equal bento gutters (16px) and equal inner padding (32px) in every tile.
- Hero vertical rhythm: 96px top, 88px bottom; the stat tile 56px below the CTA row.

**Microcopy polish**
- Keep copy as is unless a line is wrong. Remove stray double punctuation, ensure sentence case, and make every CTA say "Open account" (secondary actions: "How it works", "Talk to sales", "Contact support").

---

## 6. Accessibility and performance (unchanged standards)

- WCAG 2.2 AA, focus rings, 44px touch targets, one `h1`, semantic landmarks.
- White text on the dark card must keep 4.5:1 contrast against the stripes plus scrim. Check at the brightest stripe region.
- All decorative layers (`HalftoneField`, stripes, sheens, floating toast) are `aria-hidden` and `pointer-events: none`.
- Lighthouse: Performance 90+, Accessibility 100, no layout shift from fonts or reveals. Test with CPU 4× throttle.

---

## 7. Do this in order

1. Restore or rebuild the `BankCard` artwork to match the reference (section 1). Show before/after screenshots next to the reference.
2. Fix the bento overlaps and add the meter and settlement timeline (section 2); add `data-keep-clear` / `data-floating` and the Playwright test.
3. Build `HalftoneField` and wire it into the hero and the CTA panel (section 3).
4. Implement the animation system (section 4), starting with tokens and reveal, then card behaviors, numbers, toast, tiles, nav.
5. Professional sweep (section 5).
6. Run typecheck, lint, unit, and e2e tests. Capture screenshots at 1920, 1440, 1024, 768, and 390, plus a short screen recording of the hero for the owner.
7. Report what changed, remaining `VERIFY` / `TODO(compliance)` items, and anything you could not do.

---

## 8. Acceptance checklist

**Cards**
- [ ] Dark card shows the full-face olive/slate pinstripe with olive glow, matching the reference in angle, density, and color; all text readable.
- [ ] Light card matches the lime-to-lavender gradient, no stripes.
- [ ] Hero shows both cards with real content; the dark card's balance and wordmark are visible.
- [ ] Every card on the page comes from the single `BankCard` component; visual regression tests exist.

**No overlaps**
- [ ] The "Paid" toast appears only in the hero, never covers card text, and cycles through demo payments.
- [ ] Bento cards tile: wordmark, balance, number, and expiry fully visible; chips fully visible; no text runs across a card edge.
- [ ] The Playwright no-overlap test passes at all five widths.

**Motion**
- [ ] Halftone field moves slowly, reacts to the pointer, is masked away from text, pauses off-screen, and renders static under reduced motion.
- [ ] Hero entrance, card float, sheen sweep, tilt, scroll reveals, count-ups, toast cycle, tile spotlight, accordion transition, and nav behavior all work and respect `prefers-reduced-motion`.
- [ ] At most three ambient animations at once; scrolling stays smooth under 4× CPU throttle.

**Professional polish**
- [ ] Nav is clean over both dark and light bands; no grey strip; no bleed-through.
- [ ] No right-edge line; no horizontal scroll.
- [ ] Footer has one merged disclosure; the CI check blocks placeholders in production.
- [ ] Consistent section headers, gutters, padding, and container edges.
- [ ] No real brand names in demo data.

If anything here conflicts with the codebase or an earlier rule and you cannot reconcile it, stop and report instead of guessing. Do not add effects that are not in this prompt: no neon, no bloom, no gradient text, no pixel type.
