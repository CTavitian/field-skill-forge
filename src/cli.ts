#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { scoreAll } from "./eval.js";
import { loadSkills } from "./parse.js";
import type { EvalCase } from "./types.js";

function usage(): never {
  console.log(`Usage:
  field-skill-forge validate --skills <dir>
  field-skill-forge eval --skills <dir> [--cases evals/cases.yaml] [--out report.json]`);
  process.exit(1);
}

function argValue(args: string[], flag: string): string | undefined {
  const i = args.indexOf(flag);
  return i === -1 ? undefined : args[i + 1];
}

async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];
  const skillsDir = argValue(args, "--skills") ?? "skills";
  if (cmd !== "validate" && cmd !== "eval") usage();

  const skills = await loadSkills(skillsDir);
  if (cmd === "validate") {
    for (const s of skills) {
      console.log(`OK\t${s.meta.name}@${s.meta.version}`);
    }
    console.log(`${skills.length} skill(s) validated`);
    return;
  }

  const casesPath = argValue(args, "--cases") ?? "evals/cases.yaml";
  const out = argValue(args, "--out") ?? "reports/skill-eval.json";
  const cases = (parseYaml(await readFile(path.resolve(casesPath), "utf8")) as { cases: EvalCase[] })
    .cases;
  const scorecards = scoreAll(skills, cases);
  await mkdir(path.dirname(path.resolve(out)), { recursive: true });
  await writeFile(path.resolve(out), JSON.stringify({ scorecards }, null, 2) + "\n");

  let failed = 0;
  for (const sc of scorecards) {
    const mark = sc.passed ? "PASS" : "FAIL";
    if (!sc.passed) failed++;
    const fails = sc.layers.filter((l) => !l.pass).map((l) => l.layer).join(",") || "-";
    console.log(`${mark}\t${sc.skill}\tlayers_failed=${fails}`);
  }
  console.log(`Report: ${path.resolve(out)}`);
  if (failed) process.exit(1);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
