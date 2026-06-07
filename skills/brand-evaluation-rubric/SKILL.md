---
name: brand-evaluation-rubric
description: "Grade visual identity with two A-F scores (Design Score / AI-Slop) and a 10 anti-pattern detector — makes principle P-03 measurable. Use it in 03 (closing BRANDBOOK) and 08 (QA gate, on the real app)."
---

# SKILL: brand-evaluation-rubric — Design Score / AI-Slop (Agents 03 and 08)

**Purpose.** Make principle P-03 ("nothing generic, with its own personality") **measurable**. It stops being opinion: two scores with an A–F grade and evidence.

> Origin: adapted from gstack `/plan-design-review`. Used by Agent 03 (closing BRANDBOOK) and Agent 08 (at the QA gate, on the real app).

---

## Two scores
- **Design Score (A–F):** does it have personality, hierarchy, coherence, intent?
- **AI-Slop Score (A–F):** how much does it look like "made by an AI with no taste"? (A = no slop; F = pure template.)

Report the **at-a-glance reaction** first (3 sentences): what it communicates, where the eye goes first, and a **one-word verdict**. That's the most valuable part; the rest is evidence.

---

## AI-Slop detector (10 anti-patterns — each present lowers the grade)
1. Purple/blue hero gradient.
2. 3-column grid with icons in circles.
3. `Inter` (or another neutral sans) on EVERYTHING, with no second display font.
4. Everything centered, no asymmetry or focus.
5. Uniform, bubbly `border-radius` everywhere.
6. Floating blobs/decorations with no function.
7. Flat heading scale (36/24/18 with no drama).
8. Spacing with no rhythm (all 16/24, no real grid).
9. "Get Started"/CTA button identical to any SaaS.
10. Palette with no intent (>12 non-grey colors, or an accent with no usage rules).

## Categories to grade (A–F each)
Typography · Spacing/rhythm · Hierarchy · Color · Interaction states · Motion · Density/focus · Coherence with the declared identity (BRANDBOOK/TOKENS) · Personality (memorable or template?) · Visual accessibility (contrast).

---

## Output
```
Design Score: B+   |   AI-Slop Score: A-
Glance: "Feels like an esports scoreboard, not a SaaS. The eye goes to the win rate.
         In one word: competitive."
AI-Slop: 0/10 anti-patterns present (no gradient, no 3-col grid, 2 fonts...).
Top improvements: 1) ... (severity) 2) ...
```
- For Agent 03: if AI-Slop < A- or Design < B, **iterate before** closing the gate.
- For Agent 08: run the rubric **on the real app** (with `qa-eyes`), not on the mockup.
- Zero hardcoded hex/fonts outside the tokens = a requirement, not an opinion.
