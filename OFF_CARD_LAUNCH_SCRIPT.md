# Off-Card — Official Launch Film Specification
**Style:** Apple Keynote & Product Cinema (Restrained, Premium, Declarative)  
**Format:** 9:16 Vertical (1080 × 1920) | Mobile Showcase (Reels / Shorts / TikTok / X)  
**Duration:** 19.5 Seconds (5 Scenes @ 3.9s per scene)  
**Audio Archetype:** Kinetic Sound Design (Sub-bass, Haptic Glass Taps, Air Swooshes, Zero Voiceover)  
**Raylight Project:** [Open Live Editor](https://www.raylight.app/editor/d5d5b299-79d8-49d1-ac02-e6424492cecc) (`d5d5b299-79d8-49d1-ac02-e6424492cecc`)

---

## 1. Aesthetic DNA & Anti-Slop Directive

* **Zero Marketing Slop:** No "unleash", no "revolutionize", no "meet the future of fintech". Every line is a factual, declarative, short clause (2–5 words maximum).
* **The Apple Staccato:** Distinct phrases land as separate beats with rhythmic pauses. Never stack eyebrow labels or kicker tags above centered headlines.
* **Optics & Stage:**
  * **Background:** Deep obsidian / charcoal gradient (`#08080b` to `#121217`).
  * **Card Surface:** Frosted titanium / brushed obsidian with an iridescent chamfer edge foil that catches directional rim lighting.
  * **Camera Choreography:** 3D resting card tilt (39°–48°), linear ambient dollys (speed <= 1.06x), and hard snap cuts on the fastest point of motion curves.
  * **Optical Grading:** Subtle bloom (`intensity: 1.0`, `threshold: 0.85`), cinematic vignette (`0.85–0.98`), optical depth-of-field (`f2.1` to `f3.3`), and hairline chromatic aberration on high-contrast edges (`offset: 4.5–13.5`).

---

## 2. 5-Scene Storyboard & Beat Breakdown

### Scene 1: The Form (0.0s – 3.9s)
* **Visual Concept:** The obsidian card emerges from total darkness at a dramatic 48° resting tilt. A razor-sharp beam of light sweeps across the laser-etched edge foil.
* **On-Screen Typography:**
  ```text
  Off-Card.
  ```
  *(Position: Center-left, Font: Inter / SF Pro Display, Weight: 500, Size: 0.12 wu, Color: #F5F5F7)*
* **Camera & Layer Motion:**
  * Card Layer: Resting at `(-1.60, -0.78, z 0.03)` tilted `48°`, subtle linear micro-rotation `-8°` across 3857ms.
  * Camera: Smooth linear dolly push-in (`zoom x1.10`, `travel 0.12 wu`).
  * Lighting: Specular gleam sweeps across the physical titanium rim.
* **Sound Design:**
  * Sub-bass swell (`40 Hz`) building into a crisp metallic edge scrape and a subtle low-frequency impact.

---

### Scene 2: The Machine (3.9s – 7.8s)
* **Visual Concept:** Extreme macro framing on the card surface. Virtual card limits and controls materialize as frosted liquid glass UI layers with floating micro-badges.
* **On-Screen Typography:**
  ```text
  Virtual cards in 30 seconds.
  ```
  *(Secondary beat at 2100ms:)*
  ```text
  Instant limits.
  ```
  *(Size: 0.065 wu, Weight: 500, Color: #FFFFFF)*
* **Camera & Layer Motion:**
  * Card Layer: Resting at `(-1.82, 0.84, z 0.24)` tilted `40°`, linear drift `0.33 wu`.
  * UI Elements: Liquid glass spend pills settle in from `scale 0.94` with `300ms ease-out` cascade.
  * Camera: Micro-pull dolly (`zoom x0.90`, `travel 0.00 wu`).
* **Sound Design:**
  * High-velocity card deck shuffle, precision mechanical click (haptic spring feedback), and digital glass tap.

---

### Scene 3: The Manifesto (7.8s – 11.7s)
* **Visual Concept:** The dramatic centerpiece of the film. The stage dims as the card rotates into edge profile. The privacy declaration stamps the frame with absolute, uncompromising authority.
* **On-Screen Typography:**
  ```text
  Privacy. Built in.
  ```
  *(Beat 2 at 1800ms:)*
  ```text
  Non-KYC for businesses and individuals. Forever.
  ```
  *(Size: 0.08 wu headline, 0.045 wu subline, Weight: 500, Color: #F5F5F7 with iridescent sheen)*
* **Camera & Layer Motion:**
  * Card Layer: Resting at `(-2.00, 0.05, z 0.04)` tilted `39°`, subtle tilt `-5°` over 3857ms linear.
  * Typography: Staggered Word Flow entrance (`80ms per word`), snap settle into rest.
  * Camera: Committed push-in dolly (`zoom x1.22`, `travel 0.16 wu`).
* **Sound Design:**
  * Heavy tactile bass drop, instantaneous vacuum silence, followed by a resonant crystal glass ping.

---

### Scene 4: The Velocity (11.7s – 15.6s)
* **Visual Concept:** The card executes a full 180° airborne flip. As it rotates, real-time treasury balances and global payment settlements clear dynamically across multi-currency ledgers.
* **On-Screen Typography:**
  ```text
  Treasury settlement.
  Instant.
  ```
  *(Size: 0.07 wu, Weight: 600, Color: #FFFFFF)*
* **Camera & Layer Motion:**
  * Card Layer: Airborne 180° flip (`tilt 180°` over `3148ms ease-out-expo settle-in`, `move 1.18 wu`).
  * Cut on Motion: Outgoing flip accelerates into the next transition with `ease-in-expo`.
  * Camera: Micro-adjust dolly (`zoom x1.10`).
* **Sound Design:**
  * Kinetic whoosh of the spinning card, sharp register chime, and sub-bass release.

---

### Scene 5: The Lockup (15.6s – 19.5s)
* **Visual Concept:** The card docks into center stage under a warm vertical top-down keylight. The minimalist Off-Card lockup reveals itself with a fluid linear shimmer.
* **On-Screen Typography:**
  ```text
  Off-Card.
  Spend freely.
  ```
  *(URL footnote at 2200ms:)*
  ```text
  offcard.io
  ```
  *(Size: 0.10 wu wordmark, 0.04 wu URL, Weight: 500 / 400)*
* **Camera & Layer Motion:**
  * Card Layer: Center stage at `(-2.04, 2.14, z -0.41)` tilted `51°`, steady `9°` drift over 3857ms.
  * Typography: Shimmer pass (`1300ms linear`) sweeping from left to right across the wordmark.
  * Camera: Controlled push-in (`zoom x1.22`, `travel 0.16 wu`).
  * Effects: Deep vignette (`1.0`) framing the final lockup.
* **Sound Design:**
  * Final iconic keynote chord, deep sub undertone, slow 3-second acoustic decay into silence.

---

## 3. Production Execution Plan (Raylight MCP)

1. **Step 1: Editor Connection**
   * Project URL: `https://www.raylight.app/editor/8898f7e7-2d2e-4dd8-b206-9ce774ea4571`
   * User opens the link in their browser.
   * Agent verifies connection via `get_editor_status`.

2. **Step 2: Canvas Aspect Ratio & Asset Alignment**
   * Configure project coordinate system for 9:16 vertical delivery.
   * Verify layer hierarchy and z-depth separation (`0.3 – 1.2 wu`).

3. **Step 3: Batch Composition Edits (`apply_edits`)**
   * Inject exact scene copy, typography styling (Inter/SF Pro, weight 500, sizes 0.04–0.12 wu).
   * Apply 3D resting card tilt parameters (`39°–48°`) and rotation blocks.
   * Set up linear ambient camera drifts and commit dollies per beat sheet.
   * Attach optical grading: bloom (`1.0/0.85`), vignette (`0.85–0.98`), depth of field (`f2.1–f3.3`).

4. **Step 4: Quality Inspection (`render_stills`)**
   * Render calibration stills for all 5 scenes.
   * Inspect layer bounds, edge clipping, contrast ratios, and text positioning.

5. **Step 5: Export & Delivery (`save_as_video`)**
   * Render final high-bitrate vertical video.
   * Provide the finished preview and direct download link.
