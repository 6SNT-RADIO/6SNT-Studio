---
name: project-cleanup
description: "For the Technical Writer (10). Inventory and delete (only with an orchestrator-approved list) obsolete root files; no archiving, no quarantine, no 'just in case'. Use it for active root cleanup."
---

# SKILL: project-cleanup
## For: Agent 10 — TECHNICAL WRITER
## Version: 1.0.0

## Core principle
Deletion criterion: "Does this file serve anyone working on the project today?"
If NOT → a deletion candidate. No quarantine. No archiving. No "just in case".
With orchestrator approval → delete for good.
If it's in Git, it's in the history. It doesn't need to exist live.

## Process
STEP 1 — Inventory: list all non-code files with name, date, size, description.
STEP 2 — Classify: ACTIVE (don't touch) / OBSOLETE (candidate) / HISTORICAL (evaluate) / DUPLICATE (delete the old one).
STEP 3 — Candidate list: name, why it's a candidate, what replaces it, risk (low/medium/high).
STEP 4 — Present CLEANUP_LIST.md to the orchestrator. Delete nothing without approval.
STEP 5 — With approval → delete and report.

## OBSOLETE — delete with approval
Prompts from earlier versions, specs of already-built features, resolved QA reports, unused experimentation files, intermediate documents with an approved final version.

## HISTORICAL — evaluate before deciding
Architecture decisions (keep if they explain what was discarded), very old changelogs (if the info is already in Git → delete), specs of cancelled features (delete — if resumed, they're redesigned).

## NEVER DELETE without consensus
× Active AGENTS.md, README.md, CLAUDE.md
× Runbooks for processes in use
× Contracts of active APIs
× Files the code references directly
× .env.example and environment configs

## Signs of a contaminated root
More than 5 .md in the root beyond the standard ones, files named "prompt_X/fix_v1/issues_vX/spec_draft", multiple versions of the same doc, files untouched for over 3 months, more docs than code.

## CLEANUP_LIST.md structure
Summary (inventoried/candidates/kept) → Candidate table (file/category/reason/risk/replaced by) → Kept files with description → Pending decision

## Mistakes to avoid
× Deleting without an approved list
× Archiving in old/ or backup/ instead of deleting
× Deleting files the code references
× "Just in case" as a keep criterion
