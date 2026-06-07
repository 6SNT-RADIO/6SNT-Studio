---
name: orchestrator-bridge
description: "For the orchestrator. File-based dispatch-notify loop (claude-heartbeat + AMQ) without claude -p: read the disk outbox and react; each gate's approval still belongs to the PO (P-05)."
---

# SKILL: orchestrator-bridge — file-based dispatch→notify loop (Orchestrator)
- Lightweight: claude-heartbeat (https://github.com/Siigari/claude-heartbeat) — consumes io/inbox.jsonl (stop hook), writes io/outbox.jsonl; the heartbeat keeps the session alive WITHOUT claude -p.
- Bus: AMQ (https://github.com/avivsinai/agent-message-queue) — crash-safe Maildir, Claude+Codex.
- Serious/parallel: cli-agent-orchestrator (AWS Labs, Apache), headless supervisor-worker.
- The orchestrator reads the disk outbox and reacts; a scheduled task wakes it to poll. Gate approval still belongs to the PO (P-05).
