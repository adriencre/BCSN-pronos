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

export type ReminderType = "24H" | "2H" | "MANUAL";

export interface MatchReminderStatus {
  matchId: number;
  reminder24h: { sent: boolean; sentAt?: string; recipientsCount?: number };
  reminder2h: { sent: boolean; sentAt?: string; recipientsCount?: number };
}

/**
 * Envoie un rappel de match ciblé aux personnes n'ayant pas encore pronostiqué
 * Prend en charge les relances automatiques "24H" (J-1), "2H" (H-2) ou "MANUAL"
 */
export async function sendMatchReminderToPendingUsers(
  matchId: number,
  reminderType: ReminderType = "MANUAL"
) {
  try {
    // 1. Récupérer les infos du match
    const { data: match, error: matchErr } = await supabase
      .from("matches")
      .select("id, opponent, date_time, is_home, reminder_24h_sent, reminder_2h_sent")
      .eq("id", matchId)
      .single();

    if (matchErr || !match) {
      return { error: "Match introuvable" };
    }

    const matchDate = new Date(match.date_time);
    const formattedTime = matchDate.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const matchLocation = match.is_home ? "à domicile" : "à l'extérieur";

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

    // Définir le message adapté selon le type de relance
    let payload: PushPayload;
    if (reminderType === "24H") {
      payload = {
        title: `🏀 J-1 : BCSN vs ${match.opponent}`,
        body: `⏳ Coup d'envoi demain à ${formattedTime} (${matchLocation}) ! Tu n'as pas encore placé ton pronostic. Qui va l'emporter ?`,
        url: "/matchs",
        tag: `match-reminder-24h-${match.id}`,
      };
    } else if (reminderType === "2H") {
      payload = {
        title: `⚡ H-2 : BCSN vs ${match.opponent} (Dernier appel)`,
        body: `🚨 Coup d'envoi à ${formattedTime} ! Plus que 2 heures pour valider ton prono avant la clôture. Ne perds pas de points !`,
        url: "/matchs",
        tag: `match-reminder-2h-${match.id}`,
      };
    } else {
      payload = {
        title: `🏀 Rappel Prono : BCSN vs ${match.opponent}`,
        body: `⚠️ N'oublie pas ton prono (${matchLocation} à ${formattedTime}) ! Viens soutenir l'équipe et marquer des points.`,
        url: "/matchs",
        tag: `match-reminder-${match.id}`,
      };
    }

    // Si aucun retardataire n'est trouvé
    if (subsErr || !pendingSubs || pendingSubs.length === 0) {
      // On trace quand même le rappel comme traité pour que le cron ne boucle pas
      await markReminderAsSent(matchId, reminderType, 0);
      return {
        success: true,
        count: 0,
        reminderType,
        message: "Tous les abonnés ont déjà pronostiqué pour ce match !",
      };
    }

    // 4. Envoi effectif des push
    const results = await Promise.allSettled(
      pendingSubs.map((sub) => sendPushToSubscription(sub, payload))
    );

    const count = results.filter((r) => r.status === "fulfilled" && r.value === true).length;

    // 5. Enregistrer l'historique et mettre à jour le statut anti-doublon
    await markReminderAsSent(matchId, reminderType, count);

    const typeLabel =
      reminderType === "24H" ? "Rappel J-1 (24h)" : reminderType === "2H" ? "Rappel H-2 (2h)" : "Rappel";

    return {
      success: true,
      count,
      reminderType,
      totalPending: pendingSubs.length,
      message: `${typeLabel} envoyé à ${count} retardataire(s) avec succès !`,
    };
  } catch (err: any) {
    console.error("Erreur sendMatchReminderToPendingUsers:", err);
    return { error: err.message || "Erreur lors de l'envoi du rappel" };
  }
}

/**
 * Enregistre le rappel envoyé dans match_reminders et met à jour les flags du match
 */
