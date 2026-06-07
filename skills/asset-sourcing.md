# SKILL: asset-sourcing — datos/assets REALES, aprovisionados, nunca placeholders
Regla (P-11 con dientes): antes de usar cualquier dato o asset EXTERNO que el producto necesita, obtén la fuente REAL y APROVISIÓNALA de forma automática. Si no hay fuente, ESCALA; nunca caigas a placeholder/mock/iniciales/datos vacíos sin DECLARARLO. Aplica a CUALQUIER dominio (P-10).

## Alcance (cualquier dominio)
Cubre TODO asset/dato externo que el producto requiere, no solo código ni solo arte:
- datasets y tablas/padrones de referencia
- fuentes tipográficas (fonts)
- íconos y arte
- modelos
- lookup tables / archivos de referencia

## Patrón de aprovisionamiento (obligatorio)
1. **Script de fetch** (p. ej. `scripts/fetch-assets.*`) que descarga la fuente REAL a la ruta exacta donde el código la consume.
2. **Cableado a `build:all`** ANTES del paso de build → el aprovisionamiento NO es un paso manual para el PO.
3. **Idempotente:** cachea + verifica integridad; si ya existe y es válido, no re-descarga.
4. **Fallback DECLARADO (P-11) + error explícito (P-06):** si una descarga falla, error claro (qué fuente, qué pasó) y degradación DECLARADA (el dato faltante se marca como tal; el lookup/resolver devuelve vacío honesto) — NUNCA un placeholder que aparente real ni un fallo silencioso.
5. **Atribución de licencia:** registra la licencia de cada fuente en un archivo `NOTICE`.
6. **Sin dependencia de CDN en runtime (P-02):** el asset se bundlea/cachea LOCAL.

## Nota de entorno
El entorno del agente puede no poder descargar (límites de red). El estudio igual AUTORA la automatización (script + cableado a build); el build del PO la EJECUTA. Nunca se entrega la descarga como "tarea manual del PO".

## Herramientas (referencia)
- Íconos de UI: **better-icons** (https://github.com/better-auth/better-icons) — `npx better-icons setup`; trae el SVG real LOCAL, sin CDN en runtime.
- Otros datos/assets: la fuente canónica que corresponda, descargada en build a una carpeta de recursos y cacheada local.

QA lo audita: un dato/asset externo entregado como paso manual, o un placeholder no declarado, es un DEFECTO — no una entrega.
