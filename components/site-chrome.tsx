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

const sidebarScrollMemory = new Map<Locale, number>();
const openGroupMemory = new Map<Locale, Set<string>>();
let desktopSidebarCollapsedMemory = false;

function navigationGroupKey(group: NavGroup, index: number): string {
  return `${index}:${group.items[0]?.slug ?? group.label}`;
}

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

function ChevronGlyph({
  direction = "down"
}: {
  direction?: "down" | "left" | "right";
}) {
  const path =
    direction === "left"
      ? "m14.5 5-7 7 7 7"
      : direction === "right"
        ? "m9.5 5 7 7-7 7"
        : "m5 9.5 7 7 7-7";

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

function FolderGlyph({ open }: { open: boolean }) {
  return (
    <svg
      className={`folder-glyph ${open ? "is-open" : ""}`}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      {open ? (
        <>
          <path className="folder-shadow" d="M3.2 7.2h17.6v11.4H3.2z" />
          <path className="folder-tab" d="M4.2 5.2h6l1.8 2.2h7.8v8.8H4.2z" />
          <path className="folder-tab-highlight" d="M5 6h4.8l1.6 1.9h7.5" />
          <path className="folder-face" d="M2.8 9.1h18.4l-2.3 9.7H5.1z" />
          <path className="folder-face-highlight" d="M4.1 10.2h15.7" />
          <path className="folder-slot" d="M9.1 12.4h5.8" />
        </>
      ) : (
        <>
          <path className="folder-shadow" d="M3.2 6.7h17.6v12H3.2z" />
          <path className="folder-tab" d="M4.1 5.1h6.1l1.8 2.2h7.9v10.9H4.1z" />
          <path className="folder-tab-highlight" d="M5 5.9h4.8l1.7 2h7.5" />
          <path className="folder-face" d="M3.2 8.5h17.6v10.2H3.2z" />
          <path className="folder-face-highlight" d="M4.2 9.5h15.6" />
          <path className="folder-slot" d="M9.2 12.2h5.6" />
        </>
      )}
    </svg>
  );
}

function FileGlyph() {
  return (
    <svg className="file-glyph" viewBox="0 0 24 24" aria-hidden="true">
      <path className="file-shadow" d="M6.1 3.4h8l4.8 4.9v12.8H6.1z" />
      <path className="file-page" d="M5.2 2.5h8.1l5.5 5.6v12.6H5.2z" />
      <path className="file-fold" d="M13.3 2.5v5.6h5.5" />
      <path className="file-highlight" d="M6.3 3.7v15.8" />
      <path className="file-line" d="M8 11.4h8M8 14.2h8M8 17h6.4" />
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

function GitHubGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        stroke="none"
        d="M12 2.4a9.8 9.8 0 0 0-3.1 19.1c.5.1.7-.2.7-.5v-1.9c-2.8.6-3.4-1.2-3.4-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 0 1.6 1.1 1.6 1.1.9 1.6 2.4 1.1 2.9.8.1-.7.4-1.1.6-1.3-2.3-.3-4.6-1.1-4.6-4.9 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1a9.3 9.3 0 0 1 4.9 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.8-2.3 4.6-4.6 4.9.4.3.7 1 .7 2V21c0 .3.2.6.7.5A9.8 9.8 0 0 0 12 2.4Z"
      />
    </svg>
  );
}

function ExternalLinks({
  className,
  label
}: {
  className: string;
  label: string;
}) {
  return (
    <nav className={className} aria-label={label}>
      <a href="https://parano1d.org" target="_blank" rel="noopener noreferrer">
        <span>ParanO(1)d</span>
        <ExternalGlyph />
      </a>
      <a
        href="https://lab.parano1d.org"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span>Lab</span>
        <ExternalGlyph />
      </a>
      <a
        className="github-link"
        href="https://github.com/ignotusnemo/parano1d"
        target="_blank"
        rel="noopener noreferrer"
      >
        <GitHubGlyph />
        <span>GitHub</span>
      </a>
    </nav>
  );
}

function LanguageSwitcher({
  locale,
  currentSlug,
  label
}: {
  locale: Locale;
  currentSlug: string;
  label: string;
}) {
  return (
    <details className="language-switcher">
      <summary aria-label={label}>
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
              event.currentTarget.closest("details")?.removeAttribute("open")
            }
          >
            <span>{localeInfo[candidate].shortName}</span>
            <strong>{localeInfo[candidate].name}</strong>
          </Link>
        ))}
      </div>
    </details>
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
  const activeGroupKey = useMemo(() => {
    const index = navigation.findIndex((group) =>
      group.items.some((item) => item.slug === currentSlug)
    );
    return index >= 0 ? navigationGroupKey(navigation[index], index) : "";
  }, [currentSlug, navigation]);
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const remembered = openGroupMemory.get(locale);
    return new Set(remembered ?? (activeGroupKey ? [activeGroupKey] : []));
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => desktopSidebarCollapsedMemory
  );
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeHeading, setActiveHeading] = useState(toc[0]?.id ?? "");
  const searchInput = useRef<HTMLInputElement>(null);
  const sidebar = useRef<HTMLElement>(null);

  const rememberSidebarPosition = () => {
    if (!sidebar.current) return;
    if (!window.matchMedia("(min-width: 941px)").matches) return;
    const scrollTop = sidebar.current.scrollTop;
    sidebarScrollMemory.set(locale, scrollTop);
  };

  const openNavigation = () => {
    setNavigationOpen(true);
    window.requestAnimationFrame(() => {
      if (sidebar.current) sidebar.current.scrollTop = 0;
    });
  };

  const toggleNavigationGroup = (key: string) => {
    setOpenGroups((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      openGroupMemory.set(locale, new Set(next));
      return next;
    });
  };

  const toggleDesktopSidebar = () => {
    setSidebarCollapsed((current) => {
      desktopSidebarCollapsedMemory = !current;
      return !current;
    });
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
    setOpenGroups((current) => {
      const remembered = openGroupMemory.get(locale);
      const next = new Set(remembered ?? current);
      if (activeGroupKey) next.add(activeGroupKey);
      openGroupMemory.set(locale, new Set(next));
      return next;
    });
  }, [activeGroupKey, locale]);

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

    if (!window.matchMedia("(min-width: 941px)").matches) {
      element.scrollTop = 0;
      return;
    }

    const savedPosition = sidebarScrollMemory.get(locale) ?? null;

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
    <div className={`docs-app ${sidebarCollapsed ? "is-sidebar-collapsed" : ""}`}>
      <header className="topbar">
        <div className="topbar-brand">
          <Link href={pathForLocale(locale, "")} className="brand-link">
            <BrandMark />
            <Brand />
          </Link>
        </div>

        <div className="mobile-language">
          <LanguageSwitcher
            locale={locale}
            currentSlug={currentSlug}
            label={copy.language}
          />
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

        <div className="top-links">
          <LanguageSwitcher
            locale={locale}
            currentSlug={currentSlug}
            label={copy.language}
          />
          <ExternalLinks
            className="top-external-links"
            label={copy.externalLinks}
          />
        </div>

        <button
          className="icon-button mobile-menu-button"
          type="button"
          aria-label={copy.openNavigation}
          onClick={openNavigation}
        >
          <MenuGlyph />
        </button>
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

        <button
          className="sidebar-collapse-button"
          type="button"
          aria-label={
            sidebarCollapsed ? copy.expandNavigation : copy.collapseNavigation
          }
          title={
            sidebarCollapsed ? copy.expandNavigation : copy.collapseNavigation
          }
          onClick={toggleDesktopSidebar}
        >
          <ChevronGlyph direction={sidebarCollapsed ? "right" : "left"} />
        </button>

        <nav className="documentation-nav" aria-label={copy.documentation}>
          {navigation.map((group, groupIndex) => {
            const groupKey = navigationGroupKey(group, groupIndex);
            const expanded = openGroups.has(groupKey);
            const panelId = `navigation-group-${groupIndex}`;

            return (
              <section
                className={`nav-group ${expanded ? "is-open" : ""}`}
                key={groupKey}
              >
                <button
                  className="nav-group-label"
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={panelId}
                  onClick={() => toggleNavigationGroup(groupKey)}
                >
                  <ChevronGlyph direction={expanded ? "down" : "right"} />
                  <FolderGlyph open={expanded} />
                  <span>{group.label}</span>
                </button>
                {expanded ? (
                  <ul id={panelId}>
                    {group.items.map((item) => {
                      const active = item.slug === currentSlug;
                      return (
                        <li key={item.slug || "overview"}>
                          <Link
                            href={pathForLocale(locale, item.slug)}
                            className={active ? "is-active" : ""}
                            aria-current={active ? "page" : undefined}
                            onClick={() => setNavigationOpen(false)}
                          >
                            <FileGlyph />
                            <span>{item.title}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </section>
            );
          })}
        </nav>
        <ExternalLinks
          className="sidebar-external-links"
          label={copy.externalLinks}
        />
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
