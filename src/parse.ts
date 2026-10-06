import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import type { SkillMeta, SkillPackage } from "./types.js";

const REQUIRED = ["name", "description", "version"] as const;

export function parseSkillMd(raw: string): { meta: SkillMeta; body: string } {
  if (!raw.startsWith("---")) throw new Error("SKILL.md must start with YAML frontmatter");
  const end = raw.indexOf("\n---", 3);
  if (end === -1) throw new Error("SKILL.md frontmatter not closed");
  const fm = raw.slice(3, end).trim();
  const body = raw.slice(end + 4).trim();
  const meta = parseYaml(fm) as SkillMeta;
  for (const k of REQUIRED) {
    if (!meta[k] || typeof meta[k] !== "string") throw new Error(`Missing frontmatter field: ${k}`);
  }
  return { meta, body };
}

export async function loadSkills(skillsDir: string): Promise<SkillPackage[]> {
  const abs = path.resolve(skillsDir);
  const entries = await readdir(abs);
  const out: SkillPackage[] = [];
  for (const name of entries) {
    const dir = path.join(abs, name);
    if (!(await stat(dir)).isDirectory()) continue;
    const skillPath = path.join(dir, "SKILL.md");
    const raw = await readFile(skillPath, "utf8");
    const { meta, body } = parseSkillMd(raw);
    if (meta.name !== name) {
      throw new Error(`Skill folder "${name}" does not match frontmatter name "${meta.name}"`);
    }
    out.push({ dir, meta, body });
  }
  return out.sort((a, b) => a.meta.name.localeCompare(b.meta.name));
}
