---
name: smoke-test
description: 'Terminado' incluye un artefacto que ARRANCA: smoke automatico headless con UN comando, pass/fail por exit code y tests/smoke-result.json para la DoD del gate de release. Úsalo para autorar/correr el smoke (08 QA) en cualquier stack.
---

# SKILL: smoke-test — "terminado" incluye que ARRANCA (smoke automático)

**Principio (P-10 · cualquier stack/dominio).** "Terminado" no es solo que compile y pasen los unit
tests: incluye un **artefacto que ARRANCA**, probado por un **smoke automático** con **pass/fail** claro.
El estudio **AUTORA** el smoke; el PO/CI lo corre con **UN comando**. Aplica a cualquier dominio y cualquier
stack (escritorio, web, CLI, servicio): el smoke confirma que el binario/proceso levanta y muestra/expone lo esencial.

> Por qué existe: el QA headless y los unit tests NO cazan fallos de **arranque/integración del artefacto
> empaquetado** (orden de init, rutas de producción, carga del bundle, registro de handlers). Un smoke
> automático sí — y corre **sin un humano mirando**.

## Qué prueba (y qué NO)
- **SÍ:** el artefacto ARRANCA + renderiza/expone lo ESENCIAL (ventana/raíz + 2-3 puntos clave).
- **NO:** lógica de negocio — eso son los unit tests. Tampoco cobertura exhaustiva. El smoke es de ARRANQUE.
- **P-11:** lo no validable sin entorno real (hardware, datos en vivo, red) se **DECLARA diferido**, no se finge.

## Contrato (invariante, cualquier stack)
- **UN comando** (script `smoke`) → **exit 0 = pass / exit 1 = fail**. Apto para CI.
- **Evidencia legible por máquina:** al terminar escribe **`tests/smoke-result.json`** =
  `{ "pass": true|false, "ts": <epoch>, "screenshot": "tests/smoke.png" }`. El **gate de RELEASE lo verifica
  mecánicamente** (DoD): sin `smoke-result.json` con `pass:true` reciente, el release NO cierra.
- Deja también la **captura** (PNG) del arranque.
- **Headless / sin display** (no requiere intervención humana).

## Recipe actual — Electron (la actual, NO la única)
`@playwright/test` con `_electron.launch`:
1. `const app = await electron.launch({ args: ['.'] })` → arranca el proyecto Electron.
2. `const win = await app.firstWindow()` → la **ventana principal abre** (si no, FAIL).
3. Assert **2-3 elementos `data-testid` clave** visibles (raíz + vistas principales; los pone **06 FRONTEND**).
4. `await win.screenshot({ path: 'tests/smoke.png' })` → evidencia visual.
5. **Escribe `tests/smoke-result.json`** `{ pass, ts: Date.now(), screenshot: 'tests/smoke.png' }` (en `finally`,
   para que un fallo también deje `pass:false`). `await app.close()`. Pass/fail por exit code del runner.
- Script único: `"smoke": "playwright test tests/smoke.spec.ts"`. DevDep: `@playwright/test`.
- CI sin display: en Linux envolver con `xvfb-run`; en Windows arranca directo.

## Otros stacks (mismo principio, distinta recipe)
- **Web:** Playwright/Chromium headless → la página carga + selectores clave + screenshot + `smoke-result.json`.
- **CLI:** ejecutar el binario (`--version`/`--help` o un no-op) → exit 0 + salida esperada + `smoke-result.json`.
- **Servicio/API:** arrancar + health-check (p. ej. `/health` 200) → exit 0 + `smoke-result.json`.
El estudio elige la recipe según el stack; el **contrato (un comando · pass/fail · `smoke-result.json` · evidencia ·
arranque-no-lógica)** es idéntico.

## Quién
- **08 QA** AUTORA el smoke y lo deja corriendo pass/fail; **adjunta el screenshot al `QA_REPORT.md`** y deja
  `tests/smoke-result.json` para la DoD del gate de release.
- **06 FRONTEND** pone los `data-testid` en los elementos clave (raíz + vistas principales) que el smoke necesita.
- **04/07** dejan el script `smoke` (UN comando) cableado en los scripts/build del proyecto.
