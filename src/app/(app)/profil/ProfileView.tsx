"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  LogOut,
  Trophy,
  Target,
  TrendingUp,
  Hash,
  Calendar,
  History,
  Star,
  Check,
  Clock,
  ShieldCheck,
  Zap,
  Award,
  Lock,
} from "lucide-react";
import { logoutUser, updateProfile } from "@/lib/actions";
import { AVATAR_OPTIONS } from "@/lib/constants";

interface PredictionHistory {
  matchId: number;
  opponent: string;
  isHome: boolean;
  dateTime: string;
  matchday: number;
  status: string;
  scoreBcsn: number | null;
  scoreOpponent: number | null;
  predictedBcsn: number;
  predictedOpponent: number;
  pointsEarned: number;
}

interface Props {
  user: {
    id: number;
    pseudo: string;
    totalScore: number;
    role: string;
    avatarEmoji: string;
    createdAt: string;
    predictionsCount: number;
  };
  rank: number;
  totalPlayers: number;
  predictions: PredictionHistory[];
}

export default function ProfileView({
  user,
  rank,
  totalPlayers,
  predictions,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState(user.avatarEmoji);

  const handleLogout = () => {
    startTransition(async () => {
      await logoutUser();
      router.push("/login");
    });
  };

  const handleAvatarChange = (emoji: string) => {
    setCurrentAvatar(emoji);
    setShowAvatarPicker(false);
    startTransition(async () => {
      await updateProfile(emoji);
      router.refresh();
    });
  };

  const avg =
    user.predictionsCount > 0
      ? (user.totalScore / user.predictionsCount).toFixed(1)
      : "–";

  const finishedPredictions = predictions.filter((p) => p.status === "FINISHED");
  const perfectCount = finishedPredictions.filter((p) => p.pointsEarned === 10).length;

  // Streak calculation for Invincible (consecutive correct winners)
  let maxWinnerStreak = 0;
  let currentWinnerStreak = 0;
  finishedPredictions.forEach((p) => {
    if (p.pointsEarned >= 1) {
      currentWinnerStreak += 1;
      if (currentWinnerStreak > maxWinnerStreak) maxWinnerStreak = currentWinnerStreak;
    } else {
      currentWinnerStreak = 0;
    }
  });

  // Badge Statuses
  const hasSniper = perfectCount >= 3;
  const hasInvincible = maxWinnerStreak >= 5;
  const hasSupporterNum1 = user.predictionsCount >= 5;

  const avatarOptions = AVATAR_OPTIONS;

  const getPointsLabel = (pts: number) => {
    if (pts === 10) return { text: "Parfait", color: "text-gold bg-gold-soft" };
    if (pts === 5) return { text: "Écart exact", color: "text-primary-text bg-primary-soft" };
    if (pts === 3) return { text: "Proche", color: "text-primary-text bg-primary-soft" };
    if (pts === 1) return { text: "Vainqueur", color: "text-text-2 bg-bg-surface" };
    return { text: "Raté", color: "text-accent bg-accent-soft" };
  };

  const isAdmin = user.role === "ADMIN" || user.role === "COACH";

  return (
    <div className="px-5 pt-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 anim-fade">
        <h1 className="text-lg font-bold text-text-1">Profil</h1>
        <button
          onClick={handleLogout}
          disabled={isPending}
          className="flex items-center gap-1.5 text-text-3 hover:text-accent transition-colors text-xs font-medium"
          id="logout-button"
        >
          <LogOut size={14} />
          Déconnexion
        </button>
      </div>

      {/* Profile card */}
      <div className="card-elevated p-5 mb-4 anim-slide delay-1">
        <div className="flex items-center gap-4 mb-4">
          {/* Avatar (clickable to change) */}
          <button
            onClick={() => setShowAvatarPicker(!showAvatarPicker)}
            className="avatar avatar-xl bg-bg-surface ring-2 ring-border-2 hover:ring-primary/30 transition-all"
          >
            {currentAvatar}
          </button>

          <div className="flex-1">
            <h2 className="text-base font-bold text-text-1">{user.pseudo}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`badge ${
                  isAdmin
                    ? "badge-joueur bg-indigo-600/20 text-indigo-400 border-indigo-500/30 font-bold"
                    : user.role === "JOUEUR"
                    ? "badge-joueur"
                    : "badge-supporter"
                }`}
              >
                {isAdmin ? "Administrateur" : user.role === "JOUEUR" ? "Joueur BCSN" : "Supporter"}
              </span>
            </div>
            <p className="text-[10px] text-text-4 mt-1.5 flex items-center gap-1">
              <Calendar size={10} />
              Membre depuis{" "}
              {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Avatar picker */}
        {showAvatarPicker && (
          <div className="bg-bg-surface rounded-xl p-3 mb-4 anim-fade border border-border-1">
            <p className="text-xs text-text-3 mb-2.5 font-medium">
              Choisir un avatar
            </p>
            <div className="grid grid-cols-6 gap-2">
              {avatarOptions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleAvatarChange(emoji)}
                  className={`
                    w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all
                    ${
                      currentAvatar === emoji
                        ? "bg-primary-soft ring-2 ring-primary/40"
                        : "bg-bg-card hover:bg-bg-card-hover"
                    }
                  `}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Admin Direct Button (only if admin) */}
        {isAdmin && (
          <div className="pt-3 border-t border-border-1">
            <button
              onClick={() => router.push("/admin")}
              className="btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-indigo-700 font-bold shadow-md"
            >
              <ShieldCheck size={16} />
              Accéder au Panel Gestion des Scores
            </button>
          </div>
        )}
      </div>

      {/* Stats summary grid */}
      <div className="grid grid-cols-2 gap-3 mb-4 anim-slide delay-2">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-gold-soft flex items-center justify-center text-gold">
              <Trophy size={16} />
            </div>
            <div>
              <p className="text-[10px] text-text-4 uppercase tracking-wider font-semibold">
                Classement
              </p>
              <p className="text-base font-black text-text-1 tabular-nums">
                {rank > 0 ? `${rank}e / ${totalPlayers}` : "–"}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-primary-soft flex items-center justify-center text-primary-text">
              <Star size={16} />
            </div>
            <div>
              <p className="text-[10px] text-text-4 uppercase tracking-wider font-semibold">
                Score Total
              </p>
              <p className="text-base font-black text-text-1 tabular-nums">
                {user.totalScore} pts
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-bg-surface flex items-center justify-center text-text-2">
              <Target size={16} />
            </div>
            <div>
              <p className="text-[10px] text-text-4 uppercase tracking-wider font-semibold">
                Pronostics
              </p>
              <p className="text-base font-black text-text-1 tabular-nums">
                {user.predictionsCount}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-bg-surface flex items-center justify-center text-text-2">
              <TrendingUp size={16} />
            </div>
            <div>
              <p className="text-[10px] text-text-4 uppercase tracking-wider font-semibold">
                Moyenne / match
              </p>
              <p className="text-base font-black text-text-1 tabular-nums">
                {avg} pts
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Badges & Trophées Débloquables (Gamification) */}
      <div className="card p-4 mb-4 anim-slide delay-3 border border-border-1">
        <div className="flex items-center gap-2 mb-3.5">
          <Award size={16} className="text-gold" />
          <h3 className="text-xs font-bold text-text-1 uppercase tracking-wider">
            Badges & Trophées Débloquables
          </h3>
        </div>

        <div className="space-y-2.5">
          {/* Badge 1: Sniper */}
          <div
            className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
              hasSniper
                ? "bg-gradient-to-r from-amber-500/15 to-gold-soft border-gold/40 text-gold shadow-sm"
                : "bg-bg-surface border-border-1 opacity-60"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                hasSniper ? "bg-gold text-slate-900 shadow-md font-black" : "bg-bg-card text-text-4"
              }`}
            >
              🎯
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black text-text-1">Sniper</p>
                {hasSniper ? (
                  <span className="text-[9px] font-bold bg-gold text-slate-900 px-1.5 py-0.5 rounded">
                    Débloqué
                  </span>
                ) : (
                  <span className="text-[10px] text-text-4 font-semibold">{perfectCount}/3</span>
                )}
              </div>
              <p className="text-[10px] text-text-3 mt-0.5">3 scores exacts validés</p>
            </div>
          </div>

          {/* Badge 2: Invincible */}
          <div
            className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
              hasInvincible
                ? "bg-gradient-to-r from-primary-soft to-indigo-900/20 border-primary/40 text-primary-text shadow-sm"
                : "bg-bg-surface border-border-1 opacity-60"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                hasInvincible ? "bg-primary text-white shadow-md font-black" : "bg-bg-card text-text-4"
              }`}
            >
              ⚡
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black text-text-1">Invincible</p>
                {hasInvincible ? (
                  <span className="text-[9px] font-bold bg-primary text-white px-1.5 py-0.5 rounded">
                    Débloqué
                  </span>
                ) : (
                  <span className="text-[10px] text-text-4 font-semibold">{maxWinnerStreak}/5</span>
                )}
              </div>
              <p className="text-[10px] text-text-3 mt-0.5">5 bons vainqueurs consécutifs</p>
            </div>
          </div>

          {/* Badge 3: Supporter N°1 */}
          <div
            className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
              hasSupporterNum1
                ? "bg-gradient-to-r from-emerald-500/15 to-teal-900/20 border-emerald-500/40 text-emerald-400 shadow-sm"
                : "bg-bg-surface border-border-1 opacity-60"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                hasSupporterNum1 ? "bg-emerald-500 text-slate-900 shadow-md font-black" : "bg-bg-card text-text-4"
              }`}
            >
              🏆
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black text-text-1">Supporter N°1</p>
                {hasSupporterNum1 ? (
                  <span className="text-[9px] font-bold bg-emerald-500 text-slate-900 px-1.5 py-0.5 rounded">
                    Débloqué
                  </span>
                ) : (
                  <span className="text-[10px] text-text-4 font-semibold">{user.predictionsCount}/5</span>
                )}
              </div>
              <p className="text-[10px] text-text-3 mt-0.5">A pronostiqué sur 5+ matchs de la saison</p>
            </div>
          </div>
        </div>
      </div>

      {/* Predictions History */}
      <div className="anim-slide delay-4">
        <div className="flex items-center gap-2 mb-3">
          <History size={14} className="text-text-3" />
          <h3 className="text-xs font-semibold text-text-3 uppercase tracking-wider">
            Historique de mes pronostics ({predictions.length})
          </h3>
        </div>

        {predictions.length === 0 ? (
          <div className="card p-6 text-center text-text-3 text-xs">
            Vous n&apos;avez pas encore effectué de pronostic.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {predictions.map((p) => {
              const isFinished = p.status === "FINISHED";
              const labelInfo = isFinished
                ? getPointsLabel(p.pointsEarned)
                : null;

              return (
                <div key={p.matchId} className="card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-text-4 font-semibold">
                      {p.matchday > 0 ? `Journée ${p.matchday} · ` : ""}
                      {new Date(p.dateTime).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                    {isFinished && labelInfo ? (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${labelInfo.color}`}
                      >
                        +{p.pointsEarned} pts ({labelInfo.text})
                      </span>
                    ) : (
                      <span className="badge badge-open text-[10px]">
                        En attente du score
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-text-1">
                        {p.isHome ? "BCSN" : p.opponent} vs{" "}
                        {p.isHome ? p.opponent : "BCSN"}
                      </p>
                      <p className="text-[11px] text-text-3 mt-0.5">
                        Votre prono :{" "}
                        <span className="font-semibold text-text-1">
                          BCSN {p.predictedBcsn} – {p.predictedOpponent}{" "}
                          {p.opponent.split(" ")[0]}
                        </span>
                      </p>
                    </div>

                    {isFinished && (
                      <div className="text-right">
                        <span className="text-[10px] text-text-4 block mb-0.5">
                          Score final
                        </span>
                        <span className="text-xs font-black text-text-1 tabular-nums">
                          {p.scoreBcsn} – {p.scoreOpponent}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
