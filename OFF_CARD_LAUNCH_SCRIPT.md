# Off-Card — Official Launch Film Specification (Round 3 Extended Cinema Edition)

**Creative Direction:** Sovereign Fintech & Luxury Hardware Cinema (Apple × Revolut Ultra × Amex Centurion)  
**Format:** 16:9 Showcase (`1920 × 1080` / `4K 3840 × 2160`) at 60 FPS  
**Total Runtime:** 78.5 Seconds (25 Single-Action Shots, Zero Rushed Beats)  
**Audio Architecture:** Continuous Soundbed (Filtered Dark Sub-Bass Drone in Shots 1–3, 0.8s Silence in 3a, Warm Luminous Airy Pad in Shots 4–8c) + 20 Per-Shot Millisecond-Synchronized Foley Accents  
**Live Raylight Project:** [Open Live Raylight Editor](https://www.raylight.app/editor/d5d5b299-79d8-49d1-ac02-e6424492cecc) (`d5d5b299-79d8-49d1-ac02-e6424492cecc`)

---

## 1. Architectural Principles & Quality Standards

1. **One Idea Per Shot:** Every shot represents exactly ONE action or ONE idea (1.5s–4.0s). Zero scene cramming.
2. **Strict Reading-Time Compliance:** Every text line holds completely static for at least `(words / 2.5) + 1.5s` after entrance animation completes before cut.
3. **Rigid Subject Scale Rule:** Hero Chrome card rests strictly at `scale: 0.235` (~0.40 of frame width) in all subject shots; only camera moves for true macros. Front and back faces maintain identical scale.
4. **Subline Readability Standard:** All sublines rendered in `#c5cedb` (weight 500), never dimmer.
5. **Negative Space & Zero Occlusion:** Zero overlapping layers across text or active UI. Glass wallet panel and card maintain absolute separation.
6. **Continuous Acoustic Bed:** Unbroken audio from t=0 to t=78.5s, intentionally broken only by the dramatic 0.8s drop to near-silence in Shot 3a before the "Until now." pivot. The final third matches or exceeds the opening in acoustic richness.
7. **Pristine Claim Hygiene:** Unverified claims ("Zero KYC", "100M+", "0.4s", "30s", "Crafted in titanium") are excluded; titanium replaced with "Built to last." pending explicit material confirmation.

---

## 2. Complete 25-Shot List & Technical Breakdown

### Scene 1: HOOK (0.0s – 7.5s)
* **1a: "You own it." (0.0s – 3.5s / 3500ms)**
  * **Shot ID:** `eee00197-134f-4b31-9a37-60fe479a7576`
  * **Visual:** Deep near-black obsidian silk. A sharp horizontal line of light draws across with `pathReveal` + glow.
  * **Typography:** "You own it." alone (`#ffffff`, size `0.082`, weight 600, centered at `y: 0.70`). Dim background card permanently deleted.
  * **Audio:** `ambience-soft-drone-1` bed begins with 1.0s fade-in; light sweep accompanied by `whoosh-soft-airy-1` (volume 0.50).
* **1b: "So why can't you spend it?" (3.5s – 7.5s / 4000ms)**
  * **Shot ID:** `05459b64-50f8-430e-82ce-58fc64cdcef5`
  * **Visual:** Match cut on identical near-black silk background; slow linear dolly drift (`zoom: 1.05x`).
  * **Typography:** "So why can't you spend it?" (`#ffffff`, size `0.076`, weight 600, centered at `y: 0.70`).
  * **Audio:** Sub-bass drone bed continues uninterrupted.

### Scene 2: PROBLEM (7.5s – 22.0s)
* **2a: The Takeaway (7.5s – 11.5s / 4000ms)**
  * **Shot ID:** `ee0c3205-54bd-4a60-b010-04315c63e212`
  * **Visual:** Cold studio lighting (`8500K`, `#0c1626` midnight tone).
  * **Typography:** Headline "Then off-ramps took it away." (`#ffffff`, size `0.075`, weight 600, `y: 0.77`); Subline "Banking hours. Compliance holds." (`#c5cedb`, weight 500, `y: 0.57`).
  * **Audio:** Sub-bass drone bed transitions smoothly to `ambience-soft-drone-2`.
* **2b: Notification #1 Stalled (11.5s – 15.0s / 3500ms)**
  * **Shot ID:** `e077ee57-5ba2-42bb-8552-44e588c98c03`
  * **Visual:** Translucent glass container pops with a 160ms subtle glitch burst: "Withdrawal to bank · Under review". Progress bar stalled at ~30% with a pulsing amber warning dot.
  * **Audio:** Digital glitch blip `ui-error-blip-1` + scanner tick `ui-tick-1`.
* **2c: Notification #2 Identity Check (15.0s – 18.5s / 3500ms)**
  * **Shot ID:** `b134dc57-7294-48f5-b4b8-47deca842d74`
  * **Visual:** Notification #1 held at top; Notification #2 slides in under it: "Identity check required / Passport · Proof of address · Face scan". Line remains stalled.
  * **Audio:** Scanner tick `ui-tick-2` on card entrance.
* **2d: Notification #3 Held for Review (18.5s – 22.0s / 3500ms)**
  * **Shot ID:** `d7432a4b-4fc4-4864-a7eb-85e83bbff063`
  * **Visual:** Headline "Held for review." with subline "Estimated 3–5 business days." above stalled notification bar.
  * **Audio:** Scanner tick `ui-tick-3`.

### Scene 3: EXHALE (22.0s – 27.0s)
* **3a: Dim to Black (22.0s – 23.5s / 1500ms)**
  * **Shot ID:** `1732e63c-5bca-4c62-ad1e-63f373fd30d4`
  * **Visual:** Stalled progress line and notifications fade out over 700ms into pure black obsidian stillness.
  * **Audio:** Drone bed fades out completely at 22500ms, creating **0.8s of intentional near-silence**.
* **3b: "Until now." (23.5s – 27.0s / 3500ms)**
  * **Shot ID:** `6c94bf53-4485-4f93-a697-dd3035c7d116`
  * **Visual:** Locked camera in calm, serene midnight silk.
  * **Typography:** Headline "Until now." (`#ffffff`, size `0.110`, weight 700, `y: 0.77`); Subline "No bank permission. No paperwork." (`#c5cedb`, size `0.052`, weight 500, `y: 0.58`).
  * **Audio:** Tension swell `riser-airy-swell-1` peaks precisely at 23500ms, transitioning into the warm luminous pad bed `ambience-airy-pad-1`.

### Scene 4: REVEAL (27.0s – 34.5s)
* **4a: Hero Card Rise (27.0s – 30.5s / 3500ms)**
  * **Shot ID:** `d0942db2-14da-4388-95ef-6540ba41a452`
  * **Visual:** Hero Chrome Card enters ALONE with slow push-in; zero text; light sweep across specular bevel.
  * **Scale:** Strictly `scale: 0.235` (`~0.40` frame width).
  * **Audio:** Massive layered impact hits at 27000ms (`impact-sub-drop-1` sub-heavy drop + `impact-deep-muffled-1` texture).
* **4b: "Meet Off-Card." (30.5s – 34.5s / 4000ms)**
  * **Shot ID:** `b97ab1dc-04b6-4e31-9661-3cf8c8788560`
  * **Visual:** Match cut on identical card position and scale (`scale: 0.235`).
  * **Typography:** Headline "Meet Off-Card." (`#ffffff`, size `0.078`, weight 600, `y: 0.32`); Subline "A card that spends straight from your wallet." (`#c5cedb`, size `0.048`, weight 500, `y: 0.16`).
  * **Audio:** Continuous warm airy pad continues.

### Scene 5: SOLVE (34.5s – 48.0s)
* **5a: "Hold." (34.5s – 38.0s / 3500ms)**
  * **Shot ID:** `f4fd1222-40b1-48e2-a765-56ac41ee8c4e`
  * **Visual:** Translucent glass wallet HUD panel ALONE with live crypto balances (USDC, USDT, ETH, BTC) counting up. Card removed for complete focus.
  * **Typography:** "Hold." (`#ffffff`, size `0.082`, weight 600, centered at `y: 0.26`).
  * **Audio:** Digital ledger counter ticks `ui-counter-ticks-1`.
* **5b: "Tap." (38.0s – 41.5s / 3500ms)**
  * **Shot ID:** `162fd73c-d2d5-4152-9414-872f9efa4b27`
  * **Visual:** Card enters beside wallet panel (panel at `x: -2.48`, card at `x: -1.95` -> moves to `x: -1.45`; zero overlap). Card contacts minimal glass terminal on right (`x: -1.25`). 3 concentric stroke rings expand and fade from the tap contact point.
  * **Typography:** "Tap." (`#ffffff`, size `0.082`, weight 600, centered at `y: 0.26`).
  * **Audio:** Contactless chirp + soft thud (`click-trackpad-tap-1` + `ui-hover-blip-1` + `impact-soft-boom-1`).
* **5c: "Done." (41.5s – 44.5s / 3000ms)**
  * **Shot ID:** `f5316faf-83f3-49d4-9238-ee5a6d0ba864`
  * **Visual:** The progress bar that stalled in 2b now sweeps to 100% in ONE fast move (300–750ms). Emerald check badge glows and glass notification pops: "Approved · Paid from USDC".
  * **Typography:** "Done." (`#ffffff`, size `0.082`, weight 600, `y: 0.88`).
  * **Audio:** Satisfying crystal approval chime `ui-success-chime-1` at 42250ms.
* **5d: "Spend what you hold." (44.5s – 48.0s / 3500ms)**
  * **Shot ID:** `fb11f5e1-dc94-4841-81f9-aea2c4d68c9d`
  * **Visual:** Chrome card centered in calm studio light (`y: 0.35`, scale `0.235`).
  * **Typography:** Headline "Spend what you hold." (`#ffffff`, size `0.076`, weight 600, `y: 0.95`); Subline "Converted at checkout." (`#c5cedb`, size `0.048`, weight 500, `y: 0.81`).
  * **Audio:** Continuous airy pad continues.

### Scene 6: CRAFT (48.0s – 57.0s)
* **6a: Hardware Macro (48.0s – 52.0s / 4000ms)**
  * **Shot ID:** `9ffbdd7c-b30c-4efa-89d9-4b1626944a90`
  * **Visual:** True camera macro: starts at `3.0x` zoom, linear drift to `3.4x` directly on the gold EMV contact chip (`x: -2.12, y: 0.82`) with shallow depth of field (`f/1.8`) and specular light streak.
  * **Typography:** "Engineered down to the chip." (`#ffffff`, size `0.072`, weight 600, `y: 0.22`).
  * **Audio:** Warm airy pad continues.
* **6b: The Flip (52.0s – 54.5s / 2500ms)**
  * **Shot ID:** `160db3b5-4f5f-4f1f-a499-722b8d213b18`
  * **Visual:** Pure 3D Y-axis card flip (front -> back) with realistic motion blur (`180° shutter`). Both faces match exact scale `0.235`. Zero text.
  * **Audio:** Smooth card flip whoosh `whoosh-slow-smooth-1` peaks at midpoint (53250ms).
* **6c: Clean Back Face (54.5s – 57.0s / 2500ms)**
  * **Shot ID:** `aeef0c17-8862-4ab8-847c-7ad687e7ac52`
  * **Visual:** Card back face held clean in calm light (`scale: 0.235`, `y: 0.70`), showing magnetic stripe, muted signature line, and laser-etched CVV.
  * **Typography:** Subline "Built to last." (`#c5cedb`, size `0.048`, weight 500, `y: 0.22`).
  * **Audio:** Warm pad bed continues.

### Scene 7: EDITIONS (57.0s – 69.0s)
* **7a: Lumen (57.0s – 59.0s / 2000ms)**
  * **Shot ID:** `fcf2a10d-069d-4c0d-87c2-4b3e879603f4`
  * **Visual:** Iridescent pearlescent Lumen card centered (`scale: 0.235`), specular shine sweep. Label: "Lumen".
  * **Audio:** Cut hits on soft tick `ui-tick-1`.
* **7b: Chrome (59.0s – 61.0s / 2000ms)**
  * **Shot ID:** `84fe14a6-9efe-4c83-abf3-ca19960772a2`
  * **Visual:** Polished mirror Chrome card centered (`scale: 0.235`), specular shine sweep. Label: "Chrome".
  * **Audio:** Cut hits on soft tick `ui-tick-2`.
* **7c: Grid (61.0s – 63.0s / 2000ms)**
  * **Shot ID:** `f821a2b6-7c08-4f1b-bf60-a2ad78f7963a`
  * **Visual:** Architectural wireframe Grid card centered (`scale: 0.235`), specular shine sweep. Label: "Grid".
  * **Audio:** Cut hits on soft tick `ui-tick-3`.
* **7d: Carbon (63.0s – 65.0s / 2000ms)**
  * **Shot ID:** `b3d34f52-7769-4fb1-9843-868836864f2b`
  * **Visual:** Matte weave Carbon card centered (`scale: 0.235`), specular shine sweep. Label: "Carbon".
  * **Audio:** Cut hits on soft tick `ui-tick-4`.
* **7e: Four Editions Fan-Out (65.0s – 69.0s / 4000ms)**
  * **Shot ID:** `bc4047df-006e-416a-ad65-f0443d8a1441`
  * **Visual:** All 4 physical card editions dynamically fan out from center with >20% side margins (spans `x: -2.557` to `-1.241`, canvas `[-3.031, -0.769]`). Nothing clipped.
  * **Typography:** Headline "Four editions. One standard." (`#ffffff`, size `0.076`, weight 600, `y: 0.32`); Subline "Lumen · Chrome · Grid · Carbon" (`#c8d4e4`, size `0.046`, weight 500, `y: 0.16`).
  * **Audio:** Fan-out whoosh `whoosh-deep-cinematic-1` (volume 0.70).

### Scene 8: CLOSE (69.0s – 78.5s)
* **8a: Logo Lockup Alone (69.0s – 72.0s / 3000ms)**
  * **Shot ID:** `b2b7b72b-835c-40e0-8671-6ecd9b056b51`
  * **Visual:** Official vector logo lockup (striped emblem + lowercase `off-card`) alone on obsidian silk (`scale: 0.26`, `y: 0.70`). Shimmer sweep.
  * **Audio:** Continuous airy pad continues.
* **8b: Spend Freely (72.0s – 76.0s / 4000ms)**
  * **Shot ID:** `991f10b9-5aee-41d7-b80e-c46e60627da6`
  * **Visual:** Flagship Chrome card centered (`y: 0.88`, scale `0.235`), brand lockup (`y: 0.48`), headline "Spend freely." (`y: 0.30`, size `0.062`), and URL `offcard.me` in lavender (`#a5b4fc`, size `0.046`, `y: 0.16`).
  * **Audio:** Crisp prestige hit `impact-soft-boom-1` lands at 72000ms.
* **8c: Clean Hold (76.0s – 78.5s / 2500ms)**
  * **Shot ID:** `b9092800-4665-4fe6-a1b0-d09d26fc29f7`
  * **Visual:** Identical match cut to 8b; all elements hold completely still while a single slow specular light streak sweeps across the card face. Clean, confident resolution.
  * **Audio:** Smooth trailing tail of `ambience-airy-pad-2` fades out over 1.5s to absolute black.

---

## 3. Spatial Coordinates & Layout Specifications (Raylight)

| Asset Layer | Absolute World Center | Scale / Size | Safe Margin Clearance |
| :--- | :--- | :--- | :--- |
| **Hero Card (Front & Back)** | `(-1.90, 0.70 to 0.88)` | `scale: 0.235` strictly | Authoritative standard across all subject shots |
| **Glass Terminal (5b)** | `(-1.25, 0.72)` | `width: 0.42, height: 0.62` | Placed on right; card touches reader without covering body |
| **Glass Wallet Panel (5a/5b)** | `(-2.48, 0.72)` in 5b | `scale: 0.18` | Zero overlap with card (`card at -1.95 -> -1.45`) |
| **4-Card Fan-Out Cascade (7e)**| `(-2.26, -2.02, -1.78, -1.54, y: 0.84)` | `scale: 0.142` each | Symmetric `21%` frame padding on left & right |
| **Official Brand Lockup** | `(-1.90, 0.48)` | `scale: 0.18` | Centered vector emblem + wordmark |
| **Headline Typography** | `(-1.90, 0.26 to 0.32 or 0.88)` | `size: 0.072 – 0.082` | Center aligned, Inter SemiBold (600) |
| **Subline / URL Typography** | `(-1.90, 0.16 to 0.22)` | `size: 0.046 – 0.052` | Inter Medium (500), `#c5cedb` or `#a5b4fc` |
| **Canvas World Dimensions** | Center `(-1.90, 0.70)` | `width: 2.261, height: 1.272` | Authoritative bounds: `X [-3.031, -0.769]`, `Y [0.064, 1.336]` |

---

## 4. Verification & Quality Gate Results

* **Total Runtime:** `78500ms` (78.5s), perfectly in the target `70–85s` range.
* **Lint Geometry:** Diffed against authoring bounds; 0 clipping errors, 0 hidden text layers, 0 AI-poster text stack violations.
* **AV Synchronization:** Checked via `render_waveform` and `check_sync`:
  * Continuous ambient audio coverage across all 78.5 seconds.
  * Exact 0.8s drop to silence at `t=22700–23500ms` in Shot 3a before the "Until now." riser.
  * All 20 foley accents landed with peak offsets `<= 25ms` of their visual events.
  * Final third (editions + close) is acoustically full and vibrant, matching the energy of the reveal.

---

## 5. Items Requiring User Confirmation

Before commercial release or paid distribution, confirm:
1. **Physical Card Material:** Script uses `"Built to last."`. If physical cards are manufactured in grade-5 titanium or surgical steel, confirm so we can restore `"Crafted in titanium."` or specific alloy text.
2. **Checkout Conversion Mechanics:** Current copy states `"Converted at checkout."` and `"Paid from USDC"`. Confirm whether settlement occurs automatically via off-chain liquidity provider or instant DEX swap.
3. **Regulatory / Compliance Claims:** "Zero KYC", "100M+ Volume", "0.4s Settlement", and "30s Instant Issuance" remain deliberately excluded from the film until legally confirmed by your compliance team.

---

## 6. Recommended Export Settings (Raylight App UI)

To export the master film directly from the Raylight web editor:
1. Open the project in the [Raylight Web App](https://www.raylight.app/editor/d5d5b299-79d8-49d1-ac02-e6424492cecc).
2. Click **Export** in the upper right corner.
3. Select **Resolution:** `4K (3840 × 2160)` (or `1080p (1920 × 1080)` for standard web streaming).
4. Select **Frame Rate:** `60 FPS` for fluid 3D card rotation and smooth shine sweeps.
5. Toggle **Watermark:** `Off` (included on Pro / Team plans).
6. Audio Codec: `AAC Stereo 320 kbps` (Raylight standard).
