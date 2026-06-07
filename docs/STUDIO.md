# STUDIO.md — Reglas de operación del estudio de agentes
## CA6SNT · Versión 1.6.0 · 2026-06-07 (Upgrade Pack v7 aplicado)

---

## Qué es el estudio

Un sistema de 10 agentes de IA especializados para desarrollar
software de forma estructurada. Cada agente tiene un rol único,
produce un entregable concreto, y no avanza sin aprobación explícita.

El estudio no es un proyecto — es la infraestructura que sirve
a todos los proyectos. Los proyectos pasan, el estudio permanece.

---

## Las tres piezas del estudio

```
ORQUESTADOR → Claude Chat / Cowork
 Define qué agente entra y cuándo.
 Clasifica el tamaño del trabajo y activa los gates proporcionales.
 Debate decisiones con el PO.
 Aprueba gates antes de avanzar.
 Usa orchestrator-bridge (loop despacho→aviso file-based) + drift-protocol
 (aprobado-vs-construido) — v1.3.
 No tiene TOML — es este chat.

AGENTES → Claude Code / Codex
 Ejecutan tareas cuando el orquestador los activa.
 Cada agente tiene un TOML que define su rol.
 10 agentes genéricos disponibles para cualquier proyecto.

PRODUCT OWNER → CA6SNT
 Aprueba entregables en cada gate.
 Toma decisiones que los agentes no pueden tomar solos.
 Nunca lo reemplaza ningún agente.
```

---

## Dónde vive cada cosa

El estudio vive en DOS hogares espejados: ~/.claude/agents/ (Claude Code)
y ~/.codex/agents/ (Codex). REGLA: todo cambio del estudio se aplica a AMBOS.
La estructura de abajo es idéntica bajo cada hogar (`<hogar>` = cualquiera de los dos).

```
AGENTES GENÉRICOS DEL ESTUDIO
 <hogar>\agents\01-strategist.toml … 10-technical-writer.toml
 AGENTES DE VERIFICACIÓN QA (NUEVO v1.3): jenny.toml · karen.toml ·
 task-completion-validator.toml (auxiliares del gate 08; no son del pipeline 01–10)

SKILLS GENÉRICOS DEL ESTUDIO
 <hogar>\agents\skills\
 brand-evaluation-rubric.md (NUEVO v1.1)
 research-methodology.md · architecture-decision.md · data-integrity.md
 qa-visual-criteria.md · qa-eyes.md (NUEVO v1.1)
 security-audit.md · project-cleanup.md · technical-documentation.md
 agent-authoring.md (NUEVO v1.2)
 asset-sourcing.md · env-reproducible.md · diagrams-gate.md ·
 orchestrator-bridge.md · drift-protocol.md (NUEVO v1.3) · critic.md (v6.1)

MEMORIA Y PROCESO DEL ESTUDIO (NUEVO v1.1)
 <hogar>\agents\LEARNINGS.md           (memoria viva; todo agente la lee al arrancar)
 <hogar>\agents\intake-scale-gating.md (gating proporcional al tamaño)
 <hogar>\agents\STUDIO_REFINEMENTS.md  (análisis fuente del Upgrade Pack)

SOLO EN CODEX (NO espejado)
 .codex\agents\ tiene además 7 TOMLs experimentales propios de Codex
 (referencias-visuales-s3, investigador-docs, reviewer-riesgos, tester-local,
  radio-safety, ui-ux-reviewer, data-inspector). No son parte del estudio espejado.

PROYECTOS
 D:\[NombreDelProyecto]\
 Cada proyecto tiene su carpeta. Los genéricos NO se copian ni se modifican por proyecto.
 NOTA (v1.1): el árbol de desarrollo vive FUERA de carpetas sincronizadas (OneDrive/Drive);
 la nube respalda solo datos/outputs, nunca node_modules ni el build.
```

---

## Arranque de proyecto — /startsnt (intake-first)

El front door de un proyecto nuevo es el slash-command **`/startsnt`** (definición: `commands/startsnt.md`;
referencia completa de arranque: `agents/STARTERS.md`). Es **intake-first**: el LEAD **te interroga con
opciones ANTES de inicializar o spawnear a nadie** — nunca asume el alcance de 2-3 frases.

**Paso OBLIGATORIO antes de spawnear — las 5 preguntas del INTAKE** (una por una, con opciones; el lead espera respuesta):
1. **¿Qué construimos?** (1 frase) + tipo: app escritorio · app web · CLI/script · librería/API · investigación/doc · otro.
2. **Ambición / tamaño:** prueba rápida (TRIVIAL) · feature acotada (ESTÁNDAR) · producto nuevo (COMPLEJO) · clasifícalo tú.
3. **Plataforma / entorno:** Windows · multiplataforma · navegador · servidor/nube · N/A.
4. **Restricciones duras** (multi): offline-first · datos sensibles · sin deps pesadas · sin API key · ninguna.
5. **Qué importa más:** identidad visual · velocidad de uso · robustez de datos · simplicidad/alcance acotado.

