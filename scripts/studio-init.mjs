#!/usr/bin/env node
// studio-init.mjs — Activa el estudio de agentes CA6SNT en un proyecto nuevo (v4.3).
//
// Modelo: la LIBRERÍA del estudio (agentes, hooks, skills, scripts) vive global en ~/.claude o, como
// plugin, bajo ${CLAUDE_PLUGIN_ROOT}; la ACTIVACIÓN es DELIBERADA por-proyecto (copiar settings.json +
// CLAUDE.md), para no contaminar otras sesiones de Claude Code con agent-teams/telemetría/guards.
//
// Este script:
//   1) copia la plantilla right-sized   <studio>/templates/studio-project/{settings.json,CLAUDE.md}
//      a   <proyecto>/.claude/settings.json   y   <proyecto>/CLAUDE.md
//      + siembra las rúbricas de evals (pre-gate LLM-juez)  ->  <proyecto>/evals/*.rubric.yaml
//   2) VERIFICA la activación e imprime OK/FALTA por ítem:
//        - flag CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS
//        - cada hook cableado apunta a un .mjs REAL en disco
//        - telemetría OTel cableada (+ OTEL_LOG_TOOL_DETAILS para la auditoría de propiedad)
//        - rúbricas de evals sembradas + grader keyless claude-cli.js en disco
//   Idempotente: NO pisa un settings.json / CLAUDE.md existente sin --force (avisa y verifica igual).
//
// Uso:  node <studio>/scripts/studio-init.mjs <ruta-proyecto> [--force]
//   <studio> = ${CLAUDE_PLUGIN_ROOT} (plugin) o ~/.claude (instalación clásica).
import { existsSync, mkdirSync, copyFileSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve, dirname, parse } from 'node:path';
import { fileURLToPath } from 'node:url';
import os from 'node:os';

const HOME = os.homedir();
// Plantilla: en instalación de plugin vive junto al script (CLAUDE_PLUGIN_ROOT o relativo a este
// archivo); en instalación clásica, en ~/.claude/templates. Se usa la primera ruta que exista.
const SELF_DIR = dirname(fileURLToPath(import.meta.url));
const TPL = [
  process.env.CLAUDE_PLUGIN_ROOT && join(process.env.CLAUDE_PLUGIN_ROOT, 'templates', 'studio-project'),
  join(SELF_DIR, '..', 'templates', 'studio-project'),
  join(HOME, '.claude', 'templates', 'studio-project'),
].filter(Boolean).find((p) => existsSync(p)) || join(HOME, '.claude', 'templates', 'studio-project');
const argv = process.argv.slice(2);
const force = argv.includes('--force');
const target = argv.find((a) => !a.startsWith('--'));

const rel = (p) => p.replace(resolve(target || '.'), '.');
const tilde = (p) => p.replace(HOME, '~');
function die(m) { console.error(`studio-init: ${m}`); process.exit(1); }

if (!target) die('falta la ruta del proyecto.  uso: node studio-init.mjs <ruta> [--force]');
if (!existsSync(TPL)) die(`no encuentro la plantilla en ${tilde(TPL)} (¿v4.3 instalada?)`);
const ROOT = resolve(target);

// Guard: el destino NUNCA puede ser la RAÍZ de un disco (p.ej. D:\ o /). Cubre también el caso
// peligroso de pasar '.' con la cwd en una raíz → sembraría el estudio en TODO el disco.
if (ROOT === parse(ROOT).root) {
  die(`el destino "${ROOT}" es la RAÍZ de un disco. Pasa la RUTA ABSOLUTA del proyecto ` +
      `(p.ej. D:\\MiProyecto), nunca '.' desde una raíz: sembrar aquí contaminaría el disco entero.`);
}

// --- 1) copia idempotente ------------------------------------------------------------------
console.log(`\n== studio-init → ${ROOT} ==`);
const plan = [
  { src: join(TPL, 'settings.json'), dst: join(ROOT, '.claude', 'settings.json') },
  { src: join(TPL, 'CLAUDE.md'), dst: join(ROOT, 'CLAUDE.md') },
];
for (const { src, dst } of plan) {
  if (!existsSync(src)) die(`la plantilla no tiene ${tilde(src)}`);
  mkdirSync(dirname(dst), { recursive: true });
  const had = existsSync(dst);
  if (had && !force) {
    console.log(`  SKIP       ${rel(dst)}  (ya existe; usa --force para sobrescribir)`);
  } else {
    copyFileSync(src, dst);
    console.log(`  ${had ? 'OVERWRITE ' : 'COPY      '} ${rel(dst)}`);
  }
}

// --- 1b) sembrar rúbricas de evals (pre-gate LLM-juez) -------------------------------------
const evalsSrc = join(TPL, 'evals');
const evalsDst = join(ROOT, 'evals');
if (existsSync(evalsSrc)) {
  mkdirSync(evalsDst, { recursive: true });
  for (const f of readdirSync(evalsSrc)) {
    const src = join(evalsSrc, f);
    const dst = join(evalsDst, f);
    const had = existsSync(dst);
    if (had && !force) { console.log(`  SKIP       ${rel(dst)}  (ya existe)`); continue; }
    copyFileSync(src, dst);
    console.log(`  ${had ? 'OVERWRITE ' : 'COPY      '} ${rel(dst)}`);
  }
}

