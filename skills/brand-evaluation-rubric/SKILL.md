---
name: brand-evaluation-rubric
description: Calificar identidad visual con dos puntajes A-F (Design Score / AI-Slop) y un detector de 10 anti-patrones — vuelve medible el principio P-03. Úsalo en 03 (al cerrar BRANDBOOK) y en 08 (gate de QA, sobre la app real).
---

# SKILL: brand-evaluation-rubric — Design Score / AI-Slop (Agentes 03 y 08)

**Propósito.** Volver **medible** el principio P-03 ("sin genérico, con personalidad propia"). Deja de ser opinión: dos puntajes con nota A–F y evidencia.

> Origen: adaptado de gstack `/plan-design-review`. Lo usa el Agente 03 (al cerrar BRANDBOOK) y el Agente 08 (en el gate de QA, sobre la app real).

---

## Dos puntajes
- **Design Score (A–F):** ¿tiene personalidad, jerarquía, coherencia, intención?
- **AI-Slop Score (A–F):** ¿cuánto se parece a "lo hizo una IA sin gusto"? (A = nada de slop; F = plantilla pura.)

Reporta primero la **reacción de un vistazo** (3 frases): qué comunica, a qué va el ojo primero, y un **veredicto en UNA palabra**. Eso es lo más valioso; el resto es evidencia.

---

## Detector de AI-Slop (10 anti-patrones — cada uno presente baja la nota)
1. Gradiente morado/azul de héroe.
2. Grid de 3 columnas con iconos en círculos.
3. `Inter` (u otra sans neutra) en TODO, sin segunda fuente de display.
4. Todo centrado, sin asimetría ni foco.
5. `border-radius` uniforme y burbujeante en todo.
6. Blobs/decoraciones flotantes sin función.
7. Escala de títulos plana (36/24/18 sin drama).
8. Espaciado sin ritmo (todo 16/24, sin grid real).
9. Botón "Get Started"/CTA idéntico al de cualquier SaaS.
10. Paleta sin intención (>12 colores no-grises, o un acento sin reglas de uso).

## Categorías a calificar (A–F cada una)
Tipografía · Espaciado/ritmo · Jerarquía · Color · Estados de interacción · Movimiento · Densidad/foco · Coherencia con la identidad declarada (BRANDBOOK/TOKENS) · Personalidad (¿memorable o plantilla?) · Accesibilidad visual (contraste).

---

## Salida
```
Design Score: B+   |   AI-Slop Score: A-
Vistazo: "Se siente como un marcador de esports, no un SaaS. El ojo va al win rate.
          En una palabra: competitivo."
AI-Slop: 0/10 anti-patrones presentes (sin gradiente, sin grid de 3 col, 2 fuentes...).
Top mejoras: 1) ... (severidad) 2) ...
```
- Para el Agente 03: si AI-Slop < A- o Design < B, **itera antes** de cerrar el gate.
- Para el Agente 08: corre la rúbrica **sobre la app real** (con `qa-eyes`), no sobre el mockup.
- Cero hex/fuentes hardcodeadas fuera de los tokens = requisito, no opinión.
