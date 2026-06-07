---
name: technical-documentation
description: "For the Technical Writer (10). Document reality (not the ideal) for two audiences (PO and AI); if code and docs differ, code wins; update before creating; less doc than product. Use it when closing stages."
---

# SKILL: technical-documentation
## For: Agent 10 — TECHNICAL WRITER
## Version: 1.0.0

## Core principle
Documentation documents reality — not the ideal.
If the code says one thing and the docs say another, the code wins.
No aspirational documentation — only what exists today.

## Audiences
Product Owner: README.md (start the project), operational runbooks, CHANGELOG.md.
Criteria: clear language, no jargon, step by step, assuming no technical knowledge.

Executing AI: AGENTS.md (context + rules + constraints), CLAUDE.md/CODEX.md, API contracts, docstrings in critical modules.
Criteria: explicit about what NOT to do, exact paths, no ambiguity.

Both: technical-operational runbooks, architecture decisions.
Separate sections by audience — humans first, AI second.

## Process
STEP 1 — Verify the existing: what's outdated, what's missing, what's extra.
STEP 2 — Update before creating. Mark technical debt if it can't be updated.
STEP 3 — Write only what doesn't exist and is necessary.
Rule: 3 code files don't need 10 docs.
STEP 4 — Declare technical debt explicitly if the code is badly built.

## Minimal structure per document
README.md: What it is → Requirements → How to start → How it's used → Project structure.
AGENTS.md: Identity → Immovable rules → Architecture → Current state → Workflow.
API contracts: method/route, description, parameters, response, errors, constraints.
Runbooks: title, when to use it, prerequisites, exact steps, what to do if it fails.

## Signs of outdated documentation
⚠ References files that don't exist
⚠ Paths don't match the real structure
⚠ Commands that don't work when run
⚠ AGENTS.md rules that don't match real behavior

## Good vs bad documentation
Good: a new person starts without asking, an AI modifies without breaking anything critical, paths and rules match reality.
Bad: you have to read the code to understand the doc, instructions that don't work on every machine, doc longer than the code it documents.

## Mistakes to avoid
× Documenting the ideal instead of reality
× Leaving it outdated without marking it
× Duplicating information across documents
× Using jargon in PO documents
× Omitting constraints in AGENTS.md
× Producing more documentation than is consumed
