"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Trophy,
  Calendar,
  PlusCircle,
  ArrowLeft,
  Clock,
  Edit3,
  MapPin,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Bell,
  Send,
  Megaphone,
  Users,
  Smartphone,
  CheckCircle2,
  Radio,
  Loader2,
} from "lucide-react";
import {
  submitMatchResult,
  createMatch,
  sendMatchReminderAction,
  sendAdminAnnouncementAction,
  getPushSubscribersStatsAction,
  getMatchReminderPendingCount,
} from "@/lib/actions";
import { getClubLogoPath } from "@/lib/clubsData";

interface MatchItem {
  id: number;
  opponent: string;
  dateTime: string;
  isHome: boolean;
  scoreBcsn: number | null;
  scoreOpponent: number | null;
  status: string;
  matchday: number;
}

interface Props {
  matches: MatchItem[];
}

export default function AdminScoresView({ matches }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<"next" | "upcoming" | "finished" | "notifications" | "add">("next");

  // State for score entries
  const [scores, setScores] = useState<Record<number, { bcsn: number; opp: number }>>({});
  const [editingMatchId, setEditingMatchId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ id: number; type: "success" | "error"; text: string } | null>(null);

  // Push Notifications Admin State
  const [subStats, setSubStats] = useState<{ totalDevices: number; totalUsers: number } | null>(null);
  const [reminderPendingCount, setReminderPendingCount] = useState<number | null>(null);
  const [reminderSending, setReminderSending] = useState(false);
  const [announcementSending, setAnnouncementSending] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState("🏀 Flash Info BCSN");
  const [announcementBody, setAnnouncementBody] = useState("");
  const [announcementUrl, setAnnouncementUrl] = useState("/matchs");
  const [announcementRole, setAnnouncementRole] = useState<"ALL" | "JOUEUR" | "SUPPORTER">("ALL");
  const [notificationMsg, setNotificationMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // New match form
  const [newOpponent, setNewOpponent] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("20:30");
  const [newIsHome, setNewIsHome] = useState(true);
  const [newMatchday, setNewMatchday] = useState(0);

  const pendingMatches = matches.filter((m) => m.status === "PENDING");
  const finishedMatches = matches.filter((m) => m.status === "FINISHED");
  const nextMatch = pendingMatches.length > 0 ? pendingMatches[0] : null;

  // Charger les stats de notifications
  useEffect(() => {
    async function loadStats() {
      const stats = await getPushSubscribersStatsAction();
      setSubStats(stats);

      if (nextMatch) {
        const pendingCount = await getMatchReminderPendingCount(nextMatch.id);
        setReminderPendingCount(pendingCount);
      }
    }
    loadStats();
  }, [nextMatch?.id]);

  const getScore = (m: MatchItem) => {
    if (scores[m.id]) return scores[m.id];
    return {
      bcsn: m.scoreBcsn ?? 80,
      opp: m.scoreOpponent ?? 75,
    };
  };

  const updateScore = (mId: number, field: "bcsn" | "opp", val: number) => {
    const clamped = Math.max(0, val);
    setScores((prev) => {
      const cur = prev[mId] || { bcsn: 80, opp: 75 };
      return { ...prev, [mId]: { ...cur, [field]: clamped } };
    });
  };

  const handleSaveResult = (matchId: number) => {
    const targetMatch = matches.find((m) => m.id === matchId);
    if (!targetMatch) return;

    const { bcsn, opp } = getScore(targetMatch);

    startTransition(async () => {
      const res = await submitMatchResult(matchId, bcsn, opp);
      if (res.error) {
        setMessage({ id: matchId, type: "error", text: res.error });
      } else {
        setMessage({ id: matchId, type: "success", text: "Score validé, points calculés & notifications envoyées !" });
        setEditingMatchId(null);
        setTimeout(() => router.refresh(), 1000);
      }
    });
  };

  const handleSendReminder = async (matchId: number) => {
    setReminderSending(true);
    setNotificationMsg(null);
    try {
      const res = await sendMatchReminderAction(matchId);
      if ("error" in res && res.error) {
        setNotificationMsg({ type: "error", text: String(res.error) });
      } else {
        setNotificationMsg({
          type: "success",
          text: res.message || "Rappels envoyés avec succès !",
        });
        const updated = await getMatchReminderPendingCount(matchId);
        setReminderPendingCount(updated);
      }
    } catch (err: any) {
      setNotificationMsg({ type: "error", text: err.message || "Erreur lors de l'envoi du rappel." });
    }
    setReminderSending(false);
  };

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementBody.trim()) return;

    setAnnouncementSending(true);
    setNotificationMsg(null);
    try {
      const res = await sendAdminAnnouncementAction(
        announcementTitle,
        announcementBody,
        announcementUrl,
        announcementRole
      );
      if (res.error) {
        setNotificationMsg({ type: "error", text: res.error });
      } else {
        setNotificationMsg({
          type: "success",
          text: res.message || "Annonce envoyée à tous les appareils !",
        });
        setAnnouncementBody("");
      }
    } catch (err: any) {
      setNotificationMsg({ type: "error", text: err.message || "Erreur d'envoi." });
    }
    setAnnouncementSending(false);
  };

  const applyTemplate = (title: string, body: string, url: string = "/matchs") => {
    setAnnouncementTitle(title);
    setAnnouncementBody(body);
    setAnnouncementUrl(url);
  };

  const handleCreateMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOpponent || !newDate) return;

    startTransition(async () => {
      const fullIso = new Date(`${newDate}T${newTime}:00`).toISOString();
      const res = await createMatch({
        opponent: newOpponent,
        dateTime: fullIso,
        isHome: newIsHome,
        matchday: Number(newMatchday),
      });

      if ("error" in res && res.error) {
        alert(String(res.error));
      } else {
        setNewOpponent("");
        setActiveTab("upcoming");
        router.refresh();
      }
    });
  };

  return (
    <div className="px-4 pt-4 pb-16">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => router.push("/profil")}
          className="flex items-center gap-1.5 text-xs font-bold text-text-3 hover:text-text-1 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Retour au Profil</span>
        </button>
        <span className="badge badge-joueur text-[9px] bg-indigo-600/20 text-indigo-400 border-indigo-500/40 font-bold">
          ADMIN COCKPIT
        </span>
      </div>

      {/* Hero Header */}
      <div className="card-elevated p-5 mb-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white border border-indigo-500/30 shadow-2xl anim-slide">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 backdrop-blur-md flex items-center justify-center text-gold shadow-md">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight leading-tight">Centre de Contrôle</h1>
              <p className="text-xs text-white/70 mt-0.5">
                Scores, Notifications Push & Matchs du Club
              </p>
            </div>
          </div>

          {subStats && subStats.totalDevices > 0 && (
            <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 text-right hidden sm:block">
              <span className="text-[10px] text-white/70 block uppercase font-bold">Abonnés Push</span>
              <span className="text-sm font-black text-emerald-400 font-mono">
                {subStats.totalDevices} appareil{subStats.totalDevices > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="grid grid-cols-5 gap-1 p-1 bg-bg-surface rounded-2xl border border-border-1 mb-5 text-center text-xs font-bold">
        <button
          onClick={() => setActiveTab("next")}
          className={`py-2 rounded-xl transition-all ${
            activeTab === "next"
              ? "bg-bg-card text-text-1 shadow-md border border-border-2 font-black"
              : "text-text-3 hover:text-text-2"
          }`}
        >
          À Valider
        </button>
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`py-2 rounded-xl transition-all ${
            activeTab === "upcoming"
              ? "bg-bg-card text-text-1 shadow-md border border-border-2 font-black"
              : "text-text-3 hover:text-text-2"
          }`}
        >
          À Venir ({pendingMatches.length})
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
            activeTab === "notifications"
              ? "bg-indigo-600 text-white shadow-md font-black"
              : "text-indigo-400 hover:text-indigo-300"
          }`}
        >
          <Bell size={13} />
          <span>Alertes</span>
        </button>
        <button
          onClick={() => setActiveTab("finished")}
          className={`py-2 rounded-xl transition-all ${
            activeTab === "finished"
              ? "bg-bg-card text-text-1 shadow-md border border-border-2 font-black"
              : "text-text-3 hover:text-text-2"
          }`}
        >
          Terminés
        </button>
        <button
          onClick={() => setActiveTab("add")}
          className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
            activeTab === "add"
              ? "bg-primary text-white shadow-md font-black"
              : "text-primary-text hover:text-primary"
          }`}
        >
          <PlusCircle size={13} />
          <span>Créer</span>
        </button>
      </div>


      {/* Tab 1: Prochain Match à Valider */}
      {activeTab === "next" && (
        <div className="anim-fade space-y-4">
          {nextMatch ? (
            <div className="card-elevated p-5 border border-primary/40 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="badge badge-open text-[9px]">
                  Match en attente de score
                </span>
                <span className="text-[11px] font-bold text-text-3">
                  {nextMatch.matchday > 0 ? `Journée ${nextMatch.matchday}` : "Choc FFBB"}
                </span>
              </div>

              <div className="flex items-center justify-around gap-2 mb-6">
                {/* BCSN */}
                <div className="flex-1 text-center">
                  <p className="text-xs font-black text-primary-text uppercase mb-2">BCSN</p>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateScore(nextMatch.id, "bcsn", getScore(nextMatch).bcsn - 1)}
                      className="w-8 h-8 rounded-xl bg-bg-surface border border-border-1 text-text-2 font-bold"
                    >
                      -
                    </button>
                    <span className="text-3xl font-black text-text-1 tabular-nums font-mono">
                      {getScore(nextMatch).bcsn}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateScore(nextMatch.id, "bcsn", getScore(nextMatch).bcsn + 1)}
                      className="w-8 h-8 rounded-xl bg-primary text-white font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <span className="text-2xl text-text-4 font-bold">–</span>

                {/* Opponent */}
                <div className="flex-1 text-center">
                  <p className="text-xs font-black text-accent uppercase mb-2 truncate">
                    {nextMatch.opponent.split(" ")[0]}
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateScore(nextMatch.id, "opp", getScore(nextMatch).opp - 1)}
                      className="w-8 h-8 rounded-xl bg-bg-surface border border-border-1 text-text-2 font-bold"
                    >
                      -
                    </button>
                    <span className="text-3xl font-black text-text-1 tabular-nums font-mono">
                      {getScore(nextMatch).opp}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateScore(nextMatch.id, "opp", getScore(nextMatch).opp + 1)}
                      className="w-8 h-8 rounded-xl bg-primary text-white font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Match Reminder Button */}
              <div className="pt-3 border-t border-border-1 flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-1.5 text-xs text-text-3">
                  <Bell size={14} className="text-amber-400" />
                  <span>
                    Retardataires :{" "}
                    <strong className="text-text-1 font-mono">
                      {reminderPendingCount !== null ? `${reminderPendingCount} abonné(s)` : "Calcul..."}
                    </strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleSendReminder(nextMatch.id)}
                  disabled={reminderSending}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all disabled:opacity-50"
                >
                  {reminderSending ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Send size={12} />
                  )}
                  <span>Rappeler</span>
                </button>
              </div>

              {message && message.id === nextMatch.id && (
                <div className={`p-3 rounded-xl mb-4 text-xs font-bold flex items-center gap-2 ${
                  message.type === "success" ? "bg-primary-soft text-primary-text" : "bg-accent-soft text-accent"
                }`}>
                  {message.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  <span>{message.text}</span>
                </div>
              )}

              <button
                onClick={() => handleSaveResult(nextMatch.id)}
                disabled={isPending}
                className="btn-primary w-full py-3.5 text-xs font-black flex items-center justify-center gap-2 shadow-xl"
              >
                <CheckCircle size={16} />
                <span>{isPending ? "Calcul & Redistribution..." : "Valider le Score & Clôturer le Match"}</span>
              </button>
            </div>
          ) : (
            <div className="card p-8 text-center text-text-3 text-xs">
              Aucun match en attente de score.
            </div>
          )}
        </div>
      )}

      {/* Tab 2: À Venir */}
      {activeTab === "upcoming" && (
        <div className="anim-fade space-y-3">
          {pendingMatches.map((m) => {
            const oppLogo = getClubLogoPath(m.opponent);
            const isEditing = editingMatchId === m.id;

            return (
              <div key={m.id} className="card p-4 border border-border-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-text-4">
                    {m.matchday > 0 ? `Journée ${m.matchday}` : "Amical / Coupe"} · {new Date(m.dateTime).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                  </span>
                  <span className="badge badge-open text-[9px]">À venir</span>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white p-1 shadow-sm border border-border-1 flex items-center justify-center overflow-hidden shrink-0">
                      {oppLogo ? (
                        <img src={oppLogo} alt="" className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-xs">🏀</span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-black text-text-1">
                        {m.isHome ? "BCSN" : m.opponent} vs {m.isHome ? m.opponent : "BCSN"}
                      </p>
                      <p className="text-[10px] text-text-3 font-semibold">
                        {m.isHome ? "Domicile" : "Extérieur"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setEditingMatchId(isEditing ? null : m.id)}
                    className="px-3 py-1.5 rounded-xl bg-bg-surface hover:bg-bg-card-hover border border-border-1 text-xs font-bold text-text-2 flex items-center gap-1"
                  >
                    <Edit3 size={13} />
                    <span>{isEditing ? "Fermer" : "Saisir score"}</span>
                  </button>
                </div>

                {/* Inline Score Entry */}
                {isEditing && (
                  <div className="pt-3 border-t border-border-1 anim-slide">
                    <div className="flex items-center justify-around gap-2 mb-4 bg-bg-surface p-3 rounded-2xl">
                      <div className="text-center">
                        <span className="text-[10px] font-bold text-primary-text uppercase block mb-1">BCSN</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => updateScore(m.id, "bcsn", getScore(m).bcsn - 1)}
                            className="w-7 h-7 rounded-lg bg-bg-card border border-border-1 text-xs font-bold"
                          >
                            -
                          </button>
                          <span className="text-xl font-black text-text-1 tabular-nums font-mono px-1">
                            {getScore(m).bcsn}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateScore(m.id, "bcsn", getScore(m).bcsn + 1)}
                            className="w-7 h-7 rounded-lg bg-primary text-white text-xs font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <span className="text-xl text-text-4 font-bold">–</span>

                      <div className="text-center">
                        <span className="text-[10px] font-bold text-accent uppercase block mb-1 truncate max-w-[80px]">
                          {m.opponent.split(" ")[0]}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => updateScore(m.id, "opp", getScore(m).opp - 1)}
                            className="w-7 h-7 rounded-lg bg-bg-card border border-border-1 text-xs font-bold"
                          >
                            -
                          </button>
                          <span className="text-xl font-black text-text-1 tabular-nums font-mono px-1">
                            {getScore(m).opp}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateScore(m.id, "opp", getScore(m).opp + 1)}
                            className="w-7 h-7 rounded-lg bg-primary text-white text-xs font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSaveResult(m.id)}
                      disabled={isPending}
                      className="btn-primary w-full py-2.5 text-xs font-black flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle size={14} />
                      <span>Valider & Clôturer ce match</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: Centre de Notifications Push */}
      {activeTab === "notifications" && (
        <div className="anim-fade space-y-4">
          {/* Feedback Message */}
          {notificationMsg && (
            <div
              className={`p-3 rounded-2xl text-xs font-bold flex items-start gap-2.5 anim-fade ${
                notificationMsg.type === "success"
                  ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                  : "bg-rose-500/15 border border-rose-500/30 text-rose-300"
              }`}
            >
              {notificationMsg.type === "success" ? (
                <CheckCircle2 size={16} className="shrink-0 text-emerald-400 mt-0.5" />
              ) : (
                <AlertCircle size={16} className="shrink-0 text-rose-400 mt-0.5" />
              )}
              <span>{notificationMsg.text}</span>
            </div>
          )}

          {/* Subscribers Stats Banner */}
          <div className="card p-4 border border-indigo-500/30 bg-gradient-to-r from-bg-card via-indigo-950/20 to-bg-card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                <Smartphone size={20} />
              </div>
              <div>
                <p className="text-[10px] text-text-4 font-extrabold uppercase tracking-wider">
                  Audience Connectée
                </p>
                <p className="text-sm font-black text-text-1">
                  {subStats ? `${subStats.totalDevices} appareil(s) actifs` : "Chargement..."}
                </p>
              </div>
            </div>
            {subStats && (
              <span className="text-xs font-mono font-bold text-text-3 bg-bg-surface px-2.5 py-1 rounded-lg border border-border-1">
                {subStats.totalUsers} compte(s)
              </span>
            )}
          </div>

          {/* Card 1: Rappel Avant-Match */}
          <div className="card p-4 border border-border-1 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold">
                  ⏰
                </div>
                <h3 className="text-xs font-black text-text-1 uppercase tracking-wider">
                  Rappel Avant-Match Retardataires
                </h3>
              </div>
              {reminderPendingCount !== null && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono">
                  {reminderPendingCount} retardataire(s)
                </span>
              )}
            </div>

            {nextMatch ? (
              <div className="bg-bg-surface p-3 rounded-xl border border-border-1 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-text-1">
                    BCSN vs {nextMatch.opponent}
                  </span>
                  <span className="text-[11px] text-text-3">
                    {new Date(nextMatch.dateTime).toLocaleDateString("fr-FR", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-[11px] text-text-3">
                  Envoie une alerte ciblée sur le smartphone de tous les abonnés qui n&apos;ont pas encore placé leur pronostic.
                </p>
                <button
                  type="button"
                  onClick={() => handleSendReminder(nextMatch.id)}
                  disabled={reminderSending}
                  className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-md disabled:opacity-50"
                >
                  {reminderSending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                  <span>
                    {reminderSending
                      ? "Envoi des rappels..."
                      : `Envoyer le rappel aux ${reminderPendingCount ?? 0} retardataire(s)`}
                  </span>
                </button>
              </div>
            ) : (
              <p className="text-xs text-text-4 italic">Aucun match à venir.</p>
            )}
          </div>

          {/* Card 2: Annonce Flash Club */}
          <form onSubmit={handleSendAnnouncement} className="card p-4 border border-border-1 space-y-3.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                <Megaphone size={16} />
              </div>
              <h3 className="text-xs font-black text-text-1 uppercase tracking-wider">
                Envoyer une Annonce Flash Club
              </h3>
            </div>

            {/* Quick Templates */}
            <div>
              <label className="text-[10px] font-bold text-text-4 uppercase tracking-wider block mb-1.5">
                Modèles rapides en 1 clic
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    applyTemplate(
                      "🎥 Match en direct live !",
                      `Le match BCSN vs ${nextMatch?.opponent ?? "Adversaire"} est retransmis en direct live ! Rendez-vous sur notre page Facebook.`,
                      "/matchs"
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-bg-surface hover:bg-bg-surface-hover border border-border-1 text-[11px] font-semibold text-text-2 transition-all"
                >
                  🎥 Live Vidéo
                </button>
                <button
                  type="button"
                  onClick={() =>
                    applyTemplate(
                      "🔥 VICTOIRE DU BCSN !",
                      `Magnifique victoire de nos joueurs ce soir ! Merci à tous les supporters pour votre ferveur.`,
                      "/classement"
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-bg-surface hover:bg-bg-surface-hover border border-border-1 text-[11px] font-semibold text-text-2 transition-all"
                >
                  🏆 Victoire
                </button>
                <button
                  type="button"
                  onClick={() =>
                    applyTemplate(
                      "⚠️ Info Match BCSN",
                      `Attention : Le coup d'envoi du match de ce samedi est décalé à 20h30. Venez nombreux !`,
                      "/matchs"
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-bg-surface hover:bg-bg-surface-hover border border-border-1 text-[11px] font-semibold text-text-2 transition-all"
                >
                  ⏰ Horaire
                </button>
              </div>
            </div>

            {/* Target Audience */}
            <div>
              <label className="text-[10px] font-bold text-text-3 uppercase tracking-wider block mb-1">
                Destinataires
              </label>
              <div className="grid grid-cols-3 gap-1 bg-bg-surface p-1 rounded-xl border border-border-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setAnnouncementRole("ALL")}
                  className={`py-1.5 rounded-lg transition-all ${
                    announcementRole === "ALL"
                      ? "bg-indigo-600 text-white shadow-sm font-black"
                      : "text-text-3 hover:text-text-1"
                  }`}
                >
                  Tous
                </button>
                <button
                  type="button"
                  onClick={() => setAnnouncementRole("SUPPORTER")}
                  className={`py-1.5 rounded-lg transition-all ${
                    announcementRole === "SUPPORTER"
                      ? "bg-indigo-600 text-white shadow-sm font-black"
                      : "text-text-3 hover:text-text-1"
                  }`}
                >
                  Supporters
                </button>
                <button
                  type="button"
                  onClick={() => setAnnouncementRole("JOUEUR")}
                  className={`py-1.5 rounded-lg transition-all ${
                    announcementRole === "JOUEUR"
                      ? "bg-indigo-600 text-white shadow-sm font-black"
                      : "text-text-3 hover:text-text-1"
                  }`}
                >
                  Joueurs
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div>
              <label className="text-[10px] font-bold text-text-3 uppercase tracking-wider block mb-1">
                Titre de la notification
              </label>
              <input
                type="text"
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                placeholder="Ex: 🏀 Match de Gala ce samedi !"
                className="input text-xs"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-text-3 uppercase tracking-wider block mb-1">
                Message
              </label>
              <textarea
                value={announcementBody}
                onChange={(e) => setAnnouncementBody(e.target.value)}
                rows={3}
                placeholder="Rédigez votre annonce pour les supporters..."
                className="input text-xs resize-none"
                required
              />
            </div>

            {/* Live Smartphone Preview Mockup */}
            <div>
              <label className="text-[10px] font-bold text-text-4 uppercase tracking-wider block mb-1.5">
                Aperçu en direct sur smartphone
              </label>
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-border-2 shadow-inner">
                <div className="flex items-center justify-between text-[10px] text-text-4 mb-1">
                  <span className="flex items-center gap-1 font-bold text-text-3">
                    <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                    BCSN PRONOS
                  </span>
                  <span>maintenant</span>
                </div>
                <p className="text-xs font-bold text-text-1 truncate">
                  {announcementTitle || "Titre de l'alerte"}
                </p>
                <p className="text-[11px] text-text-3 line-clamp-2 mt-0.5">
                  {announcementBody || "Le texte de votre message apparaîtra ici..."}
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={announcementSending || !announcementTitle.trim() || !announcementBody.trim()}
              className="btn-primary w-full py-3 text-xs font-black flex items-center justify-center gap-2 shadow-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white disabled:opacity-50"
            >
              {announcementSending ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Send size={15} />
              )}
              <span>
                {announcementSending ? "Diffusion en cours..." : "Diffuser la notification Flash"}
              </span>
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Matchs Terminés */}
      {activeTab === "finished" && (
        <div className="anim-fade space-y-3">
          {finishedMatches.map((m) => {
            const oppLogo = getClubLogoPath(m.opponent);

            return (
              <div key={m.id} className="card p-4 border border-border-1 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white p-1 shadow-sm border border-border-1 flex items-center justify-center overflow-hidden shrink-0">
                    {oppLogo ? (
                      <img src={oppLogo} alt="" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-xs">🏀</span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text-1">
                      {m.isHome ? "BCSN" : m.opponent} vs {m.isHome ? m.opponent : "BCSN"}
                    </p>
                    <p className="text-[10px] text-text-4">
                      {m.matchday > 0 ? `Journée ${m.matchday} · ` : ""}
                      {new Date(m.dateTime).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-text-1 tabular-nums font-mono">
                    {m.scoreBcsn} - {m.scoreOpponent}
                  </span>
                  <span className="badge badge-open text-[8px] block mt-0.5">
                    Clôturé
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 4: Programmer un Match */}
      {activeTab === "add" && (
        <form onSubmit={handleCreateMatch} className="card-elevated p-5 space-y-4 anim-scale border border-border-2">
          <h3 className="text-sm font-black text-text-1 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <PlusCircle size={16} className="text-primary-text" />
            Ajouter une Nouvelle Rencontre
          </h3>

          <div>
            <label className="text-[10px] font-bold text-text-3 uppercase tracking-wider block mb-1">
              Nom de l&apos;équipe adverse
            </label>
            <input
              type="text"
              value={newOpponent}
              onChange={(e) => setNewOpponent(e.target.value)}
              placeholder="Ex: Longueau, Gouvieux, Margny..."
              className="input text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-text-3 uppercase tracking-wider block mb-1">
                Date du match
              </label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="input text-xs"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-text-3 uppercase tracking-wider block mb-1">
                Heure du coup d&apos;envoi
              </label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="input text-xs"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-text-3 uppercase tracking-wider block mb-1">
                Lieu du match
              </label>
              <div className="flex gap-1 bg-bg-surface p-1 rounded-xl border border-border-1">
                <button
                  type="button"
                  onClick={() => setNewIsHome(true)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    newIsHome ? "bg-primary text-white shadow-sm font-black" : "text-text-4"
                  }`}
                >
                  Domicile
                </button>
                <button
                  type="button"
                  onClick={() => setNewIsHome(false)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    !newIsHome ? "bg-slate-700 text-white shadow-sm font-black" : "text-text-4"
                  }`}
                >
                  Extérieur
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-text-3 uppercase tracking-wider block mb-1">
                N° de Journée (0 si amical)
              </label>
              <input
                type="number"
                value={newMatchday}
                onChange={(e) => setNewMatchday(Number(e.target.value))}
                min={0}
                max={30}
                className="input text-xs font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="btn-primary w-full py-3 text-xs font-black flex items-center justify-center gap-2 shadow-xl mt-2"
          >
            <PlusCircle size={16} />
            <span>{isPending ? "Création en cours..." : "Programmer la Rencontre"}</span>
          </button>
        </form>
      )}
    </div>
  );
}
