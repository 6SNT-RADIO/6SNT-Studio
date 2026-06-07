---
name: setup
description: Activa el estudio CA6SNT en un proyecto. Corre el scaffolder studio-init (siembra .claude/settings.json, CLAUDE.md, evals/ y el smoke) y verifica la activación. Úsalo al instalar o iniciar el estudio en una carpeta de proyecto, antes de /startsnt.
---

# SKILL: setup — activar el estudio en un proyecto (scaffolder)

Activa la capa del estudio (agent-teams + hooks + telemetría + evals) en un proyecto, de forma
**deliberada y por-proyecto**. La librería del plugin (agentes, skills, hooks, scripts, plantilla)
ya está instalada por el plugin; este skill SIEMBRA la activación en la carpeta del proyecto y la VERIFICA.

## Cuándo usarlo
- Al iniciar un proyecto nuevo del estudio (antes de `/startsnt`).
- Para re-verificar o reparar la activación de un proyecto existente.

## Qué hace
Corre el scaffolder que copia la plantilla `templates/studio-project/{settings.json,CLAUDE.md}` al
proyecto, siembra `evals/*.rubric.yaml` + el smoke (`tests/` + scaffold de `package.json`), e imprime
un reporte OK/FALTA (flag agent-teams, hooks resueltos, telemetría OTel, rúbricas de evals).

## Cómo correrlo
SIEMPRE con la RUTA ABSOLUTA del proyecto (nunca `'.'`; en la raíz de un disco está prohibido y el
script lo rechaza):

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/studio-init.mjs" <RUTA-ABSOLUTA-DEL-PROYECTO>
```

Es idempotente: no pisa un `settings.json` / `CLAUDE.md` existente sin `--force`.

## Después del scaffolder (OBLIGATORIO)
Greenfield es huevo-y-gallina: la carpeta y su `.claude/settings.json` no existen hasta correr esto,
así que la sesión que inicializa casi nunca está rooteada en el proyecto. Abre una **sesión NUEVA
rooteada en la carpeta del proyecto** (los hooks, el `CLAUDE.md` y la telemetría SOLO cargan al ABRIR
la sesión ahí; no se recargan en caliente) y recién entonces usa `/startsnt`.

## Prerrequisito
El estudio corre sobre agent-teams (experimental). Si no está activo, añade a `~/.claude/settings.json`
y reinicia Claude Code:

```json
{ "env": { "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1" } }
```
