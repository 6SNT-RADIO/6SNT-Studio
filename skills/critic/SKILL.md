---
name: critic
description: "Adversarial pre-gate review. Attack a deliverable to surface contradictions, blind spots, over-claims, missing cases and spec drift before the human gate — external review, never self-congratulation. Used by 02 (RESEARCH), 08 (QA) and 09 (Security) before their gate, or by the lead at any gate."
---

# SKILL: critic — break it before the gate (adversarial pre-gate review)

Principle: self-review hits a "coherence trap" — the author polishes wrong answers. External, independent review is what catches blind spots. The critic's job is to ATTACK the deliverable, not approve it.

## Stance (non-negotiable)
- Assume the deliverable is wrong until proven otherwise. Hunt for what's missing, not what's present.
- Independent framing: run as a FRESH pass with no stake in the work. In agent-teams, invoke it as a separate teammate/subagent so it does not just re-read its own context.
- Never fixes. Reports findings; the owner iterates.

## What to attack (checklist)
- Contradictions: internal, or vs the upstream it must honor (BRIEF / RESEARCH / ARCHITECTURE / DATAMODEL).
- Blind spots / missing cases: edge cases, error paths, the unhappy path, scale.
- Over-claims / unverified assertions: "X works" with no evidence; a cited source that does not say what is claimed.
- Undeclared placeholders/mocks (P-11) and silently swallowed errors (P-06).
- Spec drift: where the deliverable quietly diverges from what was approved upstream.
- Honesty gaps: anything sold as real/done that is not; missing "indeterminate / deferred" declarations.
- Bloat / buried decisions: is the verdict reachable in the first screen, and are the open PO decisions and risks surfaced up top? If they're buried under prose, flag it (P-09).

## Output (machine-friendly)
A findings list; each item: { severity: blocking | warning | note, where, issue, why it is a problem, what to check }. No fixes. End with a one-line verdict: "N blocking, M warnings."

## Loop (how the owner uses it)
Resolve blocking first, then warnings; re-run; max 3 iterations on the same issue, then escalate to the lead. No infinite loops (same rule as QA).

## Who invokes it, and on what
- 02 RESEARCHER → on RESEARCH.md before G02: missed existing solutions, unverified sources, over-claims, build-vs-reuse that ignores an option.
- 04 ARCHITECT → on ARCHITECTURE.md before G04 (CONSISTENCY mode): that it honors the BRIEF (constraints/metrics), the RESEARCH (build-vs-reuse), the BRANDBOOK/TOKENS (feasibility). Drift here is the most expensive.
- 08 QA → on the build + reports before G08: makes QA explicitly adversarial ("attack the app, do not check a list"); complements qa-eyes + the anti-placeholder audit.
- 09 SECURITY → completeness / false-negative pass on SECURITY_REPORT before escalating (security is already adversarial; the critic checks for what the audit missed).
- LEAD → may invoke at any gate for a high-stakes deliverable (e.g., a G04 architecture fork).

## Anti-bloat note
A SKILL, not an 11th agent, not a multi-model council. One adversarial pass ≈ 80% of the benefit reflexion/self-consistency chase, at one prompt's cost.
