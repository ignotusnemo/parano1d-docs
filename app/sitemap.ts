import type { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/docs";
import {
  languageAlternates,
  locales,
  pathForLocale
} from "@/lib/i18n";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.flatMap((locale) =>
    getAllSlugs(locale).map((slug) => ({
      url: `https://docs.parano1d.org${pathForLocale(locale, slug)}`,
      changeFrequency: "weekly" as const,
      priority: slug ? 0.7 : 1,
      alternates: {
        languages: Object.fromEntries(
          Object.entries(languageAlternates(slug)).map(([language, path]) => [
            language,
            `https://docs.parano1d.org${path}`
          ])
        )
      }
    }))
  );
}
