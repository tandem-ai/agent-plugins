// One zip per skill, for a customer's Organization settings → Skills → Add.
//
// That upload is the ONLY route that gives a customer's owner our skills without
// them mirroring this repository: it takes a zip whose ROOT is the skill folder,
// carrying SKILL.md and its references. So this script exists to make the thing
// an admin can actually accept, and nothing else.
//
// The packaged copy renames the skill — `setup` becomes `tandem-setup` — because
// a standalone skill lands in the customer's directory under its own bare name,
// where "setup" and "sync" say nothing about whose. Inside the plugin the names
// stay short: there the prefix comes from the plugin, as `/tandem:setup`.
import { execFileSync } from "node:child_process";
import {
  cpSync,
  existsSync,
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
const built = [];
for (const skill of skills) {
  const name = `${prefix}-${skill}`;
  const stage = join(out, name);
  cpSync(join(skillsDir, skill), stage, { recursive: true });

  const file = join(stage, "SKILL.md");
  const text = readFileSync(file, "utf8");
  const renamed = text.replace(/^name:\s*.+$/m, `name: ${name}`);
  if (renamed === text) throw new Error(`${skill}: no name in frontmatter to rename`);
  writeFileSync(file, renamed);

  // -r for the references directory, and the folder as the zip's root entry.
  execFileSync("zip", ["-qr", `${name}.zip`, name], { cwd: out });
  rmSync(stage, { recursive: true, force: true });
  built.push(`${name}.zip`);
}

if (!built.length) throw new Error("no skills to package");

/* One more archive, for the platforms that read skills out of a REPOSITORY
   rather than taking an upload: Cursor from `.agents/skills/`, Copilot from
   `.github/skills/`. They want the skill folders, not a zip each, so this is
   the same content shaped for a copy — and because it lands in the customer's
   own repo, their next pull is what updates it. */
const bundleDir = join(out, "tandem-skills");
mkdirSync(bundleDir, { recursive: true });
for (const skill of skills) {
  cpSync(join(skillsDir, skill), join(bundleDir, `${prefix}-${skill}`), {
    recursive: true,
  });
  const file = join(bundleDir, `${prefix}-${skill}`, "SKILL.md");
  writeFileSync(
    file,
    readFileSync(file, "utf8").replace(
      /^name:\s*.+$/m,
      `name: ${prefix}-${skill}`,
    ),
  );
}
execFileSync("zip", ["-qr", "tandem-skills.zip", "tandem-skills"], { cwd: out });
rmSync(bundleDir, { recursive: true, force: true });
built.push("tandem-skills.zip");

console.log(`packaged: ${built.join(", ")} in dist/skills`);
