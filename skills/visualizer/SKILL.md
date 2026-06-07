---
name: visualizer
description: "Generate live, self-contained HTML previews of UI and diagrams that consume the project's TOKENS.css (zero hardcoded hex, no CDN, all states, labeled placeholders). For 03 (UX/UI), 05 (Data Modeler), 06 (Frontend) and 08 (QA)."
---

# SKILL: visualizer
## For: Agents 03 (UX/UI) · 05 (Data Modeler) · 06 (Frontend) · 08 (QA)
## Version: 1.0.0

---

## Purpose
Generate live previews of UI and diagrams to validate the design before and during the build. Produces a self-contained, runnable HTML PREVIEW of a component, layout or diagram that consumes the project's `TOKENS.css`.

---

## Hard rules

ALWAYS USE:
  ✓ var(--<prefix>-*) for every visual value — ZERO hardcoded hex
  ✓ Local fonts and assets — NO CDN (P-02), the preview runs offline
  ✓ ALL relevant states: default / active / disabled / error
  ✓ Motion where it matters (e.g. needle ballistics)
  ✓ Every sample datum LABELED as placeholder (P-11) — never appearing to be real

NEVER:
  × Hex colors or other literals instead of var(--<prefix>-*)
  × CDN resources (breaks P-02 and the offline preview)
  × A single state when the component has several
  × Sample data sold as real (P-11 defect)

---

## When they use it

  03 UX/UI        → visual directions and components
  05 DATA MODELER → data diagrams (mermaid / ER)
  06 FRONTEND     → UI preview
  08 QA           → visual gate inspection

---

## Output
An `.html` file in the project's `docs/` or `previews/`.
Self-contained: opens and runs with no server or network, consuming the project's `TOKENS.css`.

---

## Verification
STEP 1 — Open the `.html` (or take a screenshot).
STEP 2 — Confirm the var(--<prefix>-*) tokens resolve (nothing unstyled or fallback-colored).
STEP 3 — Confirm ZERO console errors.
STEP 4 — Confirm each declared state shows, and every placeholder is labeled (P-11).
