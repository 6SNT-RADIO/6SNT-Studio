# Skills & tooling

The studio is more than ten role prompts — it ships a set of **skills** and **mechanisms** that make the gated process real. Summarized:

## Process skills

| Skill | What it does |
|---|---|
| **Intake gating** | Classifies a request as TRIVIAL / STANDARD / COMPLEX and creates only the gates that fit. Default to the smallest size that fits. |
| **Smoke test** | Defines "done" as *an artifact that starts*. Reference recipe: Playwright headless Electron → open window, assert key `data-testid`, screenshot, pass/fail. Authored by QA, run by PO/CI with one command. |
| **Brand rubric** | Scores identity against a rubric (Design Score / AI-Slop) so P-03 ("no generic SaaS look") is measurable, not a matter of taste. |
| **Project scaffolder** | One command bootstraps a new studio project: the agent-teams flag, session guards, observability wiring, and eval rubrics — from a project template. |
| **Guided start** | An intake-first kickoff: the studio interrogates the PO with multiple-choice questions *before* invoking any agent, then classifies size and builds the task graph. |

## Quality & safety mechanisms

| Mechanism | Role |
|---|---|
| **Session safety guard** | `PreToolUse` lock: blocks reads/writes of real credentials/`.env`, writes outside the project tree, and writes to `.claude/settings.json`. |
| **Gate / Definition-of-Done gate** | `TaskCompleted` lock: a `GATE·` task can't close without PO approval; the release gate requires artifact + smoke-pass + assets. |
| **Evals pre-gate** | `promptfoo` rubric configs per gate, judged keyless, run before the human gate. |
| **Observability** | Native OpenTelemetry traces → local Jaeger. Also the post-hoc audit substrate for per-role ownership (see [PIPELINE](PIPELINE.md)). |
| **Lessons log** | A running log of what the studio learned, written stack-neutral (a rule is general even if the evidence names a project). |

## Reference stack

Electron + TypeScript + a local embedded database, packaged as a native desktop app (portable + installer). Node via a pinned toolchain. All local-first; no mandatory cloud.

> The **runnable** versions of these skills (and the 10 agent definitions, hooks, scaffolder and template) are added in a sanitized second commit. This document is the precise summary of what they do.
