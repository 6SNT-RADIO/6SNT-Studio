---
name: orchestrator-bridge
description: Para el orquestador. Loop despacho-aviso file-based (claude-heartbeat + AMQ) sin claude -p: lee el outbox del disco y reacciona; la aprobación de cada gate sigue siendo del PO (P-05).
---

# SKILL: orchestrator-bridge — loop despacho→aviso file-based (Orquestador)
- Ligero: claude-heartbeat (https://github.com/Siigari/claude-heartbeat) — consume io/inbox.jsonl (stop hook), escribe io/outbox.jsonl; heartbeat mantiene viva la sesión SIN claude -p.
- Bus: AMQ (https://github.com/avivsinai/agent-message-queue) — Maildir crash-safe, Claude+Codex.
- Serio/paralelo: cli-agent-orchestrator (AWS Labs, Apache), supervisor-worker headless.
- El orquestador lee outbox del disco y reacciona; una tarea programada lo despierta a poll. La aprobación de gate sigue siendo del PO (P-05).
