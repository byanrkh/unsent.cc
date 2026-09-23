import type { Metadata, Viewport } from "next";
import "./globals.css";
import { newsreader } from "@/libs/Font";

// NOTE: ganti ke domain asli project lu kalau beda dari ini.
const SITE_URL = "https://unsent.cc";
const SITE_NAME = "unsent.cc";
const SITE_TITLE = "unsent.cc — Say the things you never sent";
const SITE_DESCRIPTION =
  "Write the message you never had the courage to send. unsent.cc is a quiet place to leave unsent letters — anonymous, unfiltered, and read gently by strangers who understand.";

// TODO: banner ini masih dummy (placeholder generator). Ganti url di bawah
// begitu banner asli (1200x630, palet #fbfaf8 / #171717) udah jadi —
// idealnya taro filenya di /public/og-image.png terus tinggal ganti
// string-nya jadi "/og-image.png".
const OG_IMAGE_URL = "/og-image.png";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: SITE_TITLE,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "unsent messages",
    "unsent letters",
    "anonymous letters",
    "things left unsaid",
    "write a letter you'll never send",
    "unsent.cc",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  applicationName: SITE_NAME,
  category: "lifestyle",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "en_US",
    images: [
      {
        url: OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: "unsent.cc — say the things you never sent",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE_URL],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#fbfaf8",
  colorScheme: "light",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${newsreader.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
