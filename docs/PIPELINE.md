# Pipeline, gates & enforcement

## Size classification (first, always)

Before building the task graph the lead classifies the request and creates **only the needed subset**. When in doubt, size up; skipping a gate never exempts the principles.

| Size | Subset |
|---|---|
| **TRIVIAL** | Direct implementation (06/07 as needed) → QA smoke. No 01/04/05, no intermediate gates; PO confirms delivery. |
| **STANDARD** | UX *(only if UI)* → 06 ∥ 07 → QA → Security *(only if auth/data/attack surface)*. Gates: G03 *(if UX)* + G08; PO approves release. No 01/02/04/05. |
| **COMPLEX** | Full 01–10 pipeline with all **6 human gates**. |

*Default to the smallest size that fits — adding gates to a gated pipeline increases failure.*

## The 6 human gates

`G01 BRIEF · G02 RESEARCH · G03 IDENTITY · G04 ARCHITECTURE · G08 QA · G10 RELEASE`

There are no G05/G06/G07/G09 — those stages chain automatically once their blocker closes.

## Task graph (COMPLEX)

The lead materializes the pipeline as a **task graph**. Agent tasks (`Txx`) are owned by the teammate; gate tasks (`Gxx`) are owned by the **PO**. Edges are wired with explicit `blockedBy` / `blocks` dependencies, so a task with an unresolved blocker is not claimable; closing a blocker auto-unblocks its dependents.

```
T01 strategist → G01 → T02 researcher → G02 → T03 ux/ui → G03 →
T04 architect → G04 → T05 data-modeler → (T06 frontend ∥ T07 backend) →
T08 qa → G08 → T09 security → T10 tech-writer → G10 release
```

## The gate checkpoint

A gate task is owned by the PO and the lead **never auto-completes it**:
1. The agent closes its task by delivering its artifact → the gate becomes ready for decision.
2. The lead reports the deliverable to the PO and **waits for explicit approval**.
3. Only on the PO's "approved" does the lead close the gate → the next agent auto-unblocks.
4. If the PO rejects, the gate stays open and the lead re-dispatches the task to iterate.

## Enforcement — mechanical vs. norm

**Mechanical (deterministic, session-level — the real locks):**
- A `PreToolUse` guard blocks, no matter who acts: reading/writing real credentials/`.env`, writing **outside the project tree**, and writing to `.claude/settings.json`.
- A `TaskCompleted` gate **rejects** closing any `GATE·` task unless it is approved by the PO — making the "no gate without PO" rule mechanical. For code/doc tasks it keeps a light validation (typecheck/test/build or deliverable existence).
- **Release Definition-of-Done:** the release gate requires, deterministically, a built artifact + a passing smoke result + declared assets.

**Norm + post-hoc audit (not a lock):**
- Per-agent ownership **cannot** be enforced by a hook today — the tool-use hook does not expose the calling sub-agent's identity ([claude-code#54898](https://github.com/anthropics/claude-code/issues/54898)). So ownership is a **norm**, audited after the fact via **OpenTelemetry** tool-spans (file path + agent identity) in a local Jaeger: *"did agent NN write outside its zone?"*

> In one line: the only mechanical enforcement is the **session guards** + **PO-approved gates**; per-role ownership is an **audited norm**, not a padlock.

## Quality tooling

- **Smoke test** — "done" includes an artifact that *starts*. Reference recipe: Playwright headless Electron launches the window, checks key `data-testid` elements, screenshots, and exits pass/fail.
- **Evals as pre-gate** — `promptfoo` rubric configs per gate (brand, architecture, type contract, anti-placeholder) run before the human gate, with a keyless LLM judge. The PO approves something that already passed a machine rubric.
- **Observability** — native OpenTelemetry traces export to a **local** Jaeger (no cloud): who did what, cost, timings, hook & gate spans.
