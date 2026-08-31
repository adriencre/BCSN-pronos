"use client";

import { useState, useTransition } from "react";
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
} from "lucide-react";
import { submitMatchResult, createMatch } from "@/lib/actions";
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
  const [activeTab, setActiveTab] = useState<"next" | "upcoming" | "finished" | "add">("next");

  // State for score entries: matchId -> { bcsn, opp }
  const [scores, setScores] = useState<Record<number, { bcsn: number; opp: number }>>({});
  const [editingMatchId, setEditingMatchId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ id: number; type: "success" | "error"; text: string } | null>(null);

  // New match form
  const [newOpponent, setNewOpponent] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("20:30");
  const [newIsHome, setNewIsHome] = useState(true);
  const [newMatchday, setNewMatchday] = useState(0);

  const pendingMatches = matches.filter((m) => m.status === "PENDING");
  const finishedMatches = matches.filter((m) => m.status === "FINISHED");
  const nextMatch = pendingMatches.length > 0 ? pendingMatches[0] : null;

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
        setMessage({ id: matchId, type: "success", text: "Score validé & points recalculés !" });
        setEditingMatchId(null);
        setTimeout(() => router.refresh(), 1000);
      }
    });
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

      if (res.error) {
        alert(res.error);
      } else {
        setNewOpponent("");
        setActiveTab("upcoming");
        router.refresh();
      }
    });
  };

  return (
    <div className="px-5 pt-6 pb-16">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => router.push("/profil")}
          className="flex items-center gap-1.5 text-xs font-semibold text-text-3 hover:text-text-1 transition-colors"
        >
          <ArrowLeft size={16} />
          Retour au Profil
        </button>
        <span className="badge badge-joueur text-[10px] bg-primary-soft text-primary-text font-bold">
          ADMIN
        </span>
      </div>

      {/* Admin Hero Header */}
      <div className="card-elevated p-5 mb-5 bg-gradient-to-br from-slate-900 via-primary-dark to-indigo-950 text-white shadow-xl anim-slide">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-gold">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight leading-none">Gestion des Scores</h1>
            <p className="text-xs text-white/70 mt-1">
              Validation des résultats & Recalcul du classement
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex items-center gap-1 bg-bg-surface p-1.5 rounded-2xl mb-6 border border-border-1 overflow-x-auto text-xs font-bold shadow-inner">
        <button
          onClick={() => setActiveTab("next")}
          className={`flex-1 py-2 px-3 rounded-xl transition-all whitespace-nowrap text-center ${
            activeTab === "next"
              ? "bg-primary text-white shadow-md"
              : "text-text-3 hover:text-text-1"
          }`}
        >
          ⚡ Prochain Match
        </button>

        <button
          onClick={() => setActiveTab("upcoming")}
          className={`flex-1 py-2 px-3 rounded-xl transition-all whitespace-nowrap text-center ${
            activeTab === "upcoming"
              ? "bg-primary text-white shadow-md"
              : "text-text-3 hover:text-text-1"
          }`}
        >
          📅 À venir ({pendingMatches.length})
        </button>

        <button
          onClick={() => setActiveTab("finished")}
          className={`flex-1 py-2 px-3 rounded-xl transition-all whitespace-nowrap text-center ${
            activeTab === "finished"
              ? "bg-primary text-white shadow-md"
              : "text-text-3 hover:text-text-1"
          }`}
        >
          ✅ Terminés ({finishedMatches.length})
        </button>

        <button
          onClick={() => setActiveTab("add")}
          className={`py-2 px-3 rounded-xl transition-all whitespace-nowrap text-center ${
            activeTab === "add"
              ? "bg-primary text-white shadow-md"
              : "text-text-3 hover:text-text-1"
          }`}
        >
          ➕ Ajouter
        </button>
      </div>

      {/* TAB 1: NEXT MATCH HERO SCORE ENTRY */}
      {activeTab === "next" && (
        <div className="anim-fade">
          {nextMatch ? (
            <div className="card p-5 mb-4 shadow-lg border-2 border-primary/20">
              <div className="flex items-center justify-between mb-4">
                <span className="badge badge-open text-[10px]">
                  {nextMatch.matchday > 0 ? `Journée ${nextMatch.matchday}` : "Amical / Coupe"}
                </span>
                <span className="text-xs text-text-3 flex items-center gap-1 font-semibold">
                  <MapPin size={12} />
                  {nextMatch.isHome ? "Domicile (St-Nicolas)" : "Extérieur"}
                </span>
              </div>

              {/* Match Teams Header */}
              <div className="flex items-center justify-between gap-4 mb-6">
                {/* BCSN Logo & Info */}
                <div className="flex-1 text-center">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-white p-1.5 shadow-md flex items-center justify-center mb-2 border border-border-1 overflow-hidden">
                    <img
                      src={getClubLogoPath("bcsn") || "/logos/bcsn.jpg"}
                      alt="BCSN"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-xs font-black text-text-1">BCSN</p>
                </div>

                <span className="text-sm font-extrabold text-text-4 bg-bg-surface px-2.5 py-1 rounded-md">
                  VS
                </span>

                {/* Opponent Logo & Info */}
                <div className="flex-1 text-center">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-white p-1.5 shadow-md flex items-center justify-center mb-2 border border-border-1 overflow-hidden">
                    {getClubLogoPath(nextMatch.opponent) ? (
                      <img
                        src={getClubLogoPath(nextMatch.opponent)!}
                        alt={nextMatch.opponent}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-2xl">🏀</span>
                    )}
                  </div>
                  <p className="text-xs font-black text-text-1 truncate max-w-[110px] mx-auto">
                    {nextMatch.opponent}
                  </p>
                </div>
              </div>

              {/* Score Input Stepper Controls */}
              <div className="bg-bg-surface rounded-2xl p-4 mb-5 border border-border-1">
                <p className="text-xs text-center font-bold text-text-3 uppercase tracking-wider mb-3">
                  Saisie du Score Final
                </p>

                <div className="flex items-center justify-around gap-3">
                  {/* BCSN Score Controls */}
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-[11px] font-bold text-text-2">BCSN</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          updateScore(nextMatch.id, "bcsn", getScore(nextMatch).bcsn - 1)
                        }
                        className="w-9 h-9 rounded-xl bg-bg-card border border-border-1 flex items-center justify-center font-black text-lg hover:bg-bg-card-hover"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={getScore(nextMatch).bcsn}
                        onChange={(e) =>
                          updateScore(nextMatch.id, "bcsn", Number(e.target.value))
                        }
                        className="w-16 h-12 text-center text-2xl font-black bg-white text-slate-900 border-2 border-primary rounded-xl shadow-inner focus:outline-none"
                      />
                      <button
                        onClick={() =>
                          updateScore(nextMatch.id, "bcsn", getScore(nextMatch).bcsn + 1)
                        }
                        className="w-9 h-9 rounded-xl bg-bg-card border border-border-1 flex items-center justify-center font-black text-lg hover:bg-bg-card-hover"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <span className="text-xl font-black text-text-4 mt-5">–</span>

                  {/* Opponent Score Controls */}
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-[11px] font-bold text-text-2 truncate max-w-[90px]">
                      {nextMatch.opponent.split(" ")[0]}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          updateScore(nextMatch.id, "opp", getScore(nextMatch).opp - 1)
                        }
                        className="w-9 h-9 rounded-xl bg-bg-card border border-border-1 flex items-center justify-center font-black text-lg hover:bg-bg-card-hover"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={getScore(nextMatch).opp}
                        onChange={(e) =>
                          updateScore(nextMatch.id, "opp", Number(e.target.value))
                        }
                        className="w-16 h-12 text-center text-2xl font-black bg-white text-slate-900 border-2 border-primary rounded-xl shadow-inner focus:outline-none"
                      />
                      <button
                        onClick={() =>
                          updateScore(nextMatch.id, "opp", getScore(nextMatch).opp + 1)
                        }
                        className="w-9 h-9 rounded-xl bg-bg-card border border-border-1 flex items-center justify-center font-black text-lg hover:bg-bg-card-hover"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feedback Message */}
              {message?.id === nextMatch.id && (
                <div
                  className={`flex items-center gap-2 p-3 rounded-xl mb-4 text-xs font-medium ${
                    message.type === "success"
                      ? "bg-primary-soft text-primary-text"
                      : "bg-accent-soft text-accent"
                  }`}
                >
                  {message.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  {message.text}
                </div>
              )}

              {/* Save Button */}
              <button
                onClick={() => handleSaveResult(nextMatch.id)}
                disabled={isPending}
                className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2 font-bold shadow-lg"
              >
                <CheckCircle size={18} />
                {isPending ? "Clôture en cours..." : "Valider et Clôturer ce match"}
              </button>
            </div>
          ) : (
            <div className="card p-8 text-center text-text-3 text-xs">
              <Sparkles size={24} className="mx-auto mb-2 text-primary-text opacity-70" />
              Tous les matchs programmés ont déjà été clôturés !
            </div>
          )}
        </div>
      )}

      {/* TAB 2: UPCOMING MATCHES SCHEDULE */}
      {activeTab === "upcoming" && (
        <div className="space-y-3 anim-fade">
          {pendingMatches.length === 0 ? (
            <div className="card p-6 text-center text-text-3 text-xs">
              Aucun match à venir dans le calendrier.
            </div>
          ) : (
            pendingMatches.map((m) => {
              const current = getScore(m);
              const oppLogo = getClubLogoPath(m.opponent);

              return (
                <div key={m.id} className="card p-4">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-border-1">
                    <span className="badge badge-open text-[10px]">
                      {m.matchday > 0 ? `Journée ${m.matchday}` : "Amical"}
                    </span>
                    <span className="text-xs text-text-3">
                      {new Date(m.dateTime).toLocaleDateString("fr-FR", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-white p-1 shadow-sm border border-border-1 flex items-center justify-center overflow-hidden shrink-0">
                        {oppLogo ? (
                          <img src={oppLogo} alt={m.opponent} className="w-full h-full object-contain" />
                        ) : (
                          <span>🏀</span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text-1">
                          {m.isHome ? `BCSN vs ${m.opponent}` : `${m.opponent} vs BCSN`}
                        </p>
                        <p className="text-[10px] text-text-4">
                          {m.isHome ? "Domicile" : "Extérieur"}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab("next");
                      }}
                      className="btn-secondary text-[11px] py-1.5 px-3 flex items-center gap-1"
                    >
                      Saisir score <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 3: FINISHED MATCHES WITH FULL RE-EDIT CAPABILITY */}
      {activeTab === "finished" && (
        <div className="space-y-3 anim-fade">
          {finishedMatches.length === 0 ? (
            <div className="card p-6 text-center text-text-3 text-xs">
              Aucun match terminé enregistré.
            </div>
          ) : (
            finishedMatches.map((m) => {
              const oppLogo = getClubLogoPath(m.opponent);
              const isEditing = editingMatchId === m.id;
              const current = getScore(m);
              const msg = message?.id === m.id ? message : null;

              return (
                <div key={m.id} className="card p-4 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-text-4 uppercase tracking-wider">
                      {m.matchday > 0 ? `Journée ${m.matchday}` : "Amical"} ·{" "}
                      {new Date(m.dateTime).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                    <span className="badge badge-joueur text-[9px] bg-primary-soft text-primary-text">
                      Terminé
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-white p-1 shadow-sm border border-border-1 flex items-center justify-center overflow-hidden shrink-0">
                        {oppLogo ? (
                          <img src={oppLogo} alt={m.opponent} className="w-full h-full object-contain" />
                        ) : (
                          <span>🏀</span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text-1">
                          {m.isHome ? `BCSN vs ${m.opponent}` : `${m.opponent} vs BCSN`}
                        </p>
                        <p className="text-[10px] text-text-4 font-bold text-primary-text">
                          Score : {m.scoreBcsn} – {m.scoreOpponent}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setEditingMatchId(isEditing ? null : m.id)}
                      className="btn-secondary text-[11px] py-1.5 px-3 flex items-center gap-1 text-primary-text border-primary/30"
                    >
                      <Edit3 size={13} />
                      {isEditing ? "Fermer" : "Modifier score"}
                    </button>
                  </div>

                  {/* Inline Re-edit Box */}
                  {isEditing && (
                    <div className="mt-4 pt-3 border-t border-border-1 bg-bg-surface p-3.5 rounded-xl anim-slide">
                      <p className="text-xs font-bold text-text-2 mb-3">
                        Modifier le score final (Recalcule tous les points) :
                      </p>

                      <div className="flex items-center justify-center gap-4 mb-3">
                        <div className="text-center">
                          <label className="text-[10px] font-bold text-text-3 block mb-1">BCSN</label>
                          <input
                            type="number"
                            value={current.bcsn}
                            onChange={(e) => updateScore(m.id, "bcsn", Number(e.target.value))}
                            className="w-16 h-10 text-center text-lg font-black bg-white text-slate-900 border border-border-1 rounded-xl focus:border-primary focus:outline-none"
                          />
                        </div>

                        <span className="text-lg font-bold text-text-4 mt-4">–</span>

                        <div className="text-center">
                          <label className="text-[10px] font-bold text-text-3 block mb-1 truncate max-w-[80px]">
                            {m.opponent.split(" ")[0]}
                          </label>
                          <input
                            type="number"
                            value={current.opp}
                            onChange={(e) => updateScore(m.id, "opp", Number(e.target.value))}
                            className="w-16 h-10 text-center text-lg font-black bg-white text-slate-900 border border-border-1 rounded-xl focus:border-primary focus:outline-none"
                          />
                        </div>
                      </div>

                      {msg && (
                        <div
                          className={`flex items-center gap-2 p-2 rounded-lg mb-3 text-xs font-medium ${
                            msg.type === "success"
                              ? "bg-primary-soft text-primary-text"
                              : "bg-accent-soft text-accent"
                          }`}
                        >
                          {msg.type === "success" ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                          {msg.text}
                        </div>
                      )}

                      <button
                        onClick={() => handleSaveResult(m.id)}
                        disabled={isPending}
                        className="btn-primary w-full py-2 text-xs flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle size={14} />
                        {isPending ? "Mise à jour..." : "Enregistrer la modification"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 4: ADD NEW MATCH FORM */}
      {activeTab === "add" && (
        <form onSubmit={handleCreateMatch} className="card p-5 space-y-4 anim-fade">
          <h3 className="text-sm font-bold text-text-1 mb-1">
            Programmer un nouveau match au calendrier
          </h3>

          <div>
            <label className="text-xs font-semibold text-text-3 block mb-1">
              Nom du club adversaire
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Orchies / Lambersart"
              value={newOpponent}
              onChange={(e) => setNewOpponent(e.target.value)}
              className="input-field py-2.5 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-xs font-semibold text-text-3 block mb-1">
                Journée (0 = Amical/Coupe)
              </label>
              <input
                type="number"
                value={newMatchday}
                onChange={(e) => setNewMatchday(Number(e.target.value))}
                className="input-field py-2.5 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-text-3 block mb-1">Heure</label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="input-field py-2.5 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-3 block mb-1">Date du match</label>
            <input
              type="date"
              required
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="input-field py-2.5 text-xs"
            />
          </div>

          <div className="flex items-center gap-6 text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-text-2">
              <input
                type="radio"
                name="isHome"
                checked={newIsHome}
                onChange={() => setNewIsHome(true)}
              />
              Domicile (BCSN)
            </label>
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-text-2">
              <input
                type="radio"
                name="isHome"
                checked={!newIsHome}
                onChange={() => setNewIsHome(false)}
              />
              Extérieur
            </label>
          </div>

          <button type="submit" disabled={isPending} className="btn-primary py-3 text-xs w-full font-bold">
            {isPending ? "Ajout en cours..." : "Ajouter le match au calendrier"}
          </button>
        </form>
      )}
    </div>
  );
}
