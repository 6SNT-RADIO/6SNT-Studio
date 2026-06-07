# SKILL: data-integrity
## Para: Agente 05 — DATA MODELER
## Versión: 1.0.0

## Principios globales — aplican a todos los proyectos
1. NUNCA modificar datos directamente — siempre vía capa de acceso.
2. WRITER ÚNICO — un solo punto de escritura por entidad crítica.
3. LECTORES READ-ONLY — separar capa de lectura de escritura.
4. BACKUP SIEMPRE — si el usuario no puede recuperar los datos, hay backup.
5. TODA MIGRACIÓN TIENE ROLLBACK — definido y probado antes de ejecutar.

## Proceso
PASO 1 — Identificar entidades: qué existe, atributos, relaciones,
cuáles son críticas (pérdida irreversible) vs derivadas (recalculables).
PASO 2 — Clasificar por criticidad: CRÍTICOS → IMPORTANTES → DERIVADOS → TEMPORALES.
PASO 3 — Diseñar esquema: tipos precisos, índices para queries frecuentes,
constraints NOT NULL/UNIQUE/FK/CHECK. No optimizar prematuramente.
PASO 4 — Diseñar para crecimiento: campos opcionales, PKs sin lógica de negocio,
relaciones N:M desde el inicio si hay riesgo, tipos con margen.
PASO 5 — Diseñar migraciones: script forward + rollback + datos afectados.
PASO 6 — Definir backup: frecuencia, ubicación, verificación de integridad, proceso de restauración.

## Criterios de esquema
Nombres: tablas en plural, columnas descriptivas, FK con nombre que indica relación.
Tipos: fechas como fecha, booleanos como booleano, IDs como entero o UUID.
Constraints: NOT NULL donde siempre hay valor, UNIQUE donde aplica, CASCADE/RESTRICT según lógica.

## Señales de alerta — escalar al orquestador
⚠ Tabla con más de 40 columnas
⚠ Datos críticos sin backup
⚠ Migración que elimina columnas con datos existentes
⚠ JOIN de más de 4 tablas
⚠ Datos de negocio en JSON sin estructura
⚠ PK basada en lógica de negocio

## Estructura del DATAMODEL.md
Entidades → Relaciones → Esquema DDL → Índices → Migraciones →
Clasificación por criticidad → Estrategia de backup → Plan de integridad → Alertas de conflicto

## Errores a evitar
× Diseñar solo para el estado actual
× Strings para fechas o booleanos
× Migraciones sin rollback
× Asumir que el backup se hace después
