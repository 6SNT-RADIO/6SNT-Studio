# Evals — pre-gate LLM-juez (promptfoo)

Rúbricas máquina de **alto valor** (2–3, anti-burocracia) que puntúan un entregable **antes** de que
el PO lo apruebe en su gate. El PO aprueba algo que **ya pasó la rúbrica máquina**.

- **Herramienta:** [promptfoo](https://promptfoo.dev) **0.121.15** (MIT), vía `npx` — no se instala global.
- **Juez (grader):** **Claude vía la CLI `claude -p`** — ver "Gotcha de auth" abajo.
- **Offline-capable:** sin nube de promptfoo (telemetría/compartir desactivados); las únicas llamadas
  salientes son las del juez Claude (la suscripción ya instalada).

## Las rúbricas

| Archivo | Gate | Qué evalúa | Skill fuente |
|---|---|---|---|
| `brandbook.rubric.yaml` | **G03** | `BRANDBOOK.md` + `TOKENS.css` — Design Score / AI-Slop | brand-evaluation-rubric |
| `architecture.rubric.yaml` | **G04** | `ARCHITECTURE.md` + `src/shared/types.ts` — stack, P-01/02/06, env reproducible, contrato | architecture-decision · env-reproducible |
| `anti-placeholder.rubric.yaml` | apoyo a **08 QA** | cualquier entregable — placeholders no declarados (P-11) | (P-11) |

## Cómo correr

Desde la **raíz del proyecto** (las rutas `file://../X` resuelven relativas al `.yaml`):

```powershell
# desactiva nube de promptfoo (offline)
$env:PROMPTFOO_DISABLE_TELEMETRY='1'; $env:PROMPTFOO_DISABLE_UPDATE='1'; $env:PROMPTFOO_DISABLE_SHARING='1'

npx -y promptfoo@0.121.15 eval -c evals/brandbook.rubric.yaml --no-cache -o evals/_result.json
npx -y promptfoo@0.121.15 eval -c evals/architecture.rubric.yaml --no-cache
npx -y promptfoo@0.121.15 eval -c evals/anti-placeholder.rubric.yaml --no-cache
```

El `score` (0.0–1.0) y el `pass/fail` salen en la tabla; el texto del juicio queda en
`gradingResult.componentResults[].reason` del JSON (`-o`).

## Cómo funciona (flujo)

Puntuamos un **entregable existente** (un archivo), no la salida de un LLM. Por eso:

```
input = contenido del entregable  ──►  provider `echo` (lo devuelve como "output a juzgar")
                                   ──►  assert llm-rubric (la rúbrica = criterios)
                                   ──►  GRADER = claude-cli.js  (Claude juzga y devuelve {reason,score,pass})
```

El **target** es `echo` (passthrough, cero tokens); el único que llama a un LLM es el **grader**.

## Gotcha de auth — el juez es la CLI, SIN API key

El estudio corre con la **suscripción de Claude Code (OAuth)**, no con `ANTHROPIC_API_KEY`. El
provider nativo `anthropic:` de promptfoo **exige esa key** → no sirve aquí. Solución: el grader es
`~/.claude/evals/providers/claude-cli.js`, que ejecuta `claude -p` (ya autenticado) y devuelve su
salida. **No pide API key.** Verificado: corrida real sin ninguna key configurada.

- Si algún día hay `ANTHROPIC_API_KEY`, puedes cambiar el grader a `anthropic:messages:<modelo>` (más
  rápido), pero **no es necesario**.
- El provider corre `claude -p` con `cwd = tmp` (no carga hooks/telemetría del proyecto) y maneja
  errores explícitos (P-06): si `claude -p` falla (no arranca / exit≠0 / timeout / vacío), devuelve
  `{ error }` — promptfoo lo marca como error de grading, **no** como pass falso.

### Normalización de la salida del juez

`claude -p` puede meter preámbulo o envolver el JSON en ```` ```json ````. El provider **normaliza**:
quita los fences y **extrae el objeto `{reason,score,pass}`** (parseo directo → si no, escaneo de
llaves balanceadas buscando las claves `score`/`pass`/`reason`). Así el parser de `llm-rubric`
siempre recibe JSON limpio. Si no hubiera JSON, devuelve el texto crudo (para que el fallo sea visible).

### Warning benigno

Verás `(node) [DEP0190] DeprecationWarning: Passing args to a child process with shell option true…`.
Es esperado: en Windows usamos `shell:true` para que `claude` resuelva el shim `claude.cmd`; los args
son **fijos** (`-p --output-format text`) y el prompt va por **stdin** (no por args), así que no hay
inyección. No afecta el resultado.

## Validación cruzada del juez (Pizarra)

Corrida real de `brandbook.rubric` sobre `BRANDBOOK.md` + `TOKENS.css` (proyecto Pizarra):

| | Self-eval (BRANDBOOK §9) | Juez `claude-cli` |
|---|---|---|
| Design Score | 8.7/10 | **8.3/10 (B+)** · PASS |
| AI-Slop | 1.3/10 | **A · 0/10 anti-patrones** |

El juez **no copió** el 8.7 (lo halló dentro del archivo): puntuó 8.3 con hallazgos **propios**
(faltan tokens de movimiento, un `@media` CSS inválido, desajustes doc↔token). Eso valida que razona,
no parrotea. Para una corrida 100% ciega, audita el archivo sin la sección de autoevaluación.

## Cómo lo usa 08 QA (pre-gate de evals)

Antes de reportar al PO, **08 QA** corre la(s) rúbrica(s) relevante(s) sobre los entregables, adjunta
el `score`/`pass` + el texto del juicio al `QA_REPORT.md`, y resuelve los `fail` antes del gate humano.
Ver `STUDIO.md` → "Pre-gate de evals".

---

## Gotcha — inyectar un archivo de CÓDIGO (.ts/.js) como var de TEXTO  (2026-06-06 · RadioLogVivo)

promptfoo carga las vars `file://` según la EXTENSIÓN: `.md/.css/.txt` se leen como **texto**, pero
**`.ts/.js/.mjs` se IMPORTAN como módulo** y promptfoo **llama** a la función exportada (que debe
devolver `{ output: <valor> }`). Por eso `types: file://../src/shared/types.ts` fallaba con
`TypeError: (intermediate value) is not a function` en `renderPrompt` (antes de llamar al juez).

**Solución (ya aplicada en `architecture.rubric.yaml`):** un loader `read-contract.mjs` que hace
`export default () => ({ output: readFileSync("../src/shared/types.ts","utf8") })`, y la var apunta a
`types: file://./read-contract.mjs`. Para inyectar CUALQUIER `.ts/.js` como texto, usa ese patrón.

**Ojo con `anti-placeholder.rubric.yaml`:** su `target` por defecto es `../README.md` (texto, OK),
pero si lo re-apuntas a un `.ts/.js` tendrás el mismo error → usa el loader, no `file://...ts` directo.

**Runtime:** promptfoo 0.121.15 exige Node `^20.20.0 || >=22.22.0`. Pinea el proyecto en 22.x **≥22.22.0**.
