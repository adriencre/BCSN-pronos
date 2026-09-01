import webpush from "web-push";
import { supabase } from "./supabase";

const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  "BArK24K6aefMCRdOtKTecR0eLiFrVhimEWlvoTTLbm3MdnoDFNgnHpbemum_ujBAyr3z1SCn0ExMcHVDLbT-9NQ";

const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY || "IZrT6zMO64p2hUwHhoKfST5cktk0E2cps1zUbMov2Gs";

const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:contact@bcsn-pronos.fr";

// Configuration initiale de web-push
try {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
} catch (e) {
  console.error("Erreur lors de l'initialisation de web-push:", e);
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
  tag?: string;
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Enregistre ou met à jour une souscription push pour un utilisateur
 */
export async function savePushSubscription(
  userId: number,
  subscription: PushSubscriptionData,
  userAgent?: string
) {
  try {
    const { data: existing } = await supabase
      .from("push_subscriptions")
      .select("id")
      .eq("endpoint", subscription.endpoint)
      .limit(1);

    if (existing && existing.length > 0) {
      const { error } = await supabase
        .from("push_subscriptions")
        .update({
          user_id: userId,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          user_agent: userAgent || null,
          updated_at: new Date().toISOString(),
        })
        .eq("endpoint", subscription.endpoint);

      if (error) throw error;
      return { success: true };
    } else {
      const { error } = await supabase.from("push_subscriptions").insert({
        user_id: userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        user_agent: userAgent || null,
      });

      if (error) throw error;
      return { success: true };
    }
  } catch (err: any) {
    console.error("Erreur savePushSubscription:", err);
    return { error: err.message || "Erreur de sauvegarde de l'abonnement push" };
  }
}

/**
 * Supprime une souscription push de la base de données
 */
export async function deletePushSubscription(endpoint: string) {
  try {
    await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
    return { success: true };
  } catch (err: any) {
    console.error("Erreur deletePushSubscription:", err);
    return { error: err.message };
  }
}

/**
 * Envoie une notification à un abonnement individuel avec auto-nettoyage si expiré
 */
export async function sendPushToSubscription(
  sub: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload
): Promise<boolean> {
  const pushSubscription = {
    endpoint: sub.endpoint,
    keys: {
      p256dh: sub.p256dh,
      auth: sub.auth,
    },
  };

  const payloadString = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url || "/matchs",
    icon: payload.icon || "/logo-192.png",
    badge: payload.badge || "/logo-192.png",
    tag: payload.tag || "bcsn-notification",
  });

  try {
    await webpush.sendNotification(pushSubscription, payloadString);
    return true;
  } catch (err: any) {
    // Si l'abonnement n'est plus valide (désinstallé, expiré), on le supprime de la base
    if (err.statusCode === 404 || err.statusCode === 410) {
      console.log(`Suppression de l'abonnement push expiré: ${sub.endpoint}`);
      await deletePushSubscription(sub.endpoint);
    } else {
      console.error("Erreur d'envoi web-push:", err.message || err);
    }
    return false;
  }
}

/**
 * Envoie une notification à tous les appareils d'un utilisateur
 */
export async function sendPushToUser(userId: number, payload: PushPayload): Promise<number> {
  try {
    const { data: subs, error } = await supabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("user_id", userId);

    if (error || !subs || subs.length === 0) return 0;

    const results = await Promise.allSettled(
      subs.map((sub) => sendPushToSubscription(sub, payload))
    );

    return results.filter((r) => r.status === "fulfilled" && r.value === true).length;
  } catch (err) {
    console.error(`Erreur sendPushToUser (user: ${userId}):`, err);
    return 0;
  }
}

/**
 * Envoie une notification à plusieurs utilisateurs
 */
export async function sendPushToUsers(userIds: number[], payload: PushPayload): Promise<number> {
  if (userIds.length === 0) return 0;
  try {
    const { data: subs, error } = await supabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth, user_id")
      .in("user_id", userIds);

    if (error || !subs || subs.length === 0) return 0;

    const results = await Promise.allSettled(
      subs.map((sub) => sendPushToSubscription(sub, payload))
    );

    return results.filter((r) => r.status === "fulfilled" && r.value === true).length;
  } catch (err) {
    console.error("Erreur sendPushToUsers:", err);
    return 0;
  }
}

