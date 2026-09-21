import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

test("template exposes the required workspace packages", async () => {
  const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
  assert.deepEqual(packageJson.workspaces, ["apps/*", "packages/*"]);
  for (const path of [
    "FIRST.md",
    "CODER.md",
    "packages/components/package.json",
    "packages/pages/package.json",
    ".preview/fixtures/project.json",
    "project/workflow.md",
  ]) {
    assert.ok((await readFile(join(root, path))).length > 0, `${path} must exist`);
  }
});

test("preview coder contract forbids application and API implementation", async () => {
  const contract = await readFile(join(root, "CODER.md"), "utf8");
  assert.match(contract, /any file under `apps\/\*\*`/);
  assert.match(contract, /direct network or storage calls/);
  assert.match(contract, /packages\/components\/src/);
  assert.match(contract, /packages\/pages\/src/);
  assert.match(contract, /Status: approved/);
});

test("bootstrap contract derives folder, branch, and subdomain from one key", async () => {
  const contract = await readFile(join(root, "FIRST.md"), "utf8");
  assert.match(contract, /local folder name/);
  assert.match(contract, /Git branch name/);
  assert.match(contract, /subdomain prefix/);
  assert.match(contract, /--branch main --single-branch/);
});
