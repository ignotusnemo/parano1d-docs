import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = resolve(
  process.env.PARANO1D_REPO ?? resolve(siteRoot, "../parano1d")
);
const sourceDocs = resolve(sourceRoot, "docs");
const contentTarget = resolve(siteRoot, "content");
const assetTarget = resolve(siteRoot, "public/assets");
const localizedSources = {
  ru: resolve(sourceDocs, "i18n", "ru"),
  zh: resolve(sourceDocs, "i18n", "zh")
};

if (!existsSync(resolve(sourceDocs, "SUMMARY.md"))) {
  throw new Error(`Documentation source not found: ${sourceDocs}`);
}

rmSync(contentTarget, { recursive: true, force: true });
const englishTarget = resolve(contentTarget, "en");
mkdirSync(englishTarget, { recursive: true });

for (const entry of readdirSync(sourceDocs, { withFileTypes: true })) {
  if (entry.name === "assets" || entry.name === "i18n") continue;
  cpSync(
    resolve(sourceDocs, entry.name),
    resolve(englishTarget, entry.name),
    { recursive: entry.isDirectory() }
  );
}

for (const [locale, source] of Object.entries(localizedSources)) {
  if (!existsSync(resolve(source, "SUMMARY.md"))) {
    throw new Error(`Localized documentation source not found: ${source}`);
  }
  cpSync(source, resolve(contentTarget, locale), { recursive: true });
}

for (const group of ["architecture", "wallet"]) {
  const source = resolve(sourceDocs, "assets", group);
  const target = resolve(assetTarget, group);
  rmSync(target, { recursive: true, force: true });
  cpSync(source, target, { recursive: true });
}

console.log(`Synced documentation from ${sourceDocs}`);
