---
name: security-audit
description: "For Security (09). READ-ONLY audit as if the repo were public: credentials, inputs, auth, logging, dependencies; local vs public-distribution severity; justified false positives. Use it before any release."
---

# SKILL: security-audit
## For: Agent 09 — SECURITY REVIEWER
## Version: 1.0.0

## Core principle
Everything is audited as if it were public distribution and a public repo.
"It's only local" is not a justification. Read-only. Never modify anything.

## Process
STEP 1 — Recon: structure, stack, entry points, dependencies, configs.
STEP 2 — Automated tools: static analysis (Bandit/ESLint security), dependency analysis (Safety/npm audit), insecure patterns. Save the full output.
STEP 3 — Manual analysis: credentials, input validation, endpoints without auth, sensitive logging, data-access patterns. Exact evidence (file + line).
STEP 4 — Classify: local vs public-distribution severity. Don't inflate or minimize.
STEP 5 — Complete the full report before escalating, even if there are criticals.

## What to look for
Credentials: hardcoded API keys/tokens/passwords, .env in the repo, secrets in comments.
Inputs: SQL injection, unsanitized commands, deserialization without validation.
Auth: unprotected endpoints, tokens without expiry, insecure password comparison.
Logging: personal data in logs, stack traces to the user, internal paths in errors.
Dependencies: known CVEs, abandoned deps, unpinned versions.

## Severity
CRITICAL: credential in code, SQL injection, admin endpoint without auth.
HIGH: high CVE in a dependency, unvalidated input in a public endpoint, logging of personal data.
MEDIUM: outdated dep without CVE, technical info in errors to the user.
LOW: commented code with historical info, dev configs in production.
FALSE POSITIVE: always document and justify, never ignore silently.

## Absolute rules
× NEVER modify files
× NEVER run the application
× NEVER access .env or config with real credentials
× NEVER escalate an individual finding before finishing the full report

## Mistakes to avoid
× A false positive without justification
× Escalating before finishing the report
× Reporting without exact evidence
× Not checking .gitignore
