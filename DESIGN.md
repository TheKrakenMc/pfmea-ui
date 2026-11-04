---
name: APG DMS entry surfaces
description: Corporate document workspace for employee access and module navigation.
colors:
  ground: "#f5f7fa"
  surface: "#fff"
  ink: "#172b45"
  muted: "#59697d"
  line: "#dce3ec"
  blue: "#245ac0"
  blue-hover: "#194aab"
  tint: "#edf3fd"
  focus: "#3673dc"
  error: "#a52632"
  error-bg: "#fff0f1"
  success: "#246442"
  success-bg: "#edf8f1"
  dark-ground: "#111720"
  dark-surface: "#19222e"
  dark-ink: "#edf2f9"
  dark-muted: "#a8b7c9"
  dark-line: "#354255"
  dark-blue: "#91b8ff"
  dark-blue-hover: "#b6cfff"
  dark-tint: "#1b2c46"
  dark-focus: "#91b8ff"
  dark-error: "#ffb9c1"
  dark-error-bg: "#3a2029"
  dark-success: "#a6e4bc"
  dark-success-bg: "#18372a"
  identity-navy: "#17385f"
  identity-copy: "#d2dfef"
  identity-detail: "#c1d2e6"
  identity-icon: "#b8d4fc"
  identity-line: "#56718f"
  selection: "#c8dcff"
typography:
  display:
    fontFamily: "var(--font-sans)"
    fontSize: "clamp(34px, 3.25vw, 48px)"
    fontWeight: 500
    lineHeight: 1.12
    letterSpacing: "-.035em"
  headline:
    fontFamily: "var(--font-sans)"
    fontSize: "clamp(27px, 2.5vw, 34px)"
    fontWeight: 600
    lineHeight: 1.22
    letterSpacing: "-.035em"
  login-title:
    fontSize: "30px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-.03em"
  feature-title:
    fontSize: "25px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-.025em"
  title:
    fontSize: "17px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-.02em"
  body:
    fontSize: "14px"
    lineHeight: 1.75
  label:
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.5
rounded:
  control: "9px"
  utility: "8px"
  panel: "16px"
  directory: "0"
spacing:
  compact: "8px"
  inline: "12px"
  frame: "16px"
  mobile: "24px"
  panel: "28px"
  gutter: "32px"
components:
  button-primary:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "13px 16px"
    width: "100%"
  button-primary-hover:
    backgroundColor: "{colors.blue-hover}"
  button-utility:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.utility}"
    padding: "10px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "49px"
  pfmea-feature:
    backgroundColor: "{colors.tint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "28px"
  module-link:
    textColor: "{colors.ink}"
    rounded: "{rounded.directory}"
    padding: "26px 12px"
---

# Design System: APG DMS entry surfaces

## Overview

**Creative North Star: "Corporate document workspace"**

The corporate document workspace gives employees a calm, practical entrance to manufacturing documentation. Light ground, corporate blue, restrained typography, and direct actions express the confirmed modern, minimal enterprise direction.

This specification covers LoginPage and WelcomePage only. It records src/pages/entry-pages.css and the corresponding React components; it does not redefine the global application shell, worksheets, or editors. Existing dark-mode compatibility and the inherited Inter font remain part of these surfaces.

**Key Characteristics:**

- Clear employee access.
- Blue emphasis with flat tonal surfaces.
- A prominent PFMEA destination and a quiet module directory.
- Responsive, localized, keyboard-accessible controls.

## Colors

Corporate blue sits against cool paper neutrals; the identity panel uses a stable navy.

### Primary

- **Corporate blue** (`blue`): text actions, PFMEA accents, and the submit button. The button retains the light blue fill and white text in both themes; dark-mode text actions use `dark-blue`.
- **Identity navy** (`identity-navy`): the login narrative panel, with identity-copy, identity-detail, identity-icon, and identity-line supporting its hierarchy.
- **Pale blue** (`tint`): PFMEA's feature surface; `dark-tint` supplies the dark equivalent.
- **Focus blue** (`focus`): keyboard outlines; dark mode selects `dark-focus`.

### Neutral

- **Cool paper** (`ground`) and **white surface** (`surface`): welcome ground and form/control surfaces.
- **Document ink** (`ink`), **supporting slate** (`muted`), and **fine divider** (`line`): text hierarchy and separators.
- Dark-prefixed tokens are the explicit replacements under the application's dark ancestor.
- Error and success pairs provide readable foregrounds on tinted status backgrounds. Selection uses its own pale blue with document ink.

