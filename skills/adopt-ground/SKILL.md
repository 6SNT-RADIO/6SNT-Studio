---
name: adopt-ground
description: "Brownfield grounding + safety pass: pack an existing repo into an AI-readable inventory (Repomix, token-budgeted), scan for secrets FIRST (Gitleaks/TruffleHog or a built-in heuristic), and audit dependencies/licenses — so reconstructed specs are grounded in real code, never in memory. Used by /adopt before any artifact is reconstructed."
---

# SKILL: adopt-ground — ground the codebase + safety, before reconstructing anything

Brownfield rule: never spec from memory. First produce a grounded INVENTORY of the real code, and screen for secrets BEFORE reading deep or generating docs. The output feeds 04/05/01/10 so their reconstructed artifacts reflect the actual system.

## Order (safety first)
1. **Secret scan FIRST.** Run `gitleaks detect` and `trufflehog filesystem .` (TruffleHog verifies if creds are still live) if installed. If not installed, run the built-in heuristic: grep high-signal patterns (`API_KEY`, `SECRET`, `TOKEN`, `PASSWORD=`, `BEGIN PRIVATE KEY`, `.env`, `github_pat_`, `sk-`, AWS `AKIA`) and list FILES + line numbers — NEVER the secret value. Any hit → STOP and escalate to the PO (P-02); quarantine before continuing.
2. **Inventory (grounding).** `npx repomix` → one AI-readable pack with per-file + total token counts. If it exceeds the working budget, use `--split-output` or restrict to the relevant subtree. Write a short `INVENTORY.md`: stack/languages, entry points, top dirs/modules, dependency list, token-size note. (Alternative for huge repos: an Aider-style symbol map; Repomix suffices under ~10k files.)
3. **Dependency & license audit.** `npm audit` / OSV / Snyk if available for known CVEs; list third-party licenses. Feed findings to 09 Security.

## Output
- `INVENTORY.md` (grounding doc for 04/05/01/10).
- Secret-scan result: PASS, or a list of `{file, line, pattern}` (no values) + PO escalation.
- Dependency/license notes.

## Environment note (P-06)
If Gitleaks/TruffleHog/Repomix aren't installed, the studio AUTHORS the exact commands and the PO/CI runs them (same pattern as `asset-sourcing`); the built-in heuristic is the always-available fallback so a secret scan ALWAYS happens. Never deliver "run the scan" as a silent skip.

## Anti-bloat
A grounding wrapper, not a platform. Local-first (Repomix, Gitleaks). No IDE/cloud lock-in. Reconstruction stays incremental + PO-reviewed (see `/adopt`).
