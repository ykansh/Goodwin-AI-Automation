import type { Metadata } from "next";
import { Inter, Outfit, Geist } from "next/font/google";
import ClientLayoutWrapper from "@/components/layout/ClientLayoutWrapper";
import { getGlobalSettings } from "@/lib/data";
import { GlobalSettingsProvider } from "@/components/GlobalSettingsProvider";
import { GOODWIN_CONFIG } from "@/config/goodwin";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://goodwinbatteries.in'),
  title: {
    default: "Goodwin",
    template: "%s | Goodwin",
  },
  description: GOODWIN_CONFIG.description,
  icons: {
    icon: [
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
      { url: '/assets/logo/g-logo.png', sizes: '512x512', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
  alternates: {
    canonical: '/',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getGlobalSettings();

  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", inter.variable, outfit.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-full flex flex-col font-sans text-foreground bg-background">
        <GlobalSettingsProvider settings={settings}>
          <ClientLayoutWrapper>
            {children}
          </ClientLayoutWrapper>
          {settings && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "LocalBusiness",
                  name: settings.company_name || "Goodwin Batteries",
                  image: "https://www.goodwinbatteries.com/assets/logo/Goodwin.png",
                  telephone: settings.phone_sales || "",
                  address: {
                    "@type": "PostalAddress",
                    streetAddress: settings.address || "",
                    addressLocality: settings.city || "",
                    addressRegion: settings.state || "",
                    postalCode: settings.pincode || "",
                    addressCountry: "IN",
                  },
                }),
              }}
            />
          )}
        </GlobalSettingsProvider>
      </body>
    </html>
  );
}
