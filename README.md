# field-skill-forge

Package and evaluate field-service Agent Skills. Skills are versioned folders with `SKILL.md` frontmatter (inputs, outputs, triggers, forbidden behaviours). Evaluation is a binary scorecard — pass or fail per layer — not a fuzzy rubric.

## Why

Generic prompt libraries do not fail closed. Ops skills need schemas, explicit refusals, and regression cases that prove a skill does *not* fire on unrelated prompts.

## Layers

`integrity` · `schema` · `safety` · `trigger` · `functional` · `regression` · `rollout`

## Setup

```bash
npm install
npm test
npm run validate -- --skills skills
npm run eval -- --skills skills --cases evals/cases.yaml
```

## Included skills

- `refuse-skip-inspection`
- `propose-reschedule-only`
- `cite-work-order`

## Non-goals

- Not a marketplace or host for third-party skills
- Does not call a live model; functional cases use documented mock outputs

## Licence

MIT
