# Phase 6B v21 FFET Gate Manifest

Status: `PHASE_6B_V21_READY_FOR_GATE_3_REVIEW_AFTER_PHASE_6A`

Gate rules:

- One FFET maps to exactly one seed unless an explicit merge rationale exists.
- Expected files must be concrete paths only.
- Every FFET test file must have a direct `pnpm exec tsx` validation command.
- Broad API test commands are supplemental, not ticket-specific proof.
- Phase 6A files remain forbidden for Phase 6B execution.
- Ticket and execution authorization flags remain false until human Gate 3.
