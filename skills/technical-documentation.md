# SKILL: technical-documentation
## Para: Agente 10 — TECHNICAL WRITER
## Versión: 1.0.0

## Principio fundamental
La documentación documenta la realidad — no el ideal.
Si el código dice una cosa y la documentación dice otra, el código manda.
No se escribe documentación aspiracional — solo lo que existe hoy.

## Audiencias
Product Owner: README.md (arrancar el proyecto), runbooks operativos, CHANGELOG.md.
Criterios: lenguaje claro, sin jerga, paso a paso, sin asumir conocimiento técnico.

IA ejecutora: AGENTS.md (contexto + reglas + restricciones), CLAUDE.md/CODEX.md,
contratos de APIs, docstrings en módulos críticos.
Criterios: explícito sobre qué NO hacer, rutas exactas, sin ambigüedades.

Ambas: runbooks técnico-operativos, decisiones de arquitectura.
Separar secciones por audiencia — humanos primero, IA después.

## Proceso
PASO 1 — Verificar existente: qué está desactualizado, qué falta, qué sobra.
PASO 2 — Actualizar antes de crear. Marcar deuda técnica si no se puede actualizar.
PASO 3 — Escribir solo lo que no existe y es necesario.
Regla: 3 archivos de código no necesitan 10 de documentación.
PASO 4 — Declarar deuda técnica explícitamente si el código está mal construido.

## Estructura mínima por documento
README.md: Qué es → Requisitos → Cómo arrancar → Cómo se usa → Estructura del proyecto.
AGENTS.md: Identidad → Reglas inamovibles → Arquitectura → Estado actual → Flujo de trabajo.
Contratos API: método/ruta, descripción, parámetros, respuesta, errores, restricciones.
Runbooks: título, cuándo usarlo, prerrequisitos, pasos exactos, qué hacer si falla.

## Señales de documentación desactualizada
⚠ Referencia archivos que no existen
⚠ Rutas no coinciden con la estructura real
⚠ Comandos que no funcionan al ejecutarlos
⚠ Reglas de AGENTS.md que no coinciden con el comportamiento real

## Documentación buena vs mala
Buena: persona nueva arranca sin preguntar, IA modifica sin romper nada crítico,
rutas y reglas coinciden con la realidad.
Mala: hay que leer el código para entender la doc, instrucciones que no funcionan en todas las máquinas,
doc más larga que el código que documenta.

## Errores a evitar
× Documentar el ideal en vez de la realidad
× Dejar desactualizada sin marcarla
× Duplicar información entre documentos
× Usar jerga en documentos para el PO
× Omitir restricciones en AGENTS.md
× Producir más documentación que la que se consume
