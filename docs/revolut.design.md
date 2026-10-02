---
version: alpha
name: Revolut
website: "https://www.revolut.com"
description: >-
  A high-contrast fintech marketing canvas that alternates between true-black storytelling bands and pure-white catalogue rows, anchored on Revolut's cobalt-violet `#494fdf` and an Aeonik Pro 500 display stack running from 20px all the way to 136px. The brand reads as banking-meets-product-brochure — oversized headlines with `lineHeight: 1.0`, generous 88–120px section bands, full-bleed phone and card mockups inside near-black sections, and pill-shaped buttons everywhere. The actual primary CTA is a white pill on black, not the cobalt accent; eight saturated product colours (teal `#00a87e`, deep pink `#e61e49`, warning orange `#ec7e00`, light blue `#007bc2`, light green `#428619`, yellow `#b09000`, danger red `#e23b4a`, brown `#936d62`) appear only inside product illustrations.

seo:
  title: "Revolut Design System for React — Cobalt #494fdf, Aeonik Pro, 21 components"
  metaDescription: "Revolut's design system as a DESIGN.md file. Cobalt #494fdf, Aeonik Pro at 20-136px, 31 colors, 21 components. For React, Next.js, and AI tools."
  highlights:
    - "Two-mode canvas — true black #000000 storytelling bands slam against pure white #ffffff catalogue rows in full-bleed switches"
    - "Primary CTA is a white pill on black, not the cobalt accent — `#494fdf` is reserved for the featured plan card and brand glyph only"
    - "Aeonik Pro 500 runs 20px to 136px with `lineHeight: 1.0` and -2.72px tracking on the flagship hero"
    - "Eight saturated accent colours live inside product mockups only — never as button surfaces or text colours"
    - "Zero drop shadows — depth comes from canvas switches and surface-luminance shifts between `#000000` and `#16181a`"
  tags:
    - "Fintech & Crypto"
    - "Banking & Payments"
  lastUpdated: "2026-05-12"
  author:
    name: "Dov Azencot"
    url: "https://x.com/dovazencot"
  opening: |
    Revolut's marketing surfaces operate on a two-mode rhythm that most fintech sites avoid: full-bleed true-black storytelling bands at #000000 slam directly against pure-white #ffffff catalogue rows, with no soft transitions between them. The brand cobalt-violet #494fdf is famous, but on the marketing site it barely appears — the primary CTA on every dark hero is a white pill with black text, and the cobalt is held back for the featured plan card and the brand wordmark. The display stack is Aeonik Pro at weight 500, used at sizes from 20px up to a 136px hero ("Banking & Beyond") with tight -2.72px letter-spacing and `lineHeight: 1.0`. Body type is Inter at weight 400 with positive 0.24px tracking, which gives UI labels a subtly mechanical precision that fits the fintech context.

    This page packages Revolut's marketing canvas into a single DESIGN.md file built on the Google Labs DESIGN.md specification. Inside the spec: 31 colour tokens grouped into brand, surface, text, and semantic; 17 typography tokens spanning display-xxl at 136px down to caption at 13px; 11 spacing tokens climbing from 4px to a 120px hero band; six radius tokens including a 28px corner reserved for product mockup chrome; and 21 component tokens covering buttons, plan cards, hero bands, product mockups, navigation, and the regulatory footer. Every value is quoted as an exact hex, pixel, or millisecond — no Tailwind shorthand, no approximations.

    A working React or Next.js developer drops the file into Claude, Cursor, or GitHub Copilot and the agent reproduces Revolut's two-mode rhythm rather than a generic dark-theme dashboard. The tokens map cleanly onto Tailwind config or CSS variables, and component definitions reference each other by name (`{component.plan-card-featured}` resolves to `{colors.primary}` over `{colors.canvas-dark}`). The system is worth studying for one disciplined choice: a famous brand colour that almost never appears, because the white-pill-on-black CTA carries more visual voltage than the cobalt ever could.
  related:
    - href: "https://github.com/google-labs-code/design.md"
      title: "The DESIGN.md specification"
      description: "Google Labs' open spec for machine-readable design system files — the format this page is built on."
    - href: "/design"
      title: "Browse all design systems"
      description: "The full directory of DESIGN.md files on shadcn.io, with live mockups for each."
    - href: "/blocks"
      title: "React blocks for shadcn/ui"
      description: "Production-ready hero, pricing, CTA, and dashboard sections built with the same Tailwind + shadcn primitives."
  questions:
    - id: "primary-color"
      title: "What is Revolut's primary brand color and how is it used?"
      answer: "Revolut's brand colour is cobalt violet — #494fdf, a fully-saturated indigo. The surprising rule: it almost never appears on the marketing canvas. The primary CTA on every dark hero band is a white pill with black text, not cobalt. The cobalt is reserved for the featured plan card surface (the recommended subscription tier), the brand wordmark, and secondary CTAs inside white-canvas regions. There's a pressed variant at #3a40c4 and a bright variant at #4f55f1 for inline links."
    - id: "dark-mode"
      title: "Does Revolut use dark mode on its marketing site?"
      answer: "Revolut runs a two-mode canvas — not a toggle, but a structural rhythm. Pure black #000000 storytelling bands carry hero headlines, plan cards, and product mockups; pure white #ffffff catalogue bands carry FAQ rows, download tiles, and comparison tables. The two switch in full-bleed band boundaries with no soft transitions. Inside dark regions, surfaces step up to #16181a (surface-elevated) for plan cards; that's the only second dark step in the system."
    - id: "typography"
      title: "What typography does Revolut use, and what are the substitutes?"
      answer: "The display family is Aeonik Pro at weight 500, used from 20px up to 136px with tight `lineHeight: 1.0` and negative letter-spacing scaling from -0.32px at 32px to -2.72px at 136px. Body type is Inter at weight 400 with positive 0.24px tracking. When Aeonik Pro cannot be licensed, Inter Display, General Sans, or Söhne are credible substitutes — clamp display line-height to 1.0 explicitly and apply -1% letter-spacing. Inter is open-source and can be used directly for body."
    - id: "shape-language"
      title: "What is the shape language of Revolut's design system?"
      answer: "Every button is a pill at radius 9999px (`{rounded.full}`), regardless of size or surface. Content cards including feature cards and plan cards use a 20px radius (`{rounded.lg}`). Form inputs and download tiles use 12px (`{rounded.md}`). Product mockup chrome — the device bezels on phone and POS terminal photography — uses a 28px radius (`{rounded.xl}`). The only square corners in the system are full-bleed hero bands and the footer. There's no shadow language at all — depth comes from canvas switches and surface-luminance shifts."
    - id: "use-in-project"
      title: "Can I use this DESIGN.md to build my own fintech React app?"
      answer: "Yes — the file is structured to feed into Claude, Cursor, or any AI coding tool that reads structured design tokens. The agent will reproduce Revolut's two-mode rhythm, scarce-cobalt discipline, and Aeonik Pro display weights rather than a generic fintech dashboard theme. You can also reference the tokens directly: every colour, type style, radius, and spacing value is a quoted hex or pixel that drops into Tailwind config or CSS variables. The 21 component definitions reference each other by token name so they compose cleanly."
    - id: "known-gaps"
      title: "What is missing from this DESIGN.md spec?"
      answer: "A handful of items, documented in the Known Gaps section: pressed and active visual states are only captured for button-primary; other components rely on focus-ring (browser default). Logged-in app surfaces — transactions, transfers, account settings — are out of scope; only the public marketing canvas is documented. The wide accent palette from teal #00a87e through brown #936d62 is captured as tokens, but exact usage inside product illustrations varies per market. Mobile-app screenshot art direction (bezels, status bars) is product-photography territory and not standardised as design tokens."