/**
 * Envoie une notification générale à tous les supporters / joueurs
 */
export async function sendBroadcastPush(
  payload: PushPayload,
  options?: { targetRole?: string; excludeUserId?: number }
): Promise<{ totalSent: number; totalDevices: number }> {
  try {
    let query = supabase.from("push_subscriptions").select("endpoint, p256dh, auth, user_id, user:users(role)");

    if (options?.excludeUserId) {
      query = query.neq("user_id", options.excludeUserId);
    }

    const { data: subs, error } = await query;

    if (error || !subs || subs.length === 0) {
      return { totalSent: 0, totalDevices: 0 };
    }

    // Filtrage par rôle si spécifié
    const filteredSubs = subs.filter((item: any) => {
      if (!options?.targetRole || options.targetRole === "ALL") return true;
      return item.user?.role === options.targetRole;
    });

    const results = await Promise.allSettled(
      filteredSubs.map((sub) => sendPushToSubscription(sub, payload))
    );

    const totalSent = results.filter((r) => r.status === "fulfilled" && r.value === true).length;
    return { totalSent, totalDevices: filteredSubs.length };
  } catch (err) {
    console.error("Erreur sendBroadcastPush:", err);
    return { totalSent: 0, totalDevices: 0 };
  }
}

/**
 * Envoie un rappel de match aux personnes n'ayant pas encore pronostiqué
 */
export async function sendMatchReminderToPendingUsers(matchId: number) {
  try {
    // 1. Récupérer le match
    const { data: match, error: matchErr } = await supabase
      .from("matches")
      .select("id, opponent, date_time, is_home")
      .eq("id", matchId)
      .single();

    if (matchErr || !match) {
      return { error: "Match introuvable" };
    }

    // 2. Récupérer les utilisateurs ayant déjà pronostiqué
    const { data: preds } = await supabase
      .from("predictions")
      .select("user_id")
      .eq("match_id", matchId);

    const alreadyPredictedUserIds = (preds || []).map((p) => p.user_id);

    // 3. Récupérer les abonnés push qui N'ONT PAS encore pronostiqué
    let subQuery = supabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth, user_id, user:users(pseudo)");

    if (alreadyPredictedUserIds.length > 0) {
      subQuery = subQuery.not("user_id", "in", `(${alreadyPredictedUserIds.join(",")})`);
    }

    const { data: pendingSubs, error: subsErr } = await subQuery;

    if (subsErr || !pendingSubs || pendingSubs.length === 0) {
      return { success: true, count: 0, message: "Tous les abonnés ont déjà pronostiqué ou aucun abonné actif." };
    }

    const matchLocation = match.is_home ? "à domicile" : "à l'extérieur";
    const payload: PushPayload = {
      title: `🏀 Rappel Match : BCSN vs ${match.opponent}`,
      body: `⚠️ N'oublie pas ton prono ! Le coup d'envoi approche (${matchLocation}). Viens marquer des points !`,
      url: "/matchs",
      tag: `match-reminder-${match.id}`,
    };

    const results = await Promise.allSettled(
      pendingSubs.map((sub) => sendPushToSubscription(sub, payload))
    );

    const count = results.filter((r) => r.status === "fulfilled" && r.value === true).length;
    return {
      success: true,
      count,
      totalPending: pendingSubs.length,
      message: `${count} rappel(s) envoyé(s) avec succès !`,
    };
  } catch (err: any) {
    console.error("Erreur sendMatchReminderToPendingUsers:", err);
    return { error: err.message || "Erreur lors de l'envoi du rappel" };
  }
}

/**
 * Envoie les notifications de résultats après la fin d'un match
 */
