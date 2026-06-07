#!/usr/bin/env node
// R3 — the team LEAD/orchestrator only coordinates; it must not Write/Edit/Bash.
// Wired from project settings.json PreToolUse (matcher "Write|Edit|Bash").
//
// Teammates are full sessions that ALSO read this settings.json, so they hit this hook too —
// they are ALLOWED here (their own frontmatter ownership-guard governs their writes).
// Only the lead of an ACTIVE team is blocked. With no active team => allow (lead role not in
// effect), so normal solo sessions are never restricted.  Identity is resolved from the live
// team config: ~/.claude/teams/<team>/config.json (members[] carry teammate session ids).
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import os from 'node:os';

let d = {};
try { d = JSON.parse(readFileSync(0, 'utf8') || '{}'); } catch { d = {}; }
const tool = d.tool_name || '';
const sid = String(d.session_id || '');
if (!/^(Write|Edit|MultiEdit|NotebookEdit|Bash)$/.test(tool)) process.exit(0);

const teamsDir = process.env.STUDIO_TEAMS_DIR || join(os.homedir(), '.claude', 'teams');
if (!existsSync(teamsDir)) process.exit(0);                    // teams never used -> allow

const teammateSids = new Set();
const leadSids = new Set();
let anyTeam = false;
try {
  for (const t of readdirSync(teamsDir)) {
    const cfg = join(teamsDir, t, 'config.json');
    if (!existsSync(cfg)) continue;
    anyTeam = true;
    let j = {};
    try { j = JSON.parse(readFileSync(cfg, 'utf8')); } catch { continue; }
    // Match the acting session_id against ANY string value in a member object, so detection
    // is robust to the real (unobserved) field name for a teammate's session id. Session ids
    // are long unique strings, so a false match against a name/agentType is effectively impossible.
    for (const m of (j.members || j.teammates || j.agents || [])) {
      if (m && typeof m === 'object') {
        for (const v of Object.values(m)) if (typeof v === 'string') teammateSids.add(v);
      } else if (typeof m === 'string') {
        teammateSids.add(m);
      }
    }
    for (const key of ['lead', 'leadSessionId', 'lead_session_id', 'leadSession']) {
      const v = j[key];
      if (typeof v === 'string') leadSids.add(v);
      else if (v && (v.sessionId || v.session_id)) leadSids.add(String(v.sessionId || v.session_id));
    }
  }
} catch { /* ignore */ }

function block() {
  process.stderr.write(`R3: el LEAD/orquestador solo coordina — no ejecuta ${tool}. Delega en un teammate (TaskCreate / SendMessage) o consulta al PO. (sesion ${sid || '?'})\n`);
  process.exit(2);
}

if (!anyTeam) process.exit(0);                                 // no active team -> allow
if (sid && teammateSids.has(sid)) process.exit(0);             // this session is a teammate -> allow
if (sid && leadSids.has(sid)) block();                         // explicit lead -> block
if (teammateSids.size > 0 && sid && !teammateSids.has(sid)) block(); // active team & not a teammate -> lead
process.exit(0);                                               // cannot determine -> fail open (never break teammates)
