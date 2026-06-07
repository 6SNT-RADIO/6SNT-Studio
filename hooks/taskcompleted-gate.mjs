#!/usr/bin/env node
// R4 — TaskCompleted gate: when a task is marked complete, run a LIGHT, REAL check.
//   code task -> typecheck/tests/build (whichever npm script exists) must pass
//   doc  task -> the declared deliverable file exists and is non-empty
// Wired from project settings.json "TaskCompleted" (no matcher; fires on completion).
// Exit 2 + stderr => prevent completion & feed feedback.  Exit 0 => allow.
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

let d = {};
try { d = JSON.parse(readFileSync(0, 'utf8') || '{}'); } catch { d = {}; }
const cwd = d.cwd || process.cwd();
const subj = String(d.task_subject || d.subject || (d.task && d.task.subject) || '');
const desc = String(d.task_description || d.description || (d.task && d.task.description) || '');
const agentType = String(d.agent_type || d.teammate_agent_type || (d.task && d.task.agent_type) || '');
const text = `${subj} ${desc} ${agentType}`.toLowerCase();

function fail(m) { process.stderr.write('R4: ' + m + '\n'); process.exit(2); }

// --- G-hardening (v4.3): una GATE· no se cierra sin aprobación EXPLÍCITA del PO -------------
// Vuelve mecánico P-05 ("ningún gate se cruza sin aprobación del PO"). El lead fija
// metadata.approved_by:"PO" SOLO tras el visto bueno explícito; sin eso, exit 2.
// ── DoD mecánica del gate de RELEASE (Upgrade Pack v5.2) — DETERMINISTA, sin LLM ──────────────
// Regla general (domain/stack-neutral): RELEASE no cierra sin (a) un ARTEFACTO ejecutable, (b) un
// SMOKE que pasó (evidencia máquina), y (c) los ASSETS provisionados si el proyecto los declara.
// Las rutas vienen de convención o de un manifest mínimo <cwd>/dod.manifest.json (NO se hardcodean).
function dodManifest(cwd) {
  const p = join(cwd, 'dod.manifest.json');
  if (!existsSync(p)) return {};
  try { const m = JSON.parse(readFileSync(p, 'utf8')); return (m && typeof m === 'object') ? m : {}; }
  catch { return { __parseError: true }; }
}
function fileSize(p) { try { return statSync(p).size; } catch { return -1; } }
function walkFind(dir, pred, depth) {
  if (depth == null) depth = 6;
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return null; }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) { if (depth > 0) { const r = walkFind(full, pred, depth - 1); if (r) return r; } }
    else if (pred(e.name, full)) { return full; }
  }
  return null;
}
function dirHasRealData(dir) {
  // al menos un archivo no-stub (no *.version / .gitkeep) con tamaño > 0
  return !!walkFind(dir, (name, full) => {
    const n = name.toLowerCase();
    if (n.endsWith('.version') || n === '.gitkeep') return false;
    return fileSize(full) > 0;
  });
}
function checkReleaseDoD(cwd) {
  const errs = [];
  const m = dodManifest(cwd);
  if (m.__parseError) errs.push('dod.manifest.json existe pero no es JSON valido.');

  // (a) ARTEFACTO ejecutable
  if (Array.isArray(m.artifacts) && m.artifacts.length) {
    if (!m.artifacts.some((rp) => existsSync(join(cwd, rp)) && fileSize(join(cwd, rp)) > 0))
      errs.push('ARTEFACTO: ninguno de los artifacts declarados en dod.manifest.json existe/no-vacio: ' + m.artifacts.join(', ') + '.');
  } else {
    const dirs = (Array.isArray(m.artifactDirs) && m.artifactDirs.length) ? m.artifactDirs : ['release', 'dist'];
    const exts = (Array.isArray(m.artifactExts) && m.artifactExts.length) ? m.artifactExts
      : ['.exe', '.msi', '.app', '.dmg', '.pkg', '.appimage', '.deb', '.rpm', '.snap', '.apk', '.bin'];
    let found = false;
    for (const d of dirs) {
      const dd = join(cwd, d);
      if (!existsSync(dd)) continue;
      if (walkFind(dd, (name) => { const n = name.toLowerCase(); return exts.some((x) => n.endsWith(x.toLowerCase())); })) { found = true; break; }
    }
    if (!found) errs.push('ARTEFACTO ejecutable: no hay binario (' + exts.join('/') + ') bajo ' + dirs.join(' o ') + '/. Empaqueta el release (o declara la ruta en dod.manifest.json: artifacts / artifactDirs / artifactExts).');
  }

  // (b) SMOKE paso (evidencia maquina)
  const smokeRel = (typeof m.smokeResult === 'string' && m.smokeResult) ? m.smokeResult : 'tests/smoke-result.json';
  const smokeP = join(cwd, smokeRel);
  if (!existsSync(smokeP)) {
    errs.push('SMOKE: falta ' + smokeRel + ' — corre el smoke (p. ej. `npm run smoke`). El release exige un smoke que arranque el artefacto.');
  } else {
    let r = null;
    try { r = JSON.parse(readFileSync(smokeP, 'utf8')); } catch { errs.push('SMOKE: ' + smokeRel + ' no parsea (JSON invalido).'); }
    if (r) {
      if (r.pass !== true) errs.push('SMOKE: el ultimo resultado NO es pass (pass=' + JSON.stringify(r.pass) + '). Arregla el arranque y re-corre el smoke.');
      const rawTs = typeof r.ts === 'number' ? r.ts : 0;
      const tsMs = (rawTs > 0 && rawTs < 1e12) ? rawTs * 1000 : rawTs; // acepta epoch en s o ms
      const maxAgeH = (typeof m.smokeMaxAgeHours === 'number') ? m.smokeMaxAgeHours : 72;
      const ageMs = Date.now() - tsMs;
      if (!tsMs || ageMs < 0 || ageMs > maxAgeH * 3600 * 1000)
        errs.push('SMOKE: el resultado es viejo o sin ts valido (debe ser de las ultimas ' + maxAgeH + 'h, sobre el build actual). Re-corre el smoke.');
    }
  }

  // (c) ASSETS provisionados (solo si el proyecto los declara)
  if (typeof m.assetsDir === 'string' && m.assetsDir) {
    if (!dirHasRealData(join(cwd, m.assetsDir))) errs.push('ASSETS: ' + m.assetsDir + '/ vacio o solo stubs (declarado en dod.manifest.json).');
  } else if (Array.isArray(m.assets) && m.assets.length) {
    const missing = m.assets.filter((rp) => !(existsSync(join(cwd, rp)) && fileSize(join(cwd, rp)) > 0));
    if (missing.length) errs.push('ASSETS: faltan/vacios los assets declarados: ' + missing.join(', ') + '.');
  } else {
    // convencion: si el proyecto provisiona (script fetch-assets) o tiene data/, exige data/ real
    let usesFetch = false;
    const pkgP = join(cwd, 'package.json');
    if (existsSync(pkgP)) { try { const j = JSON.parse(readFileSync(pkgP, 'utf8')); usesFetch = !!(j && j.scripts && (j.scripts['fetch-assets'] || j.scripts['fetch:assets'])); } catch { /* */ } }
    const dataDir = join(cwd, 'data');
    if (usesFetch || existsSync(dataDir)) {
      if (!dirHasRealData(dataDir)) errs.push('ASSETS: el proyecto provisiona datos (script fetch-assets o data/) pero data/ esta vacio o solo tiene stubs. Corre `npm run fetch-assets` (o build:all).');
    }
  }

  return errs;
}

