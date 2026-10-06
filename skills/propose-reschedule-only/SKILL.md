---
name: propose-reschedule-only
description: Propose schedule changes as drafts; never silently commit
version: 1.0.0
inputs:
  job_id: string
  proposed_slot: string
outputs:
  proposal: object
  requires_approval: boolean
triggers:
  - reschedule
  - move job
  - change slot
forbidden:
  - schedule updated
  - committed without approval
---

# Propose reschedule only

Emit a proposal object. Set requires_approval true. Do not claim the schedule was updated.
