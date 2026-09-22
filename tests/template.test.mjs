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
    "packages/project-types/package.json",
    ".preview/fixtures/project.json",
    ".preview/fixtures/SOURCES.md",
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
  assert.match(contract, /packages\/project-types\/index\.d\.ts/);
  assert.match(contract, /@molda-org\/\*/);
  assert.match(contract, /SOURCES\.md/);
  assert.match(contract, /Status: approved/);
});

test("template prelists the complete npm next declaration catalog", async () => {
  const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
  const expected = [
    "module-contracts",
    "core",
    "identity",
    "customers",
    "content",
    "media",
    "forms",
    "notifications",
    "workflow-actions-audit",
    "views-exports",
    "catalog-pricing",
    "scheduling",
    "reservations",
    "orders-fulfillment",
    "payments",
    "quotes-custom-orders",
    "promotions-loyalty",
    "memberships",
    "events-tickets",
    "rentals",
    "service-jobs",
  ].map((name) => `@molda-org/${name}`).sort();

  const actual = Object.entries(packageJson.devDependencies)
    .filter(([name]) => name.startsWith("@molda-org/"))
    .map(([name, version]) => {
      assert.equal(version, "next", `${name} must follow the next channel`);
      return name;
    })
    .sort();
  assert.deepEqual(actual, expected);
});

test("project type declarations are an extension seam, not a duplicate module model", async () => {
  const declaration = await readFile(join(root, "packages/project-types/index.d.ts"), "utf8");
  assert.match(declaration, /ProjectTypeExtension/);
  assert.match(declaration, /ModuleType & ProjectFields/);
  assert.doesNotMatch(declaration, /interface (Customer|Product|Order|Payment)/);
});

test("bootstrap contract derives folder, branch, and subdomain from one key", async () => {
  const contract = await readFile(join(root, "FIRST.md"), "utf8");
  assert.match(contract, /local folder name/);
  assert.match(contract, /Git branch name/);
  assert.match(contract, /subdomain prefix/);
  assert.match(contract, /--branch main --single-branch/);
  assert.match(contract, /@molda-org\/module-contracts/);
  assert.match(contract, /npm install/);
});
