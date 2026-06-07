# SKILL: qa-eyes — QA con ojos (Agente 08)

**Propósito.** El QA no debe depender del PO para "ver" la app. Con este skill, el Agente 08 **conduce la aplicación real**, toma capturas, verifica estados y **caza placeholders/mocks disfrazados de real** — automáticamente.

> Origen: adaptado de gstack `/browse` + `/qa`. gstack usa Playwright (web); nosotros priorizamos **escritorio** vía computer-use.

---

## Herramienta según el tipo de app
- **App de escritorio (Electron, nativa):** `computer-use` MCP — `request_access` a la app, `screenshot`, `left_click`, `type`, `key`, `scroll`. ES el camino correcto para apps nativas.
- **App web:** Claude-in-Chrome MCP (`navigate`, `get_page_text`, `screenshot`, `read_console_messages`).
- Nunca afirmes un estado sin haberlo **visto** en una captura. Cero "debería funcionar".

---

## Protocolo (un pase de QA)
1. **Arranca la app** según su README (anótalo si requiere pasos no obvios — p. ej. build + Node concreto). Si no arranca, eso ya es un hallazgo **blocking**.
2. **Recorre cada feature** del BRIEF. Por cada una: captura → compara contra el comportamiento esperado (BRANDBOOK/DATAMODEL) → registra con evidencia (ruta de la captura).
3. **Camino de escritura** (lo crítico): crea un dato real, **cierra y reabre**, confirma que persiste. No asumas persistencia: verifícala.
4. **Estados:** carga, vacío, error (provoca uno), éxito.
5. **Consola/logs:** sin errores no manejados (P-06).

---

## ⭐ Auditoría anti-placeholder (OBLIGATORIA — P-11)
Por cada dato/asset visible, pregunta: **¿esto es real o un relleno?** Caza activamente:
- Valores fijos que no cambian con la entrada (señal de mock).
- Iconos/imágenes con iniciales/cuadros vacíos donde debería haber arte real.
- Features que "responden" idéntico sin importar el input (OCR que devuelve siempre lo mismo, listas sembradas).
- Banners tipo "modo desarrollo / datos de ejemplo" en un build que se presenta como real.
Para cada hallazgo: ¿está **declarado** como diferido (backlog) o se **vende como real**? Lo segundo es un **defecto blocking**, no una nota.

---

## Salida: `docs/QA_REPORT.md`
- **Health Score (0-100)** + conteo por severidad: `blocking / warning / nota`.
- Cada hallazgo: descripción + **captura** + cómo reproducir + severidad.
- Sección **Anti-placeholder** explícita (qué es real, qué es relleno, qué se vende mal).
- **Veredicto del gate:** 0 blocking para aprobar. Lo diferido y **declarado** (PHASE2_BACKLOG) va como "fuera de alcance", no como defecto.
- No arregles el código: **reporta**. El orquestador decide quién itera.

## Ejemplo (1 línea de cada tipo)
- ✅ Real: "Registré Maokai 2/4/17 → Dashboard muestra win rate 100%, KDA 6.3; persiste tras reabrir (captura qa-03.png)."
- ❌ Placeholder vendido como real: "OCR devuelve Yasuo 8/3/11 para CUALQUIER captura → no lee la imagen; el botón sugiere que sí. BLOCKING salvo que se oculte/marque 'próximamente'."

---

## Prioriza por riesgo (no cobertura exhaustiva)
Testea primero lo de mayor impacto y probabilidad de fallo: datos irrecuperables, dinero,
autenticación, y el flujo crítico del BRIEF. No persigas testear todo. Declara en el reporte
qué se priorizó y qué se omitió por bajo riesgo (con una línea de por qué).
