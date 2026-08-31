"use client";

import { useState, useEffect } from "react";
import { Download, X, Share, PlusSquare, Smartphone, CheckCircle, Sparkles } from "lucide-react";

export default function PwaInstallPrompt() {
  const [isOpen, setIsOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running as installed standalone app
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsStandalone(true);
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIos(/iphone|ipad|ipod/.test(userAgent));

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

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setDeferredPrompt(null);
        setIsOpen(false);
      }
    } else {
      setIsOpen(true);
    }
  };

  // If already running inside standalone PWA mode, don't show the prompt button
  if (isStandalone) return null;

  return (
    <>
      {/* Floating PWA Install Banner */}
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md anim-slide">
        <div className="bg-gradient-to-r from-emerald-600 via-primary to-indigo-700 p-2.5 rounded-2xl shadow-2xl flex items-center justify-between text-white border border-white/20">
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

          <button
            onClick={() => setIsOpen(true)}
            className="btn-secondary py-1.5 px-3 text-[11px] font-extrabold bg-white text-emerald-950 border-none shadow-md hover:bg-slate-100 flex items-center gap-1"
          >
            <Download size={13} />
            Installer
          </button>
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
