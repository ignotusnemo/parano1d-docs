import MarkdownIt from "markdown-it";
import anchor from "markdown-it-anchor";
import { mathPlugin } from "@/lib/math";
import {
  generatedDocuments,
  generatedImageDimensions,
  generatedImageVariants,
  generatedResponsiveImageVariants,
  generatedSummaries
} from "@/generated/docs-content";
import {
  locales,
  pathForLocale,
  routeSegmentsForLocale,
  uiCopy,
  type Locale
} from "@/lib/i18n";

export type NavItem = {
  title: string;
  slug: string;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export type TocItem = {
  id: string;
  title: string;
  level: number;
};

export type SearchEntry = {
  title: string;
  slug: string;
  section: string;
  description: string;
  text: string;
};

export type DocPage = {
  slug: string;
  sourcePath: string;
  title: string;
  description: string;
  html: string;
  toc: TocItem[];
};

function normalizeSlash(value: string): string {
  return value.replaceAll("\\", "/");
}

export function slugFromSource(sourcePath: string): string {
  const withoutExtension = normalizeSlash(sourcePath).replace(/\.md$/i, "");
  if (withoutExtension === "index") return "";
  return withoutExtension.replace(/\/index$/i, "");
}

function sourceFromSlug(locale: Locale, slug: string): string | null {
  const documents = generatedDocuments[locale];
  if (!slug) return "index.md";

  const direct = `${slug}.md`;
  if (direct in documents) return direct;

  const nested = `${slug}/index.md`;
  if (nested in documents) return nested;

  return null;
}

export function getAllSlugs(locale: Locale): string[] {
  return Object.keys(generatedDocuments[locale]).sort().map(slugFromSource);
}

export function getAllRouteSegments(): string[][] {
  return locales.flatMap((locale) =>
    getAllSlugs(locale).map((slug) => routeSegmentsForLocale(locale, slug))
  );
}

function cleanInlineMarkdown(value: string): string {
  return value
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[*_~>#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function titleFromMarkdown(raw: string): string {
  const match = raw.match(/^#\s+(.+)$/m);
  return match ? cleanInlineMarkdown(match[1]) : "Untitled";
}

function truncateDescription(value: string, locale: Locale): string {
  const maximum = locale === "zh" ? 82 : 160;
  const minimumSentence = locale === "zh" ? 38 : 92;
  if (value.length <= maximum) return value;

  const candidate = value.slice(0, maximum + 1);
  const sentenceBoundary = Math.max(
    candidate.lastIndexOf("。"),
    candidate.lastIndexOf("！"),
    candidate.lastIndexOf("？"),
    candidate.lastIndexOf(". "),
    candidate.lastIndexOf("! "),
    candidate.lastIndexOf("? ")
  );
  if (sentenceBoundary >= minimumSentence) {
    return candidate.slice(0, sentenceBoundary + 1).trim();
  }

  if (locale === "zh") return `${value.slice(0, maximum - 1).trim()}…`;
  const wordBoundary = candidate.lastIndexOf(" ");
  return `${candidate.slice(0, wordBoundary >= minimumSentence ? wordBoundary : maximum - 1).trim()}…`;
}

function descriptionFromMarkdown(raw: string, locale: Locale): string {
  const withoutCode = raw.replace(/```[\s\S]*?```/g, "");
  const blocks = withoutCode
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(
      (block) =>
        block &&
        !block.startsWith("#") &&
        !block.startsWith("|") &&
        !block.startsWith("- ") &&
        !block.startsWith("![")
    );

  const minimum = locale === "zh" ? 42 : 96;
  const descriptionBlocks: string[] = [];
  for (const block of blocks) {
    const clean = cleanInlineMarkdown(block);
    if (!clean) continue;
    descriptionBlocks.push(clean);
    if (descriptionBlocks.join(" ").length >= minimum) break;
  }

  return truncateDescription(descriptionBlocks.join(" "), locale);
}

const seoTitleOverrides: Readonly<Record<Locale, Readonly<Record<string, string>>>> = {
  en: {
    "operate/internal-mining": "Internal Core miner",
    "wallet/mining": "Mining in the wallet"
  },
  ru: {
    "operate/internal-mining": "Встроенный майнер Core",
    "wallet/mining": "Майнинг в кошельке"
  },
  zh: {
    "architecture/state": "Live State 架构",
    "concepts/proof-native-statechain": "证明原生 statechain",
    "operate/internal-mining": "Core 内置矿工",
    "wallet/mining": "在钱包中挖矿"
  }
};

export function getSeoTitle(
  locale: Locale,
  slug: string,
  fallback: string
): string {
  return seoTitleOverrides[locale][slug] ?? fallback;
}

function plainTextFromMarkdown(raw: string): string {
  return cleanInlineMarkdown(
    raw
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/^\|?[-:\s|]+\|?$/gm, " ")
  )
    .toLowerCase()
    .slice(0, 12000);
}

function slugifyHeading(value: string): string {
  return cleanInlineMarkdown(value)
    .toLowerCase()
    .replace(/[^a-z0-9\u00c0-\u024f\u0400-\u04ff\u4e00-\u9fff]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractStableHeadingIds(raw: string): {
  markdown: string;
  headingIds: ReadonlyMap<string, string>;
} {
  const headingIds = new Map<string, string>();
  const markdown = raw.replace(
    /^<a id="([a-z0-9_-]+)"><\/a>\r?\n(#{2,3})\s+(.+)$/gim,
    (_match, id: string, marker: string, title: string) => {
      headingIds.set(cleanInlineMarkdown(title), id);
      return `${marker} ${title}`;
    }
  );

  return { markdown, headingIds };
}

function splitHref(href: string): { pathname: string; suffix: string } {
  const index = href.search(/[?#]/);
  if (index === -1) return { pathname: href, suffix: "" };
  return { pathname: href.slice(0, index), suffix: href.slice(index) };
}

function dirnamePosix(value: string): string {
  const normalized = normalizeSlash(value);
  const separator = normalized.lastIndexOf("/");
  return separator < 0 ? "" : normalized.slice(0, separator);
}

function normalizePosix(value: string): string {
  const normalized: string[] = [];

  for (const part of normalizeSlash(value).split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") {
      normalized.pop();
      continue;
    }
    normalized.push(part);
  }

  return normalized.join("/");
}

function resolveDocHref(
  href: string,
  sourcePath: string,
  locale: Locale
): string {
  if (
    !href ||
    href.startsWith("#") ||
    href.startsWith("/") ||
    /^[a-z][a-z0-9+.-]*:/i.test(href)
  ) {
    return href;
  }

  const { pathname, suffix } = splitHref(href);
  const resolved = normalizePosix(`${dirnamePosix(sourcePath)}/${pathname}`);

  if (resolved.startsWith("assets/")) return `/${resolved}${suffix}`;
  if (!resolved.endsWith(".md")) return `/${resolved}${suffix}`;

  return `${pathForLocale(locale, slugFromSource(resolved))}${suffix}`;
}

function createMarkdownRenderer(
  sourcePath: string,
  locale: Locale,
  headingIds: ReadonlyMap<string, string>
) {
  let imageIndex = 0;
  const md = new MarkdownIt({
    html: false,
    linkify: true,
    typographer: false
  });

  md.use(anchor, {
    level: [2, 3],
    slugify: (value: string) =>
      headingIds.get(cleanInlineMarkdown(value)) ?? slugifyHeading(value)
  });
  md.use(mathPlugin);

  md.renderer.rules.link_open = (tokens, index, options, env, self) => {
    const token = tokens[index];
    const hrefIndex = token.attrIndex("href");

    if (hrefIndex >= 0) {
      const href = String(token.attrs?.[hrefIndex]?.[1] ?? "");
      const resolved = resolveDocHref(href, sourcePath, locale);
      token.attrSet("href", resolved);

      if (/^https?:\/\//i.test(resolved)) {
        token.attrSet("target", "_blank");
        token.attrSet("rel", "noopener noreferrer");
      }
    }

    return self.renderToken(tokens, index, options);
  };

  const defaultImage =
    md.renderer.rules.image ??
    ((tokens, index, options, env, self) =>
      self.renderToken(tokens, index, options));

  md.renderer.rules.image = (tokens, index, options, env, self) => {
    const token = tokens[index];
    const src = String(token.attrGet("src") ?? "");
    const resolvedSource = resolveDocHref(src, sourcePath, locale);
    const optimizedSource = generatedImageVariants[resolvedSource] ?? resolvedSource;
    const responsiveVariant = generatedResponsiveImageVariants[resolvedSource];
    const dimensions =
      generatedImageDimensions[optimizedSource] ??
      generatedImageDimensions[resolvedSource];
    token.attrSet("src", optimizedSource);
    if (responsiveVariant) {
      token.attrSet("srcset", responsiveVariant.srcset);
      token.attrSet("sizes", responsiveVariant.sizes);
    }
    if (dimensions) {
      token.attrSet("width", String(dimensions.width));
      token.attrSet("height", String(dimensions.height));
    }
    if (imageIndex === 0) {
      token.attrSet("loading", "eager");
      token.attrSet("fetchpriority", "high");
      token.attrSet("decoding", "async");
    } else {
      token.attrSet("loading", "lazy");
      token.attrSet("decoding", "async");
    }
    imageIndex += 1;
    return defaultImage(tokens, index, options, env, self);
  };

  md.renderer.rules.fence = (tokens, index) => {
    const token = tokens[index];
    const language = token.info.trim().split(/\s+/)[0] || "text";
    const code = md.utils.escapeHtml(token.content);
    const copy = md.utils.escapeHtml(uiCopy[locale].copy);
    const copied = md.utils.escapeHtml(uiCopy[locale].copied);

    return [
      '<div class="code-block">',
      '<div class="code-toolbar">',
      `<span>${md.utils.escapeHtml(language)}</span>`,
      `<button type="button" data-copy-code data-copy-label="${copy}" data-copied-label="${copied}">${copy}</button>`,
      "</div>",
      `<pre><code class="language-${md.utils.escapeHtml(language)}">${code}</code></pre>`,
      "</div>"
    ].join("");
  };

  return md;
}

export function getNavigation(locale: Locale): NavGroup[] {
  const raw = generatedSummaries[locale];
  const groups: NavGroup[] = [];
  let current: NavGroup = { label: uiCopy[locale].overview, items: [] };

  for (const line of raw.split(/\r?\n/)) {
    const heading = line.match(/^##\s+(.+)$/);
    if (heading) {
      if (current.items.length) groups.push(current);
      current = { label: heading[1].trim(), items: [] };
      continue;
    }

    const item = line.match(/^\s*-\s+\[([^\]]+)\]\(([^)]+)\)/);
    if (!item) continue;

    current.items.push({
      title: item[1].trim(),
      slug: slugFromSource(item[2].trim())
    });
  }

  if (current.items.length) groups.push(current);
  return groups;
}

export function getDoc(locale: Locale, slug: string): DocPage | null {
  const sourcePath = sourceFromSlug(locale, slug);
  if (!sourcePath) return null;

  const raw = generatedDocuments[locale][sourcePath];
  const { markdown, headingIds } = extractStableHeadingIds(raw);
  const md = createMarkdownRenderer(sourcePath, locale, headingIds);
  const tokens = md.parse(markdown, {});
  const toc: TocItem[] = [];

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token.type !== "heading_open") continue;

    const level = Number(token.tag.slice(1));
    if (level < 2 || level > 3) continue;

    const inline = tokens[index + 1];
    toc.push({
      id: String(
        token.attrGet("id") ?? slugifyHeading(inline?.content ?? "")
      ),
      title: cleanInlineMarkdown(inline?.content ?? ""),
      level
    });
  }

  return {
    slug,
    sourcePath,
    title: titleFromMarkdown(raw),
    description: descriptionFromMarkdown(raw, locale),
    html: md.renderer.render(tokens, md.options, {}),
    toc
  };
}

export function getSearchIndex(locale: Locale): SearchEntry[] {
  const navigation = getNavigation(locale);
  const sections = new Map<string, string>();

  for (const group of navigation) {
    for (const item of group.items) sections.set(item.slug, group.label);
  }

  return getAllSlugs(locale).map((slug) => {
    const sourcePath = sourceFromSlug(locale, slug);
    if (!sourcePath) throw new Error(`Missing source for ${slug}`);
    const raw = generatedDocuments[locale][sourcePath];

    return {
      title: titleFromMarkdown(raw),
      slug,
      section: sections.get(slug) ?? uiCopy[locale].documentation,
      description: descriptionFromMarkdown(raw, locale),
      text: plainTextFromMarkdown(raw)
    };
  });
}

export function getAdjacentPages(locale: Locale, slug: string): {
  previous: NavItem | null;
  next: NavItem | null;
} {
  const pages = getNavigation(locale).flatMap((group) => group.items);
  const index = pages.findIndex((item) => item.slug === slug);

  return {
    previous: index > 0 ? pages[index - 1] : null,
    next: index >= 0 && index < pages.length - 1 ? pages[index + 1] : null
  };
}

export function getSectionForSlug(locale: Locale, slug: string): string {
  for (const group of getNavigation(locale)) {
    if (group.items.some((item) => item.slug === slug)) return group.label;
  }
  return uiCopy[locale].documentation;
}
