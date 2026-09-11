// One zip holding every skill, for a customer to install.
//
// It is the only route that gives a customer our skills without them mirroring
// this repository, and one download is what a person hands to an admin.
//
// The packaged copy renames the skill — `setup` becomes `tandem-setup` — because
// a standalone skill lands in the customer's directory under its own bare name,
// where "setup" and "sync" say nothing about whose. Inside the plugin the names
// stay short: there the prefix comes from the plugin, as `/tandem:setup`.
import { execFileSync } from "node:child_process";
import {
  cpSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const out = join(root, "dist", "skills");
const skillsDir = join(root, "skills");
const prefix = "tandem";

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const skills = readdirSync(skillsDir).filter((d) =>
  statSync(join(skillsDir, d)).isDirectory(),
);
if (!skills.length) throw new Error("no skills to package");

/* ONE ARCHIVE, holding one folder per skill. Cursor and Copilot read skills
   from a directory, so this unzips straight into `.agents/skills/` or
   `.github/skills/`. Claude's organization upload takes one skill folder per
   file, so an owner unzips this and adds each folder — one download either way,
   which is what somebody handing this to a customer actually wants. */
const bundle = join(out, "tandem-skills");
mkdirSync(bundle, { recursive: true });
for (const skill of skills) {
  const name = `${prefix}-${skill}`;
  cpSync(join(skillsDir, skill), join(bundle, name), { recursive: true });
  const file = join(bundle, name, "SKILL.md");
  const text = readFileSync(file, "utf8");
  const renamed = text.replace(/^name:\s*.+$/m, `name: ${name}`);
  if (renamed === text) throw new Error(`${skill}: no name in frontmatter to rename`);
  writeFileSync(file, renamed);
}

execFileSync("zip", ["-qr", "tandem-skills.zip", "tandem-skills"], { cwd: out });
rmSync(bundle, { recursive: true, force: true });

console.log(
  `packaged: tandem-skills.zip (${skills.map((s) => `${prefix}-${s}`).join(", ")}) in dist/skills`,
);
