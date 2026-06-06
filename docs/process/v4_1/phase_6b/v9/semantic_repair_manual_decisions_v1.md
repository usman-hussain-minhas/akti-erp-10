# Phase 6B v8 Semantic Repair Manual Decisions

## Current Decision State

No new human approval tokens are present in v8. Conservative blocker handling remains active.

## Required Tokens For Acceptance State

Pricing acceptance requires PRICING_DECISION_ACCEPTED tokens for each pricing split seed and PRICING_ANCHOR_DECISION_ACCEPTED for any fixed-pricing anchor proxy.
Communication acceptance requires COMM_DECISION_ACCEPTED tokens for ambiguous send surfaces.
API-key direction acceptance requires API_KEY_SCOPE_DECISION_ACCEPTED for 6B.10.

## Machine-Readable Registry

manual_blocker_registry_v1.json is authoritative for blocker IDs, blocker counts, required human decisions, and ticket-pack impact.
Blocker registry status: BLOCKERS_PRESENT
Blocker count: 138

## Ticket Boundary

Ticket generation allowed: false
Ticket pack generation allowed: false
