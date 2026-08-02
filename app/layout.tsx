import type { Metadata, Viewport } from "next";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/noto-sans-mono/400.css";
import "./globals.css";
import "katex/dist/katex.min.css";

const siteUrl = "https://docs.parano1d.org";
const socialImage = "/assets/social/docs-og-v3.png";
const siteDescription =
  "Technical documentation for Parano1d, a proof-native Layer 1 network secured by proof of work: protocol, wallet, mining, and APIs.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Parano1d Documentation",
    template: "%s · Parano1d Documentation"
  },
  description: siteDescription,
  applicationName: "Parano1d Documentation",
  authors: [{ name: "Parano1d", url: "https://parano1d.org" }],
  creator: "Parano1d",
  publisher: "Parano1d",
  generator: "Next.js",
  category: "technology",
  classification: "Technical documentation",
  referrer: "origin-when-cross-origin",
  keywords: [
    "Parano1d",
    "Parano1d",
    "NOID",
    "proof-native Layer 1",
    "proof-authenticated State transitions",
    "signatureless ownership",
    "zero-knowledge proofs",
    "post-quantum blockchain",
    "proof of work",
    "Poseidon2b",
    "FROST-GKR"
  ],
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
      ru: "/ru",
      "zh-CN": "/zh",
      "x-default": "/"
    }
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Parano1d Documentation",
    title: "Parano1d Documentation",
    description: siteDescription,
    url: "/",
    images: [
      {
        url: socialImage,
        width: 1200,
        height: 630,
        alt: "Parano1d technical documentation"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Parano1d Documentation",
    description: siteDescription,
    images: [socialImage]
  },
  icons: {
    icon: [
      { url: "/favicon-96.png", type: "image/png", sizes: "96x96" },
      { url: "/icon-16.png", type: "image/png", sizes: "16x16" },
      { url: "/icon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-48.png", type: "image/png", sizes: "48x48" },
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48 96x96" }
    ],
    shortcut: "/favicon.ico",
    apple: {
      url: "/apple-touch-icon.png",
      type: "image/png",
      sizes: "180x180"
    }
  },
  manifest: "/manifest.webmanifest",
  other: {
    "apple-mobile-web-app-title": "Parano1d Docs",
    "mobile-web-app-capable": "yes"
  }
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f4f5f6",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://parano1d.org/#organization",
        name: "Parano1d",
        alternateName: "Parano1d",
        url: "https://parano1d.org",
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/assets/icons/parano1d.png`,
          width: 512,
          height: 512
        }
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Parano1d Documentation",
        alternateName: [
          "Parano1d Documentation",
          "Parano1d Docs",
          "docs.parano1d.org"
        ],
        description: siteDescription,
        inLanguage: ["en", "ru", "zh-CN"],
        availableLanguage: [
          { "@type": "Language", name: "English", alternateName: "en" },
          { "@type": "Language", name: "Русский", alternateName: "ru" },
          { "@type": "Language", name: "简体中文", alternateName: "zh-CN" }
        ],
        publisher: {
          "@id": "https://parano1d.org/#organization"
        }
      }
    ]
  };

  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c")
          }}
        />
        {children}
      </body>
    </html>
  );
}