export async function sendMatchResultPushNotifications(matchId: number) {
  try {
    // 1. Récupérer les infos du match
    const { data: match } = await supabase
      .from("matches")
      .select("*")
      .eq("id", matchId)
      .single();

    if (!match) return;

    // 2. Récupérer toutes les prédictions du match
    const { data: predictions } = await supabase
      .from("predictions")
      .select("user_id, predicted_bcsn, predicted_opponent, points_earned, user:users(pseudo)")
      .eq("match_id", matchId);

    const participantIds = new Set<number>();

    // 3. Envoyer une notification personnalisée à chaque joueur ayant pronostiqué
    if (predictions && predictions.length > 0) {
      for (const pred of predictions) {
        participantIds.add(pred.user_id);
        const pts = pred.points_earned ?? 0;
        let title = `🏀 Résultat : BCSN vs ${match.opponent}`;
        let body = `Score final : BCSN ${match.score_bcsn} - ${match.score_opponent} ${match.opponent}.`;

        if (pts >= 10) {
          title = `🎯 DANS LE MILLE ! (+10 pts)`;
          body = `Incroyable ! Tu as trouvé le score exact (${match.score_bcsn}-${match.score_opponent}) ! 🚀`;
        } else if (pts >= 5) {
          title = `🔥 Excellent prono ! (+${pts} pts)`;
          body = `Bien joué ! Tu as trouvé le bon vainqueur et le parfait écart de score !`;
        } else if (pts > 0) {
          title = `👏 Bien joué ! (+${pts} pts)`;
          body = `Victoire bien anticipée face à ${match.opponent} ! +${pts} pts au classement.`;
        } else {
          title = `🏀 Fin du match : BCSN vs ${match.opponent}`;
          body = `Score final ${match.score_bcsn}-${match.score_opponent}. 0 point cette fois, revanche au prochain match !`;
        }

        await sendPushToUser(pred.user_id, {
          title,
          body,
          url: "/profil",
          tag: `match-result-${matchId}`,
        });
      }
    }

    // 4. Envoyer une notification récapitulative à tous les autres abonnés qui n'avaient pas pronostiqué
    const { data: otherSubs } = await supabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth, user_id");

    if (otherSubs && otherSubs.length > 0) {
      const nonParticipants = otherSubs.filter((sub) => !participantIds.has(sub.user_id));
      if (nonParticipants.length > 0) {
        const recapPayload: PushPayload = {
          title: `🏁 Fin du match : BCSN ${match.score_bcsn} - ${match.score_opponent} ${match.opponent}`,
          body: `Le score a été validé et le classement général est mis à jour !`,
          url: "/classement",
          tag: `match-result-${matchId}`,
        };

        await Promise.allSettled(
          nonParticipants.map((sub) => sendPushToSubscription(sub, recapPayload))
        );
      }
    }
  } catch (err) {
    console.error("Erreur sendMatchResultPushNotifications:", err);
  }
}

/**
 * Récupère les statistiques sur les abonnés aux notifications
 */
export async function getPushSubscribersStats() {
  try {
    const { data, count, error } = await supabase
      .from("push_subscriptions")
      .select("user_id", { count: "exact" });

    if (error) throw error;

    const uniqueUsers = new Set((data || []).map((s) => s.user_id));

    return {
      totalDevices: count || 0,
      totalUsers: uniqueUsers.size,
    };
  } catch (err) {
    console.error("Erreur getPushSubscribersStats:", err);
    return { totalDevices: 0, totalUsers: 0 };
  }
}

/**
 * Vérifie et envoie automatiquement les rappels pour les matchs débutant dans les 2 à 3 heures à venir
 */
export async function checkAndSendAutomatedMatchReminders() {
  try {
    const now = new Date();
    // Fenêtre de rappel : matchs débutant entre maintenant et dans 3h
    const windowStart = new Date(now.getTime());
    const windowEnd = new Date(now.getTime() + 3.5 * 60 * 60 * 1000);

    const { data: upcomingMatches, error } = await supabase
      .from("matches")
      .select("id, opponent, date_time, is_home, status")
      .eq("status", "PENDING")
      .gte("date_time", windowStart.toISOString())
      .lte("date_time", windowEnd.toISOString());

    if (error || !upcomingMatches || upcomingMatches.length === 0) {
      return { success: true, count: 0, message: "Aucun match nécessitant un rappel immédiat." };
    }

    const processedMatches = [];
    for (const match of upcomingMatches) {
      const res = await sendMatchReminderToPendingUsers(match.id);
      processedMatches.push({ matchId: match.id, opponent: match.opponent, result: res });
    }

    return { success: true, processedMatches };
  } catch (err: any) {
    console.error("Erreur checkAndSendAutomatedMatchReminders:", err);
    return { error: err.message || "Erreur lors de la vérification automatique des rappels" };
  }
}
