import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import { cookies } from "next/headers";
import ThemeSynchronizer from "@/components/ThemeSynchronizer";
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("bcsn_theme")?.value;
  const isLight = themeCookie === "light";

  return (
    <html
      lang="fr"
      className={`${plusJakartaSans.variable} ${outfit.variable} ${isLight ? "light" : ""}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        {/* Instant zero-flash client theme script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('bcsn_theme')||(document.cookie.match(/(?:^|; )bcsn_theme=([^;]*)/)||[])[1];if(t==='light'){document.documentElement.classList.add('light')}else{document.documentElement.classList.remove('light')}}catch(e){}})()`,
          }}
        />
        <link rel="apple-touch-icon" href="/logo-192.png" />
      </head>
      <body className="font-sans bg-bg-base text-text-1 antialiased min-h-screen selection:bg-primary/30 selection:text-primary-text">
        <ThemeSynchronizer initialTheme={themeCookie} />
        {children}
      </body>
    </html>
  );
}
