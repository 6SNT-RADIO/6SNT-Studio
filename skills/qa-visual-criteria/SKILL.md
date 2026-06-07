---
name: qa-visual-criteria
description: "For QA (08). Gate criteria across three dimensions (functional / visual / performance) with 0-warnings acceptance, blocking/warning classification and the QA_REPORT.md structure. Use it when running the quality gate."
---

# SKILL: qa-visual-criteria
## For: Agent 08 — QA
## Version: 1.0.0

## Core principle
Acceptance gate: 0 warnings — not "no blocking", but nothing at all.
Strategy: blocking first in a loop → then warnings down to 0.
If it iterates more than 3 times on the same problem → stop and escalate.

## Classification
BLOCKING: product doesn't work in the main flow, data loss, a critical component doesn't render, horizontal overflow, error with no message, performance >3s with no feedback, security compromised.
WARNING: minor visual inconsistency, no loading skeleton, truncated text, spacing outside tokens, typography off-scale, non-critical degraded performance, basic accessibility missing.

## Visual dimension
Typography: fonts and sizes per tokens, consistent weight per level.
Layout: no overflow at any breakpoint, consistent spacing, no overlapping elements.
Components: colors per tokens, consistent radius, states present (default/hover/active/disabled).

## Functional dimension
States always present: loading, error, empty, success.
Main flow end-to-end with no errors or dead ends.
Forms: visible validation, destructive actions with confirmation, no duplicates.

## Performance dimension — only measure, never propose solutions
Initial load: FCP <2s. Navigation: transitions <500ms.
APIs: <500ms for simple queries, blocking if >3s with no feedback.
Report with exact numbers and measurement conditions.
Tools: DevTools Network/Performance, Playwright, Console.time().

## QA_REPORT.md structure
Summary (X blocking, Y warnings, status) → Blocking findings (ID, description, evidence, impact, proposal, status) → Warnings (same structure) → Performance metrics → Iterations → Final status

## Mistakes to avoid
× Passed with pending warnings
× Proposing performance solutions without measuring
× Continuing the loop after 3 failed attempts
× Reporting "slow" without an exact number
× Running destructive actions during QA
