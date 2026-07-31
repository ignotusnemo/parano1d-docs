import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const outputRoot = resolve("out");

function walkHtml(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = resolve(directory, entry.name);
    if (entry.isDirectory()) return walkHtml(absolute);
    return entry.name.endsWith(".html") ? [absolute] : [];
  });
}

const localeRoots = {
  ru: "ru",
  zh: "zh-CN"
};

let updated = 0;

for (const [route, htmlLang] of Object.entries(localeRoots)) {
  const files = [
    resolve(outputRoot, `${route}.html`),
    ...walkHtml(resolve(outputRoot, route))
  ];

  for (const file of files) {
    const source = readFileSync(file, "utf8");
    if (source.includes(`<html lang="${htmlLang}">`)) {
      continue;
    }

    if (!source.includes('<html lang="en">')) {
      throw new Error(`Expected an English html lang marker in ${file}`);
    }

    const localized = source.replace(
      /<html lang="en">/,
      `<html lang="${htmlLang}">`
    );
    writeFileSync(file, localized);
    updated += 1;
  }
}

console.log(`Localized static html lang attributes in ${updated} pages`);
