#!/usr/bin/env node
// R5 — TeammateIdle: a teammate should not go idle while reclaimable work remains.
//   reclaimable task (pending, unblocked, unassigned)  -> exit 2 (keep working)
//   only human-decision / approval / blocked work left -> exit 0 + notify the lead (pause)
//   nothing pending                                     -> exit 0 (idle OK)
// Wired from project settings.json "TeammateIdle" (no matcher). Tasks live at
// ~/.claude/tasks/<team>/ (overridable for tests via STUDIO_TASKS_DIR).
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import os from 'node:os';

let d = {};
try { d = JSON.parse(readFileSync(0, 'utf8') || '{}'); } catch { d = {}; }
const team = d.team_name || d.team || '';
const tasksRoot = process.env.STUDIO_TASKS_DIR || join(os.homedir(), '.claude', 'tasks');

function dirsToScan() {
  if (!existsSync(tasksRoot)) return [];
  if (team && existsSync(join(tasksRoot, team))) return [join(tasksRoot, team)];
  const out = [];
  for (const t of readdirSync(tasksRoot)) {
    const p = join(tasksRoot, t);
    try { if (statSync(p).isDirectory()) out.push(p); } catch { /* skip */ }
  }
  return out;
}
function loadTasks() {
  const tasks = [];
  for (const dir of dirsToScan()) {
    let files = [];
    try { files = readdirSync(dir); } catch { continue; }
    for (const f of files) {
      if (!f.endsWith('.json')) continue;
      try {
        const j = JSON.parse(readFileSync(join(dir, f), 'utf8'));
        if (Array.isArray(j)) tasks.push(...j); else tasks.push(j);
      } catch { /* skip */ }
    }
  }
  return tasks;
}

const tasks = loadTasks();
const idOf = t => String(t.id || t.task_id || t.subject || '');
const statusOf = t => String(t.status || t.state || '').toLowerCase();
const assigneeOf = t => t.assignee || t.assigned_to || t.owner || t.claimedBy || t.claimed_by || null;
const depsOf = t => { const x = t.dependsOn || t.depends_on || t.dependencies || t.blockedBy || []; return Array.isArray(x) ? x : [x]; };

const done = new Set();
for (const t of tasks) if (/(done|complete)/.test(statusOf(t))) done.add(idOf(t));
const isBlocked = t => depsOf(t).some(x => x && !done.has(String(x)));
const needsHuman = t => /(approval|approve|gate|\bpo\b|product owner|human|await|decision|aprob|humano|decision)/
  .test(`${t.subject || t.task_subject || ''} ${t.description || ''} ${statusOf(t)}`.toLowerCase());

// Real task schema (~/.claude/tasks/<team>/<n>.json): { id, subject, description, status, blocks[], blockedBy[] }.
const live = tasks.filter(t => !done.has(idOf(t)) && !/(done|complete|cancel|abandon)/.test(statusOf(t)));
const claimableStatus = t => /(pending|todo|open|claimable|unassigned|ready)/.test(statusOf(t)); // excludes in_progress/active (someone is on it)
const reclaimable = live.filter(t => claimableStatus(t) && !assigneeOf(t) && !isBlocked(t) && !needsHuman(t));
const humanPending = live.filter(t => needsHuman(t) || isBlocked(t));

if (reclaimable.length > 0) {
  const names = reclaimable.slice(0, 5).map(t => t.subject || t.task_subject || idOf(t) || '(tarea)').join('; ');
  process.stderr.write(`R5: quedan ${reclaimable.length} tarea(s) reclamable(s) — continua antes de quedar idle: ${names}\n`);
  process.exit(2);
}
if (humanPending.length > 0) {
  // Cannot SendMessage from a hook; surface a system message so the lead pauses and consults the PO.
  process.stdout.write(JSON.stringify({
    systemMessage: `R5: sin tareas reclamables; ${humanPending.length} requieren decision humana/aprobacion del PO. Pausando y avisando al lead.`,
    hookSpecificOutput: { hookEventName: 'TeammateIdle' },
  }));
  process.exit(0);
}
process.exit(0); // nothing reclaimable, nothing pending -> idle OK
