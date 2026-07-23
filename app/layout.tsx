import type { Metadata } from "next";
import { Montserrat, Cormorant } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { AppChrome } from "@/components/layout/AppChrome";
import { SmoothScroller } from "@/components/layout/SmoothScroller";
import { BRAND } from "@/lib/constants";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

const cormorant = Cormorant({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://auralisinteriors.com"),
  title: {
    default: `${BRAND.name} — Luxury AI Interior Design`,
    template: `%s · ${BRAND.name}`,
  },
  description: BRAND.tagline,
  keywords: [
    "luxury interior design",
    "AI interior design",
    "premium design",
    "architecture",
    "design studio",
  ],
  openGraph: {
    title: BRAND.name,
    description: BRAND.tagline,
    type: "website",
    siteName: BRAND.name,
  },
  twitter: {
    card: "summary_large_image",
    title: BRAND.name,
    description: BRAND.tagline,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${montserrat.variable} ${cormorant.variable}`}>
      <body className="min-h-screen bg-base">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-base focus:px-4 focus:py-2 focus:text-sm focus:text-black"
        >
          Skip to content
        </a>
        <SmoothScroller>
          <AuthProvider>
            <ToastProvider>
              <AppChrome>{children}</AppChrome>
            </ToastProvider>
          </AuthProvider>
        </SmoothScroller>
      </body>
    </html>
  );
}
