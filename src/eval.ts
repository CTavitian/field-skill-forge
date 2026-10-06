import type {
  EvalCase,
  LayerResult,
  SkillPackage,
  SkillScorecard,
} from "./types.js";

function integrity(skill: SkillPackage): LayerResult {
  const ok =
    skill.body.length > 40 &&
    Boolean(skill.meta.inputs) &&
    Boolean(skill.meta.outputs) &&
    (skill.meta.triggers?.length ?? 0) > 0;
  return {
    layer: "integrity",
    pass: ok,
    detail: ok
      ? "Frontmatter + body present with inputs/outputs/triggers"
      : "Skill missing body depth or schema fields",
  };
}

function schema(skill: SkillPackage): LayerResult {
  const hasIO =
    skill.meta.inputs &&
    Object.keys(skill.meta.inputs).length > 0 &&
    skill.meta.outputs &&
    Object.keys(skill.meta.outputs).length > 0;
  return {
    layer: "schema",
    pass: Boolean(hasIO),
    detail: hasIO ? "Input/output schema declared" : "Missing input/output schema",
  };
}

function safety(skill: SkillPackage): LayerResult {
  const hasForbid = (skill.meta.forbidden?.length ?? 0) > 0;
  return {
    layer: "safety",
    pass: hasForbid,
    detail: hasForbid
      ? "Forbidden behaviours declared (fail-closed intent)"
      : "No forbidden list — ops skills must declare refusals",
  };
}

function triggerLayer(skill: SkillPackage, cases: EvalCase[]): LayerResult {
  const mine = cases.filter((c) => c.skill === skill.meta.name);
  if (!mine.length) {
    return { layer: "trigger", pass: false, detail: "No eval cases for skill" };
  }
  let ok = 0;
  for (const c of mine) {
    const hit = (skill.meta.triggers ?? []).some((t) =>
      c.prompt.toLowerCase().includes(t.toLowerCase()),
    );
    if (hit === c.expect_trigger) ok++;
  }
  const pass = ok === mine.length;
  return {
    layer: "trigger",
    pass,
    detail: `${ok}/${mine.length} trigger expectations matched`,
  };
}

function functional(skill: SkillPackage, cases: EvalCase[]): LayerResult {
  const mine = cases.filter((c) => c.skill === skill.meta.name && c.expect_trigger);
  if (!mine.length) {
    return { layer: "functional", pass: false, detail: "No positive functional cases" };
  }
  let ok = 0;
  for (const c of mine) {
    const out = c.mock_output.toLowerCase();
    const includeOk = (c.must_include ?? []).every((x) => out.includes(x.toLowerCase()));
    const excludeOk = (c.must_not_include ?? []).every((x) => !out.includes(x.toLowerCase()));
    const forbidOk = (skill.meta.forbidden ?? []).every(
      (f) => !out.includes(f.toLowerCase()),
    );
    if (includeOk && excludeOk && forbidOk) ok++;
  }
  const pass = ok === mine.length;
  return {
    layer: "functional",
    pass,
    detail: `${ok}/${mine.length} functional cases passed`,
  };
}

function regression(skill: SkillPackage, cases: EvalCase[]): LayerResult {
  const neg = cases.filter((c) => c.skill === skill.meta.name && !c.expect_trigger);
  if (!neg.length) {
    return {
      layer: "regression",
      pass: true,
      detail: "No negative cases (skipped)",
    };
  }
  let ok = 0;
  for (const c of neg) {
    const hit = (skill.meta.triggers ?? []).some((t) =>
      c.prompt.toLowerCase().includes(t.toLowerCase()),
    );
    if (!hit) ok++;
  }
  return {
    layer: "regression",
    pass: ok === neg.length,
    detail: `${ok}/${neg.length} negative prompts correctly non-triggering`,
  };
}

function rollout(skill: SkillPackage): LayerResult {
  const semver = /^\d+\.\d+\.\d+$/.test(skill.meta.version);
  return {
    layer: "rollout",
    pass: semver,
    detail: semver ? `Version ${skill.meta.version}` : "Version must be semver x.y.z",
  };
}

export function scoreSkill(skill: SkillPackage, cases: EvalCase[]): SkillScorecard {
  const layers: LayerResult[] = [
    integrity(skill),
    schema(skill),
    safety(skill),
    triggerLayer(skill, cases),
    functional(skill, cases),
    regression(skill, cases),
    rollout(skill),
  ];
  return {
    skill: skill.meta.name,
    layers,
    passed: layers.every((l) => l.pass),
  };
}

export function scoreAll(skills: SkillPackage[], cases: EvalCase[]): SkillScorecard[] {
  return skills.map((s) => scoreSkill(s, cases));
}
