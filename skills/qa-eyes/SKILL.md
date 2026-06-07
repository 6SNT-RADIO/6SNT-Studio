---
name: qa-eyes
description: "For QA (08). Drive the REAL app (computer-use on desktop / Chrome on web), capture states and catch placeholders/mocks disguised as real (P-11 audit). Use it at the QA gate, on the real app, not the mockup."
---

# SKILL: qa-eyes — QA with eyes (Agent 08)

**Purpose.** QA must not depend on the PO to "see" the app. With this skill, Agent 08 **drives the real application**, takes screenshots, verifies states and **catches placeholders/mocks disguised as real** — automatically.

> Origin: adapted from gstack `/browse` + `/qa`. gstack uses Playwright (web); we prioritize **desktop** via computer-use.

---

## Tool by app type
- **Desktop app (Electron, native):** `computer-use` MCP — `request_access` to the app, `screenshot`, `left_click`, `type`, `key`, `scroll`. This IS the right path for native apps.
- **Web app:** Claude-in-Chrome MCP (`navigate`, `get_page_text`, `screenshot`, `read_console_messages`).
- Never assert a state without having **seen** it in a screenshot. Zero "should work".

---

## Protocol (one QA pass)
1. **Start the app** per its README (note it if it needs non-obvious steps — e.g. build + a specific Node). If it doesn't start, that's already a **blocking** finding.
2. **Walk every feature** in the BRIEF. For each: screenshot → compare against expected behavior (BRANDBOOK/DATAMODEL) → record with evidence (screenshot path).
3. **Write path** (the critical one): create real data, **close and reopen**, confirm it persists. Don't assume persistence: verify it.
4. **States:** loading, empty, error (trigger one), success.
5. **Console/logs:** no unhandled errors (P-06).

---

## ⭐ Anti-placeholder audit (MANDATORY — P-11)
For each visible datum/asset, ask: **is this real or filler?** Actively hunt:
- Fixed values that don't change with input (mock signal).
- Icons/images with initials/empty boxes where real art should be.
- Features that "respond" identically regardless of input (OCR always returning the same, seeded lists).
- "Development mode / sample data" banners in a build presented as real.
For each finding: is it **declared** as deferred (backlog) or **sold as real**? The latter is a **blocking defect**, not a note.

---

## Output: `docs/QA_REPORT.md`
- **Health Score (0-100)** + count by severity: `blocking / warning / note`.
- Each finding: description + **screenshot** + how to reproduce + severity.
- Explicit **Anti-placeholder** section (what's real, what's filler, what's mis-sold).
- **Gate verdict:** 0 blocking to approve. Deferred and **declared** items (PHASE2_BACKLOG) go as "out of scope", not as a defect.
- Don't fix the code: **report**. The orchestrator decides who iterates.

## Example (one line of each type)
- ✅ Real: "Logged Maokai 2/4/17 → Dashboard shows 100% win rate, 6.3 KDA; persists after reopening (screenshot qa-03.png)."
- ❌ Placeholder sold as real: "OCR returns Yasuo 8/3/11 for ANY screenshot → it doesn't read the image; the button implies it does. BLOCKING unless hidden/marked 'coming soon'."

---

## Prioritize by risk (not exhaustive coverage)
Test the highest impact and failure-probability first: unrecoverable data, money, authentication, and the BRIEF's critical flow. Don't chase testing everything. Declare in the report what was prioritized and what was skipped as low-risk (with a one-line why).

---

## Done = done (impl-vs-spec, reality-check, end-to-end) (merged from `qa-verification`, v6.3)

> Folded in from the `qa-verification` skill without losing content.

Before approving the QA gate, verify that "done" means done:
- **Jenny (impl-vs-spec):** find gaps/inconsistencies between what's implemented and what's specified.
- **Karen (reality-check):** REAL vs claimed completeness; cut stubs/placeholders.
- **task-completion-validator (end-to-end):** it works end-to-end, not just compiles.

Combine with `qa-eyes` (real app) + the anti-placeholder audit (P-11) + a reviewdog baseline.

