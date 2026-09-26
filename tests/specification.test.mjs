import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import { test } from "node:test";
import { dirname, extname, join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const codeRuleNames = [
  "architecture.md",
  "typescript.md",
  "react-mui.md",
  "node-runtime.md",
  "trpc.md",
  "zod-contracts.md",
  "mongodb.md",
  "external-files.md",
  "structural-data-tools.md",
  "security.md",
  "testing.md",
  "docker.md",
  "static-uis.md",
  "project-composition.md",
  "composer.md",
  "common-mcp.md",
  "events.md",
  "module-authoring.md",
];
const exampleNames = [
  "README.md",
  "start-project.md",
  "react-page-and-bindings.md",
  "trpc-and-zod.md",
  "composer-and-mcp.md",
  "mongo-repository.md",
  "structural-data-tools.md",
  "events.md",
  "multi-ui-static.md",
  "module-definition.md",
];
const requiredHandbookDocs = [
  "docs/README.md",
  "docs/frameworks.md",
  ...codeRuleNames.map((name) => `docs/code-rules/${name}`),
  "docs/modules/README.md",
  "docs/modules/catalog.md",
  ...exampleNames.map((name) => `docs/examples/${name}`),
];

test("all required handbook and example documents exist", async () => {
  for (const path of requiredHandbookDocs) {
    const info = await stat(join(root, path)).catch(() => null);
    assert.ok(info?.isFile(), `${path} must exist`);
  }
});

test("every code-rules guide has the standard contract sections", async () => {
  const headings = [
    "Responsibility",
    "Non-responsibility",
    "Required rules",
    "Limitations",
    "Correct example",
    "Avoid",
    "Verification",
  ];

  for (const name of codeRuleNames) {
    const path = `docs/code-rules/${name}`;
    const markdown = await readFile(join(root, path), "utf8");
    for (const heading of headings) {
      assert.match(
        markdown,
        new RegExp(`^#{1,6}\\s+${heading.replaceAll(" ", "\\s+")}\\s*$`, "im"),
        `${path} must have a ${heading} heading`,
      );
    }
  }
});

test("the module catalog covers all 20 installed domain declaration packages", async () => {
  const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
  const moduleNames = Object.keys(packageJson.devDependencies)
    .filter((name) => name.startsWith("@molda-org/") && name !== "@molda-org/module-contracts")
    .map((name) => name.slice("@molda-org/".length))
    .sort();
  assert.equal(moduleNames.length, 20, "package.json must prelist exactly 20 domain declaration packages");

  const catalog = await readFile(join(root, "docs/modules/catalog.md"), "utf8");
  assert.equal(
    catalog.match(/^- \*\*Declared surface:\*\*/gm)?.length,
    20,
    "every domain module must document its exact declaration surface",
  );
  for (const moduleName of moduleNames) {
    assert.ok(
      catalog.includes(`@molda-org/${moduleName}`) || catalog.includes("`" + moduleName + "`"),
      `docs/modules/catalog.md must represent module ${moduleName}`,
    );
  }
});

async function markdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return markdownFiles(path);
      return entry.isFile() && extname(entry.name).toLowerCase() === ".md" ? [path] : [];
    }),
  );
  return nested.flat();
}

function withoutFencedCode(markdown) {
  return markdown.replace(/^\s*(```|~~~)[^\n]*\n[\s\S]*?^\s*\1\s*$/gm, "");
}

function markdownLinkTargets(markdown) {
  const source = withoutFencedCode(markdown);
  const targets = [];
  const inlineLink = /\[[^\]]*\]\(\s*(?:<([^>]+)>|([^\s)]+))(?:\s+[^)]*)?\s*\)/g;
  const referenceDefinition = /^\s*\[[^\]]+\]:\s*<?([^\s>]+)>?/gm;
  for (const match of source.matchAll(inlineLink)) targets.push(match[1] ?? match[2]);
  for (const match of source.matchAll(referenceDefinition)) targets.push(match[1]);
  return targets;
}

test("internal relative Markdown links in docs and root guides resolve", async () => {
  const rootGuides = ["FIRST.md", "CODER.md", "README.md", "AGENTS.md"].map((path) => join(root, path));
  const sources = [...(await markdownFiles(join(root, "docs"))), ...rootGuides];
  const broken = [];

  for (const sourcePath of sources) {
    const markdown = await readFile(sourcePath, "utf8");
    for (const target of markdownLinkTargets(markdown)) {
      if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(target)) continue;
      const pathname = decodeURIComponent(target.split(/[?#]/, 1)[0]);
      if (!pathname) continue;
      const resolved = resolve(dirname(sourcePath), pathname);
      if (!resolved.startsWith(`${root}/`) && resolved !== root) continue;
      const info = await stat(resolved).catch(() => null);
      const linkedFile = info?.isDirectory() ? await stat(join(resolved, "README.md")).catch(() => null) : info;
      if (!linkedFile?.isFile()) {
        broken.push(`${sourcePath.slice(root.length + 1)} -> ${target}`);
      }
    }
  }

  assert.deepEqual(broken, [], `broken internal Markdown links:\n${broken.join("\n")}`);
});
