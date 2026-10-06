export interface SkillMeta {
  name: string;
  description: string;
  version: string;
  inputs?: Record<string, string>;
  outputs?: Record<string, string>;
  triggers?: string[];
  forbidden?: string[];
}

export interface SkillPackage {
  dir: string;
  meta: SkillMeta;
  body: string;
}

export type LayerName =
  | "integrity"
  | "trigger"
  | "functional"
  | "regression"
  | "schema"
  | "rollout"
  | "safety";

export interface LayerResult {
  layer: LayerName;
  pass: boolean;
  detail: string;
}

export interface EvalCase {
  id: string;
  skill: string;
  prompt: string;
  expect_trigger: boolean;
  mock_output: string;
  must_include?: string[];
  must_not_include?: string[];
}

export interface SkillScorecard {
  skill: string;
  layers: LayerResult[];
  passed: boolean;
}
