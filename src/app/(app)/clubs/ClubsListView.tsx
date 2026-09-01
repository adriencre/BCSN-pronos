"use client";

import { useRouter } from "next/navigation";
import { Shield, ChevronRight, MapPin, Trophy, Target, Sparkles, ArrowRight } from "lucide-react";
import { CLUBS_DATA } from "@/lib/clubsData";
import { getClubLogoPath } from "@/lib/clubsData";

export default function ClubsListView() {
  const router = useRouter();
  const clubsList = Object.values(CLUBS_DATA);

  return (
    <div className="px-4 pt-4 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 anim-fade">
        <div>
          <div className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-primary-text mb-0.5">
            <Sparkles size={11} /> Données & Scouting FFBB
          </div>
          <h1 className="text-xl font-black text-text-1">Fiches des Clubs</h1>
          <p className="text-xs text-text-3 font-medium mt-0.5">
            Analyses & statistiques officielles pour vos pronostics
          </p>
        </div>
      </div>

      {/* Clubs List */}
      <div className="flex flex-col gap-3">
        {clubsList.map((club, i) => {
          const isBcsn = club.id === "bcsn";
          const logoPath = getClubLogoPath(club.id) || getClubLogoPath(club.shortName);
          const winRate = Math.round((club.wins / (club.wins + club.losses)) * 100);

          return (
            <div
              key={club.id}
              onClick={() => router.push(`/clubs/${club.id}`)}
              className={`card p-4 cursor-pointer hover:border-primary/50 transition-all duration-200 anim-slide ${
                isBcsn ? "ring-2 ring-primary/40 bg-gradient-to-r from-primary-soft/20 via-bg-card to-bcsn-blue-soft/20 border-primary/40" : ""
              }`}
              style={{ animationDelay: `${i * 35}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {logoPath ? (
                    <div className="w-12 h-12 rounded-2xl bg-white p-1 shadow-md border border-border-1 flex items-center justify-center overflow-hidden shrink-0">
                      <img src={logoPath} alt={club.shortName} className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-md bg-gradient-to-br ${club.primaryColor} text-white shrink-0`}
                    >
                      {club.logoEmoji}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-black text-text-1">
                        {club.shortName}
                      </h2>
                      {isBcsn ? (
                        <span className="badge badge-joueur text-[8px] px-2 py-0.5">
                          Notre Équipe
                        </span>
                      ) : (
                        <span className="badge badge-supporter text-[8px] px-2 py-0.5">
                          {club.badgeRole}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-text-3 flex items-center gap-1 mt-0.5 font-medium">
                      <MapPin size={11} className="text-text-4" />
                      {club.city}
                    </p>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-bg-surface flex items-center justify-center text-text-4 group-hover:text-text-1 transition-colors">
                  <ChevronRight size={16} />
                </div>
              </div>

              {/* Stats Metrics Bar */}
              <div className="grid grid-cols-3 gap-2 bg-bg-surface rounded-2xl p-2.5 text-center text-xs border border-border-1">
                <div>
                  <span className="text-[9px] text-text-4 font-bold uppercase block mb-0.5">Bilan</span>
                  <span className="font-extrabold text-text-1 tabular-nums">
                    {club.wins}V - {club.losses}D ({winRate}%)
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-text-4 font-bold uppercase block mb-0.5">Attaque</span>
                  <span className="font-extrabold text-primary-text tabular-nums">
                    {club.avgPointsScored} pts
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-text-4 font-bold uppercase block mb-0.5">Défense</span>
                  <span className="font-extrabold text-accent tabular-nums">
                    {club.avgPointsConceded} pts
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
