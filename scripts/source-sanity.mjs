import { readFile, readdir } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import process from "node:process";

const root = process.cwd();
const sourceRoots = ["app", "components", "lib", "tests"];
const rootFiles = [".env.example", "README.md"];
const allowedExtensions = new Set([".ts", ".tsx", ".js", ".mjs", ".css", ".md", ".example"]);

const forbidden = [
  { label: "legacy AI import", value: "@/lib/ai-template" },
  { label: "legacy AI endpoint", value: "/api/ai/generate-template" },
  { label: "Gemini API key", value: "GEMINI_API_KEY" },
  { label: "Gemini model", value: "GEMINI_MODEL" },
  { label: "old AI action", value: "Buat dengan AI" },
  { label: "mojibake U+00C2", value: "\u00c2" },
  { label: "mojibake prefix", value: "\u00e2\u20ac" },
  { label: "replacement character", value: "\ufffd" },
  { label: "broken dash regex", value: "/[_---]+/g" },
];

async function collectFiles(directory) {
  const entries = await readdir(join(root, directory), { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const relativePath = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(relativePath)));
    } else if (allowedExtensions.has(extname(entry.name))) {
      files.push(relativePath);
    }
  }
  return files;
}

const files = [
  ...(await Promise.all(sourceRoots.map(collectFiles))).flat(),
  ...rootFiles,
];
const violations = [];

for (const file of files) {
  const fullPath = join(root, file);
  const content = await readFile(fullPath, "utf8");
  for (const rule of forbidden) {
    if (content.includes(rule.value)) {
      violations.push(`${relative(root, fullPath)}: ${rule.label}`);
    }
  }
}

if (violations.length) {
  console.error("Source sanity check gagal:");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log(`Source sanity check OK (${files.length} files).`);
