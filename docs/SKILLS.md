# Skills & tooling

The studio is more than ten role prompts — it ships **skills** and **mechanisms** that make the gated process real. The catalog is kept lean (overlapping skills are merged, not multiplied). Summarized:

## Process skills

| Skill | What it does |
|---|---|
| **Intake gating** | Classifies a request as TRIVIAL / STANDARD / COMPLEX and creates only the gates that fit. Default to the smallest size that fits. |
| **Critic (adversarial review)** | Attacks a deliverable *before* its gate — contradictions, blind spots, over-claims, spec drift, buried decisions. Used by 02 (research), 04 (G04 cross-artifact consistency), 08 (QA) and 09 (security). External review beats self-review; it's a skill, not an 11th agent. |
| **Smoke test** | Defines "done" as *an artifact that starts*. Reference recipe: Playwright headless Electron → open window, assert key `data-testid`, screenshot, pass/fail. Authored by QA, run by PO/CI with one command. |
| **Brand rubric (+ jury)** | Scores identity (Design Score / AI-Slop) so P-03 ("no generic SaaS look") is measurable. The brand gate is judged by a **keyless multi-tier jury** (opus/sonnet/haiku, median + majority); objective gates use one judge, escalating to the jury only on borderline scores. Cost-aware. |
| **Brownfield grounding (`adopt-ground`)** | For the `/adopt` on-ramp: packs an existing repo into an AI-readable inventory (Repomix, token-budgeted), scans for secrets **first**, and audits deps/licenses — so reconstructed specs are grounded in real code, never in memory. |
| **Project scaffolder** | One command bootstraps a new studio project (greenfield) or adopts an existing one (`--adopt`, no-clobber): the agent-teams flag, session guards, observability wiring, eval rubrics. |
| **Guided start** | Intake-first kickoff: `/startsnt` (greenfield) interrogates the PO before invoking any agent; `/adopt` (brownfield) grounds an existing codebase first. |

## Quality & safety mechanisms

| Mechanism | Role |
|---|---|
| **Session safety guard** | `PreToolUse` lock: blocks reads/writes of real credentials/`.env`, writes outside the project tree, and writes to `.claude/settings.json`. |
| **Gate / Definition-of-Done gate** | `TaskCompleted` lock: a `GATE·` task can't close without PO approval; release requires artifact + smoke-pass + assets; and 06/07 can't close without their `FRONTEND/BACKEND_REPORT.md` (RC-07, mechanical). |
| **Evals pre-gate** | `promptfoo` rubric configs per gate, judged keyless (single judge, or jury on subjective/borderline), run before the human gate. |
| **Observability** | Native OpenTelemetry traces → local Jaeger. Also the post-hoc audit substrate for per-role ownership (see [PIPELINE](PIPELINE.md)). |
| **Lessons log** | A running log of what the studio learned, written stack-neutral (a rule is general even if the evidence names a project). |

## Reference stack

Electron + TypeScript + a local embedded database, packaged as a native desktop app (portable + installer). Node via a pinned toolchain. All local-first; no mandatory cloud.

> Active skills live at the repo root (`skills/`, English); Spanish reference copies of the **agents** are under [`i18n/es/`](../i18n/es/). This document is the precise summary of what the skills do.