Solo con las **5 respuestas**: clasifica el tamaño (`intake-scale-gating.md`) → materializa el TaskGraph
(solo el subset que toca) → spawnea **01 Strategist** con un **BRIEF-seed** que ya incorpora las respuestas.

**PASO 0 — init con RUTA ABSOLUTA.** El comando corre `studio-init <RUTA-ABSOLUTA>` (nunca `'.'`; en la
raíz de un disco está prohibido y el script lo rechaza), que crea la carpeta + `settings.json` + `CLAUDE.md`
+ `evals/` si no existen.

**PASO 0.5 — sesión ROOTEADA en el proyecto (OBLIGATORIO).** Greenfield es huevo-y-gallina: la carpeta y su
`settings.json` no existen hasta el PASO 0, así que la sesión que inicializa **casi nunca** está ya rooteada
en el proyecto. **En la app, "rootear" = abrir una SESIÓN NUEVA en la pestaña Code con la carpeta del
proyecto seleccionada** en el selector de arriba (no es un comando de terminal). Los hooks + `CLAUDE.md` +
telemetría del proyecto **solo cargan al ABRIR la sesión rooteada** ahí (no se recargan en caliente) → el
LEAD **no materializa TaskGraph ni spawnea a nadie** hasta estar rooteado (`/startsnt` es idempotente: si ya
rooteado + `settings.json` existe, continúa; si no, init y se detiene en el PASO 0.5). *(Pie de página CLI,
alternativa: `cd <ruta> && claude` en sesión fresca, no `--resume`; si `claude` no está en PATH, ruta
completa o `$env:PATH += ";$env:APPDATA\\npm"`.)*

Cowork tiene su gemelo intake-first (prompt en `agents/STARTERS.md` §C). **Solo `.claude`.**

---

## Brownfield — la rampa `/adopt`

Segundo punto de ENTRADA al estudio: adoptar un proyecto **EN CURSO** y continuarlo desde su estado
**REAL**. No es un 2º pipeline — es **una rampa de 1 gate (G-ADOPT)** que reengancha al grafo normal
en el gate de **madurez real** del proyecto.

- **Regla de oro:** NO reconstruir todo el spec de una (produce specs plausibles-falsos).
  Reconstrucción **incremental + grounded** (anclada al código real vía `adopt-ground`/Repomix, no a
  memoria) y revisada por el PO **artefacto-por-artefacto**. Forma Kiro: *Actual / Esperado /
  Sin-cambios*; inferencias marcadas `[TO VERIFY]` (drift-protocol). Código existente **read-only**
  hasta G-ADOPT (baseline commit + checkpoint primero).
- **Seguridad primero:** `adopt-ground` corre el secret-scan ANTES de leer hondo o generar doc; si
  aparecen secretos → STOP, cuarentena y escalar al PO (P-02). Nunca imprimir el valor del secreto.
- **Flujo (TaskGraph liviano):** `T-ground (adopt-ground) → T-smoke (smoke-test) → T04 ARCH ∥ T05
  DATA → T01 BRIEF → T10 DOCS(draft) → GATE·ADOPT(PO) → reenganche al grafo normal`.
- **G-ADOPT** reusa el patrón `approved_by:"PO"` / `[PO-OK]` del `taskcompleted-gate.mjs` (sin hook ni
  enforcement nuevos). Tras el gate, el lead crea el pipeline normal A PARTIR del gate de madurez real
  (no recrea G01–G03 si ya existen).
- **Anti-bloat:** solo `adopt-ground` (skill) + `/adopt` (comando) + G-ADOPT (gate) + modo `--adopt`
  de studio-init son nuevos; todo lo demás REUSA `security-audit`, `smoke-test`, `diagrams-gate`,
  `drift-protocol`, `critic`, `data-integrity`, `intake-scale-gating`.

> Definición: `commands/adopt.md` + skill `adopt-ground`.

---

## Iniciar un proyecto del estudio (agent-teams · solo `.claude`)

La **librería** del estudio (los 10 agentes, `hooks/`, `skills/`, `scripts/`) vive **global** en
`~/.claude` y sirve a todos los proyectos. Pero la **activación** de agent-teams en un proyecto es
**deliberada y por-proyecto**: se copia un `settings.json` (flag de agent-teams + wiring de hooks +
telemetría OTel) y un `CLAUDE.md`. Así un proyecto del estudio **no contamina** otras sesiones de
Claude Code de la máquina (que siguen sin agent-teams, sin guards y sin telemetría).

Para iniciar (o re-verificar) un proyecto:

```
node ~/.claude/scripts/studio-init.mjs <ruta-del-proyecto>
```

Copia la plantilla `~/.claude/templates/studio-project/{settings.json,CLAUDE.md}` dentro del
proyecto y **verifica** la activación (flag `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`, que cada hook
resuelva a un `.mjs` real, y que la telemetría esté cableada), imprimiendo un reporte `OK/FALTA`.
Es **idempotente**: no pisa un `settings.json` existente sin `--force`.

