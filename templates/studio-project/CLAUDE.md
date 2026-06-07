# CLAUDE.md — Estudio de Agentes CA6SNT

> Contexto compartido que cargan **todos los teammates** del estudio en Claude Code (agent-teams).
> Fuente canónica: `docs/STUDIO.md` (CA6SNT · v1.3 · 2026-06-05). Este archivo es el contrato
> operativo mínimo del equipo; el detalle completo vive en `STUDIO.md`, en `docs/LEARNINGS.md`
> y en la definición de cada agente (`agents/NN-*.md`).

---

## Proyecto

> **Proyecto:** `<PROYECTO>`
> **Qué es:** `<descripción de una línea — qué resuelve, para quién, en qué stack>`
>
> Rellena estos dos marcadores al iniciar el proyecto (o deja que **01 STRATEGIST** los fije en el
> `BRIEF.md`). Todo lo que sigue es el **contrato del estudio** — project-agnostic; no se edita por proyecto.

---

## Identidad del estudio

Un sistema de **10 agentes de IA especializados** para desarrollar software de forma estructurada.
Cada agente tiene un rol único, produce un entregable concreto, y **no avanza sin aprobación
explícita** del Product Owner en su gate.

El estudio no es un proyecto — es la infraestructura que sirve a todos los proyectos. Los
proyectos pasan, el estudio permanece.

**Las tres piezas (en agent-teams):**
- **LEAD / Orquestador** — coordina: decide qué agente entra y cuándo, clasifica el tamaño del
  trabajo (TRIVIAL / ESTÁNDAR / COMPLEJO) y activa los gates proporcionales, debate decisiones y
  aprueba el avance entre gates. **No produce entregables: solo coordina.**
- **AGENTES (01–10)** — ejecutan su tarea cuando el lead los activa. Cada uno tiene su definición
  en `agents/NN-*.md` y produce un único entregable (ver Mapa de propiedad).
- **PRODUCT OWNER (humano · CA6SNT)** — aprueba entregables en cada gate y toma las decisiones que
  los agentes no pueden tomar solos. Ningún agente lo reemplaza.

**Pipeline por defecto (trabajo COMPLEJO):**
`01 STRATEGIST → 02 RESEARCHER → 03 UX/UI → 04 ARCHITECT → 05 DATA MODELER → 06 FRONTEND ∥ 07 BACKEND → 08 QA → 09 SECURITY → 10 TECH WRITER`
El gating es proporcional al tamaño (ver `docs/intake-scale-gating.md`): TRIVIAL y ESTÁNDAR
activan solo el subset necesario. Omitir un gate **no** exime de los principios P-01..P-11. **Default al tamaño MÁS PEQUEÑO que encaje; agregar gates aumenta el fracaso (anti-bloat v5.4 · ver STUDIO.md).**

**Tier de modelo por agente** (3-tier, coste-consciente; el lead puede subir de tier por tarea puntual):
- **opus** → `01-strategist` · `04-architect` · `05-data-modeler` · `09-security-reviewer`
- **sonnet** → `02-researcher` · `03-ux-ui` · `06-frontend` · `07-backend` · `08-qa`
- **haiku** → `10-technical-writer`

---

## Principios globales del estudio (P-01..P-11)

*(texto canónico — `docs/STUDIO.md`)*

- **P-01**  Toda app se empaqueta y se ve como app nativa. Nunca localhost en el browser.
- **P-02**  Construir como si el repo fuera público. Nunca credenciales/datos sensibles en código.
- **P-03**  Sin SaaS genérico ni plantilla. Diseño con personalidad propia. (Medible con brand-evaluation-rubric: Design Score / AI-Slop — v1.1.)
- **P-04**  Los agentes no resuelven conflictos entre sí. Escalan al orquestador.
- **P-05**  Ningún agente avanza sin aprobación explícita del PO en su gate.
- **P-06**  Manejo de errores explícito. Ningún error se traga sin registrar.
- **P-07**  Backup siempre si hay datos que el usuario no puede recuperar de otro lado.
- **P-08**  Toda migración tiene rollback definido antes de ejecutarse.
- **P-09**  No producir más documentación que producto. La doc documenta la realidad.
- **P-10**  Los agentes genéricos no contienen referencias a proyectos específicos.
- **P-11**  (NUEVO v1.1) PLACEHOLDER DECLARADO O NO HAY PLACEHOLDER. Ningún agente rellena con mock/placeholder un dato o asset faltante sin escalarlo (RC-08). Un placeholder no declarado que aparenta ser real es un DEFECTO, no una entrega. QA lo audita.

