# SKILL: visualizer
## Para: Agentes 03 (UX/UI) · 05 (Data Modeler) · 06 (Frontend) · 08 (QA)
## Versión: 1.0.0

---

## Propósito

Generar previews vivos de UI y diagramas para validar el diseño antes y
durante el build. Produce un PREVIEW HTML autocontenido y ejecutable de un
componente, layout o diagrama, que consume el `TOKENS.css` del proyecto.

---

## Reglas duras

USAR SIEMPRE:
  ✓ var(--<prefijo>-*) para todo valor visual — CERO hex hardcodeado
  ✓ Fuentes y assets locales — SIN CDN (P-02), el preview corre offline
  ✓ TODOS los estados relevantes: default / activo / disabled / error
  ✓ Movimiento donde importe (p. ej. balística de agujas)
  ✓ Todo dato de ejemplo ROTULADO como placeholder (P-11) — nunca aparentando ser real

NUNCA:
  × Colores hex u otros literales en vez de var(--<prefijo>-*)
  × Recursos por CDN (rompe P-02 y el preview offline)
  × Un solo estado cuando el componente tiene varios
  × Datos de ejemplo que se venden como reales (defecto P-11)

---

## Cuándo la usan

  03 UX/UI        → direcciones visuales y componentes
  05 DATA MODELER → diagramas de datos (mermaid / ER)
  06 FRONTEND     → preview de UI
  08 QA           → inspección visual del gate

---

## Salida

Un archivo `.html` en `docs/` o `previews/` del proyecto.
Autocontenido: abre y corre sin servidor ni red, consumiendo el `TOKENS.css` del proyecto.

---

## Verificación

PASO 1 — Abrir el `.html` (o tomar screenshot).
PASO 2 — Confirmar que los tokens var(--<prefijo>-*) resuelven (nada sin estilo ni color de fallback).
PASO 3 — Confirmar CERO errores en consola.
PASO 4 — Confirmar que cada estado declarado se ve, y que todo placeholder está rotulado (P-11).
