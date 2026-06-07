// tests/smoke.spec.ts — SMOKE del estudio (skill smoke-test): ARRANQUE + render esencial.
//
// Principio (P-10): "terminado" incluye un artefacto que ARRANCA, probado automáticamente,
// pass/fail por exit code, con UN comando (`npm run smoke`). Recipe ACTUAL = Electron (no la única).
//
// REGLA: el smoke prueba ARRANQUE + render esencial, NO lógica de negocio (eso son los unit tests).
// P-11: lo no validable headless (hardware, datos en vivo, red) se DECLARA diferido, no se finge.
//
// EVIDENCIA legible por máquina (DoD del gate de RELEASE, v5.2): al terminar escribe
// tests/smoke-result.json = { pass, ts, screenshot }. El taskcompleted-gate lo verifica.
//
// STUB sembrado por el estudio — 06 FRONTEND ajusta los `data-testid` reales (raíz + vistas clave);
// 04/07 dejan el script `smoke`. Requiere devDep: @playwright/test.
import { test, expect, _electron as electron } from '@playwright/test';
import { writeFileSync } from 'node:fs';

test('la app arranca y renderiza la UI esencial', async () => {
  let pass = false;
  try {
    const app = await electron.launch({ args: ['.'] });
    const win = await app.firstWindow();

    // 1) la ventana principal abre
    expect(win).toBeTruthy();
    await win.waitForLoadState('domcontentloaded');

    // 2) 2-3 elementos clave con data-testid renderizan (06 los pone en la UI real).
    //    Reemplaza estos selectores por los testids reales del proyecto:
    await expect(win.locator('[data-testid="app-root"]')).toBeVisible({ timeout: 10_000 });
    // await expect(win.locator('[data-testid="main-view"]')).toBeVisible();

    // 3) evidencia visual
    await win.screenshot({ path: 'tests/smoke.png' });

    await app.close();
    pass = true;
  } finally {
    // 4) evidencia legible por máquina — pass:false si algo falló antes del cierre limpio.
    writeFileSync(
      'tests/smoke-result.json',
      JSON.stringify({ pass, ts: Date.now(), screenshot: 'tests/smoke.png' }, null, 2),
    );
  }
  // exit code refleja el pass (si el try lanzó, ya falló antes de aquí).
  expect(pass).toBe(true);
});
