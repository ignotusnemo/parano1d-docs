import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";

const contentRoot = resolve("content");
const locales = ["en", "ru", "zh"];
const translatedLocales = ["ru", "zh"];
const failures = [];
const executableFenceLanguages = new Set([
  "sh",
  "bash",
  "powershell",
  "json",
  "toml",
  "ini",
  "http"
]);

function normalizeSlash(value) {
  return value.split(sep).join("/");
}

function walkMarkdown(directory, base = directory) {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const absolute = resolve(directory, entry.name);
      if (entry.isDirectory()) return walkMarkdown(absolute, base);
      if (!entry.name.endsWith(".md")) return [];
      return [normalizeSlash(relative(base, absolute))];
    })
    .sort();
}

function extractFences(markdown) {
  return [...markdown.matchAll(/```([^\n]*)\n([\s\S]*?)```/g)].map(
    ([, info, body]) => ({
      language: info.trim().split(/\s+/)[0],
      body
    })
  );
}

function extractLinks(markdown) {
  return [...markdown.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)].map(
    ([, href]) => href.trim().split(/\s+/)[0]
  );
}

const fileSets = Object.fromEntries(
  locales.map((locale) => [
    locale,
    walkMarkdown(resolve(contentRoot, locale))
  ])
);
const englishFiles = fileSets.en;

for (const locale of translatedLocales) {
  const missing = englishFiles.filter((file) => !fileSets[locale].includes(file));
  const extra = fileSets[locale].filter((file) => !englishFiles.includes(file));
  if (missing.length) failures.push(`${locale}: missing ${missing.join(", ")}`);
  if (extra.length) failures.push(`${locale}: extra ${extra.join(", ")}`);
}

for (const sourcePath of englishFiles.filter((file) => file !== "SUMMARY.md")) {
  const english = readFileSync(resolve(contentRoot, "en", sourcePath), "utf8");
  const englishFences = extractFences(english);

  for (const locale of translatedLocales) {
    const localizedPath = resolve(contentRoot, locale, sourcePath);
    if (!existsSync(localizedPath)) continue;
    const localized = readFileSync(localizedPath, "utf8");

    if (localized === english) {
      failures.push(`${locale}/${sourcePath}: still identical to English`);
    }
    if (!/^#\s+\S/m.test(localized)) {
      failures.push(`${locale}/${sourcePath}: missing H1`);
    }

    const localizedFences = extractFences(localized);
    if (localizedFences.length !== englishFences.length) {
      failures.push(
        `${locale}/${sourcePath}: ${localizedFences.length} code fences, expected ${englishFences.length}`
      );
    } else {
      englishFences.forEach((fence, index) => {
        const translatedFence = localizedFences[index];
        if (translatedFence.language !== fence.language) {
          failures.push(
            `${locale}/${sourcePath}: fence ${index + 1} language changed`
          );
        }
        if (
          executableFenceLanguages.has(fence.language) &&
          translatedFence.body !== fence.body
        ) {
          failures.push(
            `${locale}/${sourcePath}: executable fence ${index + 1} changed`
          );
        }
      });
    }

    for (const href of extractLinks(localized)) {
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("/") ||
        /^[a-z][a-z0-9+.-]*:/i.test(href)
      ) {
        continue;
      }

      const target = href.split(/[?#]/)[0];
      if (!target.endsWith(".md")) continue;
      const candidate = resolve(dirname(localizedPath), target);
      if (!existsSync(candidate)) {
        failures.push(`${locale}/${sourcePath}: broken link ${href}`);
      }
    }
  }
}

for (const locale of locales) {
  const summary = readFileSync(resolve(contentRoot, locale, "SUMMARY.md"), "utf8");
  for (const href of extractLinks(summary)) {
    const target = href.split(/[?#]/)[0];
    if (!target.endsWith(".md")) continue;
    if (!existsSync(resolve(contentRoot, locale, target))) {
      failures.push(`${locale}/SUMMARY.md: broken link ${href}`);
    }
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  `Locale validation passed for ${englishFiles.length - 1} pages in ${locales.length} languages`
);
