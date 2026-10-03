# Off-Card — Official Launch Film Specification (Unhurried Cinematic Edition)

**Creative Direction:** High-Status Luxury Hardware & Sovereign Fintech Cinema (Apple × Revolut Ultra × Amex Centurion)  
**Format:** 16:9 Cinematic Showcase (1920 × 1080)  
**Total Runtime:** 47.5 Seconds (9 Unhurried, Measured Beats)  
**Audio Architecture:** Full Bespoke Soundscape (Filtered Sub-bass Drone, Tension Riser, Layered Sub/Air Reveal Impacts, Card Flip Whooshes, Mechanical Ledger Counter Ticks, Crystal CTA Chime)  
**Active Raylight Project:** [Open Live Raylight Editor](https://www.raylight.app/editor/d5d5b299-79d8-49d1-ac02-e6424492cecc) (`d5d5b299-79d8-49d1-ac02-e6424492cecc`)

---

## 1. Creative Principles & Quality Standards

1. **One Idea per Shot:** 12 cramped beats consolidated into 9 confident, unhurried sequences.
2. **Strict Reading-Time Law:** Every single text line remains statically visible for at least `(words / 2.5) + 1.2s` AFTER its entrance completes before any exit or cut occurs.
3. **Pristine Entrances:** Slow, clean arrivals (`600–900ms`), blur-to-focus + subtle vertical slide (`slideY: 0.02`), whole line at once (`staggerMode: "none"`). No character ghosting or letter jitter.
4. **Negative Space & Hierarchy:** Max 2 text levels per shot. No element within 6% of the frame bounds; hero compositions maintain >20% side margins. Headlines in `#ffffff` (weight 600), sublines in brushed titanium silver (`#c8d4e4` / `#b8c2d0`).
5. **Calm, Committed Motion:** Single slow camera drift per shot (linear or ease-in-out; real push-ins at 1.7–2.5x; zero ~1.1x camera wobble). Idle float `<= 3°`.
6. **Restrained Optical Accents:** Bloom intensity `0.35` (threshold `0.65`), vignette `0.70`, film grain `0.06`. Anamorphic glitch restricted to a single brief burst (`160ms`) in Beat 3 only.
7. **Silence as a Weapon:** 700ms of near-silence before the "Until now." pivot so the reveal hits with maximum weight.

---

## 2. 9-Beat Narrative & Visual Score Breakdown

### Beat 1: The Sovereign Hook (0.0s – 4.5s / 4500ms)
* **Emotional Beat:** High-status sovereign declaration.
* **Visual:** Generous negative space in midnight liquid silk. Faint out-of-focus iridescent glint of the Lumen card floating in the background depth plane.
* **Typography:**
  * Headline: `Crypto was built for freedom.` (`color: #ffffff`, `size: 0.076`, `weight: 600`, `y: 0.70`)
  * Entrance: `800ms` blur-to-focus. Static hold for `3.7s` (exceeds `3.2s` reading-time rule).
* **Camera:** Slow linear dolly drift (`zoom: 1.04`).
* **Audio:** Low filtered sub-bass drone bed begins with 1.2s fade-in; soft haptic tick at `800ms`.

### Beat 2: The Takeaway — Centralized Capture (4.5s – 9.5s / 5000ms)
* **Emotional Beat:** Cold realization of systemic friction.
* **Visual:** Lighting shifts cold (`8500K`, `#0c1626` midnight silk).
* **Typography:**
  * Headline: `Then off-ramps took it away.` (`#ffffff`, `size: 0.075`, `weight: 600`, `y: 0.77`, in at `200ms`, `4.1s` static hold > `3.2s`).
  * Subline: `Banking hours. Compliance holds.` (`#c8d4e4`, `size: 0.046`, `weight: 400`, `y: 0.57`, in at `900ms`, `3.4s` static hold > `2.8s`).
* **Camera:** Steady linear drift (`zoom: 1.06`).
* **Audio:** Sub-bass drone deepens; soft haptic click at `5200ms`.

### Beat 3: The Friction Wall (9.5s – 14.5s / 5000ms)
* **Emotional Beat:** Escalating bureaucratic surveillance.
* **Visual:** 3 upright typographic lines staggering in `700ms` apart, upright and perfectly centered (all italic skews, quotes, and cheap red fills eliminated).
* **Typography:**
  * Line 1: `Account under review.` (`#ffffff`, `size: 0.065`, `weight: 600`, `y: 0.85`, in at `200ms`, `4.2s` static hold > `2.4s`).
  * Line 2: `Passport scans. Proof of address.` (`#d0d8e8`, `size: 0.058`, `weight: 500`, `y: 0.70`, in at `900ms`, `3.5s` static hold > `3.2s`).
  * Line 3: `Biometric facial recognition.` (`#a0b0c4`, `size: 0.054`, `weight: 400`, `y: 0.55`, in at `1600ms`, `2.8s` static hold > `2.4s`).
* **Effects:** Single `160ms` subtle glitch disturbance on Line 1 arrival; all three lines hold static together.
* **Audio:** Drone bed fades out at `13800ms`, creating `700ms` of near-silence before the pivot.

### Beat 4: The Pivot — The Exhale (14.5s – 19.0s / 4500ms)
* **Emotional Beat:** Total tension release; the sovereign turning point.
* **Visual:** Deep obsidian black silk almost motionless (`speed: 0.25`). Locked-off stillness.
* **Typography:**
  * Headline: `Until now.` (`#ffffff`, `size: 0.11`, `weight: 700`, `y: 0.77`, in at `100ms`, `3.75s` static hold > `2.0s`).
  * Subline: `No bank permission. No paperwork.` (`#c8d4e4`, `size: 0.052`, `weight: 500`, `y: 0.58`, in at `650ms`, `3.25s` static hold >= `3.2s`).
* **Camera:** Locked-off center framing.
* **Audio:** `2.0s` dark tension riser (`riser-airy-swell-1`) peaks precisely at `14500ms`, landing on silent calm.

### Beat 5: The Reveal — Meet Off-Card (19.0s – 25.0s / 6000ms)
* **Emotional Beat:** High-status arrival of the flagship hardware.
* **Visual:** Authentic **Chrome Titanium Physical Card** (`card_chrome_front.png`, `scale: 0.235`, `~0.42` frame width) enters alone. Settles into softbox studio lighting.
* **Typography:**
  * Headline: `Meet Off-Card.` (`#ffffff`, `size: 0.078`, `weight: 600`, `y: 0.32`, enters ONLY after card settles at `2000ms`, hold `3.3s` > `2.4s`).
  * Subline: `Crafted in titanium.` (`#c8d4e4`, `size: 0.048`, `weight: 400`, `y: 0.16`, enters at `2600ms`, hold `2.7s` > `2.4s`).
* **Lighting:** Key light sweeps across titanium bevel and specular rim.
* **Audio:** Massive dual-layer impact hits at `19000ms` (sub-heavy drop `impact-sub-drop-1` + airy textural hit `impact-deep-muffled-1`).

### Beat 6: Hardware Craftsmanship — Macro Chip to 3D Flip (25.0s – 32.0s / 7000ms)
* **Emotional Beat:** Unrivaled engineering precision; physical offline autonomy.
* **Visual:** **One continuous sequence**:
  * 0.0s – 2.6s: Camera pushes in to `2.2x` macro on the gold EMV contact microchip with shallow depth-of-field (`f/2.8`), catching a specular streak across the contacts.
  * 2.6s – 4.5s: Card initiates a 3D Y-axis rotation with motion blur (`180° shutter`) and specular rim sweep at edge-on.
  * 4.5s – 7.0s: Flips seamlessly to the physical reverse face (`card_chrome_back.png`), revealing the true black magnetic stripe, muted signature panel (`ALEX MORGAN`), and laser-etched CVV.
* **Typography:**
  * Headline: `Engineered down to the chip.` (`#ffffff`, `size: 0.072`, `weight: 600`, `y: 0.22`, in at `2600ms`, hold `3.7s` > `3.2s`).
* **Audio:** Smooth card flip whoosh (`whoosh-slow-smooth-1`) peaks at `27500ms`, leading the physical card flip onset by `100ms`.

### Beat 7: The Editions — 4-Card Dynamic Fan-Out (32.0s – 37.0s / 5000ms)
* **Emotional Beat:** Aesthetic variety and unified physical standard.
* **Visual:** All 4 physical card editions (**Lumen, Chrome, Grid, Carbon**) dynamically fan out from center into a luxurious horizontal cascade with >20% frame margins. A soft key light sweep passes across them left-to-right, illuminating each card in sequence.
* **Typography:**
  * Headline: `Four editions. One standard.` (`#ffffff`, `size: 0.076`, `weight: 600`, `y: 0.32`, in at `400ms`, hold `3.9s` > `2.8s`).
  * Subline: `Lumen · Chrome · Grid · Carbon` (`#c8d4e4`, `size: 0.046`, `weight: 500`, `y: 0.16`, in at `1200ms`, hold `3.2s` > `2.8s`).
* **Camera:** Slow linear dolly (`1.05x`).

### Beat 8: Self-Custodial Funding — Live Wallet Balance (37.0s – 42.0s / 5000ms)
* **Emotional Beat:** Sovereign balance custody; zero third-party pre-funding.
* **Visual:** Chrome card floating in background (`y: 0.86, z: -0.02`), fronted by a floating translucent glass HUD panel with liquid blur and multi-asset crypto balances (USDC, USDT, ETH, BTC).
* **Typography & Dynamics:**
  * Headline: `Spend what you hold.` (`#ffffff`, `size: 0.076`, `weight: 600`, `y: 0.32`, in at `400ms`, hold `3.9s` > `2.8s`).
  * Subline: `Funded directly from your wallet.` (`#c8d4e4`, `size: 0.046`, `weight: 400`, `y: 0.16`, in at `1200ms`, hold `3.2s` >= `3.2s`).
* **Audio:** Mechanical digital counter tick sequence (`ui-counter-ticks-1`) rolls from `37500ms` to `39500ms`.

### Beat 9: The Climax & CTA — Spend Freely (42.0s – 47.5s / 5500ms)
* **Emotional Beat:** Absolute empowerment and high-status brand lockup.
* **Visual:** Flagship Chrome card centered in calm light (`y: 0.90`). Below it rests the official vector brand lockup (striped circular emblem + lowercase `off-card`).
* **Typography:**
  * Headline: `Spend freely.` (`#ffffff`, `size: 0.062`, `weight: 600`, `y: 0.27`, in at `1200ms`, hold `3.7s` > `2.0s`).
  * URL: `offcard.me` (`#a5b4fc` lavender brand accent, `letterSpacing: 0.10em`, `size: 0.046`, `weight: 600`, `y: 0.15`, in at `1800ms`, hold `3.1s` > `1.6s`).
* **Final Hold:** **The last 1.5 seconds (46.0s – 47.5s) are completely motionless**, except for a faint specular light drift across the titanium bevel.
* **Audio:** Single pristine luxury crystal chime (`ui-success-chime-1`) lands at `43200ms`, sustaining gently into the quiet hold.

---

## 3. Spatial Coordinates & Layout Specifications (Raylight)

| Asset Layer | Absolute World Center | Scale / Size | Safe Margin Clearance |
| :--- | :--- | :--- | :--- |
| **Hero Card (Reveal / Climax)** | `(-1.90, 0.84 to 0.90)` | `scale: 0.22 – 0.235` | Upper-half anchor; `>0.08 wu` clearance to headline |
| **4-Card Fan-Out Cascade** | `(-2.26, -2.02, -1.78, -1.54, y: 0.84)` | `scale: 0.142` each | Symmetric `21%` frame padding on left & right |
| **Official Brand Lockup** | `(-1.90, 0.45)` | `scale: 0.18` | Centered vector emblem + wordmark |
| **Headline Typography** | `(-1.90, 0.27 to 0.32)` | `size: 0.062 – 0.078` | Lower third anchor; `maxWidth: 0.80 wu`, center aligned |
| **Subline / URL Typography** | `(-1.90, 0.15 to 0.16)` | `size: 0.046 – 0.048` | `>0.05 wu` vertical gap below headline; 0 lint warnings |
| **Canvas World Dimensions** | Center `(-1.90, 0.70)` | `width: 2.261, height: 1.272` | Authoritative bounds: `X [-3.031, -0.769]`, `Y [0.064, 1.336]` |
