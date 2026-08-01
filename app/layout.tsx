import type { Metadata, Viewport } from "next";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "./globals.css";
import "katex/dist/katex.min.css";

const siteUrl = "https://docs.parano1d.org";
const socialImage = "/assets/social/docs-og.png";
const siteDescription =
  "Technical documentation for ParanO(1)d (Parano1d), a proof-native L1 statechain secured by proof of work: protocol, wallet, mining, and APIs.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ParanO(1)d Documentation",
    template: "%s · ParanO(1)d Documentation"
  },
  description: siteDescription,
  applicationName: "ParanO(1)d Documentation",
  authors: [{ name: "ParanO(1)d", url: "https://parano1d.org" }],
  creator: "ParanO(1)d",
  publisher: "ParanO(1)d",
  generator: "Next.js",
  category: "technology",
  classification: "Technical documentation",
  referrer: "origin-when-cross-origin",
  keywords: [
    "ParanO(1)d",
    "Parano1d",
    "NOID",
    "proof-native blockchain",
    "statechain",
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
    siteName: "ParanO(1)d Documentation",
    title: "ParanO(1)d Documentation",
    description: siteDescription,
    url: "/",
    images: [
      {
        url: socialImage,
        width: 1200,
        height: 630,
        alt: "ParanO(1)d technical documentation"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "ParanO(1)d Documentation",
    description: siteDescription,
    images: [socialImage]
  },
  icons: {
    icon: [
      { url: "/icon-16.png", type: "image/png", sizes: "16x16" },
      { url: "/icon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-48.png", type: "image/png", sizes: "48x48" },
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48" }
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
    "apple-mobile-web-app-title": "ParanO(1)d Docs",
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
        name: "ParanO(1)d",
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
        name: "ParanO(1)d Documentation",
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
