---
name: asset-sourcing
description: "Provision REAL external data/assets automatically (a fetch script wired to the build, idempotent, with license and declared fallback), never placeholders. Any domain. Use it when the product needs an external source."
---

# SKILL: asset-sourcing — REAL data/assets, provisioned, never placeholders
Rule (P-11 with teeth): before using any EXTERNAL datum or asset the product needs, obtain the REAL source and PROVISION it automatically. If there is no source, ESCALATE; never fall back to placeholder/mock/initials/empty data without DECLARING it. Applies to ANY domain (P-10).

## Scope (any domain)
Covers EVERY external asset/datum the product requires, not just code or art:
- datasets and reference tables/registries
- typefaces (fonts)
- icons and art
- models
- lookup tables / reference files

## Provisioning pattern (mandatory)
1. **Fetch script** (e.g. `scripts/fetch-assets.*`) that downloads the REAL source to the exact path where the code consumes it.
2. **Wired into `build:all`** BEFORE the build step → provisioning is NOT a manual step for the PO.
3. **Idempotent:** cache + verify integrity; if it already exists and is valid, do not re-download.
4. **DECLARED fallback (P-11) + explicit error (P-06):** if a download fails, a clear error (which source, what happened) and DECLARED degradation (the missing datum is marked as such; the lookup/resolver returns an honest empty) — NEVER a placeholder that looks real, nor a silent failure.
5. **License attribution:** record each source's license in a `NOTICE` file.
6. **No runtime CDN dependency (P-02):** the asset is bundled/cached LOCALLY.

## Environment note
The agent's environment may be unable to download (network limits). The studio still AUTHORS the automation (script + build wiring); the PO's build EXECUTES it. The download is never delivered as a "manual PO task".

## Tools (reference)
- UI icons: **better-icons** (https://github.com/better-auth/better-icons) — `npx better-icons setup`; brings the real SVG LOCAL, no runtime CDN.
- Other data/assets: the appropriate canonical source, downloaded at build into a resources folder and cached locally.

QA audits it: an external datum/asset delivered as a manual step, or an undeclared placeholder, is a DEFECT — not a delivery.
