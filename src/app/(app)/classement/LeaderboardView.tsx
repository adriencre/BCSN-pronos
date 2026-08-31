"use client";

import { Trophy, Star, Target, Flame } from "lucide-react";

interface Entry {
  id: number;
  pseudo: string;
  totalScore: number;
  role: string;
  avatarEmoji: string;
  recentForm?: number[];
  streak?: number;
  _count: { predictions: number };
}

interface Props {
  leaderboard: Entry[];
  currentUserId: number;
}

function FormDots({ form = [], streak = 0 }: { form?: number[]; streak?: number }) {
  return (
    <div className="flex items-center gap-1">
      {/* Streak badge */}
      {streak >= 2 && (
        <span className="text-[10px] font-extrabold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 animate-pulse">
          <Flame size={11} className="fill-amber-400 text-amber-400" />
          {streak}
        </span>
      )}

      {/* Form Dots (Last 5 matches) */}
      {form.length > 0 ? (
        <div className="flex items-center gap-1 bg-bg-surface px-1.5 py-1 rounded-lg border border-border-1">
          {form.map((pts, idx) => {
            let colorClass = "bg-rose-500/80"; // 0 pts (Wrong)
            let tooltip = "0 pt";

            if (pts >= 5) {
              colorClass = "bg-emerald-500 shadow-sm shadow-emerald-500/50"; // 5-10 pts (Great)
              tooltip = `+${pts} pts (Excellent)`;
            } else if (pts >= 1) {
              colorClass = "bg-amber-400 shadow-sm shadow-amber-400/50"; // 1-3 pts (Good)
              tooltip = `+${pts} pt`;
            }

            return (
              <span
                key={idx}
                title={tooltip}
                className={`w-2 h-2 rounded-full ${colorClass} transition-transform hover:scale-125`}
              />
            );
          })}
        </div>
      ) : (
        <span className="text-[10px] text-text-4 font-medium italic">Pas de forme</span>
      )}
    </div>
  );
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
          <h1 className="text-lg font-bold text-text-1">Classement Général</h1>
          <p className="text-xs text-text-3 mt-0.5">
            {leaderboard.length} joueur{leaderboard.length > 1 ? "s" : ""} · Saison 2026–2027
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-text-3">
          <Trophy size={14} />
          <span className="text-xs font-medium">BCSN</span>
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
                      mb-2 anim-scale delay-2
                    `}
                  >
                    {entry.avatarEmoji}
                  </div>

                  {/* Name */}
                  <p
                    className={`text-xs font-bold text-center leading-tight mb-0.5 truncate w-full ${
                      isMe ? "text-primary-text" : "text-text-1"
                    }`}
                  >
                    {entry.pseudo}
                  </p>

                  {/* Streak & Form */}
                  <div className="mb-1">
                    <FormDots form={entry.recentForm} streak={entry.streak} />
                  </div>

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
                  ${isMe ? "!border-primary/30 !bg-primary-soft/20 ring-1 ring-primary/20" : ""}
                `}
                style={{ animationDelay: `${200 + i * 40}ms` }}
              >
                {/* Rank */}
                <span className="text-xs font-bold text-text-4 w-6 text-center tabular-nums">
                  {rank}
                </span>

                {/* Avatar */}
                <div className="avatar avatar-sm bg-bg-surface shrink-0">
                  {entry.avatarEmoji}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p
                      className={`text-xs font-bold truncate ${
                        isMe ? "text-primary-text" : "text-text-1"
                      }`}
                    >
                      {entry.pseudo}
                    </p>
                    <span
                      className={`badge text-[9px] py-0 px-1.5 ${
                        entry.role === "JOUEUR"
                          ? "badge-joueur"
                          : "badge-supporter"
                      }`}
                    >
                      {entry.role === "JOUEUR" ? "Joueur" : "Supporter"}
                    </span>
                  </div>

                  {/* Form dots & streak */}
                  <FormDots form={entry.recentForm} streak={entry.streak} />
                </div>

                {/* Score */}
                <div className="text-right shrink-0">
                  <p className="text-base font-black text-text-1 tabular-nums">
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
      <div className="card p-4 mb-4 anim-fade delay-5 border border-border-1">
        <h3 className="text-xs font-bold text-text-2 uppercase tracking-wider mb-3">
          Barème de points & Forme
        </h3>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {[
            { pts: 10, label: "Score exact", color: "text-gold bg-gold-soft" },
            { pts: 5, label: "Écart exact", color: "text-primary-text bg-primary-soft" },
            { pts: 3, label: "Écart ±3 pts", color: "text-primary-text bg-primary-soft" },
            { pts: 1, label: "Bon vainqueur", color: "text-text-2 bg-bg-surface" },
          ].map((r) => (
            <div
              key={r.pts}
              className="flex items-center gap-2.5 rounded-xl p-2 bg-bg-surface border border-border-1"
            >
              <span
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${r.color}`}
              >
                {r.pts}
              </span>
              <span className="text-[11px] text-text-2 font-medium">{r.label}</span>
            </div>
          ))}
        </div>

        {/* Legend for Form Dots */}
        <div className="pt-2 border-t border-border-1 flex items-center justify-around text-[10px] text-text-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> +5 à 10 pts
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> +1 pt
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> 0 pt
          </span>
          <span className="flex items-center gap-1 font-bold text-amber-400">
            <Flame size={10} /> Série
          </span>
        </div>
      </div>
    </div>
  );
}
