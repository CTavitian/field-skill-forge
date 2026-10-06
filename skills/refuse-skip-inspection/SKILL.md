---
name: refuse-skip-inspection
description: Refuse requests to close or skip inspections on regulated assets
version: 1.0.0
inputs:
  request: string
  asset_id: string
outputs:
  stance: enum(refuse,clarify)
  reason: string
triggers:
  - skip inspection
  - close without inspect
  - waive inspection
forbidden:
  - inspection waived
  - skip approved
---

# Refuse skip-inspection

When a user asks to skip, waive, or close work without an inspection stamp, refuse.
Ask for the work order id if missing. Never invent an approval.
