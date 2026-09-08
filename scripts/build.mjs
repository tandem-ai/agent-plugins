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

// Environment variants. The root of the repo IS the production plugin. Each variant is a full copy
// under variants/<env>/ with the hosts rewritten and the plugin renamed, so a tester installs
// `tandem-stage` beside (or instead of) `tandem` without the two servers competing.
const ENVS = {
  stage: { api: "https://api.stage.usetandem.ai", app: "https://app.stage.usetandem.ai" },
  local: { api: "https://api.usetandem.com", app: "https://app.usetandem.com" },
};
const PROD = { api: "https://api.usetandem.ai", app: "https://app.usetandem.ai" };
const VARIANT_FILES = [
  ".mcp.json", ".claude-plugin/plugin.json", ".codex-plugin/plugin.json", ".cursor-plugin/plugin.json",
  ".cursor/mcp.json", "gemini-extension.json", "GEMINI.md", "plugin.json", "mcp_config.json",
];
const VARIANT_DIRS = ["skills"];
const variantsRoot = join(root, "variants");
if (!check) rmSync(variantsRoot, { recursive: true, force: true });
for (const [env, hosts] of Object.entries(ENVS)) {
  const out = join(variantsRoot, env);
  const rewrite = (text) => text
    .replaceAll(PROD.api, hosts.api)
    .replaceAll(PROD.app, hosts.app)
    .replace(/"name": "tandem"/g, `"name": "tandem-${env}"`)
    .replace(/"displayName": "Tandem"/g, `"displayName": "Tandem (${env})"`)
    .replace(/"hooks": "\.\/hooks\/hooks\.json"/g, '"hooks": "./hooks/hooks.json"');
  if (check) {
    for (const f of VARIANT_FILES) {
      const src = join(root, f), dst = join(out, f);
      if (!existsSync(dst) || readFileSync(dst, "utf8") !== rewrite(readFileSync(src, "utf8"))) problems.push(`variants/${env}/${f} is stale, run npm run build`);
    }
    continue;
  }
  for (const f of VARIANT_FILES) {
    const dst = join(out, f);
    mkdirSync(join(dst, ".."), { recursive: true });
    writeFileSync(dst, rewrite(readFileSync(join(root, f), "utf8")));
  }
  for (const d of VARIANT_DIRS) {
    cpSync(join(root, d), join(out, d), { recursive: true });
    for (const s of skills) {
      for (const f of ["SKILL.md", "references/tandem-mcp.md", "references/providers.md"]) {
        const fp = join(out, "skills", s, f);
        if (existsSync(fp)) writeFileSync(fp, rewrite(readFileSync(fp, "utf8")));
      }
    }
  }
  writeFileSync(join(out, "README.md"), `# Tandem (${env})\n\nGenerated by \`npm run build\` from the repository root. Do not edit. Connector: ${hosts.api}/mcp, app: ${hosts.app}. Internal testing only.\n`);
}

if (problems.length) { console.error(problems.join("\n")); process.exit(1); }
console.log(`${check ? "checked" : "built"}: ${skills.length} skills, version ${[...distinct][0]}`);
