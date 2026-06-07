---
name: research-methodology
description: "For the Researcher (02). Research the external context from the brief, reuse before building (plugins/MCPs/APIs/libraries), with an explicit recommendation and qualified sources. Use it when building the RESEARCH.md."
---

# SKILL: research-methodology
## For: Agent 02 — RESEARCHER
## Version: 1.0.0

## Purpose
This skill defines how to research a project's external context. The goal is to deliver actionable information. Every finding must have enough context for the orchestrator and PO to decide.

## Core principle
Before recommending to build something, verify it doesn't exist.
Before recommending a technology, verify it solves the specific problem.
Never research in the abstract — always in relation to the brief.

## Process
STEP 1 — Read the full brief. Identify the core problem, user, constraints, and what the product explicitly is NOT.
STEP 2 — Search in order: complete tools → plugins/MCPs/APIs → libraries → patterns. For each solution: what it solves, what it doesn't, license, maturity, integration with the stack.
STEP 3 — Analyze 3-5 similar products: what they do well, what badly, the differentiator.
STEP 4 — Explore tangents if they would change a project decision.
STEP 5 — Build the report with an explicit recommendation per section.

## Source criteria
HIGH: official documentation, active GitHub, recent changelog, real cases.
MEDIUM: recent technical articles, comparisons with methodology.
DISCARD: marketing without evidence, undated articles, opinions without context.

## Recommend integrating if:
It solves it better than we could build, lower cost, actively maintained, compatible license.

## Recommend building if:
Nothing solves the specific problem, or the dependencies complicate more than they help.

## RESEARCH.md structure
Executive summary → Existing solutions → Similar products → Relevant technologies → Patterns → Risks → Opportunities → Final recommendation

## Mistakes to avoid
× Researching without reading the brief first
× Recommending without verifying the license
× Confusing popular with suitable for this project
× Presenting links without context
