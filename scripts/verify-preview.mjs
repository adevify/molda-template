import { readFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const presentationRoots = [
  join(root, "packages", "components", "src"),
  join(root, "packages", "pages", "src"),
];
const forbidden = [
  /\bfetch\s*\(/,
  /\bXMLHttpRequest\b/,
  /\bWebSocket\b/,
  /\blocalStorage\b/,
  /\bsessionStorage\b/,
  /\baxios\b/i,
  /\bmongodb\b/i,
];

async function sourceFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await sourceFiles(path));
    else if (/\.(?:ts|tsx)$/.test(entry.name)) files.push(path);
  }
  return files;
}

const violations = [];
for (const directory of presentationRoots) {
  for (const path of await sourceFiles(directory)) {
    const source = await readFile(path, "utf8");
    for (const pattern of forbidden) {
      if (pattern.test(source)) violations.push(`${path}: forbidden integration ${pattern}`);
    }
  }
}

if (violations.length) throw new Error(violations.join("\n"));
JSON.parse(await readFile(join(root, ".preview", "fixtures", "project.json"), "utf8"));
console.log("Preview boundaries verified.");