colors:
  primary: "#494fdf"
  primary-bright: "#4f55f1"
  primary-deep: "#3a40c4"
  on-primary: "#ffffff"
  ink: "#191c1f"
  body: "#1f2226"
  charcoal: "#3a3d40"
  mute: "#505a63"
  ash: "#5c5e60"
  stone: "#8d969e"
  faint: "#c9c9cd"
  on-dark: "#ffffff"
  on-dark-mute: "rgba(255,255,255,0.72)"
  canvas-light: "#ffffff"
  canvas-dark: "#000000"
  surface-soft: "#f4f4f4"
  surface-card: "#ffffff"
  surface-deep: "#0a0a0a"
  surface-elevated: "#16181a"
  hairline-light: "#e2e2e7"
  hairline-dark: "rgba(255,255,255,0.12)"
  hairline-strong: "#191c1f"
  divider-soft: "rgba(255,255,255,0.06)"
  accent-teal: "#00a87e"
  accent-blue-link: "#376cd5"
  accent-light-blue: "#007bc2"
  accent-light-green: "#428619"
  accent-green-text: "#006400"
  accent-yellow: "#b09000"
  accent-warning: "#ec7e00"
  accent-pink: "#e61e49"
  accent-danger: "#e23b4a"
  accent-deep-red: "#8b0000"
  accent-brown: "#936d62"
  link: "#376cd5"

