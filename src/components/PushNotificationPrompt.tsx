"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Bell,
  BellRing,
  X,
  CheckCircle2,
  Clock,
  Trophy,
  Sparkles,
  Loader2,
} from "lucide-react";
import {
  isPushSupported,
  getNotificationPermission,
  getExistingPushSubscription,
  subscribeToPushNotifications,
  isIOSDevice,
  isStandalonePWA,
} from "@/lib/pushClient";
import { savePushSubscriptionAction } from "@/lib/actions";

const DISMISS_KEY = "bcsn_push_prompt_dismissed_until";
const DISMISS_DURATION_MS = 3 * 24 * 60 * 60 * 1000; // 3 jours si l'utilisateur clique sur "Plus tard"

export default function PushNotificationPrompt() {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Vérifier après un court délai pour ne pas bloquer le chargement initial
    const timer = setTimeout(async () => {
      if (!isPushSupported()) return;

      const perm = getNotificationPermission();
      // On ne propose que si la permission n'a pas encore été accordée ni refusée
      if (perm !== "default") return;

      // Vérifier si l'utilisateur a reporté la demande récemment
      const dismissedUntil = localStorage.getItem(DISMISS_KEY);
      if (dismissedUntil && Date.now() < Number(dismissedUntil)) {
        return;
      }

      // Si iOS dans Safari hors PWA, ne pas afficher de pop-up directe car Apple bloque Notification.requestPermission
      if (isIOSDevice() && !isStandalonePWA()) {
        return;
      }

      // Vérifier s'il a déjà une souscription
      const existing = await getExistingPushSubscription();
      if (!existing) {
        setIsVisible(true);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const handleAccept = async () => {
    setLoading(true);
    setErrorMsg(null);

    const res = await subscribeToPushNotifications();
    if (res.success && res.subscription) {
      const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : undefined;
      const saveRes = await savePushSubscriptionAction(res.subscription, userAgent);

      if (saveRes && "error" in saveRes && saveRes.error) {
        setErrorMsg(String(saveRes.error));
        setLoading(false);
      } else {
        setSuccess(true);
        setLoading(false);
        setTimeout(() => {
          setIsVisible(false);
        }, 1800);
      }
    } else {
      setLoading(false);
      setErrorMsg(res.error || "Autorisation refusée ou fermée.");
      // Masquer après 3s si refusé
      setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_DURATION_MS));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm anim-fade">
      <div className="w-full max-w-sm bg-gradient-to-b from-bg-card via-bg-elevated to-slate-950 rounded-3xl border border-primary/40 shadow-2xl p-5 relative overflow-hidden anim-scale my-auto">
        {/* Background glow effects */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close / Dismiss button */}
        {!loading && !success && (
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-bg-surface/80 hover:bg-bg-surface text-text-4 hover:text-text-1 flex items-center justify-center border border-border-1 transition-all"
            title="Plus tard"
          >
            <X size={15} />
          </button>
        )}

        {success ? (
          /* Success state */
          <div className="text-center py-4 space-y-2 anim-scale">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center shadow-lg animate-bounce">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-base font-black text-text-1">Notifications Activées !</h3>
            <p className="text-xs text-emerald-300">
              Vous recevrez vos rappels de match et vos points en direct. 🎉
            </p>
          </div>
        ) : (
          /* Normal prompt state */
          <div className="space-y-4">
            {/* Header Icon + Titles */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/40 text-primary flex items-center justify-center shadow-[0_0_20px_rgba(5,150,105,0.3)] shrink-0">
                <BellRing size={24} className="animate-pulse" />
              </div>
              <div className="min-w-0 pr-6">
                <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-primary-text mb-0.5">
                  <Sparkles size={11} /> Ne ratez rien
                </div>
                <h3 className="text-base font-black text-text-1 leading-tight">
                  Activer les Alertes Match ?
                </h3>
              </div>
            </div>

            {/* Benefits list */}
            <div className="bg-bg-surface/80 rounded-2xl p-3 border border-border-1/80 space-y-2 text-xs">
              <div className="flex items-center gap-2.5 text-text-2">
                <div className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                  <Clock size={13} />
                </div>
                <span>
                  <strong className="text-text-1">Rappel 2h avant le match</strong> pour ne pas oublier votre prono.
                </span>
              </div>

              <div className="flex items-center gap-2.5 text-text-2">
                <div className="w-6 h-6 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
                  <Trophy size={13} />
                </div>
                <span>
                  <strong className="text-text-1">Résultats & points en direct</strong> dès la fin de la rencontre.
                </span>
              </div>
            </div>

            {/* Error feedback if any */}
            {errorMsg && (
              <p className="text-[11px] text-rose-400 bg-rose-500/15 border border-rose-500/30 p-2 rounded-xl text-center font-bold">
                {errorMsg}
              </p>
            )}

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleAccept}
                disabled={loading}
                className="btn-primary w-full py-3 text-xs font-black flex items-center justify-center gap-2 shadow-xl bg-gradient-to-r from-primary to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Bell size={16} />
                )}
                <span>{loading ? "Activation en cours..." : "Oui, activer les notifications 🔔"}</span>
              </button>

              <button
                onClick={handleDismiss}
                disabled={loading}
                className="w-full py-2 text-[11px] font-bold text-text-4 hover:text-text-2 transition-colors text-center"
              >
                Plus tard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
