---
name: diagrams-gate
description: Generar diagramas (C4 / mermaid) desde spec o código en el gate de arquitectura/datos (04/05) para que los supuestos se nombren, no se cuelen; el gate exige diagramas presentes y válidos.
---

# SKILL: diagrams-gate — diagramas que fuerzan supuestos (Architect 04 / Data Modeler 05)
En el gate de arquitectura, generar diagramas desde spec/código; los supuestos se nombran, no se cuelan.
- c4-model-skill (https://github.com/cheriftj/c4-model-skill): C4 con modo review (BLOCKING/IMPORTANT/NICE) y tecnología obligatoria por container. Úsalo como gate.
- oh-my-mermaid (https://github.com/oh-my-mermaid/oh-my-mermaid): omm scan → perspectivas (estructura, data-flow) en .mmd diffables; probado en Electron; configura Claude Code y Codex.
- El gate exige diagramas presentes Y válidos (compilan).
