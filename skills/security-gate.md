# SKILL: security-gate — auditoría real + aprende de FP (Security 09)
- SecOpsAgentKit (https://github.com/AgentSecOps/SecOpsAgentKit): orquesta Gitleaks (secrets), Semgrep/Bandit (SAST), Trivy/Grype (SCA), Checkov (IaC), DefectDojo (findings). El LLM triagea; bajo costo.
- reviewdog (https://github.com/reviewdog/reviewdog) con baseline: postea solo sobre el diff y congela lo ya triado → falla solo en hallazgos NUEVOS = aprende de falsos positivos.
- Profundo: llm-sast-scanner (taint + paso Judge anti-FP). Electron: valida aislamiento (contextIsolation/sandbox/CSP).
