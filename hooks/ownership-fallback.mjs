#!/usr/bin/env node
// FALLBACK de ownership a nivel settings.json (proyecto) — cubre la ruta TEAMMATE de
// agent-teams, donde los hooks de frontmatter podrian no dispararse. Compone limpio con
// los hooks de frontmatter (un deny redundante esta OK).
//   Wired:  PreToolUse (matcher "Write|Edit") en <proyecto>/.claude/settings.json
//   Exit 2 + stderr => BLOCK.  Exit 0 => ALLOW.
//
// Logica:
//  1) Resuelve el agente actuante via session_id -> agent_type leyendo el team config
//     (~/.claude/teams/<team>/config.json), misma tecnica que lead-guard.mjs.
//  2) Si se resuelve: aplica el veredicto canonico del mapa compartido (== R1/R2).
//  3) Si NO se resuelve: DENY solo si el destino es un entregable PROTEGIDO; si no, ALLOW
//     (fail-open, no rompas trabajo legitimo).
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import os from 'node:os';
import { verdict, isProtectedDeliverable, agentId, normalize } from './ownership-map.mjs';

let d = {};
try { d = JSON.parse(readFileSync(0, 'utf8') || '{}'); } catch { d = {}; }
const tool = d.tool_name || '';
const sid = String(d.session_id || '');
const fp = (d.tool_input && (d.tool_input.file_path || d.tool_input.filePath)) || '';
if (!/^(Write|Edit|MultiEdit|NotebookEdit)$/.test(tool) || !fp) process.exit(0);

// TODO(Fase 4): calibrar session_id -> agente contra un teams/<x>/config.json real.
// Hoy se infiere el campo del session id por value-match (cualquier string del miembro),
// y el agent_type por m.agentType|m.type|valor "NN-..."|m.name. Ajustar al esquema real.
function resolveActingId() {
  if (!sid) return null;
  const teamsDir = process.env.STUDIO_TEAMS_DIR || join(os.homedir(), '.claude', 'teams');
  if (!existsSync(teamsDir)) return null;
  try {
    for (const t of readdirSync(teamsDir)) {
      const cfg = join(teamsDir, t, 'config.json');
      if (!existsSync(cfg)) continue;
      let j = {};
      try { j = JSON.parse(readFileSync(cfg, 'utf8')); } catch { continue; }
      for (const m of (j.members || j.teammates || j.agents || [])) {
        if (!m || typeof m !== 'object') continue;
        const vals = Object.values(m).filter(v => typeof v === 'string');
        if (!vals.includes(sid)) continue;                 // this member is the acting session
        const at = m.agentType || m.agent_type || m.type || vals.find(v => /^\d{2}-/.test(v)) || m.name || '';
        const id = agentId(at);
        if (id) return id;
      }
    }
  } catch { /* ignore */ }
  return null;
}

const actingId = resolveActingId();

if (actingId) {
  // identidad resuelta -> mismo veredicto que R1/R2
  const v = verdict(actingId, tool, fp);
  if (!v.allow) { process.stderr.write('(fallback) ' + v.reason + '\n'); process.exit(2); }
  process.exit(0);
}

// identidad NO resuelta -> protege solo entregables nombrados; el resto fail-open
if (isProtectedDeliverable(fp)) {
  const { norm } = normalize(fp);
  process.stderr.write(`RC-05 (fallback): identidad del actuante no resoluble y ${norm} es un entregable protegido del mapa de propiedad. NIEGA por defecto — escala al lead para confirmar autoria.\n`);
  process.exit(2);
}
process.exit(0); // fuera de la lista protegida -> ALLOW (fail-open)
