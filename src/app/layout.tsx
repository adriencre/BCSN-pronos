import type { Metadata, Viewport } from "next";
import "./globals.css";

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
    <html lang="fr" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" href="/logo-192.png" />
      </head>
      <body className="font-sans bg-bg-base text-text-1 antialiased min-h-screen selection:bg-primary/30 selection:text-primary-text">
        {children}
      </body>
    </html>
  );
}

