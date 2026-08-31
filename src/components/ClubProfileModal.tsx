"use client";

import { X, MapPin, Building, Shield, History, Trophy, Calendar } from "lucide-react";
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
  if (!clubId) return null;

  const club: ClubProfile = getClubBySlug(clubId);
  const logoPath = getClubLogoPath(club.id) || getClubLogoPath(clubId);

  // Filter past matches played against this opponent
  const h2hMatches = pastMatches.filter((m) =>
    m.opponent.toLowerCase().includes(club.shortName.toLowerCase()) ||
    club.shortName.toLowerCase().includes(m.opponent.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm anim-fade">
      {/* Backdrop click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-md max-h-[85vh] overflow-y-auto bg-bg-card rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-border-1 anim-slide z-10">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-bg-surface flex items-center justify-center text-text-3 hover:text-text-1 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header Banner */}
        <div className={`rounded-2xl p-5 mb-4 bg-gradient-to-br ${club.primaryColor} text-white shadow-md`}>
          <div className="flex items-center gap-4 mb-3">
            {logoPath ? (
              <div className="w-16 h-16 rounded-2xl bg-white p-1 flex items-center justify-center shadow-lg shrink-0 overflow-hidden">
                <img
                  src={logoPath}
                  alt={club.name}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner shrink-0">
                {club.logoEmoji}
              </div>
            )}

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md backdrop-blur-sm inline-block mb-1">
                {club.badgeRole}
              </span>
              <h2 className="text-xl font-black leading-tight">{club.shortName}</h2>
              <p className="text-xs text-white/80">{club.fullName}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs bg-black/20 backdrop-blur-md rounded-xl p-2.5">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin size={13} className="text-white/80 shrink-0" />
              <span className="truncate font-semibold">{club.city}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <Building size={13} className="text-white/80 shrink-0" />
              <span className="truncate font-semibold">{club.hall}</span>
            </div>
          </div>
        </div>

        {/* Official Info Summary */}
        <div className="card p-4 mb-4 space-y-2.5 text-xs">
          <h3 className="text-xs font-bold text-text-1 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Shield size={14} className="text-primary-text" />
            Informations Équipe
          </h3>
          <div className="flex items-center justify-between pb-2 border-b border-border-1">
            <span className="text-text-3 font-medium">Nom officiel</span>
            <span className="font-bold text-text-1">{club.fullName}</span>
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-border-1">
            <span className="text-text-3 font-medium">Ville</span>
            <span className="font-bold text-text-1">{club.city}</span>
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-border-1">
            <span className="text-text-3 font-medium">Salle principale</span>
            <span className="font-bold text-text-1 max-w-[160px] truncate text-right">{club.hall}</span>
          </div>
          {club.ffbbCode && (
            <div className="flex items-center justify-between">
              <span className="text-text-3 font-medium">Code Organisme FFBB</span>
              <span className="font-mono font-bold text-primary-text">{club.ffbbCode}</span>
            </div>
          )}
        </div>

        {/* Past matches against BCSN */}
        <div className="card p-4">
          <h3 className="text-xs font-bold text-text-1 uppercase tracking-wider flex items-center gap-1.5 mb-3">
            <History size={14} className="text-primary-text" />
            Historique des confrontations
          </h3>

          {h2hMatches.length > 0 ? (
            <div className="space-y-2">
              {h2hMatches.map((m) => {
                const won = m.scoreBcsn !== null && m.scoreOpponent !== null && m.scoreBcsn > m.scoreOpponent;
                const lost = m.scoreBcsn !== null && m.scoreOpponent !== null && m.scoreBcsn < m.scoreOpponent;

                return (
                  <div
                    key={m.id}
                    className="bg-bg-surface p-3 rounded-xl flex items-center justify-between text-xs border border-border-1"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${won ? "bg-primary" : lost ? "bg-accent" : "bg-text-4"}`} />
                      <div>
                        <span className="font-bold text-text-1">
                          {m.isHome ? "BCSN" : m.opponent} vs {m.isHome ? m.opponent : "BCSN"}
                        </span>
                        <p className="text-[10px] text-text-4">
                          {new Date(m.dateTime).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <span className="font-black text-text-1 tabular-nums">
                      {m.scoreBcsn} – {m.scoreOpponent}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4 text-text-4 text-xs">
              <Calendar size={18} className="mx-auto mb-1 text-text-4 opacity-60" />
              Aucune rencontre passée enregistrée cette saison.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
