---
name: setup
description: "Activates the CA6SNT studio in a project. Runs the studio-init scaffolder (seeds .claude/settings.json, CLAUDE.md, evals/ and the smoke) and verifies activation. Use it when installing or starting the studio in a project folder, before /startsnt."
---

# SKILL: setup — activate the studio in a project (scaffolder)

Activates the studio layer (agent-teams + hooks + telemetry + evals) in a project, **deliberately and
per-project**. The plugin library (agents, skills, hooks, scripts, template) is already installed by the
plugin; this skill SEEDS the activation into the project folder and VERIFIES it.

## When to use it
- When starting a new studio project (before `/startsnt`).
- To re-verify or repair the activation of an existing project.

## What it does
Runs the scaffolder that copies the template `templates/studio-project/{settings.json,CLAUDE.md}` into the
project, seeds `evals/*.rubric.yaml` + the smoke (`tests/` + a `package.json` scaffold), and prints an
OK/MISSING report (agent-teams flag, resolved hooks, OTel telemetry, eval rubrics).

## How to run it
ALWAYS with the project's ABSOLUTE path (never `'.'`; a disk root is forbidden and the script rejects it):

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/studio-init.mjs" <ABSOLUTE-PROJECT-PATH>
```

It is idempotent: it does not overwrite an existing `settings.json` / `CLAUDE.md` without `--force`.

## After the scaffolder (MANDATORY)
Greenfield is chicken-and-egg: the folder and its `.claude/settings.json` don't exist until you run this,
so the session that initializes is almost never rooted in the project. Open a **NEW session rooted in the
project folder** (hooks, `CLAUDE.md` and telemetry ONLY load when the session OPENS there; they don't
hot-reload) and only then use `/startsnt`.

## Prerequisite
The studio runs on agent-teams (experimental). If it's not active, add to `~/.claude/settings.json` and
restart Claude Code:

```json
{ "env": { "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1" } }
```
