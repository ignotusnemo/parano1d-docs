"use client";

import Link from "next/link";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from "react";
import type {
  NavGroup,
  NavItem,
  SearchEntry,
  TocItem
} from "@/lib/docs";
import {
  localeInfo,
  locales,
  pathForLocale,
  uiCopy,
  type Locale
} from "@/lib/i18n";

type SiteChromeProps = {
  locale: Locale;
  navigation: NavGroup[];
  searchIndex: SearchEntry[];
  currentSlug: string;
  section: string;
  sourcePath: string;
  toc: TocItem[];
  previous: NavItem | null;
  next: NavItem | null;
  children: React.ReactNode;
};

const SIDEBAR_SCROLL_KEY = "parano1d-docs:sidebar-scroll";
const sidebarScrollMemory = new Map<Locale, number>();

function Brand() {
  return (
    <span className="brand-word" aria-label="ParanO(1)d">
      Paran<span>O(1)</span>d
    </span>
  );
}

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <img src="/assets/icons/parano1d.png" alt="" />
    </span>
  );
}

function SearchGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.8" cy="10.8" r="6.2" />
      <path d="m15.4 15.4 4 4" />
    </svg>
  );
}

function MenuGlyph({ close = false }: { close?: boolean }) {
  return close ? (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function ExternalGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 16 16 8M10 8h6v6" />
    </svg>
  );
}

