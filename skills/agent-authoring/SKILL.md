---
name: agent-authoring
description: Escribir o editar definiciones de agente magras y sin bloat (una responsabilidad, un entregable, sin repetir los principios globales). Úsalo solo al crear o modificar un agente del estudio.
---

# SKILL: agent-authoring — escribir/editar TOMLs de agente magros
Úsalo solo al crear o editar un agente. Objetivo: agentes claros, no inflados.
## Estructura mínima
id/rol · objetivo (1 frase) · qué lee · UN entregable + su gate · criterios (bullets) ·
reglas (RC + escalamiento) · modelo (tier).
## Checklist anti-bloat (rechaza el TOML si falla)
- [ ] Una sola responsabilidad.
- [ ] NO repite los principios globales (P-01..P-11 viven en STUDIO.md).
- [ ] Sin contradicciones ni tan rígido que impida razonar (OVER_CONSTRAINED).
- [ ] Sin referencias a archivos/skills inexistentes (ORPHAN).
- [ ] Ejemplos solo si aportan (anti BLOATED).
- [ ] Objetivo y entregable inequívocos (anti VAGUE).