async function markReminderAsSent(matchId: number, reminderType: ReminderType, count: number) {
  const nowIso = new Date().toISOString();

  // 1. Enregistrement dans match_reminders (table dédiée)
  try {
    await supabase.from("match_reminders").upsert(
      {
        match_id: matchId,
        reminder_type: reminderType,
        recipients_count: count,
        sent_at: nowIso,
      },
      { onConflict: "match_id,reminder_type" }
    );
  } catch (err) {
    // Si la table n'a pas encore été créée, on continue gracieusement
    console.warn("Impossible d'insérer dans match_reminders:", err);
  }

  // 2. Mise à jour des colonnes sur matches
  try {
    const updatePayload: Record<string, any> = {};
    if (reminderType === "24H") {
      updatePayload.reminder_24h_sent = true;
      updatePayload.reminder_24h_at = nowIso;
    } else if (reminderType === "2H") {
      updatePayload.reminder_2h_sent = true;
      updatePayload.reminder_2h_at = nowIso;
    }

    if (Object.keys(updatePayload).length > 0) {
      await supabase.from("matches").update(updatePayload).eq("id", matchId);
    }
  } catch (err) {
    console.warn("Impossible de mettre à jour les colonnes reminder sur matches:", err);
  }
}

/**
 * Récupère le statut des rappels (24h et 2h) pour un match donné
 */
export async function getMatchRemindersStatus(matchId: number): Promise<MatchReminderStatus> {
  const status: MatchReminderStatus = {
    matchId,
    reminder24h: { sent: false },
    reminder2h: { sent: false },
  };

  try {
    // Vérification table match_reminders
    const { data: logs } = await supabase
      .from("match_reminders")
      .select("reminder_type, sent_at, recipients_count")
      .eq("match_id", matchId);

    if (logs && logs.length > 0) {
      for (const log of logs) {
        if (log.reminder_type === "24H") {
          status.reminder24h = {
            sent: true,
            sentAt: log.sent_at,
            recipientsCount: log.recipients_count,
          };
        } else if (log.reminder_type === "2H") {
          status.reminder2h = {
            sent: true,
            sentAt: log.sent_at,
            recipientsCount: log.recipients_count,
          };
        }
      }
    } else {
      // Fallback sur les colonnes de matches
      const { data: match } = await supabase
        .from("matches")
        .select("reminder_24h_sent, reminder_2h_sent, reminder_24h_at, reminder_2h_at")
        .eq("id", matchId)
        .single();

      if (match) {
        if (match.reminder_24h_sent) {
          status.reminder24h = { sent: true, sentAt: match.reminder_24h_at };
        }
        if (match.reminder_2h_sent) {
          status.reminder2h = { sent: true, sentAt: match.reminder_2h_at };
        }
      }
    }
  } catch (err) {
    console.error("Erreur getMatchRemindersStatus:", err);
  }

  return status;
}

/**
 * Réinitialise les flags de rappel pour un match (ex: en cas de report de date)
 */
