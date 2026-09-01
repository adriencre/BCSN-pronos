"use client";

import { useState } from "react";
import { Trophy, Star, Target, Flame, Crown, Medal, Award, Info, ChevronDown, CheckCircle2 } from "lucide-react";

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
        <span className="text-[9px] font-black text-amber-400 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
          <Flame size={10} className="fill-amber-400 text-amber-400" />
          {streak}
        </span>
      )}

      {/* Form Dots (Last 5 matches) */}
      {form.length > 0 ? (
        <div className="flex items-center gap-1 bg-bg-surface px-1.5 py-1 rounded-lg border border-border-1">
          {form.map((pts, idx) => {
            let colorClass = "bg-rose-500/80";
            let tooltip = "0 pt";

            if (pts >= 5) {
              colorClass = "bg-emerald-500 shadow-[0_0_6px_#10B981]";
              tooltip = `+${pts} pts (Excellent)`;
            } else if (pts >= 1) {
              colorClass = "bg-amber-400 shadow-[0_0_6px_#F59E0B]";
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
        <span className="text-[10px] text-text-4 font-medium italic">Nouveau</span>
      )}
    </div>
  );
}

export default function LeaderboardView({ leaderboard, currentUserId }: Props) {
  const [filterRole, setFilterRole] = useState<"ALL" | "JOUEUR" | "SUPPORTER">("ALL");
  const [showRules, setShowRules] = useState(false);

  const filteredLeaderboard = leaderboard.filter((entry) => {
    if (filterRole === "ALL") return true;
    return entry.role === filterRole;
  });

  const top3 = filteredLeaderboard.slice(0, 3);
  const rest = filteredLeaderboard.slice(3);

  const myEntryIndex = filteredLeaderboard.findIndex((e) => e.id === currentUserId);
  const myEntry = myEntryIndex !== -1 ? filteredLeaderboard[myEntryIndex] : null;
  const myRank = myEntryIndex !== -1 ? myEntryIndex + 1 : null;

  const rankColors = [
    { ring: "ring-gold/60", bg: "bg-gold-soft", text: "text-gold", label: "1er", border: "border-gold/40" },
    { ring: "ring-silver/40", bg: "bg-silver-soft", text: "text-silver", label: "2e", border: "border-silver/40" },
    { ring: "ring-bronze/40", bg: "bg-bronze-soft", text: "text-bronze", label: "3e", border: "border-bronze/40" },
  ];

  // Podium display order: 2nd (left), 1st (center), 3rd (right)
  const podiumOrder = top3.length >= 3 ? [1, 0, 2] : top3.length === 2 ? [1, 0] : [0];

  return (
    <div className="px-4 pt-4 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 anim-fade">
        <div>
          <div className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-primary-text mb-0.5">
            <Trophy size={11} /> Saison 2026–2027
          </div>
          <h1 className="text-xl font-black text-text-1">Classement Général</h1>
          <p className="text-xs text-text-3 mt-0.5 font-medium">
            {leaderboard.length} participant{leaderboard.length > 1 ? "s" : ""} au total
          </p>
        </div>

        <button
          onClick={() => setShowRules(!showRules)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-bg-card hover:bg-bg-card-hover border border-border-1 text-xs font-bold text-text-2 transition-all shadow-sm"
        >
          <Info size={13} className="text-primary-text" />
          <span>Barème</span>
          <ChevronDown size={13} className={`transition-transform duration-200 ${showRules ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Rules Explainer Accordion Dropdown */}
      {showRules && (
        <div className="card-elevated p-4 mb-4 anim-scale border border-border-2">
          <h3 className="text-xs font-black text-text-1 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Award size={14} className="text-gold" /> Barème Officiel des Points
          </h3>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {[
              { pts: "+10 pts", label: "Score exact", desc: "Ex: BCSN 82-74 prédit pile", color: "text-gold bg-gold-soft border-gold/30" },
              { pts: "+5 pts", label: "Écart exact", desc: "Ex: Bon écart de +8 pts", color: "text-primary-text bg-primary-soft border-primary/30" },
              { pts: "+3 pts", label: "Écart ±3 pts", desc: "Très proche du score", color: "text-primary-text bg-primary-soft border-primary/30" },
              { pts: "+1 pt", label: "Bon vainqueur", desc: "Bonne équipe victorieuse", color: "text-text-2 bg-bg-surface border-border-1" },
            ].map((r) => (
              <div
                key={r.pts}
                className="p-2.5 rounded-xl bg-bg-surface border border-border-1 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md border ${r.color}`}>
                    {r.pts}
                  </span>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-text-1">{r.label}</p>
                  <p className="text-[9px] text-text-3 mt-0.5">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-border-1 flex items-center justify-around text-[10px] text-text-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_4px_#10B981]" /> 5-10 pts
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_4px_#F59E0B]" /> 1-3 pts
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> 0 pt
            </span>
          </div>
        </div>
      )}

      {/* Role Filter Tabs */}
      <div className="flex gap-1 mb-5 p-1 bg-bg-surface rounded-2xl border border-border-1">
        {[
          { id: "ALL", label: "Tous les membres" },
          { id: "JOUEUR", label: "Joueurs BCSN" },
          { id: "SUPPORTER", label: "Supporters" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterRole(tab.id as any)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              filterRole === tab.id
                ? "bg-bg-card text-text-1 shadow-md border border-border-2"
                : "text-text-3 hover:text-text-2"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* My Rank Sticky Quick Bar */}
      {myEntry && myRank && (
        <div className="card p-3.5 mb-5 anim-slide bg-gradient-to-r from-primary-soft/40 via-bg-card to-bcsn-blue-soft/30 border border-primary/40 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-sm shadow-md">
              #{myRank}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-text-1">Votre position actuelle</span>
                <span className="badge badge-joueur text-[8px] py-0 px-1">Vous</span>
              </div>
              <p className="text-[10px] text-text-3 font-medium mt-0.5">
                {myEntry.pseudo} · {myEntry._count.predictions} prono{myEntry._count.predictions > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-lg font-black text-primary-text tabular-nums">
              {myEntry.totalScore}
            </span>
            <span className="text-[10px] text-text-4 font-bold block">points</span>
          </div>
        </div>
      )}

      {/* Olympic 3D Podium */}
      {top3.length > 0 && (
        <div className="mb-6 anim-slide delay-1">
          <div className="flex items-end justify-center gap-2 pt-4 pb-2 px-1">
            {podiumOrder.map((idx) => {
              const entry = top3[idx];
              if (!entry) return null;
              const rc = rankColors[idx];
              const isFirst = idx === 0;
              const isMe = entry.id === currentUserId;

              return (
                <div
                  key={entry.id}
                  className={`flex flex-col items-center ${isFirst ? "mb-3" : ""}`}
                  style={{ width: isFirst ? "38%" : "30%" }}
                >
                  {/* Crown for 1st */}
                  {isFirst && (
                    <div className="mb-1 anim-float">
                      <div className="w-8 h-8 rounded-full bg-gold-soft border border-gold/40 flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <Crown size={18} className="text-gold fill-gold" />
                      </div>
                    </div>
                  )}

                  {/* 2nd / 3rd Medal */}
                  {!isFirst && (
                    <div className="mb-1 text-center">
                      <Medal size={14} className={rc.text} />
                    </div>
                  )}

                  {/* Avatar with Halo */}
                  <div
                    className={`
                      avatar ${isFirst ? "avatar-xl" : "avatar-lg"}
                      ${rc.bg} ring-2 ${rc.ring} ${rc.border}
                      ${isMe ? "ring-primary ring-offset-2 ring-offset-bg-base" : ""}
                      mb-2 anim-scale delay-2 shadow-xl relative
                    `}
                  >
                    {entry.avatarEmoji}
                  </div>

                  {/* Pseudo */}
                  <p
                    className={`text-xs font-black text-center leading-tight mb-0.5 truncate w-full ${
                      isMe ? "text-primary-text" : "text-text-1"
                    }`}
                  >
                    {entry.pseudo}
                  </p>

                  {/* Form Dots */}
                  <div className="mb-1">
                    <FormDots form={entry.recentForm} streak={entry.streak} />
                  </div>

                  {/* Role badge */}
                  <span
                    className={`badge mb-1.5 text-[8px] py-0 px-1.5 ${
                      entry.role === "JOUEUR" ? "badge-joueur" : "badge-supporter"
                    }`}
                  >
                    {entry.role === "JOUEUR" ? "Joueur" : "Supporter"}
                  </span>

                  {/* Score */}
                  <p className={`text-xl font-black ${rc.text} tabular-nums font-mono`}>
                    {entry.totalScore}
                  </p>
                  <p className="text-[9px] text-text-4 font-bold uppercase">pts</p>

                  {/* 3D Podium Base Pedestal */}
                  <div
                    className={`w-full ${rc.bg} border-t-2 ${rc.border} rounded-t-2xl mt-2.5 shadow-lg flex items-center justify-center`}
                    style={{ height: isFirst ? 70 : idx === 1 ? 50 : 36 }}
                  >
                    <span className={`text-xs font-black ${rc.text}`}>
                      {rc.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Rest of Leaderboard Rows */}
      {rest.length > 0 && (
        <div className="flex flex-col gap-2 mb-6">
          {rest.map((entry, i) => {
            const isMe = entry.id === currentUserId;
            const rank = i + 4;

            return (
              <div
                key={entry.id}
                className={`
                  card px-4 py-3.5 flex items-center gap-3 anim-fade
                  ${isMe ? "!border-primary/50 !bg-primary-soft/15 ring-1 ring-primary/30" : ""}
                `}
                style={{ animationDelay: `${200 + i * 30}ms` }}
              >
                {/* Rank Digit */}
                <span className="text-xs font-black text-text-3 w-6 text-center tabular-nums font-mono">
                  #{rank}
                </span>

                {/* Avatar */}
                <div className="avatar avatar-sm bg-bg-surface border border-border-1 shrink-0">
                  {entry.avatarEmoji}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p
                      className={`text-xs font-extrabold truncate ${
                        isMe ? "text-primary-text" : "text-text-1"
                      }`}
                    >
                      {entry.pseudo}
                    </p>
                    <span
                      className={`badge text-[8px] py-0 px-1.5 ${
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
                  <p className="text-base font-black text-text-1 tabular-nums font-mono">
                    {entry.totalScore}
                  </p>
                  <p className="text-[9px] text-text-4 font-bold uppercase">pts</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {filteredLeaderboard.length === 0 && (
        <div className="text-center py-16 card-elevated p-6 anim-fade">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-bg-surface flex items-center justify-center mb-3">
            <Trophy size={28} className="text-text-4" />
          </div>
          <h3 className="text-base font-black text-text-1 mb-1">
            Aucun joueur dans cette catégorie
          </h3>
          <p className="text-xs text-text-3">
            Sois le premier à pronostiquer pour ouvrir le classement !
          </p>
        </div>
      )}
    </div>
  );
}
