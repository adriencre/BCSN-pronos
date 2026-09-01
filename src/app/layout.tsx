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
  viewportFit: "cover",
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
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
              // Immediate standalone PWA app mode detection
              try {
                if (
                  window.matchMedia('(display-mode: standalone)').matches ||
                  window.matchMedia('(display-mode: fullscreen)').matches ||
                  window.matchMedia('(display-mode: minimal-ui)').matches ||
                  navigator.standalone === true ||
                  (document.referrer && document.referrer.indexOf('android-app://') !== -1)
                ) {
                  document.documentElement.classList.add('is-standalone');
                }
              } catch(e){}

              function removeNetlifyBadge(){
                try {
                  var sel = 'a[href*="netlify.com"], [class*="netlify"], [id*="netlify"], [data-netlify], [data-netlify-badge], [data-netlify-drawer], [data-testid*="netlify"], netlify-drawer, .netlify-badge, #netlify-badge, #netlify-feedback-drawer, iframe[src*="netlify"], iframe[title*="Netlify" i], iframe[title*="Feedback" i], div[style*="2147483647"]';
                  var els = document.querySelectorAll(sel);
                  els.forEach(function(el){
                    if(el && el.parentNode){ el.parentNode.removeChild(el); }
                  });
                } catch(e){}
              }
              if(typeof window !== 'undefined'){
                removeNetlifyBadge();
                document.addEventListener('DOMContentLoaded', removeNetlifyBadge);
                window.addEventListener('load', removeNetlifyBadge);
                try {
                  var obs = new MutationObserver(removeNetlifyBadge);
                  obs.observe(document.documentElement, { childList: true, subtree: true });
                } catch(e){}
                setInterval(removeNetlifyBadge, 500);

                // Enregistrement du Service Worker pour les notifications Push
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js').catch(function(err){
                      console.log('SW registration error:', err);
                    });
                  });
                }
              }
            })()`,
          }}
        />

      </head>
      <body className="font-sans bg-bg-base text-text-1 antialiased min-h-screen selection:bg-primary/30 selection:text-primary-text">
        {children}
      </body>

    </html>
  );
}
