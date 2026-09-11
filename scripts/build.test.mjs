import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

test("build and check validate manifest assets and generated copies", () => {
  const root = fileURLToPath(new URL("..", import.meta.url));
  const scratch = mkdtempSync(join(tmpdir(), "plugin-assets-"));
  const run = (...args) => spawnSync(process.execPath, ["scripts/build.mjs", ...args], { cwd: scratch, encoding: "utf8" });
  try {
    cpSync(root, scratch, {
      recursive: true,
      filter: (source) => ![".git", "node_modules", "variants", ".scratch"].some((dir) => source === join(root, dir)),
    });
    assert.equal(run().status, 0);
    assert.equal(run("--check").status, 0);
    for (const [manifest, fields] of [
      [".codex-plugin/plugin.json", ["composerIcon", "logo", "logoDark"]],
      [".cursor-plugin/plugin.json", ["logo"]],
    ]) {
      const path = join(scratch, manifest);
      const original = readFileSync(path, "utf8");
      for (const field of fields) {
        const data = JSON.parse(original);
        (data.interface ?? data)[field] = "./assets/missing.png";
        writeFileSync(path, JSON.stringify(data));
        for (const args of [[], ["--check"]]) {
          const result = run(...args);
          assert.equal(result.status, 1);
          assert.ok(result.stderr.includes(`${manifest}: ${field} must reference an existing asset file`));
        }
      }
      writeFileSync(path, original);
    }
    const codexPath = join(scratch, ".codex-plugin/plugin.json");
    const codexOriginal = readFileSync(codexPath, "utf8");
    const codex = JSON.parse(codexOriginal);
    delete codex.interface.logoDark;
    writeFileSync(codexPath, JSON.stringify(codex));
    assert.equal(run().status, 0);
    assert.equal(run("--check").status, 0);
    writeFileSync(codexPath, codexOriginal);
    assert.equal(run().status, 0);
    writeFileSync(join(scratch, "variants/stage/assets/icon.png"), "stale");
    assert.match(run("--check").stderr, /variants\/stage\/assets\/icon\.png is stale/);
    assert.equal(run().status, 0);
    assert.equal(run("--check").status, 0);
    rmSync(join(scratch, "assets/icon.png"));
    for (const args of [[], ["--check"]]) {
      const result = run(...args);
      assert.equal(result.status, 1);
      assert.match(result.stderr, /must reference an existing asset file/);
      assert.doesNotMatch(result.stderr, /ENOENT/);
    }
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
});
