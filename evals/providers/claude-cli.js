'use strict';
/**
 * claude-cli.js — Custom provider de promptfoo: el JUEZ (grader) es Claude vía la CLI `claude -p`.
 *
 * POR QUÉ: el estudio corre con la suscripción de Claude Code (OAuth), NO con ANTHROPIC_API_KEY.
 * promptfoo's anthropic provider exige esa key; este provider la evita ejecutando el CLI ya
 * autenticado. Así el juez es un modelo Anthropic (Claude) y el flujo es "offline-capable": no se
 * crean secretos nuevos ni se depende de la nube de promptfoo.
 *
 * USO: se referencia como grader en las rúbricas:
 *   defaultTest: { options: { provider: { id: "file://C:/Users/luiss/.claude/evals/providers/claude-cli.js" } } }
 * promptfoo llama callApi(gradingPrompt) y espera el veredicto JSON {reason,score,pass} en `output`.
 *
 * P-06 (errores explícitos): si `claude -p` falla (no arranca, exit != 0, timeout, vacío), se
 * devuelve { error } — NO se traga ni se finge un veredicto.
 *
 * Config opcional (promptfooconfig):
 *   config: { model: "<id>", timeoutMs: 240000 }
 *   config: { models: ["opus","sonnet","haiku"] }   ← JURADO (Upgrade Pack v6.2)
 * Env:  CLAUDE_CLI_JUDGE_TIMEOUT_MS (default 240000)
 *
 * JURADO (Upgrade Pack v6.2): si `config.models` es un array, el grader corre el MISMO prompt con
 * cada tier de Claude (p.ej. opus+sonnet+haiku) y AGREGA: score = mediana, pass = mayoría, reason =
 * concatenado por juez. Diversidad real (3 tiers) sin API key ni modelos de terceros. Cost-aware:
 * actívalo SOLO en gates subjetivos (marca/G03) o en puntajes-borde. Sin `models`, 1 juez (igual que antes).
 */
const { spawn } = require('node:child_process');
const os = require('node:os');

class ClaudeCliProvider {
  constructor(options = {}) {
    this.config = options.config || {};
    this.providerId = options.id || 'claude-cli';
  }

  id() {
    return this.providerId;
  }

  async callApi(prompt /*, context, options */) {
    const p = String(prompt ?? '');
    const models = Array.isArray(this.config.models) ? this.config.models.filter(Boolean) : null;

    // JURADO (Upgrade Pack v6.2): config.models => varios jueces -> mediana + mayoría.
    if (models && models.length) {
      const verdicts = [];
      for (const m of models) {
        const r = await runClaude(p, { ...this.config, model: m });
        if (r.error || !r.out || !r.out.trim()) continue; // P-06: descartar juez caído
        const v = tryParse(extractVerdict(r.out));
        if (v && typeof v === 'object') {
          verdicts.push({ model: m, score: v.score, pass: v.pass, reason: v.reason });
        }
      }
      if (!verdicts.length) {
        return { error: '[claude-cli] jurado: todos los jueces fallaron (timeout/exit/vacío/JSON)' };
      }
      const scores = verdicts
        .map((v) => Number(v.score))
        .filter((n) => !Number.isNaN(n))
        .sort((a, b) => a - b);
      const median = scores.length
        ? (scores.length % 2
            ? scores[(scores.length - 1) / 2]
            : (scores[scores.length / 2 - 1] + scores[scores.length / 2]) / 2)
        : undefined;
      const passCount = verdicts.filter((v) => v.pass === true).length;
      const pass = passCount * 2 >= verdicts.length; // mayoría (>= mitad de los que respondieron)
      const reason = verdicts.map((v) => `[${v.model}] ${v.reason ?? ''}`).join('\n');
      return { output: JSON.stringify({ score: median, pass, reason, jury: verdicts }) };
    }

    // 1 JUEZ (comportamiento por defecto, backward-compatible).
    const res = await runClaude(p, this.config);
    if (res.error) {
      // P-06: error explícito hacia promptfoo (aparece como fallo de grading, no como pass falso).
      return { error: `[claude-cli] ${res.error}` };
    }
    if (!res.out || !res.out.trim()) {
      return { error: '[claude-cli] respuesta vacía de `claude -p`' };
    }
    // Normaliza: extrae el objeto JSON del veredicto (claude puede meter preámbulo o ```fences```).
    return { output: extractVerdict(res.out) };
  }
}

function runClaude(prompt, cfg) {
  const timeoutMs = Number(cfg.timeoutMs || process.env.CLAUDE_CLI_JUDGE_TIMEOUT_MS || 240000);
  const isWin = process.platform === 'win32';
  const args = ['-p', '--output-format', 'text'];
  if (cfg.model) args.push('--model', String(cfg.model));

  return new Promise((resolve) => {
    let child;
    try {
      // shell:true en Windows para que 'claude' resuelva el shim claude.cmd vía PATHEXT.
      child = spawn('claude', args, { cwd: os.tmpdir(), shell: isWin, windowsHide: true });
    } catch (e) {
      return resolve({ error: `no pude lanzar 'claude': ${e.message}` });
    }

    let out = '';
    let err = '';
    let settled = false;
    const done = (v) => { if (!settled) { settled = true; clearTimeout(timer); resolve(v); } };

    const timer = setTimeout(() => {
      try { child.kill('SIGKILL'); } catch { /* noop */ }
      done({ error: `timeout ${timeoutMs}ms esperando a 'claude -p'` });
    }, timeoutMs);

    child.stdout.on('data', (d) => { out += d.toString(); });
    child.stderr.on('data', (d) => { err += d.toString(); });
    child.on('error', (e) => done({ error: `fallo ejecutando 'claude -p': ${e.message}` }));
    child.on('close', (code) => {
      if (code !== 0) {
        return done({ error: `'claude -p' salió con código ${code}. stderr: ${err.trim().slice(0, 600) || '(vacío)'}` });
      }
      done({ out });
    });

    // Prompt por STDIN (raw pipe): evita límites de longitud de argv y problemas de escaping.
    try { child.stdin.write(prompt); child.stdin.end(); } catch { /* el child puede haber muerto */ }
  });
}

/** Devuelve el JSON {reason,score,pass} como string limpio, o el texto crudo si no hay JSON. */
function extractVerdict(text) {
  let s = String(text).trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();

  const direct = tryParse(s);
  if (hasVerdictKeys(direct)) return JSON.stringify(direct);

  const scanned = findJsonWithKeys(text, ['score', 'pass', 'reason']);
  if (scanned) return JSON.stringify(scanned);

  return text; // sin JSON detectable -> que promptfoo lo intente / lo registre
}

function tryParse(str) { try { return JSON.parse(str); } catch { return null; } }
function hasVerdictKeys(o) {
  return o && typeof o === 'object' && (o.score !== undefined || o.pass !== undefined);
}
function findJsonWithKeys(text, keys) {
  const cands = [];
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== '{') continue;
    let depth = 0;
    for (let j = i; j < text.length; j++) {
      const c = text[j];
      if (c === '{') depth++;
      else if (c === '}') { depth--; if (depth === 0) { cands.push(text.slice(i, j + 1)); break; } }
    }
  }
  for (let k = cands.length - 1; k >= 0; k--) {
    const o = tryParse(cands[k]);
    if (o && typeof o === 'object' && keys.some((key) => key in o)) return o;
  }
  return null;
}

module.exports = ClaudeCliProvider;