---

## Reglas para Claude Code al ejecutar un agente (RC-01..RC-08)

*(texto canónico — `docs/STUDIO.md`)*

- **RC-01**  Leer el TOML del agente y LEARNINGS.md antes de empezar. (v1.1)
- **RC-02**  Leer los documentos del proyecto en local (Drive es respaldo).
- **RC-03**  No avanzar al siguiente agente sin instrucción del orquestador.
- **RC-04**  Entregar en la carpeta del proyecto.
- **RC-05**  No modificar archivos aprobados de etapas anteriores.
- **RC-06**  No inventar contenido no provisto. Si falta un dato/asset real → ESCALAR (P-11), no rellenar.
- **RC-07**  Reportar qué se hizo y qué quedó pendiente.
- **RC-08**  Ante duda con implicaciones de diseño/arquitectura/datos → escalar al orquestador.

> **Puente agent-teams:** en `.claude` la "definición del agente" de **RC-01** es ahora
> `agents/NN-*.md` (los `.toml` se conservan como respaldo). Donde RC-03/RC-05/RC-08 y P-04 dicen
> "orquestador", en agent-teams ese rol lo cumple **el lead** (ver Topología de escalado).

---

## MAPA DE PROPIEDAD DE ARCHIVOS

Regla dura: **un agente solo escribe SU entregable.** Cualquier agente puede **leer** lo que
necesite; para **escribir**, solo su zona. Refuerza RC-05 (no se modifican entregables aprobados
de etapas anteriores) y P-04 (los choques de frontera se escalan, no se resuelven entre agentes).

