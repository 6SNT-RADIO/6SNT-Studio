# Pipeline, gates & enforcement

## Two entry paths

- **Greenfield** (`/startsnt`): an idea → the full 01–10 pipeline below, with its human gates.
- **Brownfield** (`/adopt`): an existing codebase → an **on-ramp** (not a second pipeline): ground the real code + secret-scan first, smoke (does it run?), reconstruct the specs from reality (marking inferences `[TO VERIFY]`, reviewed by the PO one artifact at a time), pass **one** gate **G-ADOPT**, then **rejoin** the pipeline at the project's real maturity. The golden rule: never reverse-engineer the whole spec at once — reconstruct incrementally, grounded in the code.

## Size classification (first, always)

Before building the task graph the lead classifies the request and creates **only the needed subset**. When in doubt, size up; skipping a gate never exempts the principles.

| Size | Subset |
|---|---|
| **TRIVIAL** | Direct implementation (06/07 as needed) → QA smoke. No 01/04/05, no intermediate gates; PO confirms delivery. |
| **STANDARD** | UX *(only if UI)* → 06 ∥ 07 → QA → Security *(only if auth/data/attack surface)*. Gates: G03 *(if UX)* + G08; PO approves release. No 01/02/04/05. |
| **COMPLEX** | Full 01–10 pipeline with all **6 human gates**. |

*Default to the smallest size that fits — adding gates to a gated pipeline increases failure.*

## The 6 human gates (greenfield)

`G01 BRIEF · G02 RESEARCH · G03 IDENTITY · G04 ARCHITECTURE · G08 QA · G10 RELEASE`

There are no G05/G06/G07/G09 — those stages chain automatically once their blocker closes. The **brownfield on-ramp** adds exactly one more, **G-ADOPT**, before a project rejoins this graph.

## Task graph (COMPLEX)

The lead materializes the pipeline as a **task graph**. Agent tasks (`Txx`) are owned by the teammate; gate tasks (`Gxx`) are owned by the **PO**. Edges are wired with explicit `blockedBy` / `blocks` dependencies, so a task with an unresolved blocker is not claimable; closing a blocker auto-unblocks its dependents.

```
T01 strategist → G01 → T02 researcher → G02 → T03 ux/ui → G03 →
T04 architect → G04 → T05 data-modeler → (T06 frontend ∥ T07 backend) →
T08 qa → G08 → T09 security → T10 tech-writer → G10 release
```

Brownfield on-ramp: `T-ground → T-smoke → (T04 ∥ T05) → T01 → T10(draft) → GATE·ADOPT → [rejoin at maturity gate]`.

## The gate checkpoint

A gate task is owned by the PO and the lead **never auto-completes it**:
1. The agent closes its task by delivering its artifact → the gate becomes ready for decision.
2. The lead reports the deliverable to the PO and **waits for explicit approval**. Producers run the `critic` skill on their deliverable before reporting (02/04/08/09); G04 includes a cross-artifact consistency pass.
3. Only on the PO's "approved" does the lead close the gate → the next agent auto-unblocks.
4. If the PO rejects, the gate stays open and the lead re-dispatches the task to iterate.

## Enforcement — mechanical vs. norm

**Mechanical (deterministic, session-level — the real locks):**
- A `PreToolUse` guard blocks, no matter who acts: reading/writing real credentials/`.env`, writing **outside the project tree**, and writing to `.claude/settings.json`.
- A `TaskCompleted` gate **rejects** closing any `GATE·` task unless it is approved by the PO. It also rejects closing 06/07 if their `FRONTEND/BACKEND_REPORT.md` is missing (RC-07). For other code/doc tasks it keeps a light validation (typecheck/test/build or deliverable existence).
- **Release Definition-of-Done:** the release gate requires, deterministically, a built artifact + a passing smoke result + declared assets.

**Norm + post-hoc audit (not a lock):**
- Per-agent ownership **cannot** be enforced by a hook today — the tool-use hook does not expose the calling sub-agent's identity ([claude-code#54898](https://github.com/anthropics/claude-code/issues/54898)). So ownership is a **norm**, audited after the fact via **OpenTelemetry** tool-spans (file path + agent identity) in a local Jaeger.

> In one line: the only mechanical enforcement is the **session guards** + **PO-approved gates** + **RC-07 report check**; per-role ownership is an **audited norm**, not a padlock.

## Quality tooling

- **Critic (adversarial pre-gate)** — 02/04/08/09 attack their deliverable before the human gate (contradictions, blind spots, over-claims, spec drift, buried decisions). External review beats self-review.
- **Smoke test** — "done" includes an artifact that *starts* (Playwright headless Electron; pass/fail + screenshot).
- **Evals as pre-gate** — `promptfoo` rubric configs (brand, architecture, type contract, anti-placeholder), keyless judge. Subjective gates (brand) use a multi-tier jury (median + majority); objective gates use one judge, escalating to the jury only on borderline scores.
- **Observability** — native OpenTelemetry traces export to a **local** Jaeger (no cloud): who did what, cost, timings, hook & gate spans.
