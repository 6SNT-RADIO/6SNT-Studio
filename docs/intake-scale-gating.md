# PROCESO: intake-scale-gating — gates proporcionales al tamaño

**Propósito.** Que el estudio NO sea burocrático en cambios chicos. El orquestador clasifica cada solicitud al entrar y activa **solo el subset de gates necesario**. Un fix de 2 líneas no pasa por los 10 agentes.

> Origen: scale-adaptive planning (BMAD). Lo aplica el **orquestador** al recibir cada solicitud.

---

## Clasificación (el orquestador decide y lo declara al PO)

| Tamaño | Qué es | Gates que se activan |
|---|---|---|
| **Trivial** | Fix puntual, copy, ajuste de estilo, bug de 1 archivo, sin cambios de datos ni de superficie. | Implementación directa + **QA rápido** (`qa-eyes` smoke). Sin Strategist/Architect/DataModeler. |
| **Estándar** | Feature acotada dentro de una arquitectura ya aprobada; sin nuevas entidades ni stack nuevo. | UX (si toca UI) → Frontend/Backend → **QA** → Security **solo si** toca auth/datos/superficie de ataque. |
| **Complejo** | Producto nuevo, cambio de arquitectura, modelo de datos nuevo, o riesgo alto. | **Pipeline completo 01–10** con todos los gates y aprobación del PO. |

## Reglas
1. La clasificación se **declara explícitamente** al PO al inicio ("esto lo trato como *estándar*: activo UX, Front/Back y QA; omito Strategist y DataModeler porque no hay entidades nuevas"). El PO puede subir el nivel.
2. **Ante la duda, sube un nivel.** Si algo "estándar" toca datos irrecuperables, autenticación o superficie de ataque → Security entra sí o sí (P-02/P-07).
3. Omitir un gate **no** es saltarse sus principios: P-01..P-11 aplican siempre, aunque no haya un agente dedicado revisándolos.
4. Los gates que SÍ se activan conservan su rigor (no se "aligera" la calidad, se ajusta el alcance).

## Por qué importa
Refinar el estudio sin burocracia: la disciplina de gates es una fortaleza, pero aplicarla entera a un cambio trivial es desperdicio (y coste de tokens). Esto la hace proporcional.

**Default al tamaño MÁS PEQUEÑO que encaje (anti-bloat v5.4):** TRIVIAL/ESTÁNDAR corren el subset reducido, NO las 6 gates siempre; COMPLEJO solo cuando de verdad aplica. Evidencia (research): agregar gates de planificación a un pipeline gated AUMENTA el fracaso — el riesgo del estudio es el EXCESO de proceso, no la falta.
