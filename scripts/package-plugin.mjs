// One zip holding the full production plugin — plugin.json, mcp_config.json,
// skills/, assets/, reference/. No stage/local variants, no env-specific config.
// A customer downloads this once and installs it without a repository.
//
// The plugin is the root of THIS repository (the production build):
// https://github.com/tandem-ai/agent-plugins/releases/latest/download/tandem-plugin.zip
//
// Claude Desktop (organization): download, extract, then add the connector URL
// in Organization → Connectors, and upload the skill folders from
// tandem-plugin/skills/ in Organization → Skills.
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const out = join(root, "dist", "plugin");

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const bundle = join(out, "tandem-plugin");
mkdirSync(bundle, { recursive: true });

// Production files only — no variants/, .git/, node_modules/, scripts/, dist/.
const FILES = [
  "plugin.json",
  "mcp_config.json",
  "AGENTS.md",
  "GEMINI.md",
  "gemini-extension.json",
  "LICENSE",
  "README.md",
  "package.json",
];
const DIRS = ["skills", "assets", "reference"];

for (const f of FILES) cpSync(join(root, f), join(bundle, f));
for (const d of DIRS) cpSync(join(root, d), join(bundle, d), { recursive: true });

execFileSync("zip", ["-qr", "tandem-plugin.zip", "tandem-plugin"], { cwd: out });
rmSync(bundle, { recursive: true, force: true });

console.log("packaged: tandem-plugin.zip in dist/plugin");