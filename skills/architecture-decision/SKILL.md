---
name: architecture-decision
description: "For the Architect (04). Evaluate the stack from the problem (not from familiarity) with 2-3 options per layer, viability criteria, and the ARCHITECTURE.md structure. Use it at the architecture gate."
---

# SKILL: architecture-decision
## For: Agent 04 — ARCHITECT
## Version: 1.0.0

## Core principle
The stack follows the problem. Every technical decision is justified in terms of the problem it solves, not familiarity or preference.

## Process
STEP 1 — Understand the problem: product type, user profile, data volume, offline/sync requirements, OS/hardware constraints, available tools (Codex, Claude Code). Do not evaluate technologies until this is complete.
STEP 2 — Evaluate 2-3 options per layer with pros/cons in context, not in the abstract.
STEP 3 — Check viability: can Codex/Claude Code implement it well? Enough documentation? Manageable dependencies? If not → document it explicitly.
STEP 4 — Separate decisions you can make from decisions that need PO approval.
STEP 5 — Document what was discarded and why — as important as what was chosen.

## Criteria to evaluate a technology
✓ Solves the problem better than the alternatives
✓ Actively maintained, with enough community and documentation
✓ Implementable with the available tools
✓ Scales with expected growth

Warnings: last update over a year ago, sparse docs, dependencies with vulnerabilities, inactive community.

## Architectural maintainability
✓ Each module with a clear responsibility
✓ Explicit, minimal dependencies between modules
✓ No critical logic in monolithic files
✓ An AI can modify a module understanding only that module

## Tooling context
Claude Chat: does not run code, produces decisions and documentation.
Claude Code/Codex: best with modular, well-documented files, struggles with long files (+2000 lines), needs explicit context in AGENTS.md.

## ARCHITECTURE.md structure
Stack evaluation → System structure → Folder structure → Technical decisions → Decisions pending approval → Risks → Environment limits

## Mistakes to avoid
× Choosing the known stack without evaluating it against the problem
× Mixing responsibilities in one module
× Not documenting what was discarded
× Ignoring expected growth