// --- 1c) sembrar scaffold de SMOKE (skill smoke-test · recipe Electron actual) -------------
// package.json es un SCAFFOLD: el Architect/Backend lo EXTIENDE (o reemplaza si el stack no es
// Node). Conserva el script "smoke" + la devDep @playwright/test. Idempotente (no pisa sin --force).
const smokeFiles = [{ src: join(TPL, 'package.json'), dst: join(ROOT, 'package.json') }];
for (const { src, dst } of smokeFiles) {
  if (!existsSync(src)) continue;
  const had = existsSync(dst);
  if (had && !force) { console.log(`  SKIP       ${rel(dst)}  (ya existe; el Architect/Backend lo EXTIENDE)`); continue; }
  copyFileSync(src, dst);
  console.log(`  ${had ? 'OVERWRITE ' : 'COPY      '} ${rel(dst)}`);
}
const testsSrc = join(TPL, 'tests');
const testsDst = join(ROOT, 'tests');
if (existsSync(testsSrc)) {
  mkdirSync(testsDst, { recursive: true });
  for (const f of readdirSync(testsSrc)) {
    const hadT = existsSync(join(testsDst, f));
    if (hadT && !force) { console.log(`  SKIP       ${rel(join(testsDst, f))}  (ya existe)`); continue; }
    copyFileSync(join(testsSrc, f), join(testsDst, f));
    console.log(`  ${hadT ? 'OVERWRITE ' : 'COPY      '} ${rel(join(testsDst, f))}`);
  }
}

// --- 2) verificación de activación ---------------------------------------------------------
const checks = [];
const check = (name, ok, detail) => checks.push({ name, ok: !!ok, detail });

const settingsPath = join(ROOT, '.claude', 'settings.json');
let s = null;
try { s = JSON.parse(readFileSync(settingsPath, 'utf8')); } catch { /* inválido */ }
check('settings.json válido', s, tilde(settingsPath));

const env = (s && s.env) || {};
check('flag CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1', env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS === '1');

const tracesEp = env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || env.OTEL_EXPORTER_OTLP_ENDPOINT || '';
check('telemetría OTel cableada',
  env.CLAUDE_CODE_ENABLE_TELEMETRY === '1' && /otlp/.test(env.OTEL_TRACES_EXPORTER || '') && !!tracesEp,
  `traces → ${tracesEp || '∅'}`);
check('OTEL_LOG_TOOL_DETAILS=1 (file_path en tool-spans → auditoría de propiedad)',
  env.OTEL_LOG_TOOL_DETAILS === '1');

const hooks = (s && s.hooks) || {};
const cmds = [];
for (const ev of Object.keys(hooks))
  for (const grp of (hooks[ev] || []))
    for (const h of (grp.hooks || [])) if (h && h.command) cmds.push({ ev, command: h.command });
check('hooks cableados', cmds.length > 0, `${cmds.length} comando(s)`);
for (const { ev, command } of cmds) {
  const m = command.match(/(\S+\.mjs)/);
  const p = m ? m[1] : null;
  const ok = p ? existsSync(p) : false;
  check(`hook ${ev} → ${p ? tilde(p) : command}`, ok, ok ? 'archivo OK' : 'NO EXISTE en disco');
}
check('CLAUDE.md presente en la raíz', existsSync(join(ROOT, 'CLAUDE.md')));

// evals: rúbricas sembradas + grader keyless en disco
const wantRubrics = ['brandbook.rubric.yaml', 'architecture.rubric.yaml', 'anti-placeholder.rubric.yaml'];
for (const rb of wantRubrics) check(`eval ${rb}`, existsSync(join(evalsDst, rb)));
const graderPath = join(HOME, '.claude', 'evals', 'providers', 'claude-cli.js');
check('grader keyless claude-cli.js en disco', existsSync(graderPath), tilde(graderPath));
let graderRef = false;
try { graderRef = /claude-cli\.js/.test(readFileSync(join(evalsDst, 'brandbook.rubric.yaml'), 'utf8')); } catch { /* */ }
check('rúbricas apuntan al grader claude-cli.js', graderRef);

// --- reporte -------------------------------------------------------------------------------
console.log('\n  Verificación de activación:');
let fails = 0;
for (const c of checks) {
  if (!c.ok) fails++;
  console.log(`   [${c.ok ? 'OK   ' : 'FALTA'}] ${c.name}${c.detail ? '  — ' + c.detail : ''}`);
}
console.log(`\n  ${fails === 0 ? '✅ activación COMPLETA' : `❌ ${fails} ítem(s) FALTAN`}\n`);

// --- siguiente paso obligatorio: rootear una SESIÓN NUEVA en el proyecto (greenfield) ----------
const CWD = resolve(process.cwd());
const sameRoot = process.platform === 'win32'
  ? CWD.toLowerCase() === ROOT.toLowerCase()
  : CWD === ROOT;
if (!sameRoot) {
  const bar = '═'.repeat(78);
  console.log(bar);
  console.log('  ⚠  SIGUIENTE PASO OBLIGATORIO — esta sesión NO está rooteada en el proyecto');
  console.log(`       sesión actual : ${CWD}`);
  console.log(`       proyecto      : ${ROOT}`);
  console.log('');
  console.log('  Abre una SESIÓN NUEVA en la pestaña Code con la carpeta del proyecto');
  console.log('  seleccionada en el selector de arriba (NO continúes esta sesión). Los hooks, el');
  console.log('  CLAUDE.md y la telemetría del proyecto SOLO cargan al ABRIR la sesión rooteada');
  console.log('  ahí; no se recargan en caliente.');
  console.log('');
  console.log(`  (CLI opcional, alternativa:  cd "${ROOT}" && claude  — sesión fresca, NO --resume;`);
  console.log('   si "claude" no está en PATH: ruta completa o  $env:PATH += ";$env:APPDATA\\npm")');
  console.log(bar + '\n');
}

process.exit(fails === 0 ? 0 : 2);