**The Scoped Palette Rule.** Entry colors belong to these two pages; they do not replace worksheet or global shell tokens.

## Typography

**Display and body font:** the existing Inter-based `--font-sans` stack is inherited without adding a font asset.

Hierarchy is expressed through size and weight rather than multiple font families. Display serves the identity panel, headline the welcome heading, login-title the form, feature-title PFMEA, title directory rows, and label form labels. Body describes features and form context. Inputs use (16px) text; their placeholders use (14px). Supporting welcome copy uses (15px) and a (1.65) line height.

Identity copy and feature descriptions stop at (38ch); directory descriptions at (53ch). The identity heading uses (15ch). OTP input uses tabular numerals, (23px) type, and (.5em) tracking.

## Layout

Login fills at least (100svh), with (16px) outer padding and gap. Desktop columns use (.94fr / 1.06fr). The navy panel has fluid padding from (28px) to (60px). The form is centered at a maximum (390px) width.

Welcome is centered at a maximum (1100px), with a twelve-column grid and (32px) gap: PFMEA spans five columns and the directory seven. The footer aligns the compact APG DMS signature beside explanatory text.

At (1050px) and below, panel and workspace padding tighten, the identity heading becomes (38px), and the welcome gap becomes (24px). At (760px) and below, login hides the identity panel and shows its small inline brand; the form heading becomes (26px). Welcome uses (22px) side padding, both destinations span all twelve columns, and the footer becomes a single column.

## Elevation & Depth

These surfaces use tonal layering, borders, and whitespace rather than shadows. PFMEA is a pale-blue plane; the directory is divided by fine rules. Keyboard focus is a (3px) outline with (4px) offset, reduced to (2px) offset for inputs.

**The Flat Surface Rule.** Preserve flat entry surfaces; use color and separators to communicate structure.

## Shapes

Panels have generous panel corners; inputs and submit actions use the tighter control radius. Utility buttons use the utility radius, while directory rows remain square. Dividers are (1px). The password visibility control is (43px) square with (6px) corners; utility actions have at least (44px) dimensions.

## Components

### Buttons

The primary submit action is full width with a minimum (49px) height. Hover darkens its fixed corporate-blue fill; press scales to (.98). Disabled submit actions use (.6) opacity and a not-allowed cursor. Theme/language controls are transparent and gain a neutral background on hover. Recovery and back actions underline on hover.

State changes use (160ms ease); button press uses (140ms cubic-bezier(.23, 1, .32, 1)). Hover styling applies only to fine pointers with hover support.

### Inputs / Fields

Explicit labels sit above bordered inputs. Focus changes the border and adds the shared outline. Password visibility has an accessible pressed state. Recovery uses a six-digit numeric OTP and an eight-character minimum new password. Error and success messages use distinct paired colors and alert/status semantics.

Submission disables the fieldset, marks the form busy, and shows a labeled spinner. Phase changes focus the form heading. Reduced-motion preference removes transitions, press scaling, and spinner animation; the text status remains.

### Navigation

Module destinations remain React Router links rendered as anchors: PFMEA, process flows, products, and auxiliary catalogs. Directory rows use a (24px / flexible / 20px) grid with (18px) gaps. Hover lightens the row surface and turns the heading and arrow blue. The entire row is the target.

### PFMEA feature

A flat tinted panel starts directly with its heading and blue ShieldCheck icon, aligned with a (12px) gap. Descriptive copy, a small text-based analysis structure, and an opening action follow. Its hover background mixes (90%) tint with corporate blue. The analysis structure is decorative and hidden from assistive technology. Icons come from existing Lucide components; no imagery or metric decoration is introduced.

## Do's and Don'ts

### Do:

- Do keep blue for actionable emphasis and the PFMEA feature.
- Do preserve light and dark semantic colors, clear keyboard focus, and reduced-motion behavior.
- Do retain Spanish/English copy, explicit labels, and native module links.

### Don't:

- Don't extend the entry-page composition to worksheets or the global shell without a separate design decision.
- Don't add invented metrics or marketing imagery to these entry surfaces.
- Don't turn the three module rows into competing elevated cards.

