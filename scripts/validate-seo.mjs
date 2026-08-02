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

async function countSourcePages(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  let count = 0;

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      count += await countSourcePages(absolutePath);
    } else if (entry.name.endsWith(".md") && entry.name !== "SUMMARY.md") {
      count += 1;
    }
  }

  return count;
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

const renderedPages = new Map();
const pageMetadata = new Map();

for (const file of htmlFiles) {
  const route = routeFromFile(file);
  renderedPages.set(route, {
    file,
    html: await readFile(file, "utf8")
  });
}

for (const [route, page] of renderedPages) {
  const { file, html } = page;
  const locale = localeForRoute(route);
  const canonical = route === "/" ? siteUrl : `${siteUrl}${route}`;
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1] ?? "";
  const description =
    html.match(/<meta name="description" content="([^"]+)"/)?.[1] ?? "";

  pageMetadata.set(route, { title, description });

  const titleLimit = locale.lang === "zh-CN" ? 48 : 70;
  const descriptionLimit = locale.lang === "zh-CN" ? 90 : 165;
  if (title.length > titleLimit) {
    failures.push(
      `${path.relative(outputDirectory, file)}: title is ${title.length} characters (limit ${titleLimit})`
    );
  }
  if (description.length > descriptionLimit) {
    failures.push(
      `${path.relative(outputDirectory, file)}: description is ${description.length} characters (limit ${descriptionLimit})`
    );
  }

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
    /<meta property="og:image" content="https:\/\/docs\.parano1d\.org\/assets\/social\/docs-og-v3\.png"/
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

for (const localePrefix of ["", "/ru", "/zh"]) {
  const coreMiner = pageMetadata.get(`${localePrefix}/operate/internal-mining`);
  const walletMiner = pageMetadata.get(`${localePrefix}/wallet/mining`);
  if (!coreMiner || !walletMiner) {
    failures.push(`${localePrefix || "/en"}: missing one of the internal miner pages`);
  } else if (coreMiner.title === walletMiner.title) {
    failures.push(
      `${localePrefix || "/en"}: Core and wallet miner pages share the same title`
    );
  }
}

const photoKeyPage = renderedPages.get("/wallet/photo-key");
if (!photoKeyPage) {
  failures.push("wallet/photo-key: page is missing");
} else {
  expect(
    photoKeyPage.file,
    photoKeyPage.html,
    "optimized Photo Key image with intrinsic dimensions",
    /<img src="\/assets\/wallet\/photo-key\.webp"[^>]*srcset="\/assets\/wallet\/photo-key-960\.webp 960w, \/assets\/wallet\/photo-key\.webp 1920w"[^>]*sizes="[^"]+"[^>]*width="1920"[^>]*height="1200"[^>]*loading="eager"[^>]*fetchpriority="high"/
  );
}

for (const [route, page] of renderedPages) {
  const ids = new Map(
    [...page.html.matchAll(/\sid="([^"]+)"/g)].map((match) => [
      match[1],
      true
    ])
  );

  for (const match of page.html.matchAll(/<a\b[^>]*\shref="([^"]+)"/g)) {
    const href = match[1];
    if (!href || /^[a-z][a-z0-9+.-]*:/i.test(href)) continue;

    const resolved = new URL(href, `${siteUrl}${route || "/"}`);
    if (resolved.origin !== siteUrl) continue;
    if (
      resolved.pathname.startsWith("/_next/") ||
      resolved.pathname.startsWith("/assets/") ||
      /\.[a-z0-9]{2,8}$/i.test(resolved.pathname)
    ) {
      continue;
    }

    const targetRoute =
      resolved.pathname.length > 1
        ? resolved.pathname.replace(/\/$/, "")
        : resolved.pathname;
    const target = renderedPages.get(targetRoute);
    if (!target) {
      failures.push(`${route}: broken internal route ${href}`);
      continue;
    }

    if (!resolved.hash) continue;
    const fragment = decodeURIComponent(resolved.hash.slice(1));
    if (!fragment) continue;
    const targetIds =
      target === page
        ? ids
        : new Map(
            [...target.html.matchAll(/\sid="([^"]+)"/g)].map((idMatch) => [
              idMatch[1],
              true
            ])
          );
    if (!targetIds.has(fragment)) {
      failures.push(`${route}: broken internal anchor ${href}`);
    }
  }
}

const expectedRootTitles = {
  "index.html": "Parano1d Documentation",
  "ru.html": "Документация Parano1d",
  "zh.html": "Parano1d 技术文档"
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

const sourcePageCount = await countSourcePages(path.resolve("content/en"));
const expectedPageCount = sourcePageCount * 3;
if (htmlFiles.length !== expectedPageCount) {
  failures.push(
    `expected ${expectedPageCount} indexable pages from ${sourcePageCount} source pages, found ${htmlFiles.length}`
  );
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
