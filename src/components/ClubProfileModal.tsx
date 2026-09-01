"use client";

import { useEffect } from "react";
import { X, MapPin, Building, Trophy, Target, Shield, CheckCircle, XCircle, Lightbulb, Sparkles, History } from "lucide-react";
import { getClubBySlug, getClubLogoPath, ClubProfile } from "@/lib/clubsData";

interface ClubProfileModalProps {
  clubId: string | null;
  onClose: () => void;
  pastMatches?: Array<{
    id: number;
    opponent: string;
    dateTime: string;
    isHome: boolean;
    scoreBcsn: number | null;
    scoreOpponent: number | null;
    matchday: number;
  }>;
}

export default function ClubProfileModal({ clubId, onClose, pastMatches = [] }: ClubProfileModalProps) {
  useEffect(() => {
    if (clubId) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [clubId]);

  if (!clubId) return null;

  const club: ClubProfile = getClubBySlug(clubId);
  const logoPath = getClubLogoPath(club.id) || getClubLogoPath(clubId);
  const winRate = Math.round((club.wins / (club.wins + club.losses)) * 100);

  const h2hMatches = pastMatches.filter((m) =>
    m.opponent.toLowerCase().includes(club.shortName.toLowerCase()) ||
    club.shortName.toLowerCase().includes(m.opponent.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xl anim-fade">
      {/* Backdrop click to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card Container */}
      <div className="relative w-full max-w-md bg-bg-card rounded-t-3xl sm:rounded-3xl shadow-2xl border border-border-2 anim-slide z-10 flex flex-col max-h-[88vh] overflow-hidden">
        {/* Top Handle bar for mobile */}
        <div className="pt-3 pb-2.5 px-5 bg-bg-card flex items-center justify-between border-b border-border-1 shrink-0">
          <div className="w-10 h-1 bg-text-4/40 rounded-full mx-auto sm:hidden" />
          <span className="text-[11px] font-extrabold text-text-3 uppercase tracking-wider hidden sm:flex items-center gap-1">
            <Sparkles size={12} className="text-primary-text" /> Fiche Scouting FFBB
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-bg-surface flex items-center justify-center text-text-3 hover:text-text-1 ml-auto transition-colors"
            title="Fermer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 overflow-y-auto overscroll-contain flex-1 space-y-4 text-xs">
          {/* Header Banner */}
          <div className={`rounded-2xl p-5 bg-gradient-to-br ${club.primaryColor} text-white shadow-xl relative overflow-hidden`}>
            <div className="flex items-center gap-4 mb-3 relative z-10">
              {logoPath ? (
                <div className="w-16 h-16 rounded-2xl bg-white p-1 flex items-center justify-center shadow-lg shrink-0 overflow-hidden border border-white/20">
                  <img
                    src={logoPath}
                    alt={club.name}
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
                <h3 className="text-lg font-black leading-tight truncate">{club.shortName}</h3>
                <p className="text-[11px] text-white/80 truncate mt-0.5">{club.fullName}</p>
              </div>
            </div>

            {/* Stadium / Location Bar */}
            <div className="grid grid-cols-2 gap-2 text-[11px] bg-black/25 backdrop-blur-md rounded-xl p-2.5 border border-white/10 relative z-10">
              <div className="flex items-center gap-2">
                <MapPin size={13} className="text-white/80 shrink-0" />
                <div className="truncate">
                  <span className="text-[9px] text-white/60 block">Ville</span>
                  <span className="font-bold truncate block">{club.city}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Building size={13} className="text-white/80 shrink-0" />
                <div className="truncate">
                  <span className="text-[9px] text-white/60 block">Salle</span>
                  <span className="font-bold truncate block">{club.hall}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-bg-surface p-3 rounded-2xl border border-border-1 text-center">
              <Trophy size={15} className="text-gold mx-auto mb-1" />
              <p className="text-base font-black text-text-1 tabular-nums">{winRate}%</p>
              <p className="text-[9px] text-text-4 font-semibold uppercase">{club.wins}V - {club.losses}D</p>
            </div>
            <div className="bg-bg-surface p-3 rounded-2xl border border-border-1 text-center">
              <Target size={15} className="text-primary-text mx-auto mb-1" />
              <p className="text-base font-black text-primary-text tabular-nums">{club.avgPointsScored}</p>
              <p className="text-[9px] text-text-4 font-semibold uppercase">Moy. Attaque</p>
            </div>
            <div className="bg-bg-surface p-3 rounded-2xl border border-border-1 text-center">
              <Shield size={15} className="text-accent mx-auto mb-1" />
              <p className="text-base font-black text-accent tabular-nums">{club.avgPointsConceded}</p>
              <p className="text-[9px] text-text-4 font-semibold uppercase">Moy. Défense</p>
            </div>
          </div>

          {/* Form & Records */}
          <div className="bg-bg-surface p-3.5 rounded-2xl border border-border-1 space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-text-1">
                  Forme Récente (5 derniers matchs)
                </span>
                <div className="flex items-center gap-1">
                  {club.recentForm.map((res, idx) => (
                    <span
                      key={idx}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${
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

            <div className="pt-2.5 border-t border-border-1">
              <span className="text-[10px] font-bold text-text-4 uppercase block mb-1.5">
                Bilan Global Saison ({club.wins + club.losses} matchs joués)
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex justify-between bg-bg-card p-2 rounded-xl border border-border-1">
                  <span className="text-text-4 font-semibold">Domicile :</span>
                  <span className="font-black text-text-1">{club.homeRecord}</span>
                </div>
                <div className="flex justify-between bg-bg-card p-2 rounded-xl border border-border-1">
                  <span className="text-text-4 font-semibold">Extérieur :</span>
                  <span className="font-black text-text-1">{club.awayRecord}</span>
                </div>
              </div>
            </div>
          </div>


          {/* H2H Match History */}
          {h2hMatches.length > 0 && (
            <div className="bg-bg-surface p-3.5 rounded-2xl border border-border-1">
              <div className="flex items-center gap-1.5 text-text-3 font-semibold mb-2">
                <History size={12} />
                <span>Historique récent vs BCSN</span>
              </div>
              <div className="space-y-1.5">
                {h2hMatches.map((m) => (
                  <div key={m.id} className="flex items-center justify-between text-[11px] bg-bg-card p-2 rounded-xl">
                    <span className="text-text-2">
                      {m.isHome ? `BCSN vs ${m.opponent}` : `${m.opponent} vs BCSN`}
                    </span>
                    <span className="font-black text-text-1 tabular-nums">
                      {m.scoreBcsn} - {m.scoreOpponent}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

