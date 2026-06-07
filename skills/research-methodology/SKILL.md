---
name: research-methodology
description: Para el Researcher (02). Investigar el contexto externo desde el brief, reutilizar antes de construir (plugins/MCPs/APIs/librerías), con recomendación explícita y fuentes calificadas. Úsalo al armar el RESEARCH.md.
---

# SKILL: research-methodology
## Para: Agente 02 — RESEARCHER
## Versión: 1.0.0

## Propósito
Este skill define cómo investigar el contexto externo de un proyecto.
El objetivo es entregar información accionable. Cada hallazgo debe tener
contexto suficiente para que el orquestador y el PO puedan decidir.

## Principio fundamental
Antes de recomendar construir algo, verificar que no existe.
Antes de recomendar una tecnología, verificar que resuelve el problema específico.
Nunca investigar en abstracto — siempre en relación al brief.

## Proceso
PASO 1 — Leer el brief completo. Identificar el problema central, usuario,
restricciones y lo que explícitamente NO es el producto.
PASO 2 — Buscar en orden: herramientas completas → plugins/MCPs/APIs → librerías → patrones.
Por cada solución: qué resuelve, qué no, licencia, madurez, integración con el stack.
PASO 3 — Analizar 3-5 productos similares: qué hacen bien, qué mal, diferenciador.
PASO 4 — Explorar tangentes si cambiarían alguna decisión del proyecto.
PASO 5 — Armar el reporte con recomendación explícita por sección.

## Criterios de fuentes
ALTA: documentación oficial, GitHub activo, changelog reciente, casos reales.
MEDIA: artículos técnicos recientes, comparativas con metodología.
DESCARTAR: marketing sin evidencia, artículos sin fecha, opiniones sin contexto.

## Recomendar integrar si:
Resuelve mejor de lo que podríamos construir, costo menor, activamente mantenido, licencia compatible.

## Recomendar construir si:
No existe nada que resuelva el problema específico, o las dependencias complican más de lo que ayudan.

## Estructura del RESEARCH.md
Resumen ejecutivo → Soluciones existentes → Productos similares →
Tecnologías relevantes → Patrones → Riesgos → Oportunidades → Recomendación final

## Errores a evitar
× Investigar sin leer el brief primero
× Recomendar sin verificar licencia
× Confundir popular con adecuado para este proyecto
× Presentar links sin contexto
