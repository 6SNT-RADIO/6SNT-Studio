#!/usr/bin/env node
// R1 (RC-05) + R2 — file-ownership guard (frontmatter PreToolUse, identidad por-agente).
// Wired from each agent's frontmatter:  node ownership-guard.mjs <NN>
// Identity is implicit (the hook only fires while that agent is active).
// Reads the PreToolUse JSON on stdin.  Exit 2 + stderr => BLOCK.  Exit 0 => ALLOW.
// Mapa de propiedad y veredicto: ./ownership-map.mjs (UNICA fuente de verdad).
import { readFileSync } from 'node:fs';
import { verdict } from './ownership-map.mjs';

const AGENT = String(process.argv[2] || '').slice(0, 2); // "01".."10"

let d = {};
try { d = JSON.parse(readFileSync(0, 'utf8') || '{}'); } catch { d = {}; }

const tool = d.tool_name || '';
const fp = (d.tool_input && (d.tool_input.file_path || d.tool_input.filePath)) || '';
// Only gate file mutations. Anything else (Read/Grep/Glob/WebSearch/Bash/...) is allowed.
if (!/^(Write|Edit|MultiEdit|NotebookEdit)$/.test(tool) || !fp) process.exit(0);

const v = verdict(AGENT, tool, fp);
if (!v.allow) { process.stderr.write(v.reason + '\n'); process.exit(2); }
process.exit(0);
