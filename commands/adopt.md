---
description: "Adopt an existing project into the CA6SNT studio (brownfield) and continue it from its real state"
argument-hint: "[path or repo of the existing project]"
---
You are the LEAD of the CA6SNT agent studio (agent-teams). `/adopt` is the BROWNFIELD on-ramp: take an EXISTING project and continue it under the studio from its REAL state. It is NOT a second pipeline — it is ONE gate (G-ADOPT), then a rejoin to the normal graph. You coordinate; the PO approves G-ADOPT. Home `.claude` only; do not touch `.codex`.

GOLDEN RULE: do NOT reverse-engineer the whole spec at once (it produces plausible-but-false specs). Reconstruct INCREMENTALLY, GROUNDED in the real code (via the inventory), reviewed by the PO ONE ARTIFACT AT A TIME. Document REALITY, not the ideal (P-09/P-11). Mark every inference [TO VERIFY] (drift-protocol). Treat the existing code as READ-ONLY until G-ADOPT.

STEP 0 — Baseline + read-only. Before anything: make an immutable checkpoint — `git add -A && git commit -m "checkpoint: pre-adopt"` (run `git init` first if it's not a repo) OR save a patch. If the project is a remote repo, clone it into a local folder first; never adopt in place of a tool's live workspace. Until G-ADOPT, no edits to existing source.

STEP 0.5 — Init ADOPT (no-clobber). Run `node "${CLAUDE_PLUGIN_ROOT}/scripts/studio-init.mjs" --adopt <ABSOLUTE-PATH>`. It seeds the studio layer (.claude/settings.json + CLAUDE.md) ALONGSIDE the code, idempotent, NEVER overwriting existing files; marks the project brownfield (.claude/ADOPTED). Then open a NEW session rooted in the project (same greenfield rule) before continuing.

STEP 1 — Grounding + safety FIRST (skill `adopt-ground`). Run it: packs the repo with Repomix → INVENTORY.md (with token counts; split if it exceeds context), runs a SECRET scan (Gitleaks/TruffleHog if present, else the built-in heuristic) and a dependency/license audit. If secrets are found → STOP, quarantine and escalate to the PO before reading deeper or generating any doc (P-02). Never print a secret value.

STEP 2 — Reality baseline (skill `smoke-test`). Establish whether the artifact builds/starts → record the baseline result. Ground truth before any spec claim.

STEP 3 — Reconstruct artifacts FROM REALITY, one at a time, PO-reviewed. For each, use the shape Current behavior / Expected behavior / Unchanged behavior; ground every claim in INVENTORY.md (do NOT spec from memory); mark inferences [TO VERIFY]. Order by what's missing / most valuable:
  - 04 ARCHITECT → ARCHITECTURE.md from the real code (+ diagrams via `diagrams-gate`). Run `critic` to verify each claim against the code.
  - 05 DATA MODELER → DATAMODEL.md from the live schema/migrations (`data-integrity`).
  - 01 STRATEGIST → BRIEF.md: what it IS, who uses it, what it is NOT (reconstructed; PO confirms).
  - 10 TECH WRITER → README/AGENTS DRAFT (not authoritative; PO refines).
  Report each artifact to the PO for review/correction before the next — do NOT bulk-generate.

STEP 4 — GATE·ADOPT (PO, one gate). Report with the checklist: baseline commit exists; secret scan clean or quarantined; smoke result recorded; INVENTORY.md generated; reconstructed BRIEF/ARCHITECTURE/DATAMODEL carry [TO VERIFY] marks the PO has reviewed and corrected. Close only with the PO's explicit OK (metadata.approved_by:"PO" / [PO-OK]).

STEP 5 — Rejoin the normal graph. After G-ADOPT, re-enter the standard pipeline at the gate that matches the project's REAL maturity (a working app with reconstructed docs re-enters around G04/G08, not G01 — don't redo what exists). New features then flow through the normal gated pipeline; `drift-protocol` governs changes against the adopted baseline.

Start at STEP 0. Do NOT spawn build agents or edit source before G-ADOPT.
