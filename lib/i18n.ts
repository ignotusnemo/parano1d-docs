export const locales = ["en", "ru", "zh"] as const;

export type Locale = (typeof locales)[number];

export type LocaleInfo = {
  htmlLang: string;
  ogLocale: string;
  name: string;
  shortName: string;
  docsTitle: string;
  docsDescription: string;
};

export type UiCopy = {
  overview: string;
  openNavigation: string;
  closeNavigation: string;
  collapseNavigation: string;
  expandNavigation: string;
  documentation: string;
  searchDocumentation: string;
  externalLinks: string;
  language: string;
  adjacentPages: string;
  previous: string;
  next: string;
  technicalDocumentation: string;
  sourceDefinesConsensus: string;
  onThisPage: string;
  noSubsections: string;
  searchDialog: string;
  searchPlaceholder: string;
  searchQuery: string;
  documentationIndex: string;
  resultCount: (count: number) => string;
  pageCount: (count: number) => string;
  noMatchingPage: string;
  noMatchingPageHint: string;
  copy: string;
  copied: string;
};

export const localeInfo: Record<Locale, LocaleInfo> = {
  en: {
    htmlLang: "en",
    ogLocale: "en_US",
    name: "English",
    shortName: "EN",
    docsTitle: "Parano1d Documentation",
    docsDescription:
      "Technical documentation for Parano1d, a proof-native L1 statechain secured by proof of work: protocol, wallet, mining, and APIs."
  },
  ru: {
    htmlLang: "ru",
    ogLocale: "ru_RU",
    name: "Русский",
    shortName: "RU",
    docsTitle: "Документация Parano1d",
    docsDescription:
      "Техническая документация Parano1d, proof-native L1 statechain на proof of work: протокол, кошелёк, майнинг и API."
  },
  zh: {
    htmlLang: "zh-CN",
    ogLocale: "zh_CN",
    name: "简体中文",
    shortName: "中文",
    docsTitle: "Parano1d 技术文档",
    docsDescription:
      "Parano1d 技术文档：由工作量证明保护的证明原生 L1 状态链，涵盖协议、钱包、挖矿与 API。"
  }
};

export const uiCopy: Record<Locale, UiCopy> = {
  en: {
    overview: "Overview",
    openNavigation: "Open documentation navigation",
    closeNavigation: "Close documentation navigation",
    collapseNavigation: "Collapse documentation navigation",
    expandNavigation: "Expand documentation navigation",
    documentation: "Documentation",
    searchDocumentation: "Search documentation",
    externalLinks: "External links",
    language: "Language",
    adjacentPages: "Adjacent pages",
    previous: "Previous",
    next: "Next",
    technicalDocumentation: "ParanO(1)d technical documentation",
    sourceDefinesConsensus: "Source code defines consensus behavior.",
    onThisPage: "On this page",
    noSubsections: "No subsections",
    searchDialog: "Search documentation",
    searchPlaceholder: "Search protocol, wallet, RPC…",
    searchQuery: "Search query",
    documentationIndex: "Documentation index",
    resultCount: (count) => `${count} matches`,
    pageCount: (count) => `${count} pages`,
    noMatchingPage: "No matching page",
    noMatchingPageHint:
      "Try a protocol object, command, or component name.",
    copy: "copy",
    copied: "copied"
  },
  ru: {
    overview: "Обзор",
    openNavigation: "Открыть меню документации",
    closeNavigation: "Закрыть меню документации",
    collapseNavigation: "Свернуть меню документации",
    expandNavigation: "Развернуть меню документации",
    documentation: "Документация",
    searchDocumentation: "Поиск по документации",
    externalLinks: "Внешние ссылки",
    language: "Язык",
    adjacentPages: "Соседние страницы",
    previous: "Назад",
    next: "Далее",
    technicalDocumentation: "Техническая документация ParanO(1)d",
    sourceDefinesConsensus:
      "Поведение консенсуса определяется исходным кодом.",
    onThisPage: "На этой странице",
    noSubsections: "Нет подразделов",
    searchDialog: "Поиск по документации",
    searchPlaceholder: "Протокол, кошелёк, RPC…",
    searchQuery: "Поисковый запрос",
    documentationIndex: "Все разделы",
    resultCount: (count) => `Совпадений: ${count}`,
    pageCount: (count) => `${count} стр.`,
    noMatchingPage: "Ничего не найдено",
    noMatchingPageHint:
      "Попробуйте название объекта протокола, команды или компонента.",
    copy: "копировать",
    copied: "скопировано"
  },
  zh: {
    overview: "概览",
    openNavigation: "打开文档导航",
    closeNavigation: "关闭文档导航",
    collapseNavigation: "收起文档导航",
    expandNavigation: "展开文档导航",
    documentation: "技术文档",
    searchDocumentation: "搜索文档",
    externalLinks: "外部链接",
    language: "语言",
    adjacentPages: "相邻页面",
    previous: "上一页",
    next: "下一页",
    technicalDocumentation: "ParanO(1)d 技术文档",
    sourceDefinesConsensus: "共识行为以源代码为准。",
    onThisPage: "本页内容",
    noSubsections: "无子章节",
    searchDialog: "搜索文档",
    searchPlaceholder: "搜索协议、钱包、RPC…",
    searchQuery: "搜索词",
    documentationIndex: "文档目录",
    resultCount: (count) => `${count} 个结果`,
    pageCount: (count) => `${count} 页`,
    noMatchingPage: "未找到相关页面",
    noMatchingPageHint: "可尝试搜索协议对象、命令或组件名称。",
    copy: "复制",
    copied: "已复制"
  }
};

export function isLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale);
}

export function parseRouteSegments(segments: string[] | undefined): {
  locale: Locale;
  slug: string;
} {
  const parts = segments ?? [];
  if (isLocale(parts[0]) && parts[0] !== "en") {
    return {
      locale: parts[0],
      slug: parts.slice(1).join("/")
    };
  }

  return {
    locale: "en",
    slug: parts.join("/")
  };
}

export function pathForLocale(locale: Locale, slug: string): string {
  const suffix = slug ? `/${slug}` : "";
  return locale === "en" ? suffix || "/" : `/${locale}${suffix}`;
}

export function routeSegmentsForLocale(
  locale: Locale,
  slug: string
): string[] {
  const parts = slug ? slug.split("/") : [];
  return locale === "en" ? parts : [locale, ...parts];
}

export function languageAlternates(slug: string): Record<string, string> {
  return {
    en: pathForLocale("en", slug),
    ru: pathForLocale("ru", slug),
    "zh-CN": pathForLocale("zh", slug),
    "x-default": pathForLocale("en", slug)
  };
}
