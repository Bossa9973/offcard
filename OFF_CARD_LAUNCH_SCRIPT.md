# Off-Card — Official Launch Film Specification (Round 6: Luxury Master Edition)

**Creative Direction:** Sovereign Fintech & Luxury Hardware Cinema (Apple × Revolut Ultra × Amex Centurion)  
**Format:** 16:9 Cinema Showcase (`1920 × 1080` / `4K 3840 × 2160`) at 60 FPS  
**Total Runtime:** 80.2 Seconds (24 Measured, Single-Action Base Shots; Zero Rushed Beats)  
**First Product Arrival:** `~0:21` (Card Reveal at `21.7s`, accelerated from 0:27)  
**Hero 3D Scale:** Strict `scale: 0.30` (`~0.53` of frame width) with 3D perspective tilt (`y: 10–15°`, `x: 4–6°`), soft drop shadows, and subtle light pool behind/below card. Neon glow frames completely removed.  
**Palette:** Pure Monochrome Silk + White Display Typography + ONE Sovereign Accent (Lavender `#a5b4fc`). Unlabeled progress lines, wireframe slabs, and neon frames permanently eliminated.  
**Layout Philosophy:** Strict architectural split system (Card right at `x: -1.45, y: 0.70`, Text left at `x: -2.40, y: 0.70`) for all explanatory and edition beats; pure centered composition reserved for Hook, Pivot, Tap, and Climax/CTA.  
**Audio Architecture:** Continuous Acoustic Bed with ZERO dead air:
- Filtered Dark Sub-Bass Drone (`ambience-soft-drone-1` & `2`) across `0.0s – 17.7s`.
- **True Intentional Silence:** Exactly 1.2s of absolute silence in Shot 3a (`17.7s – 18.9s`).
- Luminous Warm Pad Bed (`ambience-airy-pad-1`, `2`, `3`) seamlessly crossfading from `18.9s – 80.2s` with smooth 2.0s acoustic tail; all ambient dips eliminated.
- Foley accents locked to video cuts (e.g. `Impact Sub Drop 1` hitting at `21.7s` on the first card reveal; clock ticks on Day swaps).
**Live Raylight Project:** [Open Live Raylight Editor](https://www.raylight.app/editor/d5d5b299-79d8-49d1-ac02-e6424492cecc) (`d5d5b299-79d8-49d1-ac02-e6424492cecc`)

---

## 1. Architectural Principles & Quality Standards

1. **Glow Elimination & Light Pools:** Harsh neon outline frames have been stripped from every card layer. Replaced by: (a) soft drop shadow (`blur: 0.18, opacity: 0.45–0.50`), (b) an elliptical light pool behind/below the card (`lavender #a5b4fc` radial fade, `opacity: 0.15, layerBlur: 0.18`), and (c) subtle specular surface light sweeps.
2. **Emotional Day Counter System:** Problem sequence (Scene 2) eliminates arbitrary rectangles and is rebuilt into an unhurried, escalating Day Counter (Shot 2b, 8.1s) cycling "Day 1." -> "Day 2." -> "Day 3." via `textSwap` while the lighting temperature turns progressively colder (6000K -> 7500K -> 9000K).
3. **The "Day 0." Payoff:** Scene 5c delivers the direct emotional antithesis to the problem: "Day 0." (`size: 0.096, y: 0.78`) with subline "Approved. Paid from USDC." (`size: 0.052, y: 0.58`) and a lavender dot (`#a5b4fc`). The card is removed in this shot to let the resolution breathe.
4. **Strict Split vs. Centered Layouts:**
   - **Split Layout** (`Card right: x: -1.45, y: 0.70`; `Text left: x: -2.40, y: 0.70`, left-aligned): Applied to Shots 4b, 6a, 6c, 7a, 7b, 7c, and 7d.
   - **Centered Layout** (`x: -1.90`): Reserved for Hook (1a, 1b), Pivot (3b), Solve (5b, 5c, 5d), and Climax/CTA (8b, 8c).
5. **Physical Hardware Realism:** Reverse card face (Shots 6b, 6c) updated with true black magnetic stripe (`#000000`) and muted off-white signature strip (`#d4d3ce`) for tangible luxury authenticity.
6. **Strict Reading-Time Law:** Every text line remains static for at least `(words / 2.5) + 1.2s` after entrance finishes.
7. **Pristine Claim Hygiene:** Unverified claims ("Zero KYC", "100M+", "0.4s", "30s", "Crafted in titanium") remain excluded; titanium replaced with "Built to last." pending user material confirmation.

---

## 2. Complete 24-Shot Base Visual Sequence & Technical Breakdown

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
  * **Visual:** Unlabeled lines and wireframe rectangles eliminated. Multi-stage Day Counter:
    * *Stage 1 (0–2700ms):* "Day 1." (`size: 0.096, y: 0.78`) + "Under review." (`#c5cedb, size: 0.052, y: 0.62`), Key light at `6000K`.
    * *Stage 2 (2700–5400ms):* `textSwap` to "Day 2." + "Identity check required. Passport · Proof of address · Face scan", Key light drops to colder `7500K`.
    * *Stage 3 (5400–8100ms):* `textSwap` to "Day 3." + "Still under review.", Key light drops to freezing `9000K`.
    * Gentle glitch burst capped at `0.25` on day transitions.
  * **Audio:** `ui-error-blip-1` at 9800ms, `ui-tick-1` at 10000ms, `ui-tick-2` at 12600ms, `ui-tick-3` at 15400ms. Sub-bass drone bed fades smoothly at 17700ms.

### Scene 3: EXHALE (17.7s – 21.7s)
* **3a: Dim to Black (17.7s – 18.9s / 1200ms)**
  * **Shot ID:** `1732e63c-5bca-4c62-ad1e-63f373fd30d4`
  * **Visual:** Total obsidian stillness. Zero elements visible on screen.
  * **Audio:** **1.2s of absolute intentional silence**. Zero sound layers active.
* **3b: "Until now." (18.9s – 21.7s / 2800ms)**
  * **Shot ID:** `6c94bf53-4485-4f93-a697-dd3035c7d116`
  * **Visual:** Serene calm midnight silk.
  * **Typography:** Headline "Until now." (`#ffffff`, size `0.110`, weight 700, `y: 0.77`); Subline "No bank permission. No paperwork." (`#c5cedb`, size `0.052`, weight 500, `y: 0.58`).
  * **Audio:** Tension riser `riser-airy-swell-1` builds to 21700ms.

### Scene 4: REVEAL (21.7s – 32.7s)
* **4a: Big 3D Hero Card Reveal (21.7s – 25.7s / 4000ms)**
  * **Shot ID:** `d0942db2-14da-4388-95ef-6540ba41a452`
  * **Visual:** Flagship Chrome card rises in alone. Scale `0.30` (`~0.53` frame width). 3D perspective tilt (`y: 13°, x: 5°, z: -2°`), soft drop shadow (`blur: 0.18, opacity: 0.5`), light pool ellipse behind/below card (`width: 1.55, height: 0.65, opacity: 0.15, layerBlur: 0.18`). Camera executes slow orbit push-in (`zoom: 1.0 -> 1.22`, `orbitDeg: 8°`). Specular light streak sweeps across bevel. No text.
  * **Audio:** Cut synchronized with `impact-sub-drop-1` (re-timed to 21700ms) + `impact-deep-muffled-1` (21605ms) + launch of luminous pad bed `ambience-airy-pad-1`.
* **4b: "Meet Off-Card." (25.7s – 29.7s / 4000ms)**
  * **Shot ID:** `b97ab1dc-04b6-4e31-9661-3cf8c8788560`
  * **Visual:** Split layout: Card positioned on the right (`x: -1.45, y: 0.70, scale: 0.28, y: 13°`). Text on left (`x: -2.40, y: 0.70`, left-aligned).
  * **Typography:** Headline "Meet Off-Card." (`size: 0.082, weight: 600`); Subline "A card that spends straight from your wallet." (`size: 0.050, weight: 500, color: #c5cedb`).
  * **Audio:** Warm airy pad continues seamlessly.
* **4c: Beauty Orbit (29.7s – 32.7s / 3000ms)**
  * **Shot ID:** `f7e57503-7b4a-4197-8473-05f299dc0599`
  * **Visual:** Pure hardware cinema. Slow 3D orbit (`orbitDeg: 12° -> 22°`, `zoom: 1.28 -> 1.38`) around flagship Chrome card (`scale: 0.30`). Specular light sweeps across brushed metallic surface. Zero text.
  * **Audio:** Warm airy pad continues.

### Scene 5: SOLVE (32.7s – 46.7s)
* **5a: "Hold." (32.7s – 36.7s / 4000ms)**
  * **Shot ID:** `f4fd1222-40b1-48e2-a765-56ac41ee8c4e`
  * **Visual:** True 3D depth and parallax: Original crypto wallet funding panel angled on back plane (`x: -2.40, y: 0.72, z: -0.06`, `y: -14°`, scale `0.22`), hero Chrome card forward on right plane (`x: -1.35, y: 0.68, z: +0.08`, `y: 12°`, scale `0.28`). Camera executes `orbitDeg: 6°`.
  * **Typography:** "Hold." positioned safely within frame at `y: 0.16` (`#ffffff`, size `0.082`, weight 600).
  * **Audio:** Digital ledger counter ticks `ui-counter-ticks-1` at 32900ms.
* **5b: "Tap." (36.7s – 40.2s / 3500ms)**
  * **Shot ID:** `162fd73c-d2d5-4152-9414-872f9efa4b27`
  * **Visual:** Big 3D hero card centered (`scale: 0.30`, `y: 0.68`) pushes forward in Z (`+0.15`) then settles. 3 thin lavender stroke rings (`strokeColor: #a5b4fc, strokeWidth: 0.004, fillEnabled: false`) staggered 150ms. Bloom swell animated to `1.2` at tap hit.
  * **Typography:** "Tap." centered at `y: 0.22` (`#ffffff`, size `0.082`, weight 600).
  * **Audio:** Contactless tap chirp + soft thud (`click-trackpad-tap-1` + `ui-hover-blip-1` + `impact-soft-boom-1`) at 37900ms.
* **5c: "Day 0." Payoff (40.2s – 43.2s / 3000ms)**
  * **Shot ID:** `f5316faf-83f3-49d4-9238-ee5a6d0ba864`
  * **Visual:** Card and progress bars removed for pure typographic impact. Matches Day 3 font and position:
    * Headline "Day 0." (`#ffffff`, size `0.096`, weight 600, `y: 0.78`).
    * Subline "Approved. Paid from USDC." (`#c5cedb`, size `0.052`, weight 500, `y: 0.58`) with lavender dot (`#a5b4fc`, `x: -2.38, y: 0.58`).
  * **Audio:** Crystal approval chime `ui-success-chime-1` at 40800ms.
* **5d: "Spend what you hold." (43.2s – 46.7s / 3500ms)**
  * **Shot ID:** `fb11f5e1-dc94-4841-81f9-aea2c4d68c9d`
  * **Visual:** Centered hardware display. Hero card at `y: 0.45` (`bottom: 0.109`, safe from screen edge; scale `0.24`, tilt `y: 13°`).
  * **Typography:** Headline "Spend what you hold." (`y: 1.05`, size `0.076`, weight 600); Subline "Converted at checkout." (`y: 0.887`, size `0.048`, weight 500, `#c5cedb`).
  * **Audio:** Warm airy pad continues.

### Scene 6: HARDWARE CRAFT (46.7s – 56.2s)
* **6a: Chip Macro (46.7s – 50.2s / 3500ms)**
  * **Shot ID:** `9ffbdd7c-b30c-4efa-89d9-4b1626944a90`
  * **Visual:** Split composition: Text "Engineered down to the chip." on left (`x: -2.40, y: 0.70`, size `0.062`, weight 600, left-aligned) **fully visible at inMs: 0 before camera zooms**. Camera pushes in `zoom: 1.0 -> 3.2x` on the gold EMV contact microchip. Card scale strictly `0.30`.
  * **Audio:** Warm airy pad continues.
* **6b: The Flip (50.2s – 52.7s / 2500ms)**
  * **Shot ID:** `160db3b5-4f5f-4f1f-a499-722b8d213b18`
  * **Visual:** Camera pulls back to rest framing (`zoom: 1.0`). Card executes a seamless 3D Y-axis flip (front 0° -> 90°, new muted back face -90° -> 0°) with realistic motion blur (`180° shutter`). Zero text.
  * **Audio:** Card flip whoosh `whoosh-slow-smooth-1` peaks at midpoint (51450ms).
* **6c: Clean Back Face (52.7s – 56.2s / 3500ms)**
  * **Shot ID:** `aeef0c17-8862-4ab8-847c-7ad687e7ac52`
  * **Visual:** Split composition: Muted physical back face (true black magstripe `#000000`, off-white signature strip `#d4d3ce`, laser-etched CVV) held on right (`x: -1.45, y: 0.70, scale: 0.28, y: -12°`). Headline "Built to last." on left (`x: -2.40, y: 0.70, size: 0.082, weight: 600`, left-aligned).
  * **Audio:** Seamless warm pad continues.

### Scene 7: EDITIONS (56.2s – 70.7s)
* **7a: Lumen (56.2s – 58.7s / 2500ms)**
  * **Shot ID:** `fcf2a10d-069d-4c0d-87c2-4b3e879603f4`
  * **Visual:** Split composition: Iridescent Lumen card on right (`x: -1.45, y: 0.70, scale: 0.28, y: 13°`); Label "Lumen" on left (`x: -2.40, y: 0.70, size: 0.082, weight: 600`, left-aligned).
  * **Audio:** Soft tick `ui-tick-1` at cut (56200ms).
* **7b: Chrome (58.7s – 61.2s / 2500ms)**
  * **Shot ID:** `84fe14a6-9efe-4c83-abf3-ca19960772a2`
  * **Visual:** Split composition: Polished mirror Chrome card on right (`x: -1.45, y: 0.70, scale: 0.28, y: -13°`); Label "Chrome" on left (`x: -2.40, y: 0.70, size: 0.082, weight: 600`, left-aligned).
  * **Audio:** Soft tick `ui-tick-2` at cut (58700ms).
* **7c: Grid (61.2s – 63.7s / 2500ms)**
  * **Shot ID:** `f821a2b6-7c08-4f1b-bf60-a2ad78f7963a`
  * **Visual:** Split composition: Clean architectural vector Grid card (`d060d42d-68ff-4fd3-b8ae-0488b077501e.png`) on right (`x: -1.45, y: 0.70, scale: 0.28, y: 13°`); Label "Grid" on left (`x: -2.40, y: 0.70, size: 0.082, weight: 600`, left-aligned).
  * **Audio:** Soft tick `ui-tick-3` at cut (61200ms).
* **7d: Carbon (63.7s – 66.2s / 2500ms)**
  * **Shot ID:** `b3d34f52-7769-4fb1-9843-868836864f2b`
  * **Visual:** Split composition: Matte weave Carbon card (`crop: height: 0.90` stripping stray shadow) on right (`x: -1.45, y: 0.70, scale: 0.28, y: -13°`); Label "Carbon" on left (`x: -2.40, y: 0.70, size: 0.082, weight: 600`, left-aligned).
  * **Audio:** Soft tick `ui-tick-4` at cut (63700ms).
* **7e: Four Editions Fan-Out (66.2s – 70.7s / 4500ms)**
  * **Shot ID:** `bc4047df-006e-416a-ad65-f0443d8a1441`
  * **Visual:** All 4 physical card editions dynamically fan out from center, perspective-tilted and staggered in Z (`z: -0.06, -0.02, +0.02, +0.06`, scale `0.155`). Positions pulled inward (`x: -2.48, -2.09, -1.71, -1.32`) to satisfy 6% safe margins.
  * **Typography:** Headline "Four editions. One standard." (`y: 0.30`); Subline "Lumen · Chrome · Grid · Carbon" (`y: 0.14`, `#c5cedb`).
  * **Audio:** Fan-out whoosh `whoosh-deep-cinematic-1` at 66200ms.

### Scene 8: CLOSE (70.7s – 80.2s)
* **8a: Logo Lockup Alone (70.7s – 73.2s / 2500ms)**
  * **Shot ID:** `b2b7b72b-835c-40e0-8671-6ecd9b056b51`
  * **Visual:** Official vector logo lockup (striped emblem + lowercase `off-card`) alone on silk (`scale: 0.26`, `y: 0.70`). Shimmer sweep.
  * **Audio:** Continuous airy pad continues.
* **8b: Spend Freely (73.2s – 77.2s / 4000ms)**
  * **Shot ID:** `991f10b9-5aee-41d7-b80e-c46e60627da6`
  * **Visual:** Flagship Chrome card centered and prominent (`scale: 0.25`, `y: 0.84`, tilt `y: 13°`). Headline "Spend freely." (`y: 0.36`, size `0.068`) and URL `offcard.me` in lavender (`#a5b4fc`, size `0.048`, `y: 0.20`, `bottom: 0.160`, safely above 6% margin). Gap between text elements optimized to 0.07 with zero lints.
  * **Audio:** Prestige hit `impact-soft-boom-1` lands at 73200ms.
* **8c: Clean Hold (77.2s – 80.2s / 3000ms)**
  * **Shot ID:** `b9092800-4665-4fe6-a1b0-d09d26fc29f7`
  * **Visual:** Identical match cut to 8b; all elements hold completely still while a single slow specular light streak sweeps across the card face. Clean, confident resolution.
  * **Audio:** Lush acoustic tail of `ambience-airy-pad-3` fades out over 2.0s to absolute black.

---

## 3. Spatial Coordinates & Layout Specifications (Raylight)

| Asset Layer | Absolute World Center | Scale / Size | Safe Margin Clearance |
| :--- | :--- | :--- | :--- |
| **Split Layout: Cards (4b, 6a, 6c, 7a–7d)** | `(-1.45, 0.70)` | `scale: 0.28` | Right side; tilt `y: ±13°` |
| **Split Layout: Text (4b, 6a, 6c, 7a–7d)** | `(-2.40, 0.70)` | `size: 0.062 – 0.082` | Left-aligned (`textAlign: left`), safe margin > 12% |
| **Hero Card (Centered: 4a, 4c, 5b, 8b, 8c)** | `(-1.90, 0.68 to 0.84)` | `scale: 0.25 – 0.30` | Centered (~0.53 frame width); tilt `y: 13°, x: 5°` |
| **Wallet Panel (5a)** | `(-2.40, 0.72, z: -0.06)` | `scale: 0.22` | Back plane; zero overlap with card (`card at x: -1.35, z: +0.08`) |
| **4-Card Fan Cascade (7e)**| `(-2.48, -2.09, -1.71, -1.32, y: 0.76)` | `scale: 0.155` each | Staggered in Z; >0.19 wu top margin; >8% side margins |
| **Official Brand Lockup (8a)** | `(-1.90, 0.70)` | `scale: 0.26` | Centered vector emblem + wordmark alone on silk |
| **Day Counter (2b) / Payoff (5c) Headline** | `(-1.90, 0.78)` | `size: 0.096` | Inter SemiBold (600), `#ffffff` |
| **Day Counter (2b) / Payoff (5c) Subline** | `(-1.90, 0.58 to 0.62)` | `size: 0.052` | Inter Medium (500), `#c5cedb` |
| **Canvas World Dimensions** | Center `(-1.90, 0.70)` | `width: 2.261, height: 1.272` | Authoritative bounds: `X [-3.031, -0.769]`, `Y [0.064, 1.336]` |

---

## 4. Verification & Quality Gate Results

* **Total Runtime:** `80200ms` (80.2s), fulfilling the unhurried `70–85s` requirement.
* **Early Product Arrival:** First card reveal lands at `21.7s` (accelerated by ~5.5s from Round 3).
* **Zero Harsh Glow Frames:** Replaced with soft drop shadows and soft ambient lavender light pools.
* **Zero Unlabeled Rectangles / Wireframe Slabs:** The Problem sequence now breathes through an unhurried 3-stage Day Counter (2b), and the Solve sequence resolves cleanly in "Day 0." (5c).
* **Strict 6% Safe Margins & Zero Lints:** All text and media elements strictly respect viewport margins with zero lint warnings across the entire project.
* **AV Synchronization & Continuity:**
  * Seamless drone bed across `0.0s – 17.7s`.
  * True 1.2s silence in Shot 3a (`17.7s – 18.9s`).
  * Continuous airy pad across `18.9s – 80.2s` with all gaps/dips eliminated.
  * Sub-bass impact drop (`Shot 46`) hitting at `21.7s` synchronized within 7ms of the first card cut.

---

## 5. Items Requiring User Confirmation

Before public distribution, confirm:
1. **"No bank permission" & "No paperwork" Claims:** In Shot 3b. Confirm with compliance team that self-custodial settlement meets regulatory criteria for this phrasing.
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