export default function SiteChrome({
  locale,
  navigation,
  searchIndex,
  currentSlug,
  section,
  sourcePath,
  toc,
  previous,
  next,
  children
}: SiteChromeProps) {
  const copy = uiCopy[locale];
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeHeading, setActiveHeading] = useState(toc[0]?.id ?? "");
  const searchInput = useRef<HTMLInputElement>(null);
  const sidebar = useRef<HTMLElement>(null);

  const rememberSidebarPosition = () => {
    if (!sidebar.current) return;
    const scrollTop = sidebar.current.scrollTop;
    sidebarScrollMemory.set(locale, scrollTop);
    try {
      window.sessionStorage.setItem(
        `${SIDEBAR_SCROLL_KEY}:${locale}`,
        String(scrollTop)
      );
    } catch {
      // Navigation still keeps the in-memory value when storage is unavailable.
    }
  };

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return searchIndex.slice(0, 8);
    const terms = normalized.split(/\s+/).filter(Boolean);

    return searchIndex
      .map((entry) => {
        const title = entry.title.toLowerCase();
        const slug = entry.slug.toLowerCase();
        const sectionName = entry.section.toLowerCase();
        let score = 0;

        if (title === normalized) score += 120;
        if (title.startsWith(normalized)) score += 70;
        if (title.includes(normalized)) score += 45;
        if (slug.includes(normalized)) score += 30;
        if (sectionName.includes(normalized)) score += 18;

        for (const term of terms) {
          if (title.includes(term)) score += 16;
          if (entry.text.includes(term)) score += 3;
        }

        return { entry, score };
      })
      .filter(({ score }) => score > 0)
      .sort(
        (left, right) =>
          right.score - left.score ||
          left.entry.title.localeCompare(right.entry.title)
      )
      .slice(0, 12)
      .map(({ entry }) => entry);
  }, [query, searchIndex]);

  useEffect(() => {
    document.documentElement.lang = localeInfo[locale].htmlLang;
  }, [locale]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }

      if (event.key === "Escape") {
        setSearchOpen(false);
        setNavigationOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!searchOpen) return;
    const frame = window.requestAnimationFrame(() => searchInput.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [searchOpen]);

  useLayoutEffect(() => {
    const element = sidebar.current;
    if (!element) return;

    let savedPosition = sidebarScrollMemory.get(locale) ?? null;
    if (savedPosition === null) {
      try {
        const stored = window.sessionStorage.getItem(
          `${SIDEBAR_SCROLL_KEY}:${locale}`
        );
        if (stored !== null) {
          const parsed = Number(stored);
          if (Number.isFinite(parsed) && parsed >= 0) savedPosition = parsed;
        }
      } catch {
        // The active item fallback below also works without web storage.
      }
    }

    if (savedPosition !== null) {
      element.scrollTop = savedPosition;
      sidebarScrollMemory.set(locale, savedPosition);
    }

    const frame = window.requestAnimationFrame(() => {
      const active = element.querySelector<HTMLElement>("a.is-active");
      if (!active) return;

      const sidebarBounds = element.getBoundingClientRect();
      const activeBounds = active.getBoundingClientRect();
      const visibleTop = sidebarBounds.top + 12;
      const visibleBottom = sidebarBounds.bottom - 68;

      if (activeBounds.top < visibleTop) {
        element.scrollTop -= visibleTop - activeBounds.top;
      } else if (activeBounds.bottom > visibleBottom) {
        element.scrollTop += activeBounds.bottom - visibleBottom;
      }

      sidebarScrollMemory.set(locale, element.scrollTop);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [currentSlug, locale]);

  useEffect(() => {
    const headings = toc
      .map((item) => document.getElementById(item.id))
      .filter((heading): heading is HTMLElement => Boolean(heading));

    if (!headings.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (left, right) =>
              Math.abs(left.boundingClientRect.top) -
              Math.abs(right.boundingClientRect.top)
          );
        if (visible[0]?.target.id) setActiveHeading(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -68% 0px", threshold: [0, 1] }
    );

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [toc]);

  useEffect(() => {
    const onClick = async (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const button = target.closest<HTMLButtonElement>("[data-copy-code]");
      if (!button) return;

      const code = button
        .closest(".code-block")
        ?.querySelector("code")
        ?.textContent?.trimEnd();
      if (!code) return;

      await navigator.clipboard.writeText(code);
      button.textContent = button.dataset.copiedLabel ?? copy.copied;
      window.setTimeout(() => {
        button.textContent = button.dataset.copyLabel ?? copy.copy;
      }, 1400);
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [copy.copied, copy.copy]);

  return (
    <div className="docs-app">
      <header className="topbar">
        <div className="topbar-brand">
          <button
            className="icon-button mobile-menu-button"
            type="button"
            aria-label={copy.openNavigation}
            onClick={() => setNavigationOpen(true)}
          >
            <MenuGlyph />
          </button>
          <Link href={pathForLocale(locale, "")} className="brand-link">
            <BrandMark />
            <Brand />
          </Link>
        </div>

        <button
          className="search-trigger"
          type="button"
          onClick={() => setSearchOpen(true)}
        >
          <SearchGlyph />
          <span>{copy.searchDocumentation}</span>
          <kbd>⌘ K</kbd>
        </button>

        <nav className="top-links" aria-label={copy.externalLinks}>
          <details className="language-switcher">
            <summary aria-label={copy.language}>
              <span>{localeInfo[locale].shortName}</span>
              <svg viewBox="0 0 12 12" aria-hidden="true">
                <path d="m3 4.5 3 3 3-3" />
              </svg>
            </summary>
            <div className="language-menu">
              {locales.map((candidate) => (
                <Link
                  key={candidate}
                  href={pathForLocale(candidate, currentSlug)}
                  hrefLang={localeInfo[candidate].htmlLang}
                  lang={localeInfo[candidate].htmlLang}
                  className={candidate === locale ? "is-active" : ""}
                  aria-current={candidate === locale ? "true" : undefined}
                  onClick={(event) =>
                    event.currentTarget
                      .closest("details")
                      ?.removeAttribute("open")
                  }
                >
                  <span>{localeInfo[candidate].shortName}</span>
                  <strong>{localeInfo[candidate].name}</strong>
                </Link>
              ))}
            </div>
          </details>
          <a
            className="top-site-link"
            href="https://parano1d.org"
            target="_blank"
            rel="noreferrer"
          >
            {copy.website}
            <ExternalGlyph />
          </a>
          <a
            className="top-source-link"
            href="https://github.com/ignotusnemo/parano1d"
            target="_blank"
            rel="noreferrer"
          >
            {copy.source}
            <ExternalGlyph />
          </a>
        </nav>
      </header>

      <div
        className={`sidebar-scrim ${navigationOpen ? "is-visible" : ""}`}
        onClick={() => setNavigationOpen(false)}
        aria-hidden="true"
      />

      <aside
        ref={sidebar}
        className={`sidebar ${navigationOpen ? "is-open" : ""}`}
        onScroll={rememberSidebarPosition}
      >
        <div className="sidebar-mobile-head">
          <span className="mobile-brand">
            <BrandMark />
            <Brand />
          </span>
          <button
            className="icon-button"
            type="button"
            aria-label={copy.closeNavigation}
            onClick={() => setNavigationOpen(false)}
          >
            <MenuGlyph close />
          </button>
        </div>

        <nav className="documentation-nav" aria-label={copy.documentation}>
          {navigation.map((group) => (
            <section className="nav-group" key={group.label}>
              <div className="nav-group-label">{group.label}</div>
              <ul>
                {group.items.map((item) => {
                  const active = item.slug === currentSlug;
                  return (
                    <li key={item.slug || "overview"}>
                      <Link
                        href={pathForLocale(locale, item.slug)}
                        className={active ? "is-active" : ""}
                        aria-current={active ? "page" : undefined}
                        onClick={() => {
                          rememberSidebarPosition();
                          setNavigationOpen(false);
                        }}
                      >
                        {item.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </nav>

        <nav className="sidebar-language" aria-label={copy.language}>
          {locales.map((candidate) => (
            <Link
              key={candidate}
              href={pathForLocale(candidate, currentSlug)}
              hrefLang={localeInfo[candidate].htmlLang}
              lang={localeInfo[candidate].htmlLang}
              className={candidate === locale ? "is-active" : ""}
              aria-current={candidate === locale ? "true" : undefined}
              onClick={() => setNavigationOpen(false)}
            >
              {localeInfo[candidate].shortName}
            </Link>
          ))}
        </nav>

        <div className="sidebar-foot">
          <span>{copy.network}</span>
          <strong>{copy.mainnet}</strong>
          <i aria-hidden="true" />
        </div>
      </aside>

      <main className="main-column">
        <div className="article-frame">
          <div className="article-kicker">
            <span>{section}</span>
            <code>{sourcePath}</code>
          </div>

          <article className="doc-article">{children}</article>

          <nav className="page-neighbors" aria-label={copy.adjacentPages}>
            {previous ? (
              <Link
                href={pathForLocale(locale, previous.slug)}
                className="neighbor previous"
              >
                <span>{copy.previous}</span>
                <strong>{previous.title}</strong>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={pathForLocale(locale, next.slug)}
                className="neighbor next"
              >
                <span>{copy.next}</span>
                <strong>{next.title}</strong>
              </Link>
            ) : (
              <span />
            )}
          </nav>

          <footer className="article-footer">
            <span>{copy.technicalDocumentation}</span>
            <span>{copy.sourceDefinesConsensus}</span>
          </footer>
        </div>
      </main>

      <aside className="toc" aria-label={copy.onThisPage}>
        <div className="toc-label">{copy.onThisPage}</div>
        {toc.length ? (
          <nav>
            {toc.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={[
                  item.level === 3 ? "is-nested" : "",
                  activeHeading === item.id ? "is-active" : ""
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {item.title}
              </a>
            ))}
          </nav>
        ) : (
          <p>{copy.noSubsections}</p>
        )}
      </aside>

      {searchOpen ? (
        <div
          className="search-layer"
          role="dialog"
          aria-modal="true"
          aria-label={copy.searchDialog}
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setSearchOpen(false);
          }}
        >
          <div className="search-dialog">
            <div className="search-field">
              <SearchGlyph />
              <input
                ref={searchInput}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={copy.searchPlaceholder}
                aria-label={copy.searchQuery}
              />
              <button type="button" onClick={() => setSearchOpen(false)}>
                ESC
              </button>
            </div>

            <div className="search-meta">
              <span>
                {query
                  ? copy.resultCount(results.length)
                  : copy.documentationIndex}
              </span>
              <span>{copy.pageCount(searchIndex.length)}</span>
            </div>

            <div className="search-results">
              {results.map((entry) => (
                <Link
                  href={pathForLocale(locale, entry.slug)}
                  key={entry.slug || "overview"}
                  onClick={() => {
                    setSearchOpen(false);
                    setQuery("");
                  }}
                >
                  <span className="result-section">{entry.section}</span>
                  <strong>{entry.title}</strong>
                  <p>{entry.description}</p>
                  <span className="result-path">
                    {`docs/${entry.slug || "index"}.md`}
                  </span>
                </Link>
              ))}
              {!results.length ? (
                <div className="empty-search">
                  <strong>{copy.noMatchingPage}</strong>
                  <span>{copy.noMatchingPageHint}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
