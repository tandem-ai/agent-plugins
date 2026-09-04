// Single source of truth: skills/<name>/SKILL.md and reference/*.md.
// Generates: skills/<name>/references/tandem-mcp.md (copied) and .agents/skills/ (mirror for Codex, Cursor, Copilot, Gemini, Antigravity).
// Checks: frontmatter present, versions aligned across manifests. `--check` only verifies.
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, rmSync, cpSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const check = process.argv.includes("--check");
const problems = [];

const skillsDir = join(root, "skills");
const skills = readdirSync(skillsDir).filter((d) => statSync(join(skillsDir, d)).isDirectory());
for (const s of skills) {
  const file = join(skillsDir, s, "SKILL.md");
  if (!existsSync(file)) { problems.push(`${s}: missing SKILL.md`); continue; }
  const text = readFileSync(file, "utf8");
  const fm = text.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) { problems.push(`${s}: missing frontmatter`); continue; }
  const name = fm[1].match(/^name:\s*(.+)$/m)?.[1]?.trim();
  const desc = fm[1].match(/^description:\s*(.+)$/m)?.[1]?.trim();
  if (name !== s) problems.push(`${s}: frontmatter name "${name}" must equal directory name`);
  if (!desc) problems.push(`${s}: missing description`);
  if (text.length > 40_000) problems.push(`${s}: SKILL.md over 40k chars, move reference material to references/`);
  const refDir = join(skillsDir, s, "references");
  const shared = readFileSync(join(root, "reference", "tandem-mcp.md"), "utf8");
  const target = join(refDir, "tandem-mcp.md");
  if (check) {
    if (!existsSync(target) || readFileSync(target, "utf8") !== shared) problems.push(`${s}: references/tandem-mcp.md is stale, run npm run build`);
  } else {
    mkdirSync(refDir, { recursive: true });
    writeFileSync(target, shared);
  }
}

const versions = {
  ".claude-plugin/plugin.json": JSON.parse(readFileSync(join(root, ".claude-plugin/plugin.json"), "utf8")).version,
  ".claude-plugin/marketplace.json": JSON.parse(readFileSync(join(root, ".claude-plugin/marketplace.json"), "utf8")).plugins[0].version,
  ".codex-plugin/plugin.json": JSON.parse(readFileSync(join(root, ".codex-plugin/plugin.json"), "utf8")).version,
  ".agents/plugins/marketplace.json": JSON.parse(readFileSync(join(root, ".agents/plugins/marketplace.json"), "utf8")).plugins[0].version,
  ".cursor-plugin/plugin.json": JSON.parse(readFileSync(join(root, ".cursor-plugin/plugin.json"), "utf8")).version,
  "gemini-extension.json": JSON.parse(readFileSync(join(root, "gemini-extension.json"), "utf8")).version,
  "package.json": JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version,
};
const distinct = new Set(Object.values(versions));
if (distinct.size > 1) problems.push(`versions differ: ${JSON.stringify(versions)}`);

const mirror = join(root, ".agents", "skills");
if (!check) {
  rmSync(mirror, { recursive: true, force: true });
  mkdirSync(mirror, { recursive: true });
  for (const s of skills) cpSync(join(skillsDir, s), join(mirror, s), { recursive: true });
} else {
  for (const s of skills) {
    const a = join(skillsDir, s, "SKILL.md"), b = join(mirror, s, "SKILL.md");
    if (!existsSync(b) || readFileSync(a, "utf8") !== readFileSync(b, "utf8")) problems.push(`.agents/skills/${s} is stale, run npm run build`);
  }
}

if (problems.length) { console.error(problems.join("\n")); process.exit(1); }
console.log(`${check ? "checked" : "built"}: ${skills.length} skills, version ${[...distinct][0]}`);
