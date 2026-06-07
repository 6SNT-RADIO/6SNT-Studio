# SKILL: qa-visual-criteria
## Para: Agente 08 — QA
## Versión: 1.0.0

## Principio fundamental
Gate de aceptación: 0 warnings — no es "sin blocking", es sin nada.
Estrategia: blocking primero en loop → luego warnings hasta 0.
Si itera más de 3 veces sobre el mismo problema → parar y escalar.

## Clasificación
BLOCKING: producto no funciona en flujo principal, pérdida de datos,
componente crítico no renderiza, overflow horizontal, error sin mensaje,
performance >3s sin feedback, seguridad comprometida.
WARNING: inconsistencia visual menor, sin skeleton de carga,
texto truncado, spacing fuera de tokens, tipografía fuera de escala,
performance degradada no crítica, accesibilidad básica ausente.

## Dimensión visual
Tipografía: fuentes y tamaños según tokens, peso consistente por nivel.
Layout: sin overflow en ningún breakpoint, espaciados consistentes, sin elementos superpuestos.
Componentes: colores según tokens, radio consistente, estados presentes (default/hover/active/disabled).

## Dimensión funcional
Estados siempre presentes: carga, error, vacío, éxito.
Flujo principal de punta a punta sin errores ni callejones.
Formularios: validación visible, destructivas con confirmación, sin duplicados.

## Dimensión performance — solo medir, nunca proponer soluciones
Carga inicial: FCP <2s. Navegación: transiciones <500ms.
APIs: <500ms consultas simples, blocking si >3s sin feedback.
Reportar con números exactos y condiciones de medición.
Herramientas: DevTools Network/Performance, Playwright, Console.time().

## Estructura del QA_REPORT.md
Resumen (X blocking, Y warnings, estado) →
Blocking findings (ID, descripción, evidencia, impacto, propuesta, estado) →
Warnings (misma estructura) → Métricas de performance → Iteraciones → Estado final

## Errores a evitar
× Passed con warnings pendientes
× Proponer soluciones de performance sin medir
× Continuar en loop después de 3 intentos fallidos
× Reportar "lento" sin número exacto
× Ejecutar acciones destructivas durante el QA
