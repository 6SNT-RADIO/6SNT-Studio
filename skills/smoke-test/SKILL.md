---
name: smoke-test
description: "'Done' includes an artifact that STARTS: an automated headless smoke with ONE command, pass/fail by exit code, and tests/smoke-result.json for the release-gate DoD. Use it to author/run the smoke (08 QA) on any stack."
---

# SKILL: smoke-test — "done" includes that it STARTS (automated smoke)

**Principle (P-10 · any stack/domain).** "Done" is not just that it compiles and unit tests pass: it includes an **artifact that STARTS**, proven by an **automated smoke** with a clear **pass/fail**. The studio **AUTHORS** the smoke; the PO/CI runs it with **ONE command**. Applies to any domain and any stack (desktop, web, CLI, service): the smoke confirms the binary/process boots and shows/exposes the essentials.

> Why it exists: headless QA and unit tests do NOT catch **startup/integration failures of the packaged artifact** (init order, production paths, bundle load, handler registration). An automated smoke does — and it runs **with no human watching**.

## What it tests (and what it does NOT)
- **YES:** the artifact STARTS + renders/exposes the ESSENTIALS (window/root + 2-3 key points).
- **NO:** business logic — that's unit tests. Nor exhaustive coverage. The smoke is about STARTUP.
- **P-11:** whatever can't be validated without a real environment (hardware, live data, network) is **DECLARED deferred**, not faked.

## Contract (invariant, any stack)
- **ONE command** (`smoke` script) → **exit 0 = pass / exit 1 = fail**. CI-ready.
- **Machine-readable evidence:** on finish it writes **`tests/smoke-result.json`** =
  `{ "pass": true|false, "ts": <epoch>, "screenshot": "tests/smoke.png" }`. The **RELEASE gate verifies it
  mechanically** (DoD): without a recent `smoke-result.json` with `pass:true`, release does NOT close.
- Also leave the startup **screenshot** (PNG).
- **Headless / no display** (no human intervention required).

## Current recipe — Electron (the current one, NOT the only one)
`@playwright/test` with `_electron.launch`:
1. `const app = await electron.launch({ args: ['.'] })` → starts the Electron project.
2. `const win = await app.firstWindow()` → the **main window opens** (if not, FAIL).
3. Assert **2-3 key `data-testid` elements** visible (root + main views; placed by **06 FRONTEND**).
4. `await win.screenshot({ path: 'tests/smoke.png' })` → visual evidence.
5. **Write `tests/smoke-result.json`** `{ pass, ts: Date.now(), screenshot: 'tests/smoke.png' }` (in `finally`,
   so a failure also leaves `pass:false`). `await app.close()`. Pass/fail via the runner's exit code.
- Single script: `"smoke": "playwright test tests/smoke.spec.ts"`. DevDep: `@playwright/test`.
- CI without display: on Linux wrap with `xvfb-run`; on Windows it starts directly.

## Other stacks (same principle, different recipe)
- **Web:** Playwright/Chromium headless → the page loads + key selectors + screenshot + `smoke-result.json`.
- **CLI:** run the binary (`--version`/`--help` or a no-op) → exit 0 + expected output + `smoke-result.json`.
- **Service/API:** start + health-check (e.g. `/health` 200) → exit 0 + `smoke-result.json`.
The studio picks the recipe by stack; the **contract (one command · pass/fail · `smoke-result.json` · evidence ·
startup-not-logic)** is identical.

## Who
- **08 QA** AUTHORS the smoke and leaves it running pass/fail; **attaches the screenshot to `QA_REPORT.md`** and
  leaves `tests/smoke-result.json` for the release-gate DoD.
- **06 FRONTEND** places the `data-testid` on the key elements (root + main views) the smoke needs.
- **04/07** wire the `smoke` script (ONE command) into the project's scripts/build.
