---
name: env-reproducible
description: Para el Architect (04). Fijar el runtime POR-PROYECTO (mise/Volta) + engines + engine-strict + guard preinstall + un comando de build único, para que un cambio global nunca rompa otras apps.
---

# SKILL: env-reproducible — runtime por-proyecto (Architect 04)
Fija el runtime POR-PROYECTO desde el día 1; un cambio global NUNCA rompe otras apps.
- Polilenguaje → mise (https://github.com/jdx/mise): mise.toml commiteado fija runtime+env+tasks, se activa al cd. Preferido si hay >1 lenguaje.
- Solo Node → Volta (volta pin node@lts en package.json).
- SIEMPRE además: engines + engine-strict=true + guard preinstall que falle claro si el runtime no coincide (evita el error críptico ClangCL).
- El Architect lo declara en ARCHITECTURE.md con el comando de build único.
