"use client";

import { useState, useEffect } from "react";
import { Download, X, Share, PlusSquare, Smartphone, CheckCircle, Sparkles } from "lucide-react";
import { isStandalonePWA, isIOSDevice } from "@/lib/pushClient";

const DISMISS_KEY = "bcsn_pwa_prompt_dismissed_until";
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours

export default function PwaInstallPrompt() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check if running as installed standalone app (iOS / Android / PWA)
    const standalone = isStandalonePWA();
    setIsStandalone(standalone);

    // Check if dismissed recently
    const dismissedUntil = localStorage.getItem(DISMISS_KEY);
    if (dismissedUntil && Date.now() < Number(dismissedUntil)) {
      setDismissed(true);
    }

    // Listen for native Android/Chrome install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_DURATION_MS));
    setDismissed(true);
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setDeferredPrompt(null);
        setIsOpen(false);
        handleDismiss();
      }
    } else {
      setIsOpen(true);
    }
  };

  // If not mounted yet (SSR), or already running inside standalone PWA mode or dismissed, don't render anything
  if (!mounted || isStandalone || dismissed) return null;

  return (
    <>
      {/* PWA Install Banner */}
      <div className="pt-3 px-3 max-w-md mx-auto anim-slide">
        <div className="bg-gradient-to-r from-emerald-600 via-primary to-indigo-700 p-2.5 rounded-2xl shadow-xl flex items-center justify-between text-white border border-white/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white p-1 shadow-md overflow-hidden shrink-0">
              <img src="/logo-192.png" alt="BCSN" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-xs font-black tracking-tight leading-tight">
                Télécharger l&apos;application BCSN
              </p>
              <p className="text-[10px] text-white/80">
                Installe l&apos;app sur ton écran d&apos;accueil !
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsOpen(true)}
              className="btn-secondary py-1.5 px-3 text-[11px] font-extrabold bg-white text-emerald-950 border-none shadow-md hover:bg-slate-100 flex items-center gap-1"
            >
              <Download size={13} />
              Installer
            </button>
            <button
              onClick={handleDismiss}
              className="w-7 h-7 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white/80"
              title="Fermer"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Installation Instructions Pop-Up Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md anim-fade">
          <div className="relative w-full max-w-sm bg-bg-card rounded-3xl p-5 shadow-2xl border border-border-1 anim-slide">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-text-4 hover:text-text-1 w-8 h-8 rounded-full bg-bg-surface flex items-center justify-center"
            >
              <X size={16} />
            </button>

            {/* Header */}
            <div className="text-center mb-5">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-white p-2 shadow-lg border border-border-1 overflow-hidden mb-3">
                <img src="/logo-512.png" alt="BCSN" className="w-full h-full object-contain" />
              </div>
              <h3 className="text-base font-black text-text-1">
                Installer l&apos;application BCSN
              </h3>
              <p className="text-xs text-text-3 mt-1">
                Ajoute l&apos;icône officielle vert et rouge sur l&apos;écran d&apos;accueil de ton téléphone !
              </p>
            </div>

            {/* Android direct install button if prompt available */}
            {deferredPrompt ? (
              <div className="mb-5 text-center">
                <button
                  onClick={handleInstallClick}
                  className="btn-primary w-full py-3 text-xs font-black flex items-center justify-center gap-2 bg-emerald-600 shadow-lg mb-2"
                >
                  <Download size={16} />
                  Installer directement sur mon téléphone
                </button>
              </div>
            ) : (
              /* Step by Step instructions */
              <div className="space-y-3 mb-5">
                <div className="p-3 bg-bg-surface rounded-2xl border border-border-1 space-y-2.5">
                  <span className="text-[11px] font-bold text-primary-text uppercase tracking-wider block">
                    📱 Sur iPhone (Safari) :
                  </span>
                  <div className="flex items-start gap-2.5 text-xs text-text-2">
                    <span className="w-5 h-5 rounded-md bg-primary-soft text-primary-text font-black text-[11px] flex items-center justify-center shrink-0">
                      1
                    </span>
                    <p>
                      Appuie sur le bouton <strong className="text-text-1">Partager</strong> <Share size={12} className="inline text-primary-text" /> (le carré avec la flèche en bas).
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-text-2">
                    <span className="w-5 h-5 rounded-md bg-primary-soft text-primary-text font-black text-[11px] flex items-center justify-center shrink-0">
                      2
                    </span>
                    <p>
                      Défile vers le bas et clique sur <strong className="text-text-1">&quot;Sur l&apos;écran d&apos;accueil&quot;</strong> <PlusSquare size={12} className="inline text-primary-text" />.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-bg-surface rounded-2xl border border-border-1 space-y-2.5">
                  <span className="text-[11px] font-bold text-primary-text uppercase tracking-wider block">
                    🤖 Sur Android (Chrome) :
                  </span>
                  <div className="flex items-start gap-2.5 text-xs text-text-2">
                    <span className="w-5 h-5 rounded-md bg-primary-soft text-primary-text font-black text-[11px] flex items-center justify-center shrink-0">
                      1
                    </span>
                    <p>
                      Clique sur les <strong className="text-text-1">3 petits points</strong> en haut à droite.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-text-2">
                    <span className="w-5 h-5 rounded-md bg-primary-soft text-primary-text font-black text-[11px] flex items-center justify-center shrink-0">
                      2
                    </span>
                    <p>
                      Sélectionne <strong className="text-text-1">&quot;Installer l&apos;application&quot;</strong> ou <strong className="text-text-1">&quot;Ajouter à l&apos;écran d&apos;accueil&quot;</strong>.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setIsOpen(false)}
              className="btn-secondary w-full py-2.5 text-xs font-bold text-text-3"
            >
              Compris !
            </button>
          </div>
        </div>
      )}
    </>
  );
}
