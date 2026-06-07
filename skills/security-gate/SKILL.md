---
name: security-gate
description: "For Security (09). Real audit with SecOpsAgentKit (Gitleaks/Semgrep/Bandit/Trivy/Grype/Checkov) + a reviewdog baseline that learns from false positives; on Electron, validate isolation (contextIsolation/sandbox/CSP)."
---

# SKILL: security-gate — real audit + learns from FP (Security 09)
- SecOpsAgentKit (https://github.com/AgentSecOps/SecOpsAgentKit): orchestrates Gitleaks (secrets), Semgrep/Bandit (SAST), Trivy/Grype (SCA), Checkov (IaC), DefectDojo (findings). The LLM triages; low cost.
- reviewdog (https://github.com/reviewdog/reviewdog) with a baseline: posts only on the diff and freezes what's already triaged → fails only on NEW findings = learns from false positives.
- Deep: llm-sast-scanner (taint + a Judge anti-FP step). Electron: validate isolation (contextIsolation/sandbox/CSP).