typography:
  display-xxl:
    fontFamily: Aeonik Pro
    fontSize: 136px
    fontWeight: 500
    lineHeight: 1.0
    letterSpacing: -2.72px
  display-xl:
    fontFamily: Aeonik Pro
    fontSize: 80px
    fontWeight: 500
    lineHeight: 1.0
    letterSpacing: -0.8px
  display-lg:
    fontFamily: Aeonik Pro
    fontSize: 48px
    fontWeight: 500
    lineHeight: 1.21
    letterSpacing: -0.48px
  display-md:
    fontFamily: Aeonik Pro
    fontSize: 40px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: -0.4px
  heading-lg:
    fontFamily: Aeonik Pro
    fontSize: 32px
    fontWeight: 500
    lineHeight: 1.19
    letterSpacing: -0.32px
  heading-md:
    fontFamily: Aeonik Pro
    fontSize: 24px
    fontWeight: 500
    lineHeight: 1.33
    letterSpacing: 0
  heading-sm:
    fontFamily: Aeonik Pro
    fontSize: 20px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.56
    letterSpacing: -0.09px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0.24px
  body-md-bold:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: 0.16px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.43
  button-lg:
    fontFamily: Aeonik Pro
    fontSize: 20px
    fontWeight: 500
    lineHeight: 1.4
  button-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: 0.24px
  button-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.43
  caption:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.4
  link-emph:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: 0.24px

rounded:
  none: 0px
  sm: 8px
  md: 12px
  lg: 20px
  xl: 28px
  full: 9999px

spacing:
  xxs: 4px
  xs: 6px
  sm: 8px
  md: 14px
  lg: 16px
  xl: 24px
  xxl: 32px
  xxxl: 48px
  block: 80px
  section: 88px
  band: 120px

components:
  button-primary:
    backgroundColor: "{colors.canvas-light}"
    textColor: "{colors.canvas-dark}"
    typography: "{typography.button-md}"
    rounded: "{rounded.full}"
    padding: 14px 28px
    height: 48px
  button-primary-pressed:
    backgroundColor: "{colors.faint}"
    textColor: "{colors.canvas-dark}"
    typography: "{typography.button-md}"
    rounded: "{rounded.full}"
  button-dark:
    backgroundColor: "{colors.canvas-dark}"
    textColor: "{colors.on-dark}"
    typography: "{typography.button-md}"
    rounded: "{rounded.full}"
    padding: 14px 28px
    height: 48px
  button-soft:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.button-md}"
    rounded: "{rounded.full}"
    padding: 14px 28px
    height: 48px
  button-outline-light:
    backgroundColor: "{colors.canvas-light}"
    textColor: "{colors.ink}"
    typography: "{typography.button-md}"
    rounded: "{rounded.full}"
    padding: 13px 27px
    height: 48px
  button-outline-dark:
    backgroundColor: "{colors.canvas-dark}"
    textColor: "{colors.on-dark}"
    typography: "{typography.button-md}"
    rounded: "{rounded.full}"
    padding: 13px 27px
    height: 48px
  button-pill-sm:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.button-sm}"
    rounded: "{rounded.full}"
    padding: 8px 16px
    height: 36px
  text-input:
    backgroundColor: "{colors.canvas-light}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 14px 16px
    height: 56px
  hero-band-dark:
    backgroundColor: "{colors.canvas-dark}"
    textColor: "{colors.on-dark}"
    typography: "{typography.display-xxl}"
    rounded: "{rounded.none}"
    padding: 88px 24px
  hero-band-photo:
    backgroundColor: "{colors.canvas-dark}"
    textColor: "{colors.on-dark}"
    typography: "{typography.display-xl}"
    rounded: "{rounded.none}"
    padding: "0"
  feature-card-light:
    backgroundColor: "{colors.canvas-light}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 32px
  feature-card-dark:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.on-dark}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 32px
  plan-card:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.on-dark}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 32px
  plan-card-featured:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 32px
  product-mockup:
    backgroundColor: "{colors.canvas-dark}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.xl}"
    padding: 48px
  download-tile:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: 12px 20px
    height: 56px
  badge-tag:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: 4px 12px
  badge-feature:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: 4px 12px
  nav-bar:
    backgroundColor: "{colors.canvas-dark}"
    textColor: "{colors.on-dark}"
    typography: "{typography.button-md}"
    rounded: "{rounded.none}"
    height: 64px
  sub-nav-pill:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.on-dark}"
    typography: "{typography.button-sm}"
    rounded: "{rounded.full}"
    padding: 8px 16px
  footer:
    backgroundColor: "{colors.canvas-dark}"
    textColor: "{colors.on-dark-mute}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.none}"
    padding: 80px 24px