function readMeta(o) {
  let m = o.metadata ?? o.task_metadata ?? (o.task && o.task.metadata) ?? {};
  if (typeof m === 'string') { try { m = JSON.parse(m); } catch { m = {}; } }
  return (m && typeof m === 'object') ? m : {};
}
const isGate = /^\s*GATE[·‧•]/.test(subj); // "GATE·..." (·, ‧, • por robustez)
if (isGate) {
  const meta = readMeta(d);
  const approver = String(meta.approved_by ?? meta.approvedBy ?? meta.approved ?? '');
  // El payload TaskCompleted de este build NO entrega la metadata de la tarea (Claude Code
  // #27556 / #21356; verificado 2026-06-06 · RadioLogVivo). El subject SÍ se entrega → la
  // aprobación del PO se marca con "[PO-OK]" en el subject. metadata.approved_by queda como fallback.
  const subjOK = /\[PO-OK\]/i.test(subj);
  if (approver !== 'PO' && !subjOK) {
    fail(`GATE "${subj.trim()}" no se cierra sin aprobación del PO. Falta el marcador [PO-OK] en el ` +
      `subject (o metadata.approved_by:"PO" si el build lo entrega; actual: ${approver || '∅'}). El lead ` +
      `lo añade SOLO tras el OK explícito del Product Owner (P-05): TaskUpdate {taskId:"<Gxx>", ` +
      `subject:"<subject actual> [PO-OK]"} y luego status:"completed".`);
  }
  // ── DoD mecanica del gate de RELEASE (Upgrade Pack v5.2) — DETERMINISTA, sin LLM ───────────
  // El [PO-OK]/approved_by ya paso arriba (P-05 intacto). Esto es la capa Definition-of-Done:
  // RELEASE no cierra sin (a) artefacto ejecutable + (b) smoke pass reciente + (c) assets provisionados.
  if (/^\s*GATE[·‧•]\s*RELEASE/i.test(subj)) {
    const dodErrs = checkReleaseDoD(cwd);
    if (dodErrs.length) {
      fail('GATE·RELEASE — Definition-of-Done mecanica NO cumplida (el [PO-OK] esta OK, P-05; falta la capa DoD):\n' +
        dodErrs.map((e) => '  - ' + e).join('\n') +
        '\nAjusta y reintenta, o declara rutas en ' + cwd + '/dod.manifest.json (artifacts / smokeResult / assets).');
    }
  }
  process.exit(0); // GATE aprobada por PO: el checkpoint humano ES el gate (sin validación de código/doc).
}

