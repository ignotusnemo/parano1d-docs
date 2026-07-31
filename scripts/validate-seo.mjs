import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const outputDirectory = path.resolve("out");
const siteUrl = "https://docs.parano1d.org";
const failures = [];

const localeForRoute = (route) => {
  if (route === "/ru" || route.startsWith("/ru/")) {
    return { lang: "ru", og: "ru_RU" };
  }
  if (route === "/zh" || route.startsWith("/zh/")) {
    return { lang: "zh-CN", og: "zh_CN" };
  }
  return { lang: "en", og: "en_US" };
};

async function collectHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectHtmlFiles(absolutePath)));
    } else if (entry.name.endsWith(".html")) {
      files.push(absolutePath);
    }
  }

  return files;
}

function routeFromFile(file) {
  const relative = path.relative(outputDirectory, file).replaceAll(path.sep, "/");
  if (relative === "index.html") return "/";
  return `/${relative.replace(/\/index\.html$/, "").replace(/\.html$/, "")}`;
}

function expect(file, html, label, pattern) {
  if (!pattern.test(html)) {
    failures.push(`${path.relative(outputDirectory, file)}: missing ${label}`);
  }
}

const htmlFiles = (await collectHtmlFiles(outputDirectory)).filter((file) => {
  const route = routeFromFile(file);
  return route !== "/404" && !route.includes("_not-found");
});

for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const route = routeFromFile(file);
  const locale = localeForRoute(route);
  const canonical = route === "/" ? siteUrl : `${siteUrl}${route}`;

  expect(file, html, "title", /<title>[^<]+<\/title>/);
  expect(
    file,
    html,
    "meta description",
    /<meta name="description" content="[^"]+"/
  );
  expect(
    file,
    html,
    "canonical URL",
    new RegExp(
      `<link rel="canonical" href="${canonical.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`
    )
  );
  expect(file, html, "html language", new RegExp(`<html lang="${locale.lang}">`));
  expect(file, html, "robots directive", /<meta name="robots" content="[^"]+"/);
  expect(file, html, "Open Graph title", /<meta property="og:title" content="[^"]+"/);
  expect(
    file,
    html,
    "Open Graph description",
    /<meta property="og:description" content="[^"]+"/
  );
  expect(
    file,
    html,
    "Open Graph locale",
    new RegExp(`<meta property="og:locale" content="${locale.og}"`)
  );
  expect(
    file,
    html,
    "Open Graph image",
    /<meta property="og:image" content="https:\/\/docs\.parano1d\.org\/assets\/social\/docs-og\.png"/
  );
  expect(
    file,
    html,
    "Twitter card",
    /<meta name="twitter:card" content="summary_large_image"/
  );
  expect(file, html, "structured data", /<script type="application\/ld\+json">/);

  for (const language of ["en", "ru", "zh-CN", "x-default"]) {
    expect(
      file,
      html,
      `hreflang ${language}`,
      new RegExp(`<link rel="alternate" hrefLang="${language.replace("-", "\\-")}"|<link rel="alternate" hreflang="${language.replace("-", "\\-")}"`)
    );
  }
}

const expectedRootTitles = {
  "index.html": "ParanO(1)d Documentation",
  "ru.html": "Документация ParanO(1)d",
  "zh.html": "ParanO(1)d 技术文档"
};

for (const [relative, title] of Object.entries(expectedRootTitles)) {
  const html = await readFile(path.join(outputDirectory, relative), "utf8");
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const matches = html.match(new RegExp(`<title>${escaped}</title>`, "g")) ?? [];
  if (matches.length !== 1) {
    failures.push(
      `${relative}: expected one exact localized homepage title, found ${matches.length}`
    );
  }
}

if (htmlFiles.length !== 153) {
  failures.push(`expected 153 indexable pages, found ${htmlFiles.length}`);
}

const sitemap = await readFile(path.join(outputDirectory, "sitemap.xml"), "utf8");
const sitemapUrls = sitemap.match(/<loc>/g)?.length ?? 0;
if (sitemapUrls !== htmlFiles.length) {
  failures.push(
    `sitemap.xml: contains ${sitemapUrls} URLs for ${htmlFiles.length} indexable pages`
  );
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  `SEO validation passed for ${htmlFiles.length} pages in English, Russian, and Simplified Chinese.`
);