---

## Overview

Revolut's marketing canvas operates in a high-contrast two-mode system: a **near-black storytelling canvas** (`{colors.canvas-dark}` — `#000000`) that hosts hero bands, product mockups, and the planning section, alternating with **white catalogue bands** (`{colors.canvas-light}` — `#ffffff`) that host comparison tables, FAQ rows, and download tiles. The two modes switch in full-bleed bands rather than soft transitions; sections slam against each other to create the magazine-spread rhythm the brand is known for.

The display typography is **Aeonik Pro at weight 500**, used at sizes from 20px to 136px. The flagship hero ("Banking & Beyond", "Join the 70+ million using Revolut") sits at 80–136px with `lineHeight: 1.0` and tight negative letter-spacing. Body type is **Inter** at weight 400 — open-source, no-nonsense, paired with positive tracking (`0.24px`) on UI labels for slightly more mechanical precision.

The brand accent is `{colors.primary}` (`#494fdf`) — a saturated cobalt violet — but it appears scarcely on marketing surfaces. The actual primary CTA on the hero is the **white pill on black** ("Choose your subscription"), and the cobalt violet is reserved for featured plan cards, secondary CTAs in white sections, and the brand glyph itself. A wide secondary palette of deep teal, light-blue, deep-pink, light-green, warning orange, and yellow appears inside product mockups and feature illustrations — never as button surfaces.

**Key Characteristics:**
- Two-mode canvas system — `{colors.canvas-dark}` (true black) for storytelling, `{colors.canvas-light}` (white) for browsing — switched in full-bleed bands.
- Display typography is **Aeonik Pro 500** at sizes 20–136px with tight `lineHeight: 1.0` and large negative letter-spacing on display sizes.
- The actual primary CTA is `{component.button-primary}` — a **white pill with black text**, sitting on the dark canvas as the brightest pixel. Cobalt-violet `{colors.primary}` is reserved for featured plan cards and secondary CTAs.
- Eight saturated accent colours live inside product mockups and illustrations only, never as button surfaces — teal `#00a87e`, light-blue `#007bc2`, deep-pink `#e61e49`, light-green `#428619`, warning orange `#ec7e00`, yellow `#b09000`, brown `#936d62`, danger red `#e23b4a`.
- All buttons are pill-shaped (`{rounded.full}`); content cards use `{rounded.lg}` (20px); inputs and small chips use `{rounded.md}` (12px).
- Photography is product-led — phone mockups, card mockups, terminal mockups — shown full-bleed inside dark sections with no caption overlay.

## Known Gaps

- Pressed/active visual states are documented for `button-primary-pressed` only; other components rely on focus-ring (browser default) for interactive feedback.
- Logged-in app surfaces (transactions, transfers, account settings) are out of scope — only the public marketing canvas is documented.
- The wide accent palette (`{colors.accent-teal}` `#00a87e` through `{colors.accent-brown}` `#936d62`) is captured from the extracted token set, but exact usage inside product illustrations varies per market and product line; document per-illustration rather than as system buttons.
- Mobile-app screenshot art direction (phone bezels, status bars) is product-photography territory and not standardised as design tokens.