// ── RC-07 mecánico (Upgrade Pack v6.5): la tarea de 06/07 no cierra sin su reporte RC-07 en la raíz ──
// El payload TaskCompleted NO trae metadata fiable (#27556/#21356); este check se basa en el SUBJECT de
// la tarea + existencia del archivo en el cwd del proyecto. Tolerante: si el subject no matchea ninguna
// key, no bloquea (no afecta tareas ajenas). Acotado a los reportes RC-07 que NO fuerza un gate
// (QA_REPORT/SECURITY_REPORT ya son entregables de gate y no se duplican).
const RC07_REPORTS = { frontend: 'FRONTEND_REPORT.md', backend: 'BACKEND_REPORT.md' };
const subjRC07 = subj.toLowerCase();
for (const [key, file] of Object.entries(RC07_REPORTS)) {
  const hit = subjRC07.includes(key) || subjRC07.includes('t0' + (key === 'frontend' ? '6' : '7'));
  if (hit && !existsSync(join(cwd, file))) {
    fail(`RC-07: falta ${file} para la etapa ${key}. Entrega el reporte RC-07 en la raíz del proyecto antes de cerrar la tarea (Txx de 06/07).`);
  }
}

// classify code vs doc
const codeAgent = /\b0?[4567]\b|architect|frontend|backend|data.?model|\bqa\b/.test(agentType.toLowerCase());
const codeWords = /(test|typecheck|build|compile|lint|src\/|\.tsx?|\.jsx?|api|endpoint|component|render|serial|preload|backend|frontend)/;
const isCode = codeAgent || codeWords.test(text);

function npmScript(name) {
  const pkg = join(cwd, 'package.json');
  if (!existsSync(pkg)) return null;
  try { const j = JSON.parse(readFileSync(pkg, 'utf8')); return (j.scripts && j.scripts[name]) ? name : null; }
  catch { return null; }
}

if (isCode) {
  const script = npmScript('typecheck') || npmScript('test') || npmScript('build');
  if (!script) {
    process.stderr.write('R4 (aviso): tarea de codigo sin script typecheck/test/build en package.json; sin validacion automatica.\n');
    process.exit(0); // do not fabricate success, but do not hard-block when there is nothing real to run
  }
  const r = spawnSync('npm', ['run', '--silent', script], {
    cwd, encoding: 'utf8', timeout: 120000, shell: process.platform === 'win32',
  });
  if (r.status !== 0) {
    const out = `${r.stdout || ''}\n${r.stderr || ''}`.trim().split('\n').slice(-25).join('\n');
    fail(`la validacion de codigo '${script}' fallo (exit ${r.status == null ? 'timeout/err' : r.status}). Corrige antes de completar.\n--- salida (cola) ---\n${out}`);
  }
  process.exit(0);
}

// doc task -> deliverable exists and non-empty
const DELIV = {
  brief: 'BRIEF.md', strateg: 'BRIEF.md', research: 'RESEARCH.md',
  brandbook: 'BRANDBOOK.md', 'ux': 'BRANDBOOK.md', readme: 'README.md', writer: 'README.md',
  datamodel: 'DATAMODEL.md', architecture: 'ARCHITECTURE.md',
};
let want = null;
const m = `${subj} ${desc}`.match(/([A-Za-z0-9_\-]+\.(?:md|css))/);
if (m) want = m[1];
if (!want) { for (const k in DELIV) { if (text.includes(k)) { want = DELIV[k]; break; } } }

if (want) {
  const hit = [join(cwd, want), join(cwd, 'docs', want)].find(p => existsSync(p) && statSync(p).size > 0);
  if (!hit) fail(`el entregable de doc '${want}' no existe o esta vacio en ${cwd}. Crealo (no vacio) antes de completar.`);
}
process.exit(0); // unclassifiable -> do not block legitimate completion
