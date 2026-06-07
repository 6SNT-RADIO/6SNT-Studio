// hooks/ownership-map.mjs — UNICA fuente de verdad del MAPA DE PROPIEDAD DE ARCHIVOS
// del estudio CA6SNT (ver el CLAUDE.md del proyecto). Lo consumen, sin duplicar logica:
//   - ownership-guard.mjs    (frontmatter PreToolUse, identidad por-agente: R1/R2)
//   - ownership-fallback.mjs (settings.json PreToolUse, ruta teammate de agent-teams)

export const NAMES = {
  '01': '01 STRATEGIST', '02': '02 RESEARCHER', '03': '03 UX/UI', '04': '04 ARCHITECT',
  '05': '05 DATA MODELER', '06': '06 FRONTEND', '07': '07 BACKEND', '08': '08 QA',
  '09': '09 SECURITY', '10': '10 TECH WRITER',
};

// Entregables nombrados (match por basename; viven en raiz o bajo docs/).
const NAMED = {
  'brief.md': '01', 'research.md': '02', 'brandbook.md': '03', 'tokens.css': '03',
  'architecture.md': '04', 'datamodel.md': '05', 'qa_report.md': '08',
  'security_report.md': '09', 'readme.md': '10',
};

// Entregables PROTEGIDOS: artefactos de gate concretos. Lista ESTRECHA usada por el fallback
// cuando NO se puede resolver la identidad (protege estos; permite todo lo demas, fail-open).
const PROTECTED_BASENAMES = new Set(Object.keys(NAMED));

export function normalize(filePath) {
  const norm = String(filePath || '').replace(/\\/g, '/');
  const lower = norm.toLowerCase();
  return { norm, lower, base: lower.split('/').pop() };
}

// Resuelve el dueno de un archivo y si cae en zona gobernada (veredicto base del mapa).
export function resolveOwner(filePath) {
  const { norm, lower, base } = normalize(filePath);
  let owner = NAMED[base] || null;
  if (!owner) {
    if (/(^|\/)src\/shared\//.test(lower)) owner = '04';                         // 04: src/shared/types.ts
    else if (/(^|\/)src\/renderer\/(ui|render|state)(\/|$)/.test(lower)) owner = '06';
    else if (/(^|\/)src\/(main|core|preload)(\/|$)/.test(lower)) owner = '07';
    else if (/(^|\/)src\/renderer\/serial(\/|$)/.test(lower)) owner = '07';
    else if (/(^|\/)tests\//.test(lower)) owner = '08';                          // 08: tests/
    else if (/(^|\/)previews\//.test(lower)) owner = '03';                       // 03: previews
    else if (/(^|\/)docs\//.test(lower)) owner = '10';                           // 10: docs de usuario
  }
  const governed =
    owner != null ||
    /(^|\/)(src|tests|docs|previews)\//.test(lower) ||
    (base in NAMED);
  return { owner, governed, norm };
}

// ?Es un entregable protegido concreto? (lista estrecha para el fallback sin identidad).
export function isProtectedDeliverable(filePath) {
  const { lower, base } = normalize(filePath);
  if (PROTECTED_BASENAMES.has(base)) return true;
  if (/(^|\/)src\/shared\/types\.ts$/.test(lower)) return true; // 04: src/shared/types.ts
  return false;
}

// Normaliza un agent_type / name del team config a id "01".."10" (o null si no resuelve).
export function agentId(x) {
  const s = String(x || '').trim().toLowerCase();
  let m = s.match(/^(\d{2})\b/);          // "04-architect" / "04" / "10-technical-writer"
  if (m) return m[1];
  m = s.match(/^(\d)-/);                    // "4-architect"
  if (m) return '0' + m[1];
  const KW = { strateg: '01', research: '02', 'ux': '03', 'ui': '03', architect: '04',
    data: '05', frontend: '06', backend: '07', qa: '08', security: '09', writer: '10' };
  for (const k in KW) if (s.includes(k)) return KW[k];
  return null;
}

// VEREDICTO CANONICO por-agente (R1/R2 + fail-safe). Misma resolucion para guard y fallback.
// Devuelve { allow:boolean, reason:string|null }.
export function verdict(id, tool, filePath) {
  const { owner, governed, norm } = resolveOwner(filePath);
  const isEdit = /^(Edit|MultiEdit|NotebookEdit)$/.test(tool);
  if (id === '09' && isEdit) {
    return { allow: false, reason: `R2: 09 SECURITY es revisor read-only — sin Edit (solo Write de SECURITY_REPORT.md). Archivo: ${norm}. Escala al lead.` };
  }
  if (owner && owner === id) return { allow: true, reason: null };
  if (owner && owner !== id) {
    return { allow: false, reason: `RC-05: ${norm} es de ${NAMES[owner] || ('agente ' + owner)}; ${NAMES[id] || ('agente ' + id)} no escribe ahi. Escala al lead (SendMessage).` };
  }
  if (governed) {
    return { allow: false, reason: `RC-05 (fail-safe): ${norm} cae en zona gobernada del mapa de propiedad sin dueno determinable; NIEGA por defecto. Escala al lead.` };
  }
  return { allow: true, reason: null }; // fuera del mapa -> ALLOW
}
