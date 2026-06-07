---
name: diagrams-gate
description: "Generate diagrams (C4 / mermaid) from spec or code at the architecture/data gate (04/05) so assumptions are named, not slipped through; the gate requires diagrams present and valid."
---

# SKILL: diagrams-gate — diagrams that force assumptions (Architect 04 / Data Modeler 05)
At the architecture gate, generate diagrams from spec/code; assumptions get named, not slipped through.
- c4-model-skill (https://github.com/cheriftj/c4-model-skill): C4 with a review mode (BLOCKING/IMPORTANT/NICE) and mandatory technology per container. Use it as a gate.
- oh-my-mermaid (https://github.com/oh-my-mermaid/oh-my-mermaid): omm scan → perspectives (structure, data-flow) in diffable .mmd; tested on Electron; configures Claude Code and Codex.
- The gate requires diagrams present AND valid (they compile).
