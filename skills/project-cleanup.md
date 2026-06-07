# SKILL: project-cleanup
## Para: Agente 10 — TECHNICAL WRITER
## Versión: 1.0.0

## Principio fundamental
Criterio de eliminación: "¿Este archivo le sirve a alguien que trabaja en el proyecto hoy?"
Si NO → candidato a eliminar. Sin cuarentena. Sin archivar. Sin "por si acaso".
Con aprobación del orquestador → eliminar definitivamente.
Si está en Git, está en el historial. No necesita existir activo.

## Proceso
PASO 1 — Inventario: listar todos los archivos no-código con nombre, fecha, tamaño, descripción.
PASO 2 — Clasificar: ACTIVO (no tocar) / OBSOLETO (candidato) / HISTÓRICO (evaluar) / DUPLICADO (eliminar viejo).
PASO 3 — Lista de candidatos: nombre, por qué es candidato, qué lo reemplaza, riesgo (bajo/medio/alto).
PASO 4 — Presentar CLEANUP_LIST.md al orquestador. No eliminar nada sin aprobación.
PASO 5 — Con aprobación → eliminar y reportar.

## OBSOLETO — eliminar con aprobación
Prompts de versiones anteriores, specs de features ya construidas,
reportes de QA resueltos, archivos de experimentación sin uso,
documentos intermedios con versión final aprobada.

## HISTÓRICO — evaluar antes de decidir
Decisiones de arquitectura (conservar si explican descartados),
changelogs muy antiguos (si la info ya está en Git → eliminar),
specs de features canceladas (eliminar — si se retoman, se rediseñan).

## NUNCA ELIMINAR sin consenso
× AGENTS.md, README.md, CLAUDE.md activos
× Runbooks de procesos en uso
× Contratos de APIs activos
× Archivos que el código referencia directamente
× .env.example y configs del entorno

## Señales de raíz contaminada
Más de 5 .md en raíz fuera de los estándar, archivos con nombres
"prompt_X/fix_v1/issues_vX/spec_borrador", múltiples versiones del mismo doc,
archivos de más de 3 meses sin modificar, más docs que código.

## Estructura del CLEANUP_LIST.md
Resumen (inventariados/candidatos/conservados) →
Tabla candidatos (archivo/categoría/razón/riesgo/reemplazado por) →
Archivos conservados con descripción → Pendiente de decisión

## Errores a evitar
× Eliminar sin lista aprobada
× Archivar en old/ o backup/ en vez de eliminar
× Eliminar archivos que el código referencia
× "Por si acaso" como criterio de conservación