> **Hooks conectados (right-size v4.3):** `session-safety-guard.mjs` (PreToolUse),
> `taskcompleted-gate.mjs` (TaskCompleted, con el check `approved_by:"PO"` en `GATE·`) y
> `teammate-idle-guard.mjs` (TeammateIdle). El ownership por-agente (`ownership-guard`/`-fallback`) y
> `lead-guard` quedaron **desconectados** por
> [#54898](https://github.com/anthropics/claude-code/issues/54898) (ver `CLAUDE.md §4`). Esta
> activación es **exclusiva de `.claude`**; `.codex` no usa agent-teams.

---

## Regla fundamental — agentes genéricos vs agentes de proyecto

```
Los 10 TOMLs en <hogar>\agents\ son genéricos: no contienen referencias a
ningún proyecto y no se modifican por contexto de proyecto. Son infraestructura.

Si un proyecto necesita un agente específico → crearlo en D:\[Proyecto]\agents\,
nunca editar los genéricos.

Si un agente genérico necesita mejorar → debatir con el orquestador, actualizar
el genérico EN AMBOS HOGARES, versionar el cambio, y registrarlo en este STUDIO.md.

Igual que un agente: cualquier FIX de infraestructura del estudio (hooks, evals/rúbricas,
scripts, plantilla studio-project) —incluido un bug pequeño pero REAL y FUNCIONAL— se versiona
y se REGISTRA en el "Historial de versiones" de este STUDIO.md (y en LEARNINGS/RETRO).
```

---

## Cómo se invoca un agente

```
1. El orquestador clasifica el tamaño del trabajo (ver "Gating proporcional")
   y decide qué agentes entran.
2. Genera una instrucción de arranque apuntando a los entregables que el agente
   debe leer (en local; Drive es respaldo, no pasarela obligatoria — v1.1).
3. El PO pega esa instrucción en Claude Code / Codex.
4. El agente lee su TOML, LEARNINGS.md, los documentos del proyecto, y ejecuta.
5. El agente entrega en D:\[Proyecto]\ (Drive replica como respaldo).
6. El orquestador revisa el entregable con el PO.
7. Gate aprobado → siguiente agente. Si no → itera.
```

---

## Pre-gate de evals (LLM-juez · promptfoo) — NUEVO v4.2

Antes de un gate humano, una **rúbrica máquina** puntúa el entregable; el PO aprueba algo que **ya
pasó la rúbrica**. Premisa anti-burocracia: **2–3 rúbricas de ALTO valor**, no una por gate.

- **Herramienta:** promptfoo (MIT, vía `npx`; v0.121.15). **Juez = Claude vía la CLI `claude -p`**,
  SIN `ANTHROPIC_API_KEY` (usa el OAuth de la suscripción; provider
  `~/.claude/evals/providers/claude-cli.js`). Es **solo `.claude`**, como toda la capa agent-teams.
- **Rúbricas** (las siembra `studio-init` en `<proyecto>/evals/`):
  - `brandbook.rubric.yaml` → **G03** (Design Score / AI-Slop sobre BRANDBOOK + TOKENS).
  - `architecture.rubric.yaml` → **G04** (stack justificado, P-01/02/06, env reproducible, contrato `types.ts`).
  - `anti-placeholder.rubric.yaml` → **P-11** (placeholders no declarados; apoya a 08 QA).
- **Quién/cuándo:** **08 QA** corre `npx promptfoo eval -c evals/<rúbrica>.rubric.yaml` sobre los
  entregables relevantes ANTES de reportar al PO, adjunta `score`/`pass` + el juicio al `QA_REPORT.md`,
  y resuelve los `fail` antes del gate. (Opcional: el resultado puede alimentar `taskcompleted-gate`.)
- Detalle, flujo y **gotcha de auth** (juez keyless): `<proyecto>/evals/README.md`.
- **Consistencia cruzada pre-G04 (v6.6):** **04 ARQUITECTO** corre `critic` sobre `ARCHITECTURE.md` en
  modo CONSISTENCIA — que honre BRIEF/RESEARCH/BRANDBOOK aprobados aguas arriba — ANTES de reportar a
  G04. Disciplina spec-driven que reusa `critic` (sin skill ni gate nuevos); G04 es donde el drift sale
  más caro y donde caen las decisiones escaladas (RC-08).

---

## Gating proporcional al tamaño (NUEVO v1.1)

El estudio NO debe ser burocrático en cambios chicos. El orquestador clasifica
cada solicitud y activa solo el subset de gates necesario. Detalle en
`intake-scale-gating.md`. Resumen:

```
TRIVIAL   → implementación directa + QA rápido. Sin Strategist/Architect/DataModeler.
ESTÁNDAR  → UX (si toca UI) → Front/Back → QA → Security si toca auth/datos/superficie.
COMPLEJO  → pipeline completo 01–10 con todos los gates.
```
Ante la duda, sube un nivel. Omitir un gate NO exime de los principios P-01..P-11.

---

## Los 10 agentes — roles y orden

```
01 STRATEGIST  → brief. Gate: BRIEF.md.
02 RESEARCHER  → contexto externo, construir vs reutilizar. Gate: RESEARCH.md. (Al elegir
   fuente de datos, lista qué campos cubre y cuáles NO contra lo que pide el diseño — v1.1.)
03 UX/UI       → identidad + tokens. Gate: BRANDBOOK.md + TOKENS.css. (Evalúa con
   brand-evaluation-rubric: Design Score / AI-Slop — v1.1. Usa asset-sourcing:
   assets reales, nunca placeholders — v1.3.)
04 ARCHITECT   → stack + estructura (con diagramas). Gate: ARCHITECTURE.md. (Fija requisitos
   de entorno reproducibles, p. ej. versión de runtime, y comando de build único — v1.1.
   Usa env-reproducible (mise/Volta) + diagrams-gate (C4/mermaid) — v1.3.)
05 DATA MODELER→ modelo, integridad, backup, migraciones. Gate: DATAMODEL.md. (Usa
   diagrams-gate para el diagrama ER — v1.3.)
06 FRONTEND    → UI. En paralelo con Backend (contrato de integración primero — v1.1).
07 BACKEND     → lógica/datos/APIs. En paralelo con Frontend.
08 QA          → gate de calidad. Usa qa-eyes (conduce la app real) + auditoría
   anti-placeholder; prioriza testing por riesgo (ver qa-eyes). Gate: 0 blocking. (v1.1.
   Usa qa-eyes (Hecho=hecho: Jenny + Karen + task-completion-validator — v1.3, plegado en qa-eyes en v6.3).)
09 SECURITY    → gate de seguridad. Gate: SECURITY_REPORT.md. (Herramientas en security-audit:
   SecOpsAgentKit + reviewdog baseline — v1.3, plegado en security-audit en v6.3.)
10 TECH WRITER → cierre/docs. Documenta la realidad. Registra mejoras en STUDIO.md.
```

---

## Modelos por agente (3-tier) (NUEVO v1.2)

Tier por defecto según criticidad (coste-consciente). Se fija en cada TOML con `model = "..."`.

```
opus    → 01-strategist · 04-architect · 05-data-modeler · 09-security-reviewer
sonnet  → 02-researcher · 03-ux-ui · 06-frontend · 07-backend · 08-qa
haiku   → 10-technical-writer
```
Los agentes de verificación QA (jenny · karen · task-completion-validator) corren en `sonnet`,
el mismo tier que el gate 08 (v1.3).
El orquestador puede subir de tier por tarea puntual: un caso difícil puede justificar
un modelo más capaz que el tier por defecto del agente.

---

## Principios globales del estudio

```
P-01  Toda app se empaqueta y se ve como app nativa. Nunca localhost en el browser.
P-02  Construir como si el repo fuera público. Nunca credenciales/datos sensibles en código.
P-03  Sin SaaS genérico ni plantilla. Diseño con personalidad propia. (Medible con
      brand-evaluation-rubric: Design Score / AI-Slop — v1.1.)
P-04  Los agentes no resuelven conflictos entre sí. Escalan al orquestador.
P-05  Ningún agente avanza sin aprobación explícita del PO en su gate.
P-06  Manejo de errores explícito. Ningún error se traga sin registrar.
P-07  Backup siempre si hay datos que el usuario no puede recuperar de otro lado.
P-08  Toda migración tiene rollback definido antes de ejecutarse.
P-09  No producir más documentación que producto. La doc documenta la realidad.
P-10  Los agentes genéricos no contienen referencias a proyectos específicos.
P-11  (NUEVO v1.1) PLACEHOLDER DECLARADO O NO HAY PLACEHOLDER. Ningún agente rellena
      con mock/placeholder un dato o asset faltante sin escalarlo (RC-08). Un placeholder
      no declarado que aparenta ser real es un DEFECTO, no una entrega. QA lo audita.
```

---

## Documentos que produce cada proyecto

```
Raíz: BRIEF.md · RESEARCH.md · AGENTS.md · STATUS.md · README.md
docs/: BRANDBOOK.md · TOKENS.css · ARCHITECTURE.md · DATAMODEL.md ·
       QA_REPORT.md · SECURITY_REPORT.md · CLEANUP_LIST.md · PHASE2_BACKLOG.md (v1.1)
Orquestador: NEXT_HANDOFF.md (contexto para continuar en otro chat).
Estudio (no por proyecto): LEARNINGS.md se ACTUALIZA al cerrar cada proyecto (v1.1).
```

---

## Tooling del estudio — Upgrade Pack v1 (NUEVO v1.1)

Adiciones de herramienta, no de burocracia (origen: gstack, spec-kit, BMAD, compound-engineering):

```
qa-eyes.md                 El Agente 08 conduce la app REAL (computer-use en escritorio /
                           Chrome en web): capturas, verifica estados, AUDITORÍA ANTI-PLACEHOLDER.
brand-evaluation-rubric.md Design Score + AI-Slop Score (A–F) para Agentes 03 y 08. Mide P-03.
LEARNINGS.md               Memoria viva (compounding). Todo agente la lee; se actualiza al cierre.
intake-scale-gating.md     Gating proporcional al tamaño del trabajo.
agent-authoring.md         (v1.2) Checklist anti-bloat para crear/editar TOMLs de agente magros.
```
Pendiente de evaluar (siguiente ola): `constitution`/análisis de drift (spec-kit).
(v1.2: 3-tier de modelos por coste y agent-authoring —PluginEval-lite— ya incorporados.)

---

## Tooling externo adoptado (Upgrade Pack v2) (NUEVO v1.3)

Mapa rol → herramienta → repo → cómo se instala. El uso lo detallan las skills citadas.

```
ROL 03 (UX/UI) — skill asset-sourcing
 · better-icons          https://github.com/better-auth/better-icons
                         → `npx better-icons setup`; trae el SVG real y lo escribe LOCAL. Sin CDN.
 · Data Dragon /         Riot / CommunityDragon (arte de dominio)
   CommunityDragon       → descargar a resources/ en build; cache local.

ROL 04 (Architect) — skills env-reproducible + diagrams-gate
 · mise                  https://github.com/jdx/mise
                         → mise.toml commiteado (runtime+env+tasks); preferido si hay >1 lenguaje.
 · Volta                 (solo-Node) → `volta pin node@lts` en package.json.
 · c4-model-skill        https://github.com/cheriftj/c4-model-skill → C4 con modo review (gate).
 · oh-my-mermaid         https://github.com/oh-my-mermaid/oh-my-mermaid → `omm scan` a .mmd diffables.

ROL 05 (Data Modeler) — skill diagrams-gate (diagrama ER)
 · c4-model-skill / oh-my-mermaid (mismos repos de arriba).

ROL 08 (QA) — skill qa-eyes (fusión de qa-verification, v6.3)
 · Jenny / Karen /       https://github.com/darcyegb/ClaudeCodeAgents
   task-completion-validator → copiados a <hogar>\agents\ (adaptados al formato TOML del estudio).
 · reviewdog             https://github.com/reviewdog/reviewdog → baseline: falla solo en hallazgos nuevos.

ROL 09 (Security) — skill security-audit (fusión de security-gate, v6.3)
 · SecOpsAgentKit        https://github.com/AgentSecOps/SecOpsAgentKit
                         → orquesta Gitleaks/Semgrep/Bandit/Trivy/Grype/Checkov/DefectDojo.
 · reviewdog (baseline)  https://github.com/reviewdog/reviewdog → solo hallazgos NUEVOS sobre el diff.
 · llm-sast-scanner      (taint + paso Judge anti-FP) → análisis profundo opcional.

ORQUESTADOR — skills orchestrator-bridge + drift-protocol
 · claude-heartbeat      https://github.com/Siigari/claude-heartbeat
                         → stop hook; lee io/inbox.jsonl, escribe io/outbox.jsonl; sin `claude -p`.
 · AMQ                   https://github.com/avivsinai/agent-message-queue → bus Maildir crash-safe.
 · cli-agent-orchestrator (AWS Labs, Apache) → supervisor-worker headless para paralelo serio.
 · Divergence Protocol   https://github.com/FredAntB/Spec-Driven-Development → aprobado-vs-construido.
```
Instalación en la máquina: PENDIENTE (en este pack solo se ejecutó el git clone/copia de
Jenny/Karen/validator). El estudio ya referencia cada herramienta; la instalación local se
hace cuando un proyecto concreto la necesite.

---

## Reglas para Claude Code al ejecutar un agente

```
RC-01 Leer el TOML del agente y LEARNINGS.md antes de empezar. (v1.1)
RC-02 Leer los documentos del proyecto en local (Drive es respaldo).
RC-03 No avanzar al siguiente agente sin instrucción del orquestador.
RC-04 Entregar en la carpeta del proyecto.
RC-05 No modificar archivos aprobados de etapas anteriores.
RC-06 No inventar contenido no provisto. Si falta un dato/asset real → ESCALAR (P-11), no rellenar.
RC-07 Reportar qué se hizo y qué quedó pendiente.
RC-08 Ante duda con implicaciones de diseño/arquitectura/datos → escalar al orquestador.
```

---

## Proactividad (v5.3)

El estudio **ANTICIPA los entregables obvios** — el PO no debería tener que pedirlos. Lo que es el output
evidente de un rol se produce como parte de su "terminado", no a pedido:
- **Assets/datos** que el producto necesita → aprovisionados (skill `asset-sourcing`, script `fetch-assets`).
- **Artefacto que arranca** (binario empaquetado) → lo produce **07 BACKEND** como parte de su deliverable (no post-release).
- **Smoke** (arranque + render esencial) → lo autora y corre **08 QA** (skill `smoke-test`).

Convención (Anthropic): los agentes cuyo output es ese entregable obvio llevan **"use PROACTIVELY"** en su
`description` (frontmatter) para que el lead los active sin que el PO lo pida. El gate de RELEASE (DoD v5.2)
verifica mecánicamente que esos entregables existan (artefacto + smoke + assets).

## Gate de RELEASE — Definition-of-Done mecánica (v5.2)

**G10/RELEASE no cierra sin artefacto que arranca + smoke pass + assets — verificado mecánicamente, no a pedido del PO.**

`taskcompleted-gate.mjs` (hook `TaskCompleted`), cuando el `subject` empieza por `GATE·RELEASE`, exige —ADEMÁS
del `[PO-OK]` / `approved_by:"PO"` del PO (P-05, condición SEPARADA e intacta)— tres chequeos DETERMINISTAS (sin LLM):
- **(a) Artefacto ejecutable** existe (binario bajo `release/` o `dist/` por convención; si el stack difiere se
  declara en un `dod.manifest.json` mínimo — NO se hardcodea a `.exe`).
- **(b) Smoke pasó:** `tests/smoke-result.json` existe, parsea, `pass===true` y `ts` reciente (skill `smoke-test`).
- **(c) Assets provisionados:** si el proyecto declara datos (`data/` no vacío) o tiene script `fetch-assets`, los archivos están.

Si falta alguno → `exit 2` nombrando qué falta. Domain-neutral: la REGLA (artefacto + smoke + assets) es general;
las rutas vienen de convención o del `dod.manifest.json` del proyecto, nunca hardcodeadas.

## Anti-bloat — Upgrade Pack v5 APLICADO (v1.4.0)

> El estudio v5 cierra con foco ANTI-BLOAT. El riesgo del estudio es el EXCESO de proceso, no la falta:
> agregar gates/agentes a un pipeline gated AUMENTA la probabilidad de fracaso (McEntire 2026). Reglas de gobierno:

- **Gates proporcionales (EXPLÍCITO):** TRIVIAL y ESTÁNDAR corren el **subset reducido** de gates, **NO las 6
  siempre**. **Default al tamaño MÁS PEQUEÑO que encaje**; COMPLEJO (pipeline 01–10 + 6 gates) solo cuando de
  verdad aplica (producto nuevo / cambio de arquitectura / datos nuevos / riesgo alto). Detalle: `intake-scale-gating.md`.
- **Evals deterministas por defecto:** el LLM-juez (promptfoo) se usa **SOLO** en el pre-gate de calidad/release
  (08 QA: brandbook / architecture / anti-placeholder). En todo lo demás, chequeos **DETERMINISTAS** (existe
  archivo / exit 0 / typecheck / `smoke-result`). **Nada de LLM-juez por tarea.**
- **Dossier liviano:** `ORQUESTACION.md` = **decisiones + escalados + preguntas abiertas** (lo que un humano
  necesita para retomar). El estado MECÁNICO (status de tareas, quién hizo qué, tiempos) lo derivan la
  **observabilidad OTel/Jaeger** y la **TaskList**, NO se copia a mano.
- **Poda de contexto:** un `CLAUDE.md`/STUDIO inflado **entierra** las reglas que importan (P-09). No re-explicar
  lo que el agente ya cumple ni lo que un hook ya enforza; **no importar marketplaces enteros** (solo prompts
  puntuales). Toda adición futura justifica su peso contra esta regla.
- **"Terminado" = ARRANCA:** smoke (v5.1) + Definition-of-Done mecánica del gate de RELEASE (v5.2) + proactividad
  (v5.3): artefacto que arranca + smoke verde + assets, verificado mecánicamente; el estudio ANTICIPA esos entregables.

## Historial de versiones

```
v1.0  2026-06-04  Documento inicial. 10 agentes, 8 skills. Primer proyecto: WildRift Tracker.
v1.1  2026-06-04  Upgrade Pack v1 (post primer proyecto):
                  + P-11 (placeholder declarado o no hay placeholder).
                  + Skills: qa-eyes, brand-evaluation-rubric.
                  + LEARNINGS.md (memoria compounding) e intake-scale-gating (gates proporcionales).
                  + Notas: repo fuera de carpetas sincronizadas; contrato de integración primero;
                    fuente de datos verificada contra el diseño; entorno de runtime reproducible.
                  Origen del refinamiento: análisis de gstack + spec-kit + BMAD + compound-engineering.
v1.2  2026-06-04  estudio declarado dual-home (.claude + .codex) con regla de
                  sincronización; 3-tier de modelos; testing por riesgo en QA; skill agent-authoring.
v1.3  2026-06-05  Upgrade Pack v2: asset-sourcing (better-icons/Data Dragon), env-reproducible
                  (mise), diagrams-gate (c4/oh-my-mermaid), qa-verification (Jenny/Karen/validator),
                  security-gate (SecOpsAgentKit/reviewdog), orchestrator-bridge (claude-heartbeat/AMQ),
                  drift-protocol (Divergence). Origen: research v2.
v1.3.1 2026-06-06 Fix de bootstrap greenfield (capa agent-teams / plantilla studio-project; solo
                  .claude — no aplica al modelo lineal de Codex). studio-init.mjs SIEMPRE con RUTA
                  ABSOLUTA + RECHAZA si el target es la raíz de un disco + banner final app-first
                  ("abre una SESIÓN NUEVA en la pestaña Code con la carpeta del proyecto seleccionada;
                  los hooks/CLAUDE.md/telemetría solo cargan al ABRIR rooteado, no en caliente"; CLI
                  como pie de página). /startsnt + STARTERS.md §D quedaron idempotentes / dos fases:
                  NO materializan TaskGraph ni spawnean sin sesión rooteada. STARTERS.md reescrito
                  app-first (v2) + nota "el mantenimiento del estudio se hace desde ~/.claude" (el
                  session-safety-guard de proyectos bloquea escrituras fuera del árbol). +3 lecciones
                  en LEARNINGS. Origen: post-mortem del arranque de RadioLogVivo (greenfield = huevo y
                  gallina ⇒ relanzar una sesión fresca rooteada es OBLIGATORIO tras el init).
v1.3.2 2026-06-06 Fix de 2 bugs REALES y FUNCIONALES hallados en la 1ª corrida agent-teams real
                  (RadioLogVivo; capa agent-teams/evals — solo .claude, no aplica al modelo lineal de
                  Codex). (1) taskcompleted-gate: el payload del evento TaskCompleted del build NO
                  entrega la metadata de la tarea (Claude Code #27556 + #21356, ambos "not planned"),
                  así que el check approved_by:"PO" NUNCA pasaba y bloqueaba los 6 gates. Re-cableado
                  para gatear por marcador [PO-OK] en el SUBJECT (que sí se entrega); el LEAD lo añade
                  SOLO tras el OK explícito del PO; approved_by queda como fallback. Patch en el hook
                  global ~/.claude/hooks/taskcompleted-gate.mjs (.bak guardado). (2) architecture.rubric
                  .yaml cargaba el contrato con  types: file://../src/shared/types.ts  y promptfoo
                  ERRABA ("(intermediate value) is not a function" en renderPrompt): carga las vars
                  file:// por EXTENSIÓN y un .ts/.js lo IMPORTA como módulo y llama a su función
                  exportada (que debe devolver {output}); types.ts solo exporta tipos. Fix: loader
                  evals/read-contract.mjs (export default => ({output:<texto>})) + var
                  types: file://./read-contract.mjs; sembrado en la plantilla studio-project/evals
                  (studio-init lo copia solo vía readdirSync). Requisito de tooling: promptfoo 0.121.15
                  exige Node ^20.20.0 || >=22.22.0 -> pin por-proyecto 22.x pero >=22.22.0. Verificado:
                  brandbook PASS 0.91, architecture PASS 1.0. +3 lecciones en LEARNINGS + sección en
                  RETRO. Origen: orquestación LEAD de RadioLogVivo.
v1.3.3 2026-06-06 Upgrade Pack v5.1 + v5.2 (capa agent-teams · solo .claude, no aplica al modelo lineal de
                  Codex). v5.1: skill `smoke-test` (DOMAIN-NEUTRAL: "terminado" incluye un artefacto que
                  ARRANCA, smoke automático headless con UN comando y pass/fail; recipe actual Electron via
                  Playwright `_electron.launch`; scaffold sembrado en la plantilla — tests/smoke.spec.ts +
                  script smoke + devDep @playwright/test, y studio-init lo siembra; + 08-qa/06-frontend).
                  v5.2: **Definition-of-Done mecánica en el gate de RELEASE** — `taskcompleted-gate` exige,
                  además del `[PO-OK]` (P-05, separado), tres chequeos DETERMINISTAS (artefacto ejecutable +
                  `tests/smoke-result.json` pass reciente + assets provisionados); rutas por convención o
                  `dod.manifest.json`, sin LLM. Origen: el bug "ventana negra / No handler" de RadioLogVivo
                  que el QA headless NO cazó — solo el arranque real del binario; el smoke+DoD lo habría
                  cazado en CI sin abrir el .exe.
v1.3.4 2026-06-06 Upgrade Pack v5.3 — Proactividad + packaging como propiedad de 07 (capa agent-teams · solo
                  .claude, no aplica al modelo lineal de Codex). "use PROACTIVELY" (convención Anthropic) en la
                  `description` de 08-qa (autora/corre el smoke) y 07-backend (produce el ARTEFACTO ejecutable).
                  El **packaging es de 07 y parte de su "terminado"**, NO post-release: deja config de
                  electron-builder (portable+nsis) + script `dist`. La plantilla studio-project siembra
                  `electron-builder.yml` + script `dist` + `dod.manifest.json` (artefacto/smoke/assets) para que
                  el gate de RELEASE (DoD v5.2) tenga qué verificar desde el día 1. Recipe Electron rotulada por
                  stack (P-10). + sección "Proactividad (v5.3)" en STUDIO.
v1.4.0 2026-06-06 Upgrade Pack v5 APLICADO + cierre anti-bloat (capa agent-teams · solo .claude). Consolida
                  v5.1 (skill smoke-test), v5.2 (Definition-of-Done mecánica del gate de RELEASE), v5.3
                  (proactividad + packaging propiedad de 07) y v5.4 (anti-bloat): gates proporcionales
                  EXPLÍCITOS (subset, no 6 siempre; default al tamaño más pequeño que encaje), evals
                  deterministas por defecto (LLM-juez SOLO en pre-gate calidad/release), dossier liviano
                  (decisiones/escalados; estado mecánico vía OTel/Jaeger + TaskList), poda de contexto (no
                  inflar CLAUDE.md/STUDIO, no importar marketplaces). +4 lecciones de v5 en LEARNINGS.
                  Origen: orquestación real de RadioLogVivo (6SNT.LLFH).
v1.5.0 2026-06-07 Upgrade Pack v6.1 APLICADO — skill `critic` (revisión adversarial pre-gate) en 02/08/09
                  (capa agent-teams · dual-home: ES en ~/.claude, EN en el repo). Revisión externa que ATACA
                  el entregable ANTES del gate humano (contradicciones, puntos ciegos, sobre-afirmaciones,
                  drift de spec, placeholders/errores tragados). NO agente, NO gate — capacidad sobre gates
                  existentes (anti-bloat: 1 pasada adversarial ≈ 80% de reflexion, al costo de un prompt).
v1.5.1 2026-06-07 Upgrade Pack v6.2 APLICADO — jurado LLM-as-judge keyless cost-aware en el pre-gate de
                  evals (capa agent-teams · dual-home). El provider `claude-cli.js` admite `config.models`
                  (array de tiers): corre el MISMO prompt con opus+sonnet+haiku y agrega mediana + mayoría
                  (P-06: descarta jueces caídos; si caen todos, error). Activo SOLO en la rúbrica de marca
                  (G03, subjetiva); las objetivas siguen con 1 juez y el jurado entra por la regla
                  "borde → jurado" (score a ±0.1 del umbral). Cost-aware: 3× solo donde importa. + sección
                  en 08-qa, evals/README y LEARNINGS.
v1.5.2 2026-06-07 Upgrade Pack v6.3 APLICADO — poda de skills (anti-bloat): fusión de 3 pares solapados
                  en su keeper PRESERVANDO contenido (RC-06: mover, no perder) — brand-evaluation →
                  brand-evaluation-rubric, qa-verification → qa-eyes, security-gate → security-audit.
                  Catálogo 22→19 (repo). Refs reapuntadas (03 frontmatter, punteros ROL, índice de
                  skills); cero referencias colgantes. NO agente, NO gate.
v1.5.3 2026-06-07 Upgrade Pack v6.4 APLICADO — lean-mode de docs (P-09) en 02/04/05: RESEARCH,
                  ARCHITECTURE y DATAMODEL abren con un §0 Resumen Ejecutivo de ~1 pantalla (veredicto +
                  tablas de decisión + decisiones-PO + riesgos) aprobable de un vistazo; cuerpo escaneable.
                  Disciplina ESTRUCTURAL, no tope de bytes. + bullet en `critic` (caza decisiones
                  enterradas / P-09). NO agente, NO gate, NO hook.
v1.5.4 2026-06-07 Upgrade Pack v6.5 APLICADO — RC-07 mecánico en `taskcompleted-gate.mjs`: al cerrar la
                  tarea de 06/07, el hook rechaza (exit 2) si falta su `FRONTEND/BACKEND_REPORT.md` en la
                  raíz. Basado en SUBJECT + existencia de archivo (el payload TaskCompleted no trae
                  metadata fiable, #27556/#21356). Acotado (QA/SECURITY ya son entregables de gate);
                  tolerante si no matchea. Verificado: node --check + dry-run (sin reporte→exit2; con
                  reporte→pasa). NO agente, NO gate.
v1.5.5 2026-06-07 Upgrade Pack v6.6 APLICADO — consistencia cruzada en G04 (disciplina spec-driven sin
                  Spec Kit): 04 ARQUITECTO corre `critic` sobre ARCHITECTURE.md en modo CONSISTENCIA —
                  que honre BRIEF/RESEARCH/BRANDBOOK aprobados aguas arriba — antes de G04. Reusa
                  `critic` (frontmatter de 04 + sección "Consistencia cruzada"; 04 anclado como
                  invocador en el skill). G04 es donde el drift sale más caro. NO agente, NO gate, NO skill.
v1.6.0 2026-06-07 Upgrade Pack v7 APLICADO — Brownfield Adoption (rampa `/adopt`): 2º punto de
                  entrada para adoptar un proyecto en curso y continuarlo desde su estado real. UN
                  gate nuevo (G-ADOPT, rampa; reusa `approved_by:"PO"`), UN skill (`adopt-ground`:
                  grounding Repomix + secret-scan PRIMERO), UN comando (`/adopt`), modo `--adopt` de
                  studio-init (no-clobber del package.json del proyecto + marcador `.claude/ADOPTED`).
                  Reconstrucción incremental + grounded + PO artefacto-a-artefacto; `[TO VERIFY]`;
                  read-only hasta G-ADOPT; reenganche al grafo en el gate de madurez real. Reusa
                  security/smoke/diagrams/drift/critic/data-integrity. NO agente nuevo.
```

---

*CA6SNT · Valdivia Chile · Estudio de Agentes v1.6.0 · 2026-06-07*
*Orquestador: Claude Chat / Cowork*
