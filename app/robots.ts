import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/"
    },
    sitemap: "https://docs.parano1d.org/sitemap.xml",
    host: "https://docs.parano1d.org"
  };
}
