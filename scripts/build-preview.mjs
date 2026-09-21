import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { extname, join, relative, resolve } from "node:path";

import { build } from "esbuild";

const root = resolve(import.meta.dirname, "..");
const pagesRoot = join(root, "packages", "pages", "src");
const previewRoot = join(root, ".preview");

async function discover(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await discover(path));
    else if (/\.page\.tsx$/.test(entry.name)) files.push(path);
  }
  return files.sort();
}

const pageFiles = await discover(pagesRoot);
if (pageFiles.length === 0) {
  throw new Error("No preview pages found. Create a real packages/pages/src/*.page.tsx page first.");
}

const imports = pageFiles.map((path, index) => {
  const source = relative(previewRoot, path).replaceAll("\\", "/");
  return `import page${index} from ${JSON.stringify(source.startsWith(".") ? source : `./${source}`)};`;
});
const registry = `${imports.join("\n")}\n\nexport const pages = [${pageFiles.map((_, index) => `page${index}`).join(", ")}];\n`;
await writeFile(join(previewRoot, "generated-pages.ts"), registry);

await build({
  entryPoints: [join(previewRoot, "entry.tsx")],
  outfile: join(previewRoot, "bundle.js"),
  bundle: true,
  format: "iife",
  platform: "browser",
  target: ["es2022"],
  jsx: "automatic",
  minify: true,
  sourcemap: false,
  logLevel: "info",
});

const bundle = await readFile(join(previewRoot, "bundle.js"));
const fixture = JSON.parse(await readFile(join(previewRoot, "fixtures", "project.json"), "utf8"));
const manifest = {
  entry: ".preview/entry.tsx",
  bundle: ".preview/bundle.js",
  contentHash: `sha256:${createHash("sha256").update(bundle).digest("hex")}`,
  pages: pageFiles.map((path) => relative(root, path).replaceAll("\\", "/")),
  fixture: ".preview/fixtures/project.json",
  fixtureKeys: Object.keys(fixture).sort(),
  builtAt: new Date().toISOString(),
};
await writeFile(join(previewRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
