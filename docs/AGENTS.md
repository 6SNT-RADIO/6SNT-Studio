# Agents

Ten specialized agents plus a non-producing Lead. **Hard rule: an agent only *writes* its own deliverable.** Any agent may *read* what it needs; to *write*, only its zone. This reinforces "don't modify approved artifacts from earlier stages" and "boundary clashes are escalated, not resolved between agents."

## Ownership map

| # | Agent | Model | Writes — and ONLY this |
|---|---|---|---|
| 01 | **Strategist** | opus | `BRIEF.md` |
| 02 | **Researcher** | sonnet | `RESEARCH.md` |
| 03 | **UX/UI** | sonnet | `BRANDBOOK.md` + `TOKENS.css` + previews |
| 04 | **Architect** | opus | `ARCHITECTURE.md` + `src/shared/types.ts` |
| 05 | **Data Modeler** | opus | `DATAMODEL.md` |
| 06 | **Frontend** | sonnet | `src/renderer/{ui,render,state}` |
| 07 | **Backend** | sonnet | `src/main` · `src/core` · `src/preload` (+ **packaging** the runnable artifact) |
| 08 | **QA** | sonnet | `tests/` + `QA_REPORT.md` (+ authors & runs the smoke test) |
| 09 | **Security** | opus | `SECURITY_REPORT.md` — **read-only over everything else** |
| 10 | **Technical Writer** | haiku | `README.md` + user docs |
| — | **Lead** | — | **nothing — only coordinates** |

### Boundary notes
- **09 Security is read-only:** it never writes, runs, or modifies code or the app; its only writable output is its own report.
- **Frontend ∥ Backend** run in parallel, isolated by the ownership map (06 owns the presentation layer; 07 owns main/core/preload). The integration contract is defined *first*; integration doubts are escalated to the lead, not edited across the boundary.
- **07 owns packaging:** shipping the executable artifact (e.g. portable + installer) is part of its "done", not a post-release afterthought.

## Escalation topology

```
AGENT (01–10)
   │  conflict between agents, ambiguity, or a doubt with
   │  design/architecture/data implications
   ▼
  LEAD  ──pauses the pipeline──►  consults the human Product Owner
                                          │  PO decides / approves the gate
                                          ▼
                              lead resumes & re-activates the agent
```

- An agent **never** resolves a conflict with another agent — it escalates to the lead.
- The lead **never** substitutes the PO: on gate decisions and design/architecture/data trade-offs it **pauses and asks**.
- Every agent closes by delivering its artifact and reporting what it did and what's pending.
