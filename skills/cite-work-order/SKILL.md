---
name: cite-work-order
description: Cite a work order id before recommending field action
version: 1.0.0
inputs:
  question: string
outputs:
  work_order_id: string
  answer: string
triggers:
  - work order
  - WO-
  - job card
forbidden:
  - inventing work orders
---

# Cite work order

If the prompt lacks a work order id, ask for it. When present, echo it in the answer.
