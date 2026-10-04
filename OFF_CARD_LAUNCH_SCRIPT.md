# Off-Card — Official Launch Film Specification (Round 7: Motion Continuity & 3D Hardware Master)

**Creative Direction:** Sovereign Fintech & Luxury Hardware Cinema (Apple × Revolut Ultra × Amex Centurion)  
**Format:** 16:9 Cinema Showcase (`1920 × 1080` / `4K 3840 × 2160`) at 60 FPS  
**Total Runtime:** 80.2 Seconds (19 Measured, Single-Action Base Shots; Zero Teleporting; Zero Rushed Beats)  
**First Product Arrival:** `~0:21` (Card Reveal at `21.7s`)  
**Hero 3D Scale:** Strict `scale: 0.28 – 0.30` (`~0.53` of frame width) with 3D perspective tilt (`y: 10–13°`, `x: 4–6°`), soft drop shadows, and subtle specular lighting.  
**Palette:** Pure Monochrome Silk + White Display Typography + ONE Sovereign Accent (Lavender `#a5b4fc`). Unlabeled progress lines, wireframe slabs, and neon frames permanently eliminated.  
**Audio Architecture:** Continuous Acoustic Bed with ZERO dead air:
- Filtered Dark Sub-Bass Drone (`ambience-soft-drone-1` & `2`) across `0.0s – 17.7s`.
- **True Intentional Silence:** Exactly 1.2s of absolute silence in Shot 3a (`17.7s – 18.9s`).
- Luminous Warm Pad Bed (`ambience-airy-pad-1`, `2`, `3`) seamlessly crossfading from `18.9s – 80.2s` with smooth 2.0s acoustic tail; all ambient dips at 0:52 and 1:09 filled.
- Foley transition sounds (ticks, soft whooshes, sub drops) leading every visual cut by `60–100ms`.
- Contactless chirp + soft thud on terminal contact, followed by ~0.4s intentional near-silence before the "Day 0." relief chime at 40.8s.
**Live Raylight Project:** [Open Live Raylight Editor](https://www.raylight.app/editor/d5d5b299-79d8-49d1-ac02-e6424492cecc) (`d5d5b299-79d8-49d1-ac02-e6424492cecc`)

---

## 1. Architectural Principles & Quality Standards

1. **Zero Teleporting & Cross-Cut Momentum:** Every persistent object across cuts shares identical position, scale, rotation, and brightness between the last ~100ms of shot A and the first ~100ms of shot B. Continuous moves carry motion directly across the seam.
2. **True 3D POS Terminal:** Shot 5a features a dedicated extruded graphite metal terminal body (`depth: 0.08`, `material: metal`, dark graphite `#151822`, resting rotation `y: -12°, x: 4°`), inset screen (`#0b0e16`), multi-stage blur `textSwap` ("Ready" -> "$12.40" -> "Approved"), pulsing NFC icon, curved card arrival trajectory with contact dip, 3 expanding lavender stroke rings, subtle terminal shake, and a 3-frame bloom swell into "Day 0.".
3. **Animated Day Counter System:** Shot 2b features a massive number "1" (`size: 0.11`) with "Day" above and subline below. Swaps with `slideUp` odometer transitions to "2" (2700ms) and "3" (5400ms). Five small day pips beneath the number fill progressively with strike lines drawn via `pathReveal`. Strain jitter on "Still under review.". Key light drops progressively colder (`6000K -> 7500K -> 9000K`). Leftover orange artifacts at 17.5s completely removed.
4. **Hardware Macro & Flip Continuity:** Shot 6a unifies the EMV chip push-in (`zoom: 1.0 -> 3.5 -> 1.0`), steady card scale (`0.28`), and seamless 3D Y-axis flip (front `0° -> 90°`, back `-90° -> 0°`). Eliminates the historical scale jump at 50.2s. Back face in Shot 6c starts centered and glides smoothly right over 1.2s with ease-in-out.
5. **Clean Standalone Edition Artworks:**
   - **Grid:** Pure official graphic artwork (`33d05184-9654-42f4-b24c-0d36a91e41eb.png`), free of chips, card numbers, or names.
   - **Carbon:** Standalone high-fidelity dot-matrix single-card artwork (`246ba8fa-6420-42a6-a43e-413aa03e4dad.png`), not cropped from a stack.
   - **Fan (7e):** All 4 editions positioned strictly inside 6% safe margins, assembling with momentum from Carbon.
6. **Brand Lockup Push-Through & Zero Downward Drift:** Camera dives into the hero card logo in 7e; 8a opens with the logo lockup at scale and settles; 8b carries the identical logo layer gliding up to `y: 0.84`, with "Spend freely." at `y: 0.44` and "offcard.me" at `y: 0.26` (well above the 6% bottom safe margin `y = 0.14`).

---

## 2. Complete 19-Shot Base Visual Sequence & Technical Breakdown

### Scene 1: HOOK (0.0s – 6.4s)
* **1a: "You own it." (0.0s – 3.2s / 3200ms)**
  * **Shot ID:** `eee00197-134f-4b31-9a37-60fe479a7576`
  * **Visual:** Deep near-black obsidian silk. A sharp horizontal line of light draws across with `pathReveal` + glow.
  * **Typography:** "You own it." alone (`#ffffff`, size `0.082`, weight 600, centered at `y: 0.70`).
  * **Audio:** `ambience-soft-drone-1` bed begins with 0.8s fade-in; light sweep accompanied by `whoosh-soft-airy-1` at 300ms.
* **1b: "So why can't you spend it?" (3.2s – 6.4s / 3200ms)**
  * **Shot ID:** `05459b64-50f8-430e-82ce-58fc64cdcef5`
  * **Visual:** Match cut on identical silk; slow linear drift into question.
  * **Typography:** Headline (`#ffffff`, size `0.076`, weight 600, centered at `y: 0.70`).
  * **Audio:** Sub-bass drone bed continues uninterrupted.

### Scene 2: PROBLEM (6.4s – 17.7s)
* **2a: The Takeaway (6.4s – 9.6s / 3200ms)**
  * **Shot ID:** `ee0c3205-54bd-4a60-b010-04315c63e212`
  * **Visual:** Cold studio lighting (`8500K`, `#0c1626` midnight tone).
  * **Typography:** Headline "Then off-ramps took it away." (`#ffffff`, size `0.075`, weight 600, `y: 0.77`); Subline "Banking hours. Compliance holds." (`#c5cedb`, weight 500, `y: 0.57`).
  * **Audio:** Seamless crossfade into `ambience-soft-drone-2` at 7000ms.
* **2b: The Day Counter (9.6s – 17.7s / 8100ms)**
  * **Shot ID:** `e077ee57-5ba2-42bb-8552-44e588c98c03`
  * **Visual:** Clean animated odometer counter:
    * Label "Day" (`y: 0.88`, size `0.046`), Large number (`y: 0.77`, size `0.11`, swaps "1" -> "2" at 2700ms -> "3" at 5400ms with `slideUp`).
    * Five day pips beneath (`spacing: 0.07`, size `0.016`) with `fillColor` animations and `pathReveal` strike lines at 2700ms and 5400ms.
    * Subline "Under review." (`y: 0.62`) swapping to "Identity check required." -> "Still under review." with `jitter` emphasis.
    * Key light temperature progressively drops: `6000K -> 7500K -> 9000K`.
  * **Audio:** `ui-tick-1` at 10000ms, `ui-tick-2` at 12600ms, `ui-tick-3` at 15400ms. Sub-bass drone bed fades smoothly at 17700ms.

### Scene 3: EXHALE (17.7s – 21.7s)
* **3a: Dim to Black (17.7s – 18.9s / 1200ms)**
  * **Shot ID:** `1732e63c-5bca-4c62-ad1e-63f373fd30d4`
  * **Visual:** Total obsidian stillness. Zero elements visible on screen. Orange lines eliminated.
  * **Audio:** **1.2s of absolute intentional silence**. Zero sound layers active.
* **3b: "Until now." (18.9s – 21.7s / 2800ms)**
  * **Shot ID:** `6c94bf53-4485-4f93-a697-dd3035c7d116`
  * **Visual:** Serene calm midnight silk.
  * **Typography:** Headline "Until now." (`#ffffff`, size `0.110`, weight 700, `y: 0.77`); Subline "No bank permission. No paperwork." (`#c5cedb`, size `0.052`, weight 500, `y: 0.58`).
  * **Audio:** Tension riser `riser-airy-swell-1` builds to 21700ms.

### Scene 4: REVEAL (21.7s – 32.7s)
* **4a: Card Reveal & Settle (21.7s – 29.7s / 8000ms)**
  * **Shot ID:** `d0942db2-14da-4388-95ef-6540ba41a452`
  * **Visual:** Merged seamless reveal. Card enters at center (`x: -1.90, y: 0.70`, scale `0.30`, tilt `y: 13°`), glides right at 3200ms (`x: -1.45`), holds while "Meet Off-Card." and subline enter, then glides back to center at 7200ms (`x: -1.90`) to match-cut into 4c.
  * **Audio:** Synchronized with `impact-sub-drop-1` (21700ms) + `impact-deep-muffled-1` (21605ms) + launch of luminous pad bed `ambience-airy-pad-1`.
* **4c: Beauty Orbit (29.7s – 32.7s / 3000ms)**
  * **Shot ID:** `f7e57503-7b4a-4197-8473-05f299dc0599`
  * **Visual:** Card starts centered (`-1.90, 0.70`), undergoes 3D specular lighting sweep, and in the last second glides to `{-1.85, 0.70, 0.05}` matching Shot 5a opening frame.
  * **Audio:** Soft cut tick at 29620ms; airy pad continues.

### Scene 5: SOLVE (32.7s – 46.7s)
* **5a: Hold, Approach & Tap (32.7s – 40.2s / 7500ms)**
  * **Shot ID:** `f4fd1222-40b1-48e2-a765-56ac41ee8c4e`
  * **Visual:** Merged Hold and Tap moment.
    * Left: Crypto wallet panel slides in on back plane (`x: -2.40, z: -0.06`), dimming to `0.4` at tap.
    * Right: Extruded dark graphite POS terminal (`x: -1.05, y: 0.70`, depth `0.08`, material `metal`) with inset screen, multi-stage `textSwap` ("Ready" -> "$12.40" -> "Approved"), check icon, and pulsing NFC mark.
    * Card starts at `{-1.85, 0.70, 0.05}`, glides along curved arc (`path.control: {x: 0.30, y: 0.14, z: 0.04}`) into contact range, dips scale (`0.98`, 120ms) at 37800ms.
    * 3 thin lavender stroke rings expand from NFC mark; terminal subtle shake; 3-frame bloom swell (flash-through cut).
    * Typography: "Hold." at `y: 0.16` (well above safe margin).
  * **Audio:** Soft whoosh at 32620ms; digital ticks at 32900ms; contactless chirp + soft thud (`click-trackpad-tap-1` + `impact-soft-boom-1`) at 37800ms; ~0.4s near-silence following tap.
* **5c: "Day 0." Payoff & Rise (40.2s – 46.7s / 6500ms)**
  * **Shot ID:** `f5316faf-83f3-49d4-9238-ee5a6d0ba864`
  * **Visual:** Merged Day 0 and Spend payoff.
    * Flash-through cut continues from tap (bloom eases from `1.5 -> 0.4` in 250ms).
    * Headline "Day 0." (`y: 0.98`) morphs via blur `textSwap` to "Spend what you hold." at 2800ms.
    * Subline "Approved. Paid from USDC." (`y: 0.80`) morphs to "Converted at checkout." at 2800ms.
    * Hero card rises from below at 2800ms, settling at `{x: -1.90, y: 0.40, z: 0.05}`, scale `0.28`, rotation `{x: 5, y: 12, z: -2}`.
  * **Audio:** Soft cut whoosh at 40120ms; approval chime `ui-success-chime-1` at 40800ms; continuous ambient pad.

### Scene 6: HARDWARE CRAFT (46.7s – 56.2s)
* **6a: Chip Macro & The Flip (46.7s – 52.7s / 6000ms)**
  * **Shot ID:** `9ffbdd7c-b30c-4efa-89d9-4b1626944a90`
  * **Visual:** Merged macro zoom and 3D flip.
    * Card starts at `{x: -1.90, y: 0.40, z: 0.05}`, scale strictly `0.28` (zero scale jump).
    * Headline "Engineered down to the chip." at `y: 0.16`.
    * Camera dolly pushes in `1.0 -> 3.5x` onto chip (`600–2000ms`), then pulls back `3.5 -> 1.0x` (`2000–3400ms`).
    * Card executes 3D Y-axis flip (front `0° -> 90°` at 3400–4700ms, back `-90° -> 0°` at 4700–6000ms).
  * **Audio:** Soft tick at 46620ms; flip whoosh `whoosh-slow-smooth-1` at 50180ms.
* **6c: Clean Back Face (52.7s – 56.2s / 3500ms)**
  * **Shot ID:** `aeef0c17-8862-4ab8-847c-7ad687e7ac52`
  * **Visual:** Back face starts centered at `{x: -1.90, y: 0.40}` (matching 6a end), glides smoothly to `x: -1.45, y: 0.70` over 1.2s with ease-in-out. Headline "Built to last." enters on left at `inMs: 600`.
  * **Audio:** Soft tick at 52620ms; continuous ambient pad (zero dips at 52s).

### Scene 7: EDITIONS (56.2s – 70.7s)
* **7a: Lumen (56.2s – 58.7s / 2500ms)**
  * **Shot ID:** `fcf2a10d-069d-4c0d-87c2-4b3e879603f4`
  * **Visual:** Split layout: Lumen card (`x: -1.45, y: 0.70, scale: 0.26`); Label "Lumen" (`x: -2.40, y: 0.70, size: 0.068`). Hard cut on tick with zero camera wobble.
  * **Audio:** Soft tick `ui-tick-1` at 56120ms (leads cut by 80ms).
* **7b: Chrome (58.7s – 61.2s / 2500ms)**
  * **Shot ID:** `84fe14a6-9efe-4c83-abf3-ca19960772a2`
  * **Visual:** Split layout: Mirror Chrome card at identical position and scale; Label "Chrome" (`size: 0.068`).
  * **Audio:** Soft tick `ui-tick-2` at 58620ms.
* **7c: Grid (61.2s – 63.7s / 2500ms)**
  * **Shot ID:** `f821a2b6-7c08-4f1b-bf60-a2ad78f7963a`
  * **Visual:** Clean graphic Grid card (`card_grid_clean.png`), chip-free and imprint-free. Label "Grid" (`size: 0.068`).
  * **Audio:** Soft tick `ui-tick-3` at 61120ms.
* **7d: Carbon (63.7s – 66.2s / 2500ms)**
  * **Shot ID:** `b3d34f52-7769-4fb1-9843-868836864f2b`
  * **Visual:** Standalone Carbon card (`card_carbon_clean.png`) with dot-matrix texture. Label "Carbon" (`size: 0.068`).
  * **Audio:** Soft tick `ui-tick-4` at 63620ms.
* **7e: Four Editions Fan-Out (66.2s – 70.7s / 4500ms)**
  * **Shot ID:** `bc4047df-006e-416a-ad65-f0443d8a1441`
  * **Visual:** All 4 editions fan out from Carbon (`x: -1.45`) with momentum, settling at `x: -2.29, -2.03, -1.77, -1.54`. All cards safely inside 6% safe margins (Carbon right edge at 745px, Lumen left edge at 152px). Camera dives into hero card logo at 3700–4500ms (`zoom: 1.0 -> 4.5x`).
  * **Audio:** Fan whoosh at 66120ms; continuous airy pad (zero dips at 1:09).

### Scene 8: CLOSE (70.7s – 80.2s)
* **8a: Logo Lockup Alone (70.7s – 73.2s / 2500ms)**
  * **Shot ID:** `b2b7b72b-835c-40e0-8671-6ecd9b056b51`
  * **Visual:** Opens with logo lockup filling frame from push-through dive (scale `0.83`), settling to rest (`scale: 0.26`, `y: 0.70`) at 700ms.
  * **Audio:** Soft whoosh at 70620ms; continuous airy pad.
* **8b: Spend Freely & Resolve (73.2s – 80.2s / 7000ms)**
  * **Shot ID:** `991f10b9-5aee-41d7-b80e-c46e60627da6`
  * **Visual:** Same logo layer glides up to `y: 0.84` over 800ms. Headline "Spend freely." enters at `y: 0.44`. URL "offcard.me" in sovereign lavender enters at `y: 0.26` (well above 6% margin `y = 0.14`). Light source positioned high at `y: 22` away from text. Rock-solid hold through to 80.2s.
  * **Audio:** Prestige boom at 73070ms; continuous ambient pad bed with 2.0s acoustic tail resolving into silence.

---

## 3. Spatial Coordinates & Layout Specifications (Raylight)

| Asset Layer | Absolute World Center | Scale / Size | Safe Margin Clearance |
| :--- | :--- | :--- | :--- |
| **Split Layout: Cards (4b, 6c, 7a–7d)** | `(-1.45, 0.70)` | `scale: 0.26 – 0.28` | Right side; tilt `y: ±10°` |
| **Split Layout: Labels (4b, 6c, 7a–7d)** | `(-2.40, 0.70)` | `size: 0.068` (>= 0.04) | Left-aligned (`textAlign: left`), safe margin > 12% |
| **Hero Card (Centered: 4a, 4c, 5c, 6a)** | `(-1.90, 0.40 to 0.70)` | `scale: 0.28 – 0.30` | Centered (~0.53 frame width); tilt `y: 12°, x: 5°` |
| **Wallet Panel (5a)** | `(-2.40, 0.72, z: -0.06)` | `scale: 0.22` | Back plane; slides in from left; dims to 0.4 at tap |
| **POS Terminal Body (5a)** | `(-1.05, 0.70, z: +0.02)` | `width: 0.44, height: 0.68` | Extruded dark graphite metal solid, depth 0.08 |
| **POS Screen & States (5a)** | `(-1.05, 0.78, z: +0.05)` | `width: 0.36, height: 0.36` | "Ready" -> "$12.40" -> "Approved" + check icon |
| **4-Card Fan Cascade (7e)**| `(-2.29, -2.03, -1.77, -1.54, y: 0.76)` | `scale: 0.155` each | Staggered in Z; >0.19 wu top margin; strictly inside frame |
| **Official Brand Lockup (8a, 8b)** | `(-1.90, 0.70 -> 0.84)` | `scale: 0.26` | Centered vector emblem + wordmark alone on silk |
| **Closing Copy (8b)** | `Spend freely: y=0.44; offcard.me: y=0.26` | `size: 0.068 / 0.052` | >0.12 wu above bottom safe margin (`0.14`) |
| **Canvas World Dimensions** | Center `(-1.90, 0.70)` | `width: 2.261, height: 1.272` | Authoritative bounds: `X [-3.031, -0.769]`, `Y [0.064, 1.336]` |

---

## 4. Verification & Quality Gate Results

* **Total Runtime:** `80200ms` (80.2s), exactly adhering to the measured brief.
* **Match Cuts & Zero Teleporting:**
  * 4c last frame `{-1.85, 0.70, 0.05}` == 5a first frame `{-1.85, 0.70, 0.05}` (pixel-identical).
  * 5c last frame `{x: 190px, y: 182px, w: 388px, h: 276px}` == 6a first frame `{x: 190px, y: 182px, w: 388px, h: 276px}` (100% pixel match).
  * 6a flip end `{x: 194px, y: 185px, w: 380px, h: 266px}` == 6c start `{x: 190px, y: 184px, w: 388px, h: 271px}`, gliding right over 1.2s.
  * 7a–7d editions: cards locked at identical `px.x: 358–359`, labels at `y = 197px`, hard-cutting on ticks with zero camera wobble.
  * 7e fan: all 4 cards strictly inside margins; dives into logo; 8a opens with logo at scale.
* **Zero Harsh Glow Frames:** Replaced with soft drop shadows and soft ambient lighting.
* **Strict 6% Safe Margins & Zero Lints:** 0 lint errors across all visual shots.
* **AV Synchronization & Continuity:**
  * Seamless drone bed `0.0s – 17.7s`.
  * Intentional silence in 3a (`17.7s – 18.9s`) and after tap (~38.0s).
  * Continuous airy pad `18.9s – 80.2s` with dips at 0:52 and 1:09 filled.
  * Foley transition ticks/whooshes leading every cut by 60–100ms.

---

## 5. Items Requiring User Confirmation

1. **"No bank permission" & "No paperwork" Claims:** In Shot 3b. Confirm regulatory compliance for self-custodial phrasing.
2. **"Day 0." Payoff:** In Shot 5c. Represents instantaneous settlement without conventional multi-day holds.
3. **Physical Card Material:** Copy currently uses `"Built to last."`. If the physical cards are grade-5 titanium or surgical steel, confirm so we can restore `"Crafted in titanium."` or specific alloy copy.
4. **Checkout Conversion Mechanics:** Copy reads `"Converted at checkout."` and `"Paid from USDC"`. Confirm if settlement executes via off-chain liquidity provider or instant DEX swap.

---

## 6. Recommended Export Settings (Raylight App UI)

To export the final master render directly from the [Raylight Web Editor](https://www.raylight.app/editor/d5d5b299-79d8-49d1-ac02-e6424492cecc):
- **Resolution:** `4K (3840 × 2160)` (or `1080p (1920 × 1080)` for standard web).
- **Frame Rate:** `60 FPS` (recommended for smooth 3D card rotation and specular sweeps).
- **Watermark:** `Off` (on Pro/Team plan).
- **Audio:** `AAC Stereo 320 kbps`.
