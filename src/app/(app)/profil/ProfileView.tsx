"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
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
  Sun,
  Moon,
  Paintbrush,
  Sparkles,
  Crown,
  ChevronRight,
  Flame,
} from "lucide-react";
import { logoutUser, updateProfile, updateUserTheme } from "@/lib/actions";
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
    theme?: string;
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
  const [theme, setTheme] = useState<"dark" | "light">(
    (user.theme as "dark" | "light") || "dark"
  );

  // Load and apply theme
  useEffect(() => {
    const savedTheme =
      (user.theme as "dark" | "light") ||
      (localStorage.getItem("bcsn_theme") as "dark" | "light") ||
      "dark";

    setTheme(savedTheme);
    if (savedTheme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  }, [user.theme]);

  const toggleTheme = (newTheme: "dark" | "light") => {
    setTheme(newTheme);
    localStorage.setItem("bcsn_theme", newTheme);
    if (newTheme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }

    startTransition(async () => {
      await updateUserTheme(newTheme);
    });
  };

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
      : "0.0";

  const finishedPredictions = predictions.filter((p) => p.status === "FINISHED");
  const perfectCount = finishedPredictions.filter((p) => p.pointsEarned === 10).length;

  // Streak calculation
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
  const hasPodiumMaster = rank > 0 && rank <= 3;

  const avatarOptions = AVATAR_OPTIONS;

  const getPointsLabel = (pts: number) => {
    if (pts === 10) return { text: "Score exact", color: "text-gold bg-gold-soft border-gold/30" };
    if (pts === 5) return { text: "Écart exact", color: "text-primary-text bg-primary-soft border-primary/30" };
    if (pts === 3) return { text: "Proche ±3", color: "text-primary-text bg-primary-soft border-primary/30" };
    if (pts === 1) return { text: "Bon vainqueur", color: "text-text-2 bg-bg-surface border-border-1" };
    return { text: "0 pt", color: "text-accent bg-accent-soft border-accent/30" };
  };

  const isAdmin = user.role === "ADMIN" || user.role === "COACH";

  return (
    <div className="px-4 pt-4 pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4 anim-fade">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary-text">Espace Membre</span>
          <h1 className="text-xl font-black text-text-1">Mon Profil & Trophées</h1>
        </div>
        <button
          onClick={handleLogout}
          disabled={isPending}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-bg-surface hover:bg-accent-soft text-text-3 hover:text-accent transition-all text-xs font-bold border border-border-1"
          id="logout-button"
        >
          <LogOut size={14} />
          <span>Déconnexion</span>
        </button>
      </div>

      {/* VIP Digital Supporter License / Pass Card */}
      <div className="card-elevated p-5 mb-5 anim-slide delay-1 bg-gradient-to-br from-bg-card via-bg-elevated to-slate-900 border border-primary/30 relative overflow-hidden shadow-2xl">
        {/* Hologram gradient shine */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-primary/15 via-bcsn-blue/10 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-4 mb-4 relative z-10">
          {/* Avatar with edit halo */}
          <div className="relative group">
            <button
              onClick={() => setShowAvatarPicker(!showAvatarPicker)}
              className="avatar avatar-xl bg-bg-surface ring-2 ring-primary/40 group-hover:ring-primary transition-all shadow-xl"
              title="Changer d'avatar"
            >
              {currentAvatar}
            </button>
            <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center shadow-md border-2 border-bg-base">
              ✎
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className={`badge text-[9px] ${
                  isAdmin
                    ? "bg-indigo-600/20 text-indigo-400 border-indigo-500/40"
                    : user.role === "JOUEUR"
                    ? "badge-joueur"
                    : "badge-supporter"
                }`}
              >
                {isAdmin ? "Staff / Admin" : user.role === "JOUEUR" ? "Joueur Officiel" : "Supporter BCSN"}
              </span>
              <span className="text-[9px] font-mono text-text-4 font-bold">
                ID #{user.id.toString().padStart(4, "0")}
              </span>
            </div>
            <h2 className="text-xl font-black text-text-1 truncate">{user.pseudo}</h2>
            <p className="text-[11px] text-text-3 font-medium flex items-center gap-1 mt-0.5">
              <Calendar size={11} className="text-text-4" />
              Inscrit en{" "}
              {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Avatar Drawer Picker */}
        {showAvatarPicker && (
          <div className="bg-bg-surface rounded-2xl p-3.5 mb-4 anim-fade border border-border-1 relative z-10">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-xs text-text-2 font-bold flex items-center gap-1">
                <Sparkles size={12} className="text-primary-text" />
                Choisir un nouvel avatar
              </p>
              <button
                onClick={() => setShowAvatarPicker(false)}
                className="text-[10px] text-text-4 hover:text-text-1 font-bold"
              >
                Fermer
              </button>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {avatarOptions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleAvatarChange(emoji)}
                  className={`
                    aspect-square rounded-xl flex items-center justify-center text-lg transition-all
                    ${
                      currentAvatar === emoji
                        ? "bg-primary-soft ring-2 ring-primary scale-110 shadow-sm"
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

        {/* Admin Shortcut Button */}
        {isAdmin && (
          <div className="pt-3 border-t border-border-1 relative z-10">
            <button
              onClick={() => router.push("/admin")}
              className="btn-primary w-full py-3 text-xs flex items-center justify-center gap-2 font-black shadow-lg"
            >
              <ShieldCheck size={16} />
              <span>Accéder au Cockpit Gestion des Scores</span>
            </button>
          </div>
        )}
      </div>

      {/* KPI Performance Metrics Grid */}
      <div className="grid grid-cols-2 gap-2.5 mb-5 anim-slide delay-2">
        <div className="card p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gold-soft border border-gold/30 flex items-center justify-center text-gold shrink-0">
            <Trophy size={18} />
          </div>
          <div>
            <p className="text-[10px] text-text-4 font-extrabold uppercase tracking-wider">
              Classement
            </p>
            <p className="text-base font-black text-text-1 tabular-nums">
              {rank > 0 ? `#${rank} / ${totalPlayers}` : "–"}
            </p>
          </div>
        </div>

        <div className="card p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary-soft border border-primary/30 flex items-center justify-center text-primary-text shrink-0">
            <Star size={18} />
          </div>
          <div>
            <p className="text-[10px] text-text-4 font-extrabold uppercase tracking-wider">
              Points Totaux
            </p>
            <p className="text-base font-black text-text-1 tabular-nums font-mono">
              {user.totalScore} pts
            </p>
          </div>
        </div>

        <div className="card p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-bg-surface border border-border-1 flex items-center justify-center text-text-2 shrink-0">
            <Target size={18} />
          </div>
          <div>
            <p className="text-[10px] text-text-4 font-extrabold uppercase tracking-wider">
              Pronostics
            </p>
            <p className="text-base font-black text-text-1 tabular-nums font-mono">
              {user.predictionsCount}
            </p>
          </div>
        </div>

        <div className="card p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-bg-surface border border-border-1 flex items-center justify-center text-text-2 shrink-0">
            <TrendingUp size={18} />
          </div>
          <div>
            <p className="text-[10px] text-text-4 font-extrabold uppercase tracking-wider">
              Moyenne / Match
            </p>
            <p className="text-base font-black text-text-1 tabular-nums font-mono">
              {avg} pts
            </p>
          </div>
        </div>
      </div>

      {/* Gamification Trophy Cabinet */}
      <div className="card p-4 mb-5 anim-slide delay-3 border border-border-1">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gold-soft text-gold flex items-center justify-center">
              <Award size={16} />
            </div>
            <h3 className="text-xs font-black text-text-1 uppercase tracking-wider">
              Armoire à Trophées & Succès
            </h3>
          </div>
          <span className="text-[10px] font-black text-gold">
            {[hasSniper, hasInvincible, hasSupporterNum1, hasPodiumMaster].filter(Boolean).length}/4 Débloqués
          </span>
        </div>

        <div className="space-y-2.5">
          {/* Badge 1: Sniper */}
          <div
            className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
              hasSniper
                ? "bg-gradient-to-r from-gold-soft via-bg-card to-amber-900/10 border-gold/40 text-gold shadow-md"
                : "bg-bg-surface border-border-1 opacity-70"
            }`}
          >
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-md ${
                hasSniper ? "bg-gold text-slate-950 font-black" : "bg-bg-card text-text-4 border border-border-1"
              }`}
            >
              🎯
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black text-text-1">Le Sniper</p>
                {hasSniper ? (
                  <span className="text-[9px] font-black bg-gold text-slate-950 px-2 py-0.5 rounded-full uppercase shadow-sm">
                    Débloqué
                  </span>
                ) : (
                  <span className="text-[10px] text-text-4 font-bold font-mono">{perfectCount}/3</span>
                )}
              </div>
              <p className="text-[10px] text-text-3 mt-0.5">3 scores exacts trouvés (10 pts)</p>
            </div>
          </div>

          {/* Badge 2: Invincible */}
          <div
            className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
              hasInvincible
                ? "bg-gradient-to-r from-primary-soft via-bg-card to-emerald-950/20 border-primary/40 text-primary-text shadow-md"
                : "bg-bg-surface border-border-1 opacity-70"
            }`}
          >
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-md ${
                hasInvincible ? "bg-primary text-white font-black" : "bg-bg-card text-text-4 border border-border-1"
              }`}
            >
              ⚡
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black text-text-1">L&apos;Invincible</p>
                {hasInvincible ? (
                  <span className="text-[9px] font-black bg-primary text-white px-2 py-0.5 rounded-full uppercase shadow-sm">
                    Débloqué
                  </span>
                ) : (
                  <span className="text-[10px] text-text-4 font-bold font-mono">{maxWinnerStreak}/5</span>
                )}
              </div>
              <p className="text-[10px] text-text-3 mt-0.5">5 bons vainqueurs consécutifs</p>
            </div>
          </div>

          {/* Badge 3: Supporter N°1 */}
          <div
            className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
              hasSupporterNum1
                ? "bg-gradient-to-r from-bcsn-blue-soft via-bg-card to-indigo-950/20 border-bcsn-blue/40 text-bcsn-blue-text shadow-md"
                : "bg-bg-surface border-border-1 opacity-70"
            }`}
          >
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-md ${
                hasSupporterNum1 ? "bg-bcsn-blue text-white font-black" : "bg-bg-card text-text-4 border border-border-1"
              }`}
            >
              🏆
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black text-text-1">Supporter N°1</p>
                {hasSupporterNum1 ? (
                  <span className="text-[9px] font-black bg-bcsn-blue text-white px-2 py-0.5 rounded-full uppercase shadow-sm">
                    Débloqué
                  </span>
                ) : (
                  <span className="text-[10px] text-text-4 font-bold font-mono">{user.predictionsCount}/5</span>
                )}
              </div>
              <p className="text-[10px] text-text-3 mt-0.5">5 matchs pronostiqués sur la saison</p>
            </div>
          </div>

          {/* Badge 4: Podium Master */}
          <div
            className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
              hasPodiumMaster
                ? "bg-gradient-to-r from-gold-soft via-bg-card to-yellow-950/20 border-gold/40 text-gold shadow-md"
                : "bg-bg-surface border-border-1 opacity-70"
            }`}
          >
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-md ${
                hasPodiumMaster ? "bg-amber-400 text-slate-950 font-black" : "bg-bg-card text-text-4 border border-border-1"
              }`}
            >
              👑
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black text-text-1">Maître du Podium</p>
                {hasPodiumMaster ? (
                  <span className="text-[9px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full uppercase shadow-sm">
                    Débloqué
                  </span>
                ) : (
                  <span className="text-[10px] text-text-4 font-bold font-mono">Top 3</span>
                )}
              </div>
              <p className="text-[10px] text-text-3 mt-0.5">Atteindre le Top 3 du classement général</p>
            </div>
          </div>
        </div>
      </div>

      {/* Theme Switcher Card */}
      <div className="card p-4 mb-5 anim-slide delay-3 border border-border-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary-soft text-primary-text flex items-center justify-center">
              <Paintbrush size={16} />
            </div>
            <div>
              <p className="text-xs font-black text-text-1">Apparence de l&apos;application</p>
              <p className="text-[10px] text-text-3">Sauvegardé sur votre compte</p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-bg-surface p-1 rounded-xl border border-border-1">
            <button
              onClick={() => toggleTheme("dark")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                theme === "dark"
                  ? "bg-bg-card text-primary-text shadow-sm border border-border-2"
                  : "text-text-4 hover:text-text-2"
              }`}
            >
              <Moon size={13} />
              <span>Sombre</span>
            </button>

            <button
              onClick={() => toggleTheme("light")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                theme === "light"
                  ? "bg-amber-500 text-white shadow-sm font-black"
                  : "text-text-4 hover:text-text-2"
              }`}
            >
              <Sun size={13} />
              <span>Clair</span>
            </button>
          </div>
        </div>
      </div>

      {/* Predictions History Ledger */}
      <div className="anim-slide delay-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <History size={15} className="text-primary-text" />
            <h3 className="text-xs font-black text-text-1 uppercase tracking-wider">
              Historique des Pronostics ({predictions.length})
            </h3>
          </div>
        </div>

        {predictions.length === 0 ? (
          <div className="card p-6 text-center text-text-3 text-xs">
            Vous n&apos;avez pas encore validé de pronostic cette saison.
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {predictions.map((p) => {
              const isFinished = p.status === "FINISHED";
              const labelInfo = isFinished
                ? getPointsLabel(p.pointsEarned)
                : null;

              return (
                <div key={p.matchId} className="card p-4 border border-border-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-text-4 font-bold">
                      {p.matchday > 0 ? `Journée ${p.matchday} · ` : ""}
                      {new Date(p.dateTime).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                    {isFinished && labelInfo ? (
                      <span
                        className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${labelInfo.color}`}
                      >
                        +{p.pointsEarned} pts ({labelInfo.text})
                      </span>
                    ) : (
                      <span className="badge badge-open text-[9px]">
                        En attente du résultat
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-text-1">
                        {p.isHome ? "BCSN" : p.opponent} vs{" "}
                        {p.isHome ? p.opponent : "BCSN"}
                      </p>
                      <p className="text-[11px] text-text-3 mt-0.5">
                        Votre prono :{" "}
                        <span className="font-extrabold text-text-1">
                          BCSN {p.predictedBcsn} – {p.predictedOpponent}{" "}
                          {p.opponent.split(" ")[0]}
                        </span>
                      </p>
                    </div>

                    {isFinished && (
                      <div className="text-right">
                        <span className="text-[9px] text-text-4 font-bold block uppercase mb-0.5">
                          Score final
                        </span>
                        <span className="text-sm font-black text-text-1 tabular-nums font-mono">
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
