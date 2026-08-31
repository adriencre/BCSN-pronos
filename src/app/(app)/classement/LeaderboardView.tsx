"use client";

import { Trophy, Star, Target } from "lucide-react";

interface Entry {
  id: number;
  pseudo: string;
  totalScore: number;
  role: string;
  avatarEmoji: string;
  _count: { predictions: number };
}

interface Props {
  leaderboard: Entry[];
  currentUserId: number;
}

export default function LeaderboardView({ leaderboard, currentUserId }: Props) {
  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  const rankColors = [
    { ring: "ring-gold/40", bg: "bg-gold-soft", text: "text-gold", label: "1er" },
    { ring: "ring-silver/30", bg: "bg-silver-soft", text: "text-silver", label: "2e" },
    { ring: "ring-bronze/30", bg: "bg-bronze-soft", text: "text-bronze", label: "3e" },
  ];

  // Podium order: 2nd, 1st, 3rd
  const podiumOrder = top3.length >= 3 ? [1, 0, 2] : top3.length === 2 ? [1, 0] : [0];

  return (
    <div className="px-5 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 anim-fade">
        <div>
          <h1 className="text-lg font-bold text-text-1">Classement</h1>
          <p className="text-xs text-text-3 mt-0.5">
            {leaderboard.length} joueur{leaderboard.length > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-text-3">
          <Trophy size={14} />
          <span className="text-xs font-medium">Saison 2024–25</span>
        </div>
      </div>

      {/* Podium */}
      {top3.length > 0 && (
        <div className="mb-6 anim-slide delay-1">
          <div className="flex items-end justify-center gap-3 pt-4 pb-2">
            {podiumOrder.map((idx) => {
              const entry = top3[idx];
              if (!entry) return null;
              const rc = rankColors[idx];
              const isFirst = idx === 0;
              const isMe = entry.id === currentUserId;

              return (
                <div
                  key={entry.id}
                  className={`flex flex-col items-center ${isFirst ? "mb-4" : ""}`}
                  style={{ width: isFirst ? "36%" : "28%" }}
                >
                  {/* Crown for 1st */}
                  {isFirst && (
                    <div className="mb-1.5 anim-fade delay-2">
                      <Star size={18} className="text-gold" fill="currentColor" />
                    </div>
                  )}

                  {/* Avatar */}
                  <div
                    className={`
                      avatar ${isFirst ? "avatar-xl" : "avatar-lg"}
                      ${rc.bg} ring-2 ${rc.ring}
                      ${isMe ? "ring-primary ring-offset-2 ring-offset-bg-base" : ""}
                      mb-2.5 anim-scale delay-2
                    `}
                  >
                    {entry.avatarEmoji}
                  </div>

                  {/* Name */}
                  <p
                    className={`text-xs font-bold text-center leading-tight mb-0.5 ${
                      isMe ? "text-primary-text" : "text-text-1"
                    }`}
                  >
                    {entry.pseudo}
                  </p>

                  {/* Role badge */}
                  <span
                    className={`badge mb-1.5 ${
                      entry.role === "JOUEUR" ? "badge-joueur" : "badge-supporter"
                    }`}
                  >
                    {entry.role === "JOUEUR" ? "Joueur" : "Supporter"}
                  </span>

                  {/* Score */}
                  <p className={`text-xl font-black ${rc.text} tabular-nums`}>
                    {entry.totalScore}
                  </p>
                  <p className="text-[10px] text-text-4">pts</p>

                  {/* Podium bar */}
                  <div
                    className={`w-full ${rc.bg} rounded-t-xl mt-2`}
                    style={{ height: isFirst ? 64 : idx === 1 ? 44 : 32 }}
                  >
                    <div className="flex items-center justify-center h-full">
                      <span className={`text-xs font-bold ${rc.text}`}>
                        {rc.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Rest of leaderboard */}
      {rest.length > 0 && (
        <div className="flex flex-col gap-1.5 mb-6">
          {rest.map((entry, i) => {
            const isMe = entry.id === currentUserId;
            const rank = i + 4;

            return (
              <div
                key={entry.id}
                className={`
                  card px-4 py-3 flex items-center gap-3 anim-fade
                  ${isMe ? "!border-primary/20 !bg-primary-soft" : ""}
                `}
                style={{ animationDelay: `${200 + i * 50}ms` }}
              >
                {/* Rank */}
                <span className="text-xs font-bold text-text-4 w-6 text-center tabular-nums">
                  {rank}
                </span>

                {/* Avatar */}
                <div className="avatar avatar-sm bg-bg-surface">
                  {entry.avatarEmoji}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-sm font-semibold truncate ${
                        isMe ? "text-primary-text" : "text-text-1"
                      }`}
                    >
                      {entry.pseudo}
                    </p>
                    <span
                      className={`badge ${
                        entry.role === "JOUEUR"
                          ? "badge-joueur"
                          : "badge-supporter"
                      }`}
                    >
                      {entry.role === "JOUEUR" ? "Joueur" : "Supporter"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-text-4 mt-0.5">
                    <Target size={10} />
                    <span className="text-[10px]">
                      {entry._count.predictions} prono
                      {entry._count.predictions > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <p className="text-base font-bold text-text-1 tabular-nums">
                    {entry.totalScore}
                  </p>
                  <p className="text-[10px] text-text-4">pts</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {leaderboard.length === 0 && (
        <div className="text-center py-20 anim-fade">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-bg-surface flex items-center justify-center mb-4">
            <Trophy size={28} className="text-text-3" />
          </div>
          <h2 className="text-lg font-bold text-text-1 mb-2">
            Pas encore de classement
          </h2>
          <p className="text-sm text-text-3">
            Les points seront attribués après le premier match.
          </p>
        </div>
      )}

      {/* Scoring rules */}
      <div className="card p-4 mb-4 anim-fade delay-5">
        <h3 className="text-xs font-bold text-text-2 uppercase tracking-wider mb-3">
          Barème
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { pts: 10, label: "Score exact", color: "text-gold bg-gold-soft" },
            { pts: 5, label: "Écart exact", color: "text-primary-text bg-primary-soft" },
            { pts: 3, label: "Écart ±3 pts", color: "text-primary-text bg-primary-soft" },
            { pts: 1, label: "Bon vainqueur", color: "text-text-2 bg-bg-surface" },
          ].map((r) => (
            <div
              key={r.pts}
              className="flex items-center gap-2.5 rounded-xl p-2.5"
            >
              <span
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${r.color}`}
              >
                {r.pts}
              </span>
              <span className="text-xs text-text-2 font-medium">{r.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
