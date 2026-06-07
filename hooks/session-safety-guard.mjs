#!/usr/bin/env node
// session-safety-guard.mjs — Guards de SESIÓN deterministas del estudio CA6SNT (v4.3).
//
// NO dependen de la identidad del agente llamante: por eso SOBREVIVEN a #54898
// (el stdin de PreToolUse no expone agent_type/identidad del subagente, así que el
// ownership por-agente es inviable mecánicamente — ese enforcement pasó a NORMA + auditoría
// post-hoc por observabilidad; ver CLAUDE.md §4). Aquí solo van las tres protecciones que SÍ
// son fiables sin saber quién actúa:
//   1) CRED     — lectura/escritura de credenciales/.env reales
//   2) SETTINGS — escritura a un .claude/settings.json
//   3) OUTSIDE  — escritura fuera del árbol del proyecto (cwd)
//
// Wired desde settings.json:
//   PreToolUse, matcher "Read|Write|Edit|MultiEdit|NotebookEdit"
// Contrato de hook: lee el JSON de PreToolUse por stdin.
//   Exit 2 + stderr => BLOCK.   Exit 0 => ALLOW.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

let d = {};
try { d = JSON.parse(readFileSync(0, 'utf8') || '{}'); } catch { d = {}; }

const tool = String(d.tool_name || '');
const ti = d.tool_input || {};
const fpRaw = ti.file_path || ti.filePath || ti.path || ti.notebook_path || '';
const cwd = String(d.cwd || process.cwd());

const isRead = tool === 'Read';
const isWrite = /^(Write|Edit|MultiEdit|NotebookEdit)$/.test(tool);
if ((!isRead && !isWrite) || !fpRaw) process.exit(0); // solo Read + mutaciones de archivo con ruta

// Normaliza a ruta absoluta posix-lower para que los matches sean robustos en Windows.
const norm = (p) => resolve(cwd, String(p)).replace(/\\/g, '/').replace(/\/+$/, '');
const abs = norm(fpRaw);
const absL = abs.toLowerCase();
const base = absL.split('/').pop() || '';
const rootL = norm(cwd).toLowerCase();

function block(code, msg) {
  process.stderr.write(`SAFETY/${code}: ${msg}\n`);
  process.exit(2);
}

// --- 1) CRED: credenciales / .env reales ---------------------------------------------------
// Las PLANTILLAS (.env.example|sample|template|dist|default) sí están permitidas.
const envTemplate = /^\.env\.(example|sample|template|dist|defaults?)$/.test(base);
const isEnv = /^\.env(\.|$)/.test(base) && !envTemplate;
const isSecret =
  isEnv ||
  /\.(pem|key|pfx|p12|keystore|jks)$/.test(base) ||
  /^id_(rsa|ed25519|ecdsa|dsa)$/.test(base) ||
  /^\.(npmrc|netrc|pgpass)$/.test(base) ||
  /(^|\/)\.aws\/credentials$/.test(absL) ||
  /(^|\/)\.ssh\//.test(absL) ||
  /^(secret|secrets|credentials)\.(json|ya?ml|yml|txt|ini|env)$/.test(base);

if (isSecret) {
  block(
    'CRED',
    `${isRead ? 'lectura' : 'escritura'} de archivo sensible bloqueada: ${fpRaw}. ` +
      `Credenciales/.env no se tocan (P-02): usa variables de entorno o pide el valor al PO. ` +
      `(las plantillas .env.example|sample|template sí están permitidas)`,
  );
}
if (isRead) process.exit(0); // cualquier otra lectura es libre

// --- 2) SETTINGS: escritura a cualquier .claude/settings.json ------------------------------
if (/(^|\/)\.claude\/settings\.json$/.test(absL)) {
  block(
    'SETTINGS',
    `escritura a .claude/settings.json bloqueada: ${fpRaw}. El wiring de hooks/telemetría del ` +
      `estudio se edita a mano (o vía 'node ~/.claude/scripts/studio-init.mjs <ruta>'), no por un agente.`,
  );
}

// --- 3) OUTSIDE: escritura fuera del árbol del proyecto ------------------------------------
if (absL !== rootL && !absL.startsWith(rootL + '/')) {
  block(
    'OUTSIDE',
    `escritura fuera del árbol del proyecto bloqueada: ${fpRaw} (raíz del proyecto: ${cwd}). ` +
      `Entrega DENTRO del proyecto (RC-04); si de verdad necesitas escribir fuera, escala al lead.`,
  );
}

process.exit(0); // dentro del proyecto, no es settings.json ni secreto -> ALLOW
