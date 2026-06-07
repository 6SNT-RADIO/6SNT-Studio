---
name: env-reproducible
description: "For the Architect (04). Pin the runtime PER-PROJECT (mise/Volta) + engines + engine-strict + a preinstall guard + a single build command, so a global change never breaks other apps."
---

# SKILL: env-reproducible — per-project runtime (Architect 04)
Pin the runtime PER-PROJECT from day 1; a global change NEVER breaks other apps.
- Polyglot → mise (https://github.com/jdx/mise): a committed mise.toml pins runtime+env+tasks, activates on cd. Preferred if there's more than 1 language.
- Node only → Volta (volta pin node@lts in package.json).
- ALWAYS in addition: engines + engine-strict=true + a preinstall guard that fails clearly if the runtime doesn't match (avoids the cryptic ClangCL error).
- The Architect declares it in ARCHITECTURE.md with the single build command.
