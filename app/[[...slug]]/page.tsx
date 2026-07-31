import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteChrome from "@/components/site-chrome";
import {
  getAdjacentPages,
  getAllRouteSegments,
  getDoc,
  getNavigation,
  getSearchIndex,
  getSectionForSlug
} from "@/lib/docs";
import {
  languageAlternates,
  localeInfo,
  locales,
  parseRouteSegments,
  pathForLocale
} from "@/lib/i18n";

type PageProps = {
  params: Promise<{ slug?: string[] }>;
};

const siteUrl = "https://docs.parano1d.org";
const socialImage = `${siteUrl}/assets/social/docs-og.png`;

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllRouteSegments().map((segments) => ({
    slug: segments
  }));
}

export async function generateMetadata({
  params
}: PageProps): Promise<Metadata> {
  const { locale, slug } = parseRouteSegments((await params).slug);
  const doc = getDoc(locale, slug);
  if (!doc) return {};

  const canonical = pathForLocale(locale, slug);
  const section = getSectionForSlug(locale, slug);
  const info = localeInfo[locale];
  const pageTitle = slug ? doc.title : info.docsTitle;
  const description = slug ? doc.description : info.docsDescription;
  const title = {
    absolute: slug ? `${doc.title} · ${info.docsTitle}` : info.docsTitle
  };

  return {
    title,
    description,
    keywords: [
      doc.title,
      section,
      "ParanO(1)d",
      "Parano1d",
      info.docsTitle
    ],
    alternates: {
      canonical,
      languages: languageAlternates(slug)
    },
    openGraph: {
      type: "article",
      locale: info.ogLocale,
      alternateLocale: locales
        .filter((candidate) => candidate !== locale)
        .map((candidate) => localeInfo[candidate].ogLocale),
      siteName: info.docsTitle,
      title: pageTitle,
      description,
      url: canonical,
      images: [
        {
          url: socialImage,
          width: 1200,
          height: 630,
          alt: info.docsTitle
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [socialImage]
    }
  };
}

export default async function DocumentationPage({ params }: PageProps) {
  const { locale, slug } = parseRouteSegments((await params).slug);
  const doc = getDoc(locale, slug);
  if (!doc) notFound();

  const navigation = getNavigation(locale);
  const searchIndex = getSearchIndex(locale);
  const adjacent = getAdjacentPages(locale, slug);
  const section = getSectionForSlug(locale, slug);
  const info = localeInfo[locale];
  const canonicalUrl = `${siteUrl}${pathForLocale(locale, slug)}`;
  const documentationUrl = `${siteUrl}${pathForLocale(locale, "")}`;
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      "@id": `${canonicalUrl}#article`,
      url: canonicalUrl,
      mainEntityOfPage: canonicalUrl,
      headline: doc.title,
      description: doc.description,
      image: socialImage,
      inLanguage: info.htmlLang,
      isAccessibleForFree: true,
      articleSection: section,
      isPartOf: {
        "@id": `${siteUrl}/#website`
      },
      author: {
        "@id": "https://parano1d.org/#organization"
      },
      publisher: {
        "@id": "https://parano1d.org/#organization"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: slug
        ? [
            {
              "@type": "ListItem",
              position: 1,
              name: info.docsTitle,
              item: documentationUrl
            },
            {
              "@type": "ListItem",
              position: 2,
              name: doc.title,
              item: canonicalUrl
            }
          ]
        : [
            {
              "@type": "ListItem",
              position: 1,
              name: info.docsTitle,
              item: documentationUrl
            }
          ]
    }
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c")
        }}
      />
      <SiteChrome
        locale={locale}
        navigation={navigation}
        searchIndex={searchIndex}
        currentSlug={slug}
        section={section}
        sourcePath={`docs/${doc.sourcePath}`}
        toc={doc.toc}
        previous={adjacent.previous}
        next={adjacent.next}
      >
        <div dangerouslySetInnerHTML={{ __html: doc.html }} />
      </SiteChrome>
    </>
  );
}