> **Cómo se hace cumplir (v4.3):** esta regla es **NORMA del estudio**, no un candado mecánico —
> Claude Code no expone la identidad del subagente al hook `PreToolUse`
> ([#54898](https://github.com/anthropics/claude-code/issues/54898)). Se **audita post-hoc** con
> observabilidad OTel (tool-spans con `file_path` + identidad del agente en Jaeger; ver
> `observability/OWNERSHIP_AUDIT.md`). El enforcement mecánico real está en **§4** (guards de
> sesión + `approved_by` en `GATE·`).

| Agente | Escribe — y SOLO esto |
|---|---|
| **01 STRATEGIST** | `BRIEF.md` |
| **02 RESEARCHER** | `RESEARCH.md` |
| **03 UX/UI** | `BRANDBOOK.md` + `TOKENS.css` + previews |
| **04 ARCHITECT** | `ARCHITECTURE.md` + `src/shared/types.ts` |
| **05 DATA MODELER** | `DATAMODEL.md` |
| **06 FRONTEND** | `src/renderer/ui` · `src/renderer/render` · `src/renderer/state` |
| **07 BACKEND** | `src/main` · `src/core` · `src/renderer/serial` · `src/preload` |
| **08 QA** | `tests/` + reportes QA (`QA_REPORT.md`) |
| **09 SECURITY** | reportes de seguridad (`SECURITY_REPORT.md`) — **solo lectura sobre todo lo demás** |
| **10 TECH WRITER** | `README.md` + docs de usuario |
| **LEAD** | **nada — solo coordina** |

**Notas de frontera:**
- **09 SECURITY** es solo lectura: nunca escribe, ejecuta ni modifica el código o la app; su único
  output escribible es su propio reporte de seguridad.
- **Front ∥ Back:** 06 es dueño de la capa de presentación (`src/renderer/{ui,render,state}`); 07
  es dueño de `src/main`, `src/core`, `src/renderer/serial` y `src/preload`. El **contrato de
  integración se define primero** (v1.1); las dudas de integración se escalan al lead.
- **10 TECH WRITER** documenta la realidad; su propiedad aquí es `README.md` + docs de usuario.
- Tocar un archivo fuera de la columna propia = escalar al lead, no editarlo.

---

## Topología de escalado (agent-teams)

```
AGENTE (01–10)
   │  conflicto entre agentes (P-04), ambigüedad, o duda con
   │  implicaciones de diseño/arquitectura/datos (RC-08)
   ▼
SendMessage  ─────────►  LEAD
                          │  el lead PAUSA el avance
                          ▼
                    consulta al HUMANO (Product Owner · CA6SNT)
                          │  el PO decide / aprueba el gate (P-05)
                          ▼
                    el lead reanuda y reactiva al agente
```

- Un agente **nunca** resuelve un conflicto con otro agente (P-04): lo escala al lead vía `SendMessage`.
- El lead **no** sustituye al PO: cuando la decisión es del PO (gates, trade-offs de diseño/arquitectura/datos), **pausa y consulta** (P-05).
- Ningún gate se cruza sin aprobación explícita del PO.
- Cada agente cierra entregando SU artefacto y reportando qué hizo y qué quedó pendiente (RC-07).

---

## Orquestación — TaskGraph (lead)

El lead materializa el pipeline como un **grafo de tareas** (la task list de agent-teams) y NO
ejecuta trabajo (R3): solo **crea** tareas, **asigna** owners y **cierra GATES**. Mecánica real
de la API: `TaskCreate` **no** acepta dependencias (solo `subject`/`description`/`activeForm`/
`metadata`); las aristas y el owner se fijan **después** con `TaskUpdate`:
- `addBlockedBy: [ids]` → esos ids **deben completarse antes** de que esta tarea sea reclamable.
- `addBlocks: [ids]` → esos ids **no pueden empezar** hasta que esta cierre.
- `owner` → a quién pertenece la tarea; `metadata` → datos del gate (p. ej. `approved_by`).

Una tarea con `blockedBy` sin resolver **no es reclamable**; al completarse su bloqueante, las
dependientes se **auto-desbloquean**. Así el orden del estudio queda codificado en el grafo.

> **Dos puntos de entrada:** proyecto NUEVO (una idea) → `/startsnt` (greenfield). Proyecto EN CURSO
> (no-idea) → `/adopt` (rampa brownfield) → **G-ADOPT** → reengancha al grafo normal en el gate de
> madurez real. No recrees G01–G03 para algo que ya existe.

### 1. Primero: clasificación de tamaño (`docs/intake-scale-gating.md`)

Antes de crear el grafo, el lead **clasifica la solicitud, la declara al PO** y crea **solo el
subset** que corresponde. Ante la duda, sube un nivel; omitir un gate **no** exime de P-01..P-11.

| Tamaño | Subset a crear (agentes → GATES) |
|---|---|
| **TRIVIAL** | Implementación directa (06/07 según toque) → **T08 QA** (`qa-eyes` smoke). **Sin** 01/04/05 ni GATES intermedias; el PO confirma la entrega (checkpoint único y ligero). |
| **ESTÁNDAR** | **T03** UX *(solo si toca UI)* → **T06∥T07** → **T08** QA → **T09** Security *(solo si toca auth/datos/superficie de ataque)*. GATES = las de los stages activos: **G03** *(si hubo UX)* y **G08**; release lo aprueba el PO. **Sin** 01/02/04/05. |
| **COMPLEJO** | **Pipeline 01–10 completo** con las 6 GATES humanas (grafo canónico abajo). |

### 2. Grafo canónico (COMPLEJO)

`Txx` = tarea de agente (`owner` = el teammate NN); `Gxx` = **GATE humana** (`owner` = **PO**).
Cada fila es una arista exacta a cablear con `TaskUpdate addBlockedBy`/`addBlocks`.

| Tarea | Owner | `blockedBy` | `blocks` | Entregable (mapa de propiedad) |
|---|---|---|---|---|
| **T01** strategist | 01 | — | G01 | `BRIEF.md` |
| **G01** GATE·BRIEF | **PO** | T01 | T02 | — (aprobación) |
| **T02** researcher | 02 | G01 | G02 | `RESEARCH.md` |
| **G02** GATE·RESEARCH | **PO** | T02 | T03 | — |
| **T03** ux/ui | 03 | G02 | G03 | `BRANDBOOK.md` + `TOKENS.css` |
| **G03** GATE·IDENTIDAD | **PO** | T03 | T04 | — |
| **T04** architect | 04 | G03 | G04 | `ARCHITECTURE.md` + `src/shared/types.ts` |
| **G04** GATE·ARQUITECTURA | **PO** | T04 | T05 | — ← **aquí caen las decisiones escaladas (RC-08)** |
| **T05** data-modeler | 05 | G04 | T06, T07 | `DATAMODEL.md` |
| **T06** frontend | 06 | T05 | T08 | `src/renderer/{ui,render,state}` |
| **T07** backend | 07 | T05 | T08 | `src/main · src/core · src/renderer/serial · src/preload` |
| **T08** qa | 08 | T06, T07 | G08 | `tests/` + `QA_REPORT.md` |
| **G08** GATE·QA | **PO** | T08 | T09 | — |
| **T09** security | 09 | G08 | T10 | `SECURITY_REPORT.md` (read-only sobre el resto) |
| **T10** tech-writer | 10 | T09 | G10 | `README.md` + docs de usuario |
| **G10** GATE·RELEASE | **PO** | T10 | — | — (release) |

- **T06 ∥ T07 en paralelo:** sin arista entre sí, **aislados por el mapa de propiedad** (06 y 07
  nunca tocan el archivo del otro; la integración se define primero y las dudas se escalan, no se editan).
- **Tramos sin GATE** (T05→T06∥T07, T06/T07→T08, T09→T10) **se encadenan SOLOS**: al cerrar el
  bloqueante, la dependiente se auto-desbloquea sin intervención humana.
- GATES humanas = **G01, G02, G03, G04, G08, G10** (6). No existen G05/G06/G07/G09.

### 3. Patrón de GATE task (el checkpoint humano)

Una `Gxx` tiene `owner = PO` y **el lead NO la auto-completa** (P-05). Protocolo:

1. El agente cierra su `Txx` entregando su artefacto (RC-07). Como `Txx blocks Gxx`, la GATE queda
   lista para decisión — pero es del PO, no del lead.
2. El lead **reporta el entregable al PO** (vía el humano) y **espera aprobación explícita**; no
   marca la GATE ni avanza. Si un agente escaló (P-04/RC-08), la decisión se resuelve aquí (p. ej. G04).
3. Solo con el "aprobado" del PO, el lead cierra la GATE: `TaskUpdate {taskId:"Gxx", status:"completed"}`.
   Como `Gxx blocks T(siguiente)`, el siguiente agente se **auto-desbloquea**.
4. Si el PO rechaza: la GATE sigue abierta y el lead re-despacha la `Txx` para iterar.

El lead nunca cierra una GATE sin el OK del PO; los tramos sin GATE no esperan a nadie.

> **Consistencia cruzada pre-gate (v6.6):** el productor cuyo entregable es el más caro de driftear
> corre una pasada `critic` de CONSISTENCIA contra los artefactos aprobados aguas arriba ANTES de su
> gate — p. ej. **04** sobre `ARCHITECTURE.md` (vs BRIEF/RESEARCH/BRANDBOOK) antes de **G04**. Reusa
> `critic`; sin skill ni gate nuevos. El PO decide en el gate con los hallazgos de consistencia adjuntos.

### 4. Enforcement — qué es mecánico y qué es norma auditada (v4.3)

Tras el right-size de hooks **v4.3** (a la luz de [#54898](https://github.com/anthropics/claude-code/issues/54898)
— *Per-Agent Permission Control Gap*, **ABIERTO**: el `PreToolUse` de Claude Code **no expone la
identidad del subagente llamante** — su stdin no trae `agent_type`), el enforcement del estudio se divide así:

**Mecánico — determinista a nivel de SESIÓN (no necesita saber qué agente actúa):**
- **`hooks/session-safety-guard.mjs`** (`PreToolUse`, matcher `Read|Write|Edit|MultiEdit|NotebookEdit`)
  bloquea, actúe quien actúe: (1) lectura/escritura de **credenciales/.env** reales (P-02),
  (2) escritura **fuera del árbol del proyecto** (RC-04), (3) escritura a **`.claude/settings.json`**.
- **`hooks/taskcompleted-gate.mjs`** (`TaskCompleted`): **rechaza (exit 2)** cerrar toda tarea cuyo
  `subject` empiece por `GATE·` si `metadata.approved_by` ≠ `"PO"`. Esto vuelve **mecánica** la regla
  P-05. El lead fija `TaskUpdate {taskId:"<Gxx>", metadata:{approved_by:"PO"}}` SOLO tras el OK
  explícito del PO. Para tareas de código/doc conserva su validación ligera (typecheck/test/build o
  existencia del entregable). **(+ v6.5)** También rechaza cerrar la tarea de **06/07** si falta su
  `FRONTEND_REPORT.md` / `BACKEND_REPORT.md` en la raíz del proyecto (RC-07 mecánico, basado en el
  `subject` de la tarea + existencia de archivo; tolerante si no matchea).

**NORMA del estudio + auditoría POST-HOC (NO mecánico):**
- El **mapa de propiedad por-agente** ya **no se impone mecánicamente**: con #54898 el hook no puede
  saber qué teammate hace el Write/Edit. Los hooks por-identidad — `ownership-guard.mjs` (frontmatter
  de los 10 agentes) y `ownership-fallback.mjs` (settings.json) — quedan **DESCONECTADOS**. Sus `.mjs`
  (y `ownership-map.mjs`, fuente de verdad del mapa) **se conservan en disco**: si #54898 se arregla,
  se re-cablean sin reescribir nada.
- `lead-guard.mjs` (R3) también queda **desconectado**: siendo de sesión no distingue lead vs teammate
  de forma fiable (y congelaba el dossier de coordinación).
- Por tanto el mapa de propiedad es **NORMA** (disciplina del lead + cada agente) y se **AUDITA
  post-hoc por observabilidad OTel**: cada Write/Edit emite un span `claude_code.tool` con `file_path`
  + la identidad real del agente (`agent_id` / `agent.name` / `service.name`). En Jaeger se pregunta
  *"¿el agente NN escribió fuera de su zona?"* — receta y script en **`observability/OWNERSHIP_AUDIT.md`**.

> **En una frase:** el único enforcement mecánico son los **guards de sesión** + **`approved_by` en
> `GATE·`**; la **propiedad por-rol es norma auditada** (Jaeger), no un candado.

---

## Nota de plataforma — agent-teams es exclusivo de `.claude`

- **`.claude` (este hogar)** opera con **agent-teams**: el lead coordina agentes que se comunican
  por `SendMessage` y escalan según la topología de arriba.
- **`.codex`** mantiene el modelo **lineal** original (despacho secuencial agente→agente vía el
  orquestador, sin agent-teams).
- La regla dual-home del estudio sigue vigente para el **contenido** de agentes y skills, pero la
  **topología agent-teams NO se espeja a Codex**. Esta migración toca **solo** `.claude`.
- Los `.toml` originales en `agents/` se conservan como **respaldo** (no se borran); su contenido
  de rol vive ahora también en `agents/NN-*.md` para el equipo de Claude Code.

---

*CA6SNT · Valdivia, Chile · Estudio de Agentes v1.3 · Contrato de equipo para agent-teams (.claude).*
*Plantilla `studio-project` (v4.3) — instánciala con `node ~/.claude/scripts/studio-init.mjs <ruta>` (o el skill `setup` del plugin).*
