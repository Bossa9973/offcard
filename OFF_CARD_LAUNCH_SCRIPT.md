# Off-Card — Official Launch Film Specification (Round 5: 3D Cinematic Hardware Edition)

**Creative Direction:** Sovereign Fintech & Luxury Hardware Cinema (Apple × Revolut Ultra × Amex Centurion)  
**Format:** 16:9 Cinema Showcase (`1920 × 1080` / `4K 3840 × 2160`) at 60 FPS  
**Total Runtime:** 80.2 Seconds (26 Measured, Single-Action Shots; Zero Rushed Beats)  
**First Product Arrival:** `~0:21` (Card Reveal at `21.7s`, accelerated from 0:27)  
**Hero 3D Scale:** Strict `scale: 0.30` (`~0.53` of frame width) with 3D perspective tilt (`y: 10–15°`, `x: 4–6°`), drop shadows, and subtle lavender rim glow.  
**Palette:** Pure Monochrome Silk + White Display Typography + ONE Sovereign Accent (Lavender `#a5b4fc`). Flat navy wireframe slabs, orange shapes, and green pills permanently eliminated.  
**Audio Architecture:** Continuous Acoustic Bed with ZERO dead air:
- Filtered Dark Sub-Bass Drone (`ambience-soft-drone-1` & `2`) across `0.0s – 17.7s`.
- **True Intentional Silence:** Exactly 1.2s of absolute silence in Shot 3a (`17.7s – 18.9s`).
- Luminous Warm Pad Bed (`ambience-airy-pad-1`, `2`, `3`) seamlessly crossfading from `18.9s – 80.2s` with smooth 2.0s acoustic tail.
- 21 per-shot millisecond-synchronized foley accents.
**Live Raylight Project:** [Open Live Raylight Editor](https://www.raylight.app/editor/d5d5b299-79d8-49d1-ac02-e6424492cecc) (`d5d5b299-79d8-49d1-ac02-e6424492cecc`)

---

## 1. Architectural Principles & Quality Standards

1. **Big 3D Hero Perspective:** The hero card is prominent in every subject shot (`scale: 0.30`, spanning `~0.53` of frame width). Resting tilt `rotationDeg: {y: 13, x: 5, z: -2}` with subtle idle float `<= 3°`.
2. **True Parallax via Z-Separation:** Foreground and background layers sit at distinctly different Z coordinates (e.g. Card at `z: +0.08`, Wallet Panel at `z: -0.06`), driven by optical dolly camera moves with `orbitDeg: 6–12°`.
3. **Pure Typography & Monochromatic Precision:** Slabs, wireframes, and secondary colored boxes have been deleted. Friction and resolution are expressed through bold display typography, thin lines of light, and delicate lavender accent dots.
4. **Early Product Arrival:** Scene 1 and Scene 2 tightened so Shot 4a (the big 3D Reveal) arrives at **21.7s** instead of 27s.
5. **No Layer Scale Jumps:** Resting card scale remains constant across shots (`scale: 0.30`); zooms are achieved exclusively by animating the camera.
6. **Strict Reading-Time Law:** Every text line remains static for at least `(words / 2.5) + 1.2s` after entrance finishes.
7. **Pristine Claim Hygiene:** Unverified claims ("Zero KYC", "100M+", "0.4s", "30s", "Crafted in titanium") remain excluded; titanium replaced with "Built to last." pending user material confirmation.

---

## 2. Complete 26-Shot List & Technical Breakdown

### Scene 1: HOOK (0.0s – 6.4s)
* **1a: "You own it." (0.0s – 3.2s / 3200ms)**
  * **Shot ID:** `eee00197-134f-4b31-9a37-60fe479a7576`
  * **Visual:** Deep near-black obsidian silk. A sharp horizontal line of light draws across with `pathReveal` + glow.
  * **Typography:** "You own it." alone (`#ffffff`, size `0.082`, weight 600, centered at `y: 0.70`). Dim card layer permanently deleted.
  * **Audio:** `ambience-soft-drone-1` bed begins with 0.8s fade-in; light sweep accompanied by `whoosh-soft-airy-1` at 300ms.
* **1b: "So why can't you spend it?" (3.2s – 6.4s / 3200ms)**
  * **Shot ID:** `05459b64-50f8-430e-82ce-58fc64cdcef5`
  * **Visual:** Match cut on identical silk; slow linear drift into "So why can't you spend it?"
  * **Typography:** Headline (`#ffffff`, size `0.076`, weight 600, centered at `y: 0.70`).
  * **Audio:** Sub-bass drone bed continues uninterrupted.

### Scene 2: PROBLEM (6.4s – 17.7s)
* **2a: The Takeaway (6.4s – 9.6s / 3200ms)**
  * **Shot ID:** `ee0c3205-54bd-4a60-b010-04315c63e212`
  * **Visual:** Cold studio lighting (`8500K`, `#0c1626` midnight tone).
  * **Typography:** Headline "Then off-ramps took it away." (`#ffffff`, size `0.075`, weight 600, `y: 0.77`); Subline "Banking hours. Compliance holds." (`#c5cedb`, weight 500, `y: 0.57`).
  * **Audio:** Seamless crossfade into `ambience-soft-drone-2` at 7000ms.
* **2b: "Under review." (9.6s – 12.4s / 2800ms)**
  * **Shot ID:** `e077ee57-5ba2-42bb-8552-44e588c98c03`
  * **Visual:** Clean display typography only: "Under review." large (`#ffffff`, size `0.088`, weight 600, `y: 0.76`). Thin white line of light stalls at ~30% underneath (`y: 0.60`) with a subtle lavender pulse dot (`#a5b4fc`). Single 160ms glitch burst on arrival. All slabs deleted.
  * **Audio:** `ui-error-blip-1` at 9800ms + `ui-tick-1` at 10000ms.
* **2c: "Identity check required." (12.4s – 15.2s / 2800ms)**
  * **Shot ID:** `b134dc57-7294-48f5-b4b8-47deca842d74`
  * **Visual:** Headline "Identity check required." with subline "Passport · Proof of address · Face scan" (`#c5cedb`, size `0.056`, `y: 0.74`). Stalled white line maintained beneath (`y: 0.54`). Slabs deleted.
  * **Audio:** Scanner tick `ui-tick-2` at 12600ms. Seamless drone bed continues (no dead air at 0:13–0:14!).
* **2d: "3–5 business days." (15.2s – 17.7s / 2500ms)**
  * **Shot ID:** `d7432a4b-4fc4-4864-a7eb-85e83bbff063`
  * **Visual:** Headline "Held for review." (`y: 0.80`) + subline "3–5 business days." (`y: 0.64`). Stalled line at `y: 0.48` dims out to 0 opacity over 1200ms into black.
  * **Audio:** Review tick `ui-tick-3` at 15400ms. Drone bed 3 fades out smoothly at 17700ms.

### Scene 3: EXHALE (17.7s – 21.7s)
* **3a: Dim to Black (17.7s – 18.9s / 1200ms)**
  * **Shot ID:** `1732e63c-5bca-4c62-ad1e-63f373fd30d4`
  * **Visual:** Total obsidian stillness. Zero elements visible on screen.
  * **Audio:** **1.2s of absolute silence**. Zero sound layers active.
* **3b: "Until now." (18.9s – 21.7s / 2800ms)**
  * **Shot ID:** `6c94bf53-4485-4f93-a697-dd3035c7d116`
  * **Visual:** Locked camera in serene calm midnight silk.
  * **Typography:** Headline "Until now." (`#ffffff`, size `0.110`, weight 700, `y: 0.77`); Subline "No bank permission. No paperwork." (`#c5cedb`, size `0.052`, weight 500, `y: 0.58`).
  * **Audio:** Tension riser `riser-airy-swell-1` peaks at 18900ms, launching the luminous warm pad bed `ambience-airy-pad-1`.

### Scene 4: REVEAL (21.7s – 32.7s)
* **4a: Big 3D Hero Card Reveal (21.7s – 25.7s / 4000ms)**
  * **Shot ID:** `d0942db2-14da-4388-95ef-6540ba41a452`
  * **Visual:** Flagship Chrome card rises in alone. Scale `0.30` (`~0.53` of frame width). 3D perspective tilt (`y: 13°, x: 5°, z: -2°`), drop shadow, subtle lavender rim glow. Camera executes slow orbit push-in (`zoom: 1.0 -> 1.22`, `orbitDeg: 8°`). Specular light streak sweeps across bevel. No text.
  * **Audio:** Riser swells into cut; massive dual-layer deep impact hits at 21700ms (`impact-sub-drop-1` + `impact-deep-muffled-1`).
* **4b: "Meet Off-Card." (25.7s – 29.7s / 4000ms)**
  * **Shot ID:** `b97ab1dc-04b6-4e31-9661-3cf8c8788560`
  * **Visual:** Match cut on identical card position and scale (`scale: 0.30`, `y: 0.70`). Camera drifts `orbitDeg: 8° -> 12°`.
  * **Typography:** Headline "Meet Off-Card." (`y: 0.29`, size `0.076`, weight 600); Subline "A card that spends straight from your wallet." (`y: 0.13`, size `0.046`, weight 500, `#c5cedb`).
  * **Audio:** Warm airy pad continues.
* **4c: Beauty Orbit (29.7s – 32.7s / 3000ms)**
  * **Shot ID:** `f7e57503-7b4a-4197-8473-05f299dc0599`
  * **Visual:** Pure hardware cinema. Slow 3D orbit (`orbitDeg: 12° -> 22°`, `zoom: 1.28 -> 1.38`) around the flagship card (`scale: 0.30`). Specular light sweeps across brushed metallic surface. Zero text.
  * **Audio:** Warm airy pad continues.

### Scene 5: SOLVE (32.7s – 46.7s)
* **5a: "Hold." (32.7s – 36.7s / 4000ms)**
  * **Shot ID:** `f4fd1222-40b1-48e2-a765-56ac41ee8c4e`
  * **Visual:** True 3D depth and parallax: Original glass crypto wallet funding panel large and angled on back plane (`x: -2.40, y: 0.72, z: -0.06`, `y: -14°`, scale `0.22`), hero Chrome card forward on right plane (`x: -1.35, y: 0.68, z: +0.08`, `y: 12°`, scale `0.28`). Zero overlap. Camera moves with `orbitDeg: 6°`, creating tangible parallax between panel and card. Balances count up.
  * **Typography:** "Hold." (`#ffffff`, size `0.082`, weight 600, centered at `y: 0.22`).
  * **Audio:** Digital ledger counter ticks `ui-counter-ticks-1` at 32900ms.
* **5b: "Tap." (36.7s – 40.2s / 3500ms)**
  * **Shot ID:** `162fd73c-d2d5-4152-9414-872f9efa4b27`
  * **Visual:** Big 3D hero card centered (`scale: 0.30`, `y: 0.68`) pushes forward in Z toward camera (`z: +0.15`). 3 delicate white contactless stroke rings pulse outward from the card's contactless mark. Terminal slab permanently deleted.
  * **Typography:** "Tap." (`#ffffff`, size `0.082`, weight 600, centered at `y: 0.22`).
  * **Audio:** Contactless tap chirp + soft thud (`click-trackpad-tap-1` + `ui-hover-blip-1` + `impact-soft-boom-1`) at 37900ms.
* **5c: "Done." (40.2s – 43.2s / 3000ms)**
  * **Shot ID:** `f5316faf-83f3-49d4-9238-ee5a6d0ba864`
  * **Visual:** Same white line from 2b sweeps to 100% in one fast move (`y: 0.78`). Card edge flashes. Clean type with lavender accent dot: "• Approved. Paid from USDC." (`y: 0.18`, `#ffffff`). Wireframe slab and green pill deleted.
  * **Typography:** Headline "Done." (`y: 0.92`, size `0.082`, weight 600).
  * **Audio:** Crystal approval chime `ui-success-chime-1` at 40800ms.
* **5d: "Spend what you hold." (43.2s – 46.7s / 3500ms)**
  * **Shot ID:** `fb11f5e1-dc94-4841-81f9-aea2c4d68c9d`
  * **Visual:** Big 3D hero card centered in calm light (`y: 0.35`, scale `0.30`, `y: 13°`).
  * **Typography:** Headline "Spend what you hold." (`y: 0.95`, size `0.076`, weight 600); Subline "Converted at checkout." (`y: 0.81`, size `0.048`, weight 500, `#c5cedb`).
  * **Audio:** Warm airy pad continues.

### Scene 6: HARDWARE CRAFT (46.7s – 56.2s)
* **6a: Chip Macro (46.7s – 50.2s / 3500ms)**
  * **Shot ID:** `9ffbdd7c-b30c-4efa-89d9-4b1626944a90`
  * **Visual:** Caption "Engineered down to the chip." is placed clear of the card at `y: 0.16` and is **fully visible at inMs: 0 before the zoom starts**. Camera pushes in `zoom: 1.0 -> 3.2x` on the gold EMV contact microchip with shallow depth of field. Card scale strictly `0.30` (no layer scale jump).
  * **Audio:** Warm airy pad continues.
* **6b: The Flip (50.2s – 52.7s / 2500ms)**
  * **Shot ID:** `160db3b5-4f5f-4f1f-a499-722b8d213b18`
  * **Visual:** Camera pulls back to rest framing (`zoom: 1.0`, zero layer scale jump; card stays `scale: 0.30`). Card executes a seamless 3D Y-axis flip (front 0° -> 90°, back -90° -> 0°) with realistic motion blur (`180° shutter`). Zero text.
  * **Audio:** Card flip whoosh `whoosh-slow-smooth-1` peaks at midpoint (51450ms).
* **6c: Clean Back Face (52.7s – 56.2s / 3500ms)**
  * **Shot ID:** `aeef0c17-8862-4ab8-847c-7ad687e7ac52`
  * **Visual:** Physical reverse face held large (`scale: 0.30`, `y: 0.70`, tilt `y: -12°`), displaying magnetic stripe, signature panel, and laser-etched CVV.
  * **Typography:** Subline "Built to last." (`#c5cedb`, size `0.054`, weight 500, `y: 0.15`).
  * **Audio:** Warm pad bed continues.

### Scene 7: EDITIONS (56.2s – 70.7s)
* **7a: Lumen (56.2s – 58.7s / 2500ms)**
  * **Shot ID:** `fcf2a10d-069d-4c0d-87c2-4b3e879603f4`
  * **Visual:** Iridescent pearlescent Lumen card large (`scale: 0.30`), 3D tilt (`y: 13°`), camera orbit (`orbitDeg: 4°`), label "Lumen" at `y: 0.18`.
  * **Audio:** Soft tick `ui-tick-1` at cut (56200ms).
* **7b: Chrome (58.7s – 61.2s / 2500ms)**
  * **Shot ID:** `84fe14a6-9efe-4c83-abf3-ca19960772a2`
  * **Visual:** Polished mirror Chrome card large (`scale: 0.30`), 3D tilt (`y: -13°`), camera orbit, label "Chrome" at `y: 0.18`.
  * **Audio:** Soft tick `ui-tick-2` at cut (58700ms).
* **7c: Grid (61.2s – 63.7s / 2500ms)**
  * **Shot ID:** `f821a2b6-7c08-4f1b-bf60-a2ad78f7963a`
  * **Visual:** Architectural wireframe Grid card large (`scale: 0.30`), 3D tilt (`y: 13°`), camera orbit, label "Grid" at `y: 0.18`.
  * **Audio:** Soft tick `ui-tick-3` at cut (61200ms).
* **7d: Carbon (63.7s – 66.2s / 2500ms)**
  * **Shot ID:** `b3d34f52-7769-4fb1-9843-868836864f2b`
  * **Visual:** Matte weave Carbon card large (`scale: 0.30`), 3D tilt (`y: -13°`), camera orbit, label "Carbon" at `y: 0.15`.
  * **Audio:** Soft tick `ui-tick-4` at cut (63700ms).
* **7e: Four Editions Fan-Out (66.2s – 70.7s / 4500ms)**
  * **Shot ID:** `bc4047df-006e-416a-ad65-f0443d8a1441`
  * **Visual:** All 4 physical card editions dynamically fan out from center, perspective-tilted and staggered in Z (`z: -0.06, -0.02, +0.02, +0.06`, scale `0.155`). Lowered to `y: 0.76` for generous top margin (>0.19 world units from frame edge). Side margins >20%.
  * **Typography:** Headline "Four editions. One standard." (`y: 0.30`); Subline "Lumen · Chrome · Grid · Carbon" (`y: 0.14`, `#c5cedb`).
  * **Audio:** Fan-out whoosh `whoosh-deep-cinematic-1` at 66200ms.

### Scene 8: CLOSE (70.7s – 80.2s)
* **8a: Logo Lockup Alone (70.7s – 73.2s / 2500ms)**
  * **Shot ID:** `b2b7b72b-835c-40e0-8671-6ecd9b056b51`
  * **Visual:** Official vector logo lockup (striped emblem + lowercase `off-card`) alone on silk (`scale: 0.26`, `y: 0.70`). Shimmer sweep.
  * **Audio:** Continuous airy pad continues.
* **8b: Spend Freely (73.2s – 77.2s / 4000ms)**
  * **Shot ID:** `991f10b9-5aee-41d7-b80e-c46e60627da6`
  * **Visual:** Flagship Chrome card centered and prominent (`scale: 0.30`, `y: 0.68`, tilt `y: 13°`). **Duplicate logo removed** (as 8a already showcased it). Headline "Spend freely." (`y: 0.26`, size `0.068`) and URL `offcard.me` in lavender (`#a5b4fc`, size `0.048`, `y: 0.11`). Light streaks and bloom kept away from text.
  * **Audio:** Prestige hit `impact-soft-boom-1` lands at 73200ms.
* **8c: Clean Hold (77.2s – 80.2s / 3000ms)**
  * **Shot ID:** `b9092800-4665-4fe6-a1b0-d09d26fc29f7`
  * **Visual:** Identical match cut to 8b; all elements hold completely still while a single slow specular light streak sweeps across the card face. Clean, confident resolution.
  * **Audio:** Lush acoustic tail of `ambience-airy-pad-3` fades out over 2.0s to absolute black.

---

## 3. Spatial Coordinates & Layout Specifications (Raylight)

| Asset Layer | Absolute World Center | Scale / Size | Safe Margin Clearance |
| :--- | :--- | :--- | :--- |
| **Hero Card (Front & Back)** | `(-1.90, 0.68 to 0.70)` | `scale: 0.30` strictly | Authoritative standard (~0.53 frame width); tilt `y: 13°, x: 5°` |
| **Wallet Panel (5a)** | `(-2.40, 0.72, z: -0.06)` | `scale: 0.22` | Back plane; zero overlap with card (`card at x: -1.35, z: +0.08`) |
| **4-Card Fan Cascade (7e)**| `(-2.26, -2.02, -1.78, -1.54, y: 0.76)` | `scale: 0.155` each | Staggered in Z; >0.19 wu top margin; >20% side margins |
| **Official Brand Lockup (8a)** | `(-1.90, 0.70)` | `scale: 0.26` | Centered vector emblem + wordmark alone on silk |
| **Headline Typography** | `(-1.90, 0.24 to 0.30 or 0.88–0.95)` | `size: 0.068 – 0.088` | Inter SemiBold (600), `#ffffff` |
| **Subline / URL Typography** | `(-1.90, 0.11 to 0.18)` | `size: 0.046 – 0.056` | Inter Medium (500), `#c5cedb` or `#a5b4fc` |
| **Canvas World Dimensions** | Center `(-1.90, 0.70)` | `width: 2.261, height: 1.272` | Authoritative bounds: `X [-3.031, -0.769]`, `Y [0.064, 1.336]` |

---

## 4. Verification & Quality Gate Results

* **Total Runtime:** `80200ms` (80.2s), fulfilling the unhurried `70–85s` requirement.
* **Early Product Arrival:** First card reveal lands at `21.7s` (accelerated by ~5.5s from Round 3).
* **3D Hardware Presence:** Hero card scaled up to `scale: 0.30` (~0.53 frame width) with perspective tilt and camera orbit across Shots 4a, 4b, 4c, 5b, 5c, 5d, 6b, 6c, 7b, 8b, and 8c.
* **Zero Wireframe Slabs:** All flat navy slabs, orange shapes, and green pills deleted in favor of clean display typography, subtle white light lines, and lavender accent dots.
* **AV Synchronization & Continuity:** Checked via `render_waveform` and `check_sync`:
  * Seamless drone bed across `0.0s – 17.7s` (dead air at ~0:13–0:14 filled).
  * True 1.2s silence in Shot 3a (`17.7s – 18.9s`).
  * Continuous airy pad across `18.9s – 80.2s` (dead air at ~0:59–1:01 filled).
  * 21 foley accents landed with peak offsets `<= 25ms` of their visual events.

---

## 5. Items Requiring User Confirmation

Before public distribution, confirm:
1. **Physical Card Material:** Copy currently uses `"Built to last."`. If the physical cards are grade-5 titanium or surgical steel, confirm so we can restore `"Crafted in titanium."` or specific alloy copy.
2. **Checkout Conversion Mechanics:** Copy reads `"Converted at checkout."` and `"Paid from USDC"`. Confirm if settlement executes via off-chain liquidity provider or instant DEX swap.
3. **Compliance Claims:** `"Zero KYC"`, `"100M+"`, `"0.4s"`, and `"30s"` remain excluded until approved by your legal team.

---

## 6. Recommended Export Settings (Raylight App UI)

To export the final master render directly from the [Raylight Web Editor](https://www.raylight.app/editor/d5d5b299-79d8-49d1-ac02-e6424492cecc):
- **Resolution:** `4K (3840 × 2160)` (or `1080p (1920 × 1080)` for standard web).
- **Frame Rate:** `60 FPS` (recommended for smooth 3D card rotation and specular sweeps).
- **Watermark:** `Off` (on Pro/Team plan).
- **Audio:** `AAC Stereo 320 kbps`.
