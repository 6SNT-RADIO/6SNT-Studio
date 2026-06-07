// evals/read-contract.mjs — loader de variable para promptfoo.
//
// PROBLEMA QUE RESUELVE:
//   promptfoo carga una var `file://archivo` según la EXTENSIÓN: .md/.css/.txt → TEXTO;
//   pero .ts/.js/.mjs → IMPORTA el archivo como módulo y espera una FUNCIÓN exportada que
//   llama para obtener el valor. `src/shared/types.ts` solo exporta tipos (no una función),
//   así que al invocarlo promptfoo falla con "(intermediate value) is not a function".
//
// SOLUCIÓN (idiomática, ver evals/README.md y docs de promptfoo "Javascript variables"):
//   promptfoo SÍ acepta un .mjs/.js que exporte una función como loader de var: la llama con
//   (varName, prompt, otherVars, provider) y usa su retorno como valor. Aquí leemos el contrato
//   REAL `src/shared/types.ts` como STRING y lo devolvemos — el .ts entra como texto, sin import.
//
// Ruta canónica del contrato en TODO proyecto del estudio (mapa de propiedad de CLAUDE.md):
//   src/shared/types.ts  → por eso el path está fijo relativo a evals/.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

// promptfoo espera que el loader devuelva { output: <valor> } (no el string pelado).
export default function readContract() {
  return { output: readFileSync(join(here, '..', 'src', 'shared', 'types.ts'), 'utf8') };
}
