---
name: data-integrity
description: "For the Data Modeler (05). Design data with integrity, growth, backup and migrations with rollback; access layer, single writer, read-only readers. Use it when modeling entities and the DATAMODEL.md."
---

# SKILL: data-integrity
## For: Agent 05 — DATA MODELER
## Version: 1.0.0

## Global principles — apply to all projects
1. NEVER modify data directly — always via the access layer.
2. SINGLE WRITER — one write point per critical entity.
3. READ-ONLY READERS — separate the read layer from the write layer.
4. ALWAYS BACK UP — if the user can't recover the data, there is a backup.
5. EVERY MIGRATION HAS A ROLLBACK — defined and tested before running.

## Process
STEP 1 — Identify entities: what exists, attributes, relationships, which are critical (irreversible loss) vs derived (recomputable).
STEP 2 — Classify by criticality: CRITICAL → IMPORTANT → DERIVED → TEMPORARY.
STEP 3 — Design the schema: precise types, indexes for frequent queries, NOT NULL/UNIQUE/FK/CHECK constraints. Don't optimize prematurely.
STEP 4 — Design for growth: optional fields, PKs with no business logic, N:M relationships from the start if there's risk, types with headroom.
STEP 5 — Design migrations: forward script + rollback + affected data.
STEP 6 — Define backup: frequency, location, integrity verification, restore process.

## Schema criteria
Names: tables plural, descriptive columns, FKs named to indicate the relationship.
Types: dates as date, booleans as boolean, IDs as integer or UUID.
Constraints: NOT NULL where there's always a value, UNIQUE where applicable, CASCADE/RESTRICT per logic.

## Warning signs — escalate to the orchestrator
⚠ Table with more than 40 columns
⚠ Critical data with no backup
⚠ Migration that drops columns with existing data
⚠ JOIN of more than 4 tables
⚠ Business data in unstructured JSON
⚠ PK based on business logic

## DATAMODEL.md structure
Entities → Relationships → DDL schema → Indexes → Migrations → Criticality classification → Backup strategy → Integrity plan → Conflict warnings

## Mistakes to avoid
× Designing only for the current state
× Strings for dates or booleans
× Migrations without rollback
× Assuming backup happens later
