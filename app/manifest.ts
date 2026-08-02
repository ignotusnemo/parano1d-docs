import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Parano1d Documentation",
    short_name: "Parano1d Docs",
    description:
      "Technical documentation for the Parano1d protocol and software.",
    start_url: "/",
    scope: "/",
    lang: "en",
    display: "standalone",
    orientation: "any",
    background_color: "#f4f5f6",
    theme_color: "#f4f5f6",
    categories: ["developer tools", "documentation", "technology"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/assets/icons/parano1d.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      }
    ]
  };
}
