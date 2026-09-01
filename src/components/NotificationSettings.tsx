"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Bell,
  BellOff,
  BellRing,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Smartphone,
  Info,
  Loader2,
  Send,
} from "lucide-react";
import {
  isPushSupported,
  isIOSDevice,
  isStandalonePWA,
  getNotificationPermission,
  getExistingPushSubscription,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
} from "@/lib/pushClient";
import {
  savePushSubscriptionAction,
  removePushSubscriptionAction,
  sendTestPushAction,
} from "@/lib/actions";

export default function NotificationSettings() {
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [testPending, startTestTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const isIOS = typeof window !== "undefined" && isIOSDevice();
  const isPWA = typeof window !== "undefined" && isStandalonePWA();

  useEffect(() => {
    async function checkState() {
      const supported = isPushSupported();
      setIsSupported(supported);

      if (!supported) {
        setLoading(false);
        return;
      }

      const perm = getNotificationPermission();
      setPermission(perm);

      const existingSub = await getExistingPushSubscription();
      setIsSubscribed(Boolean(existingSub));
      setLoading(false);
    }

    checkState();
  }, []);

  const handleToggleSubscription = async () => {
    setLoading(true);
    setFeedback(null);

    if (isSubscribed) {
      // Désabonnement
      const res = await unsubscribeFromPushNotifications();
      if (res.success) {
        if (res.endpoint) {
          await removePushSubscriptionAction(res.endpoint);
        }
        setIsSubscribed(false);
        setFeedback({
          type: "info",
          text: "Notifications désactivées sur cet appareil.",
        });
      } else {
        setFeedback({
          type: "error",
          text: res.error || "Erreur lors de la désactivation.",
        });
      }
    } else {
      // Abonnement
      const res = await subscribeToPushNotifications();
      if (res.success && res.subscription) {
        const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : undefined;
        const saveRes = await savePushSubscriptionAction(res.subscription, userAgent);

        if (saveRes && "error" in saveRes && saveRes.error) {
          setFeedback({
            type: "error",
            text: String(saveRes.error),
          });
        } else {
          setIsSubscribed(true);
          setPermission("granted");
          setFeedback({
            type: "success",
            text: "🎉 Notifications activées ! Vous recevrez les rappels et vos résultats.",
          });
        }
      } else {
        setFeedback({
          type: "error",
          text: res.error || "Impossible d'activer les notifications.",
        });
      }
    }

    setLoading(false);
  };

  const handleSendTest = () => {
    setFeedback(null);
    startTestTransition(async () => {
      const res = await sendTestPushAction();
      if (res.error) {
        setFeedback({ type: "error", text: res.error });
      } else {
        setFeedback({
          type: "success",
          text: "🔔 Notification test envoyée avec succès ! Regardez votre écran.",
        });
      }
    });
  };

  return (
    <div className="bg-bg-card rounded-2xl border border-border-1 p-4 shadow-sm relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

      {/* Card Header */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              isSubscribed
                ? "bg-primary/15 text-primary border border-primary/30 shadow-[0_0_12px_rgba(5,150,105,0.2)]"
                : "bg-bg-surface text-text-3 border border-border-1"
            }`}
          >
            {isSubscribed ? <BellRing size={20} className="animate-pulse" /> : <BellOff size={20} />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-1 flex items-center gap-1.5">
              Notifications & Alertes
              {isSubscribed && (
                <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Actif
                </span>
              )}
            </h3>
            <p className="text-xs text-text-3">
              Rappels avant-match et résultats personnalisés
            </p>
          </div>
        </div>

        {/* Action Button Toggle */}
        <button
          onClick={handleToggleSubscription}
          disabled={loading || (!isSupported && !(isIOS && !isPWA))}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 ${
            isSubscribed ? "bg-primary" : "bg-bg-surface border border-border-2"
          } ${loading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
          title={isSubscribed ? "Désactiver les alertes" : "Activer les alertes"}
        >
          {loading ? (
            <span className="absolute inset-0 flex items-center justify-center">
              <Loader2 size={12} className="animate-spin text-white" />
            </span>
          ) : (
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isSubscribed ? "translate-x-6 shadow-sm" : "translate-x-1"
              }`}
            />
          )}
        </button>
      </div>

      {/* Description List */}
      <div className="bg-bg-surface/60 rounded-xl p-3 border border-border-1/60 space-y-2 mb-3 text-xs">
        <div className="flex items-start gap-2 text-text-2">
          <span className="text-amber-400 font-bold">⏰</span>
          <span>
            <strong className="text-text-1">Rappel 2h avant le coup d'envoi</strong> si vous n'avez pas encore pronostiqué.
          </span>
        </div>
        <div className="flex items-start gap-2 text-text-2">
          <span className="text-emerald-400 font-bold">🎯</span>
          <span>
            <strong className="text-text-1">Résultats en direct</strong> dès la fin du match avec vos points gagnés.
          </span>
        </div>
        <div className="flex items-start gap-2 text-text-2">
          <span className="text-cyan-400 font-bold">📢</span>
          <span>
            <strong className="text-text-1">Flash infos du club</strong> (retransmissions vidéo, horaires, victoires).
          </span>
        </div>
      </div>

      {/* Feedback Message */}
      {feedback && (
        <div
          className={`mb-3 p-2.5 rounded-xl text-xs flex items-start gap-2 anim-fade ${
            feedback.type === "success"
              ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
              : feedback.type === "error"
              ? "bg-rose-500/15 border border-rose-500/30 text-rose-300"
              : "bg-blue-500/15 border border-blue-500/30 text-blue-300"
          }`}
        >
          {feedback.type === "success" && <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-400" />}
          {feedback.type === "error" && <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />}
          {feedback.type === "info" && <Info size={16} className="shrink-0 mt-0.5 text-blue-400" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* iOS Special Helper Notice */}
      {isIOS && !isPWA && (
        <div className="mb-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-2.5">
          <Smartphone size={16} className="shrink-0 text-amber-400 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-300">Astuce iPhone (Apple) :</span>
            <p className="mt-0.5 leading-relaxed text-[11px] text-text-2">
              Pour recevoir les notifications sur iPhone, touchez <strong>Partager ⎋</strong> dans Safari puis <strong>"Sur l'écran d'accueil" ➕</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Test Button (Visible when subscribed) */}
      {isSubscribed && (
        <div className="pt-2 border-t border-border-1/60 flex items-center justify-between">
          <span className="text-[11px] text-text-3">Vérifier la réception sur cet écran</span>
          <button
            onClick={handleSendTest}
            disabled={testPending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-surface hover:bg-bg-surface-hover border border-border-2 text-xs font-semibold text-text-1 transition-all active:scale-95 disabled:opacity-50"
          >
            {testPending ? (
              <Loader2 size={12} className="animate-spin text-primary" />
            ) : (
              <Send size={12} className="text-primary" />
            )}
            <span>Envoyer un test</span>
          </button>
        </div>
      )}
    </div>
  );
}
