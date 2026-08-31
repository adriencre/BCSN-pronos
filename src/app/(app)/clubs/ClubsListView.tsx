"use client";

import { useRouter } from "next/navigation";
import { Shield, ChevronRight, MapPin, Trophy, TrendingUp, Sparkles } from "lucide-react";
import { CLUBS_DATA, ClubProfile } from "@/lib/clubsData";

export default function ClubsListView() {
  const router = useRouter();
  const clubsList = Object.values(CLUBS_DATA);

  return (
    <div className="px-5 pt-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 anim-fade">
        <div>
          <h1 className="text-lg font-bold text-text-1">Fiches Clubs</h1>
          <p className="text-xs text-text-3 mt-0.5">
            Statistiques & Analyses FFBB pour vous aider à pronostiquer
          </p>
        </div>
        <div className="badge badge-open flex items-center gap-1.5">
          <Sparkles size={12} className="text-primary-text" />
          <span className="text-[10px] font-bold">FFBB Data</span>
        </div>
      </div>

      {/* Clubs List */}
      <div className="flex flex-col gap-3">
        {clubsList.map((club, i) => {
          const isBcsn = club.id === "bcsn";
          const winRate = Math.round((club.wins / (club.wins + club.losses)) * 100);

          return (
            <div
              key={club.id}
              onClick={() => router.push(`/clubs/${club.id}`)}
              className={`card p-4 cursor-pointer hover:border-primary/40 transition-all duration-200 anim-slide ${
                isBcsn ? "ring-2 ring-primary/40 bg-primary-soft/10" : ""
              }`}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-sm bg-gradient-to-br ${club.primaryColor}`}
                  >
                    {club.logoEmoji}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-text-1">
                        {club.shortName}
                      </h2>
                      {isBcsn && (
                        <span className="badge badge-joueur text-[9px] px-2 py-0.5">
                          Mon Club
                        </span>
                      )}
                      {!isBcsn && (
                        <span className="badge badge-supporter text-[9px] px-2 py-0.5">
                          {club.badgeRole}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-text-4 flex items-center gap-1 mt-0.5">
                      <MapPin size={10} />
                      {club.city}
                    </p>
                  </div>
                </div>

                <ChevronRight size={18} className="text-text-4" />
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-2 bg-bg-surface rounded-xl p-2.5 text-center text-xs">
                <div>
                  <span className="text-[10px] text-text-4 block mb-0.5">Bilan</span>
                  <span className="font-bold text-text-1 tabular-nums">
                    {club.wins}V - {club.losses}D ({winRate}%)
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-text-4 block mb-0.5">Attaque</span>
                  <span className="font-bold text-primary-text tabular-nums">
                    {club.avgPointsScored} pts
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-text-4 block mb-0.5">Défense</span>
                  <span className="font-bold text-accent tabular-nums">
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
