# SKILL: architecture-decision
## Para: Agente 04 — ARCHITECT
## Versión: 1.0.0

## Principio fundamental
El stack sigue al problema. Cada decisión técnica se justifica
en términos del problema que resuelve, no de familiaridad o preferencia.

## Proceso
PASO 1 — Entender el problema: tipo de producto, perfil de usuario,
volumen de datos, requerimientos offline/sync, restricciones de OS/hardware,
herramientas disponibles (Codex, Claude Code). No evaluar tecnologías hasta completar esto.
PASO 2 — Evaluar 2-3 opciones por capa con pros/contras en contexto, no en abstracto.
PASO 3 — Verificar viabilidad: ¿Codex/Claude Code pueden implementarla bien?
¿Documentación suficiente? ¿Dependencias manejables? Si no → documentarlo explícitamente.
PASO 4 — Separar decisiones propias de decisiones que requieren aprobación del PO.
PASO 5 — Documentar lo descartado y por qué — igual de importante que lo elegido.

## Criterios para evaluar una tecnología
✓ Resuelve el problema mejor que las alternativas
✓ Activamente mantenida, comunidad y documentación suficiente
✓ Implementable con herramientas disponibles
✓ Escala con el crecimiento esperado

Alertas: última actualización hace más de 1 año, docs escasas,
dependencias con vulnerabilidades, comunidad inactiva.

## Mantenibilidad arquitectural
✓ Cada módulo con responsabilidad clara
✓ Dependencias explícitas y mínimas entre módulos
✓ Sin lógica crítica en archivos monolíticos
✓ Una IA puede modificar un módulo entendiendo solo ese módulo

## Contexto de herramientas
Claude Chat: no ejecuta código, genera decisiones y documentación.
Claude Code/Codex: mejor con archivos modulares y bien documentados,
dificultad con archivos largos +2000 líneas, necesita contexto explícito en AGENTS.md.

## Estructura del ARCHITECTURE.md
Evaluación de stack → Estructura del sistema → Estructura de carpetas →
Decisiones técnicas → Decisiones pendientes de aprobación → Riesgos → Limitaciones del entorno

## Errores a evitar
× Elegir el stack conocido sin evaluarlo contra el problema
× Mezclar responsabilidades en un módulo
× No documentar lo descartado
× Ignorar el crecimiento esperado