export async function resetMatchReminders(matchId: number) {
  try {
    await supabase.from("match_reminders").delete().eq("match_id", matchId);
    await supabase
      .from("matches")
      .update({
        reminder_24h_sent: false,
        reminder_2h_sent: false,
        reminder_24h_at: null,
        reminder_2h_at: null,
      })
      .eq("id", matchId);

    return { success: true, message: "Rappels réinitialisés pour ce match." };
  } catch (err: any) {
    console.error("Erreur resetMatchReminders:", err);
    return { error: err.message };
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
 * Vérifie et envoie automatiquement les rappels intelligents (24h et 2h avant coup d'envoi)
 * aux retardataires, sans jamais envoyer de doublon.
 */
export async function checkAndSendAutomatedMatchReminders() {
  try {
    const now = new Date();

    // On analyse les matchs PENDING dans les prochaines 36 heures
    const maxLookahead = new Date(now.getTime() + 36 * 60 * 60 * 1000);

    const { data: upcomingMatches, error } = await supabase
      .from("matches")
      .select("*")
      .eq("status", "PENDING")
      .gte("date_time", now.toISOString())
      .lte("date_time", maxLookahead.toISOString())
      .order("date_time", { ascending: true });

    if (error || !upcomingMatches || upcomingMatches.length === 0) {
      return {
        success: true,
        checkedMatchesCount: 0,
        sent24hCount: 0,
        sent2hCount: 0,
        message: "Aucun match à venir nécessitant une relance.",
      };
    }

    // Récupérer les logs d'envois existants pour vérifier les doublons
    const sentLogsMap = new Set<string>();
    try {
      const matchIds = upcomingMatches.map((m) => m.id);
      const { data: logs } = await supabase
        .from("match_reminders")
        .select("match_id, reminder_type")
        .in("match_id", matchIds);

      (logs || []).forEach((l) => sentLogsMap.add(`${l.match_id}-${l.reminder_type}`));
    } catch (e) {
      console.warn("Table match_reminders indisponible lors du check, utilisation des colonnes matches:", e);
    }

    const processedMatches: Array<{
      matchId: number;
      opponent: string;
      dateTime: string;
      hoursUntil: number;
      actionTaken: string;
      result?: any;
    }> = [];

    let sent24hCount = 0;
    let sent2hCount = 0;

    for (const match of upcomingMatches) {
      const matchTime = new Date(match.date_time).getTime();
      const hoursUntil = (matchTime - now.getTime()) / (1000 * 60 * 60);

      const alreadySent24h =
        sentLogsMap.has(`${match.id}-24H`) || match.reminder_24h_sent === true;
      const alreadySent2h =
        sentLogsMap.has(`${match.id}-2H`) || match.reminder_2h_sent === true;

      // 1. Fenêtre 24H (J-1) : entre 20h et 28h avant le coup d'envoi
      if (hoursUntil >= 20 && hoursUntil <= 28) {
        if (!alreadySent24h) {
          const res = await sendMatchReminderToPendingUsers(match.id, "24H");
          sent24hCount += (res && res.count) || 0;
          processedMatches.push({
            matchId: match.id,
            opponent: match.opponent,
            dateTime: match.date_time,
            hoursUntil: Math.round(hoursUntil * 10) / 10,
            actionTaken: "SENT_24H",
            result: res,
          });
          continue;
        } else {
          processedMatches.push({
            matchId: match.id,
            opponent: match.opponent,
            dateTime: match.date_time,
            hoursUntil: Math.round(hoursUntil * 10) / 10,
            actionTaken: "ALREADY_SENT_24H",
          });
        }
      }

      // 2. Fenêtre 2H (H-2) : entre 45 minutes (0.75h) et 3h30 (3.5h) avant le coup d'envoi
      if (hoursUntil >= 0.75 && hoursUntil <= 3.5) {
        if (!alreadySent2h) {
          const res = await sendMatchReminderToPendingUsers(match.id, "2H");
          sent2hCount += (res && res.count) || 0;
          processedMatches.push({
            matchId: match.id,
            opponent: match.opponent,
            dateTime: match.date_time,
            hoursUntil: Math.round(hoursUntil * 10) / 10,
            actionTaken: "SENT_2H",
            result: res,
          });
          continue;
        } else {
          processedMatches.push({
            matchId: match.id,
            opponent: match.opponent,
            dateTime: match.date_time,
            hoursUntil: Math.round(hoursUntil * 10) / 10,
            actionTaken: "ALREADY_SENT_2H",
          });
        }
      }

      // Hors fenêtre active
      if (
        !processedMatches.some((p) => p.matchId === match.id)
      ) {
        processedMatches.push({
          matchId: match.id,
          opponent: match.opponent,
          dateTime: match.date_time,
          hoursUntil: Math.round(hoursUntil * 10) / 10,
          actionTaken: `OUTSIDE_WINDOW (J-1: ${alreadySent24h ? "Fait" : "À venir"}, H-2: ${alreadySent2h ? "Fait" : "À venir"})`,
        });
      }
    }

    return {
      success: true,
      checkedMatchesCount: upcomingMatches.length,
      sent24hCount,
      sent2hCount,
      processedMatches,
      message: `Analyse terminée : ${sent24hCount} rappel(s) 24h et ${sent2hCount} rappel(s) 2h envoyés.`,
    };
  } catch (err: any) {
    console.error("Erreur checkAndSendAutomatedMatchReminders:", err);
    return { error: err.message || "Erreur lors de la vérification automatique des rappels" };
  }
}

