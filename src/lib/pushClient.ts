"use client";

// Clé publique VAPID par défaut (identique à celle générée dans le .env)
export const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  "BArK24K6aefMCRdOtKTecR0eLiFrVhimEWlvoTTLbm3MdnoDFNgnHpbemum_ujBAyr3z1SCn0ExMcHVDLbT-9NQ";

/**
 * Convertit une clé publique base64 URL-safe en Uint8Array pour le PushManager
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Vérifie si le navigateur supporte les notifications Push et les Service Workers
 */
export function isPushSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

/**
 * Détecte si l'appareil est un iPhone / iPad (iOS)
 */
export function isIOSDevice(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

/**
 * Détecte si l'app tourne en mode PWA standalone (installée sur l'écran d'accueil)
 */
export function isStandalonePWA(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    window.matchMedia("(display-mode: minimal-ui)").matches ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window.navigator as any).standalone === true ||
    (typeof document !== "undefined" &&
      (document.documentElement.classList.contains("is-standalone") ||
        document.referrer.includes("android-app://")))
  );
}

/**
 * Récupère le statut de permission actuel
 */
export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!isPushSupported()) return "unsupported";
  return Notification.permission;
}

/**
 * Enregistre le service worker et récupère l'abonnement push existant
 */
export async function getExistingPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.getRegistration("/sw.js");
    if (!registration) return null;
    return await registration.pushManager.getSubscription();
  } catch (err) {
    console.error("Erreur lors de la récupération de la souscription push:", err);
    return null;
  }
}

/**
 * Demande l'autorisation et abonne l'appareil aux notifications push
 */
export async function subscribeToPushNotifications(): Promise<{
  success: boolean;
  subscription?: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
  error?: string;
}> {
  if (!isPushSupported()) {
    if (isIOSDevice() && !isStandalonePWA()) {
      return {
        success: false,
        error: "Sur iPhone / iOS, vous devez d'abord ajouter l'application à votre écran d'accueil (Partager > Sur l'écran d'accueil) pour activer les notifications.",
      };
    }
    return {
      success: false,
      error: "Les notifications Push ne sont pas supportées par votre navigateur.",
    };
  }

  try {
    // 1. Demande de permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return {
        success: false,
        error: "L'autorisation pour les notifications a été refusée ou ignorée.",
      };
    }

    // 2. Enregistrement du Service Worker
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });
    await navigator.serviceWorker.ready;

    // 3. Souscription auprès du PushManager
    const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as any,
      });
    }

    const subJson = subscription.toJSON();
    if (!subJson.endpoint || !subJson.keys?.p256dh || !subJson.keys?.auth) {
      return {
        success: false,
        error: "Impossible d'extraire les clés de sécurité de l'abonnement push.",
      };
    }

    return {
      success: true,
      subscription: {
        endpoint: subJson.endpoint,
        keys: {
          p256dh: subJson.keys.p256dh,
          auth: subJson.keys.auth,
        },
      },
    };
  } catch (err: any) {
    console.error("Erreur d'abonnement push:", err);
    return {
      success: false,
      error: err?.message || "Une erreur est survenue lors de l'activation des notifications.",
    };
  }
}

/**
 * Désabonne l'appareil des notifications push
 */
export async function unsubscribeFromPushNotifications(): Promise<{
  success: boolean;
  endpoint?: string;
  error?: string;
}> {
  if (!isPushSupported()) return { success: true };

  try {
    const registration = await navigator.serviceWorker.getRegistration("/sw.js");
    if (!registration) return { success: true };

    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return { success: true };

    const endpoint = subscription.endpoint;
    await subscription.unsubscribe();

    return { success: true, endpoint };
  } catch (err: any) {
    console.error("Erreur de désabonnement push:", err);
    return { success: false, error: err?.message || "Erreur lors de la désactivation." };
  }
}
