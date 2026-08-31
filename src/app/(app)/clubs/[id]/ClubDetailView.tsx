"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Trophy,
  Shield,
  CheckCircle,
  XCircle,
  Lightbulb,
  Target,
  Sparkles,
  Home,
  Building,
} from "lucide-react";
import { ClubProfile } from "@/lib/clubsData";

interface Props {
  club: ClubProfile;
}

export default function ClubDetailView({ club }: Props) {
  const router = useRouter();
  const winRate = Math.round((club.wins / (club.wins + club.losses)) * 100);

  return (
    <div className="px-5 pt-6 pb-8">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs font-semibold text-text-3 hover:text-text-1 transition-colors mb-4"
      >
        <ArrowLeft size={16} />
        Retour aux clubs
      </button>

      {/* Hero Header */}
      <div className={`card-elevated p-6 mb-4 anim-slide bg-gradient-to-br ${club.primaryColor} text-white`}>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner">
            {club.logoEmoji}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md backdrop-blur-sm">
                {club.badgeRole}
              </span>
              {club.ffbbCode && (
                <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-md">
                  FFBB {club.ffbbCode}
                </span>
              )}
            </div>
            <h1 className="text-xl font-black leading-tight">{club.shortName}</h1>
            <p className="text-xs text-white/80 mt-0.5">{club.fullName}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs bg-black/20 backdrop-blur-md rounded-xl p-3">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-white/80" />
            <div>
              <span className="text-[10px] text-white/70 block">Ville</span>
              <span className="font-bold">{club.city}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Building size={14} className="text-white/80" />
            <div>
              <span className="text-[10px] text-white/70 block">Salle</span>
              <span className="font-bold truncate max-w-[120px] block">{club.hall}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-2.5 mb-4 anim-slide delay-1">
        <div className="card p-3 text-center">
          <Trophy size={16} className="text-gold mx-auto mb-1" />
          <p className="text-lg font-black text-text-1 tabular-nums">{winRate}%</p>
          <p className="text-[10px] text-text-4">Victoires ({club.wins}V-{club.losses}D)</p>
        </div>
        <div className="card p-3 text-center">
          <Target size={16} className="text-primary-text mx-auto mb-1" />
          <p className="text-lg font-black text-text-1 tabular-nums">{club.avgPointsScored}</p>
          <p className="text-[10px] text-text-4">Moy. Attaque</p>
        </div>
        <div className="card p-3 text-center">
          <Shield size={16} className="text-accent mx-auto mb-1" />
          <p className="text-lg font-black text-text-1 tabular-nums">{club.avgPointsConceded}</p>
          <p className="text-[10px] text-text-4">Moy. Défense</p>
        </div>
      </div>

      {/* Recent Form & Home/Away */}
      <div className="card p-4 mb-4 anim-slide delay-2">
        <h3 className="text-xs font-bold text-text-1 uppercase tracking-wider mb-3">
          Forme Récente & Bilan
        </h3>

        <div className="flex items-center justify-between mb-3 pb-3 border-b border-border-1">
          <span className="text-xs text-text-3 font-medium">Série (5 derniers matchs) :</span>
          <div className="flex items-center gap-1.5">
            {club.recentForm.map((res, idx) => (
              <span
                key={idx}
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
                  res === "W"
                    ? "bg-primary-soft text-primary-text"
                    : "bg-accent-soft text-accent"
                }`}
              >
                {res === "W" ? "V" : "D"}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center justify-between bg-bg-surface p-2.5 rounded-xl">
            <span className="text-text-4 flex items-center gap-1">
              <Home size={12} /> Dom.
            </span>
            <span className="font-bold text-text-1 tabular-nums">{club.homeRecord}</span>
          </div>
          <div className="flex items-center justify-between bg-bg-surface p-2.5 rounded-xl">
            <span className="text-text-4 flex items-center gap-1">
              <Building size={12} /> Ext.
            </span>
            <span className="font-bold text-text-1 tabular-nums">{club.awayRecord}</span>
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="card p-4 mb-4 anim-slide delay-3">
        <h3 className="text-xs font-bold text-text-1 uppercase tracking-wider mb-3">
          Analyse du Jeu
        </h3>

        <div className="space-y-2 mb-3">
          <span className="text-[11px] font-bold text-primary-text block">Points forts :</span>
          {club.strengths.map((str, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs text-text-2">
              <CheckCircle size={14} className="text-primary-text shrink-0" />
              <span>{str}</span>
            </div>
          ))}
        </div>

        <div className="space-y-2 pt-2 border-t border-border-1">
          <span className="text-[11px] font-bold text-accent block">Points faibles :</span>
          {club.weaknesses.map((wk, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs text-text-2">
              <XCircle size={14} className="text-accent shrink-0" />
              <span>{wk}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Advice for betting */}
      <div className="card p-4 mb-6 anim-slide delay-4 bg-primary-soft/20 border-primary/30">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb size={18} className="text-primary-text shrink-0" />
          <h3 className="text-xs font-bold text-text-1 uppercase tracking-wider">
            Conseil Pronostic Supporters
          </h3>
        </div>
        <p className="text-xs text-text-2 leading-relaxed">
          {club.pronoAdvice}
        </p>
      </div>

      {/* Direct link to bet on next match */}
      <button
        onClick={() => router.push("/matchs")}
        className="btn-primary w-full flex items-center justify-center gap-2 py-3.5"
      >
        <Target size={18} />
        Pronostiquer le prochain match
      </button>
    </div>
  );
}
