import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BCSN Pronos | L'Application Officielle de Pronostics",
  description:
    "Pronostics du Basket Club de Saint Nicolas – Prédis les scores, remporte des badges et grimpe sur le podium !",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BCSN Pronos",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#070A11",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${plusJakartaSans.variable} ${outfit.variable}`}
      data-scroll-behavior="smooth"
    >
      <head>
        <link rel="apple-touch-icon" href="/logo-192.png" />
      </head>
      <body className="font-sans bg-bg-base text-text-1 antialiased min-h-screen selection:bg-primary/30 selection:text-primary-text">
        {children}
      </body>
    </html>
  );
}
