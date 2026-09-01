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
  Calendar,
} from "lucide-react";
import { ClubProfile, getClubLogoPath } from "@/lib/clubsData";

interface Props {
  club: ClubProfile;
}

export default function ClubDetailView({ club }: Props) {
  const router = useRouter();
  const winRate = Math.round((club.wins / (club.wins + club.losses)) * 100);
  const logoPath = getClubLogoPath(club.id) || getClubLogoPath(club.shortName);

  return (
    <div className="px-4 pt-4 pb-12">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs font-bold text-text-3 hover:text-text-1 transition-colors mb-4"
      >
        <ArrowLeft size={16} />
        <span>Retour aux clubs</span>
      </button>

      {/* Hero Banner Header */}
      <div className={`card-elevated p-6 mb-4 anim-slide bg-gradient-to-br ${club.primaryColor} text-white relative overflow-hidden shadow-2xl`}>
        <div className="flex items-center gap-4 mb-4 relative z-10">
          {logoPath ? (
            <div className="w-16 h-16 rounded-2xl bg-white p-1.5 shadow-xl flex items-center justify-center shrink-0 overflow-hidden border border-white/20">
              <img
                src={logoPath}
                alt={club.shortName}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner shrink-0 border border-white/30">
              {club.logoEmoji}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <span className="text-[9px] font-black uppercase tracking-wider bg-white/25 px-2 py-0.5 rounded-full backdrop-blur-sm shadow-sm">
                {club.badgeRole}
              </span>
              {club.ffbbCode && (
                <span className="text-[9px] font-bold bg-black/30 px-2 py-0.5 rounded-full">
                  FFBB {club.ffbbCode}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-black leading-tight truncate">{club.shortName}</h1>
            <p className="text-xs text-white/80 truncate mt-0.5">{club.fullName}</p>
          </div>
        </div>

        {/* Stadium Info Bar */}
        <div className="grid grid-cols-2 gap-2 text-xs bg-black/25 backdrop-blur-md rounded-2xl p-3 border border-white/10 relative z-10">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-white/80 shrink-0" />
            <div className="truncate">
              <span className="text-[9px] text-white/60 block">Ville</span>
              <span className="font-extrabold truncate block">{club.city}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Building size={14} className="text-white/80 shrink-0" />
            <div className="truncate">
              <span className="text-[9px] text-white/60 block">Salle</span>
              <span className="font-extrabold truncate block">{club.hall}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-2.5 mb-4 anim-slide delay-1">
        <div className="card p-3.5 text-center">
          <Trophy size={16} className="text-gold mx-auto mb-1" />
          <p className="text-lg font-black text-text-1 tabular-nums font-mono">{winRate}%</p>
          <p className="text-[9px] text-text-4 font-bold uppercase">{club.wins}V - {club.losses}D</p>
        </div>
        <div className="card p-3.5 text-center">
          <Target size={16} className="text-primary-text mx-auto mb-1" />
          <p className="text-lg font-black text-primary-text tabular-nums font-mono">{club.avgPointsScored}</p>
          <p className="text-[9px] text-text-4 font-bold uppercase">Moy. Attaque</p>
        </div>
        <div className="card p-3.5 text-center">
          <Shield size={16} className="text-accent mx-auto mb-1" />
          <p className="text-lg font-black text-accent tabular-nums font-mono">{club.avgPointsConceded}</p>
          <p className="text-[9px] text-text-4 font-bold uppercase">Moy. Défense</p>
        </div>
      </div>

      {/* Recent Form & Home/Away */}
      <div className="card p-4 mb-4 anim-slide delay-2 space-y-3">
        <div>
          <h3 className="text-xs font-black text-text-1 uppercase tracking-wider mb-2">
            Forme Récente (5 derniers matchs)
          </h3>
          <div className="flex items-center justify-between bg-bg-surface p-2.5 rounded-xl border border-border-1">
            <span className="text-xs text-text-3 font-semibold">Dernières rencontres :</span>
            <div className="flex items-center gap-1.5">
              {club.recentForm.map((res, idx) => (
                <span
                  key={idx}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
                    res === "W"
                      ? "bg-primary-soft text-primary-text border border-primary/30"
                      : "bg-accent-soft text-accent border border-accent/30"
                  }`}
                >
                  {res === "W" ? "V" : "D"}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-xs font-black text-text-1 uppercase tracking-wider">
              Bilan Global Saison ({club.wins + club.losses} matchs)
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="flex items-center justify-between bg-bg-surface p-2.5 rounded-xl border border-border-1">
              <span className="text-text-4 font-semibold flex items-center gap-1">
                <Home size={12} /> Domicile
              </span>
              <span className="font-black text-text-1 tabular-nums">{club.homeRecord}</span>
            </div>
            <div className="flex items-center justify-between bg-bg-surface p-2.5 rounded-xl border border-border-1">
              <span className="text-text-4 font-semibold flex items-center gap-1">
                <Building size={12} /> Extérieur
              </span>
              <span className="font-black text-text-1 tabular-nums">{club.awayRecord}</span>
            </div>
          </div>
        </div>
      </div>


      {/* Match Bet CTA */}
      <button
        onClick={() => router.push("/matchs")}
        className="btn-primary w-full py-4 text-xs font-black flex items-center justify-center gap-2 shadow-xl mt-6"
      >
        <Target size={16} />
        <span>Pronostiquer le prochain match du BCSN</span>
      </button>
    </div>
  );
}

