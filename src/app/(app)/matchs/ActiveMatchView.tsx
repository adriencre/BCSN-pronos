"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  MapPin,
  Send,
  CheckCircle,
  AlertCircle,
  Lock,
  CalendarClock,
  History,
  Users,
  Calendar,
  Info,
  BarChart3,
  TrendingUp,
  X,
  Sparkles,
  Share2,
  Flame,
  Trophy,
  ArrowRight,
  Shield,
} from "lucide-react";
import ScoreInput from "@/components/ScoreInput";
import ClubProfileModal from "@/components/ClubProfileModal";
import PredictionShareModal from "@/components/PredictionShareModal";
import { submitPrediction } from "@/lib/actions";
import { getClubLogoPath } from "@/lib/clubsData";

interface ActiveMatchViewProps {
  active: {
    match: {
      id: number;
      opponent: string;
      dateTime: string;
      isHome: boolean;
      scoreBcsn: number | null;
      scoreOpponent: number | null;
      status: string;
      matchday: number;
      createdAt: string;
      predictions: Array<{
        id: number;
        userId: number;
        predictedBcsn: number;
        predictedOpponent: number;
        user: { id: number; pseudo: string; avatarEmoji: string; role: string };
      }>;
    };
    opensAt: string;
    closesAt: string;
    isVotingOpen: boolean;
  } | null;
  existingPrediction: {
    id: number;
    predictedBcsn: number;
    predictedOpponent: number;
    pointsEarned: number;
  } | null;
  currentUserId: number;
  upcomingMatches?: Array<{
    id: number;
    opponent: string;
    dateTime: string;
    isHome: boolean;
    matchday: number;
  }>;
  pastMatches: Array<{
    id: number;
    opponent: string;
    dateTime: string;
    isHome: boolean;
    scoreBcsn: number | null;
    scoreOpponent: number | null;
    matchday: number;
  }>;
  currentUserPseudo?: string;
  currentUserAvatar?: string;
}

export default function ActiveMatchView({
  active,
  existingPrediction,
  currentUserId,
  upcomingMatches = [],
  pastMatches = [],
  currentUserPseudo = "Supporter",
  currentUserAvatar = "🏀",
}: ActiveMatchViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);

  // Prediction Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [scoreBcsn, setScoreBcsn] = useState(78);
  const [scoreOpp, setScoreOpp] = useState(72);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [countdown, setCountdown] = useState("");

  // Countdown timer
  useEffect(() => {
    if (!active) return;
    const target = active.isVotingOpen
      ? new Date(active.closesAt).getTime()
      : new Date(active.opensAt).getTime();

    const tick = () => {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        setCountdown(active.isVotingOpen ? "Clôturé" : "Imminent");
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      if (d > 0) {
        setCountdown(`${d}j ${h}h ${m}m`);
      } else if (h > 0) {
        setCountdown(`${h}h ${m}m ${s}s`);
      } else {
        setCountdown(`${m}m ${s}s`);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [active]);

  const handleSubmit = () => {
    if (!active) return;
    startTransition(async () => {
      const result = await submitPrediction(active.match.id, scoreBcsn, scoreOpp);
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({
          type: "success",
          text: "Pronostic enregistré avec succès !",
        });
        setTimeout(() => {
          setIsModalOpen(false);
          setIsShareModalOpen(true);
          router.refresh();
        }, 800);
      }
    });
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

  const formatFullDateTime = (d: string) =>
    new Date(d).toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const getMatchOpeningDate = (dateTimeStr: string) => {
    const matchDate = new Date(dateTimeStr);
    const opensAt = new Date(matchDate);
    const day = opensAt.getDay();
    const daysFromMonday = day === 0 ? 6 : day - 1;
    opensAt.setDate(opensAt.getDate() - daysFromMonday);
    opensAt.setHours(0, 0, 0, 0);
    return opensAt;
  };

  if (!active) {
    return (
      <div className="px-5 pt-8">
        <div className="text-center py-20 card-elevated p-8 anim-fade">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-primary-soft border border-primary/30 flex items-center justify-center mb-4">
            <CalendarClock size={36} className="text-primary-text" />
          </div>
          <h2 className="text-xl font-black text-text-1 mb-2">
            Aucun match à venir
          </h2>
          <p className="text-xs text-text-3 max-w-[280px] mx-auto leading-relaxed">
            Le prochain match du BCSN n&apos;a pas encore été programmé par le coach. Reviens très vite !
          </p>
        </div>
      </div>
    );
  }

  const match = active.match;
  const votingOpen = active.isVotingOpen;
  const activeOpponentLogo = getClubLogoPath(match.opponent);
  const bcsnLogo = getClubLogoPath("bcsn") || "/logos/bcsn.jpg";

  // Community Trends
  const totalVotes = match.predictions.length;
  const bcsnWinVotes = match.predictions.filter((p) => p.predictedBcsn > p.predictedOpponent).length;
  const oppWinVotes = match.predictions.filter((p) => p.predictedOpponent > p.predictedBcsn).length;

  const bcsnWinPercent = totalVotes > 0 ? Math.round((bcsnWinVotes / totalVotes) * 100) : 80;
  const oppWinPercent = totalVotes > 0 ? 100 - bcsnWinPercent : 20;

  const avgBcsnScore =
    totalVotes > 0
      ? Math.round(match.predictions.reduce((acc, p) => acc + p.predictedBcsn, 0) / totalVotes)
      : 78;
  const avgOppScore =
    totalVotes > 0
      ? Math.round(match.predictions.reduce((acc, p) => acc + p.predictedOpponent, 0) / totalVotes)
      : 72;

  const predictedDiff = Math.abs(scoreBcsn - scoreOpp);
  const bcsnFavored = scoreBcsn > scoreOpp;

  return (
    <div className="px-4 pt-4 pb-12">
      {/* Club Profile Modal Drawer */}
      <ClubProfileModal
        clubId={selectedClubId}
        onClose={() => setSelectedClubId(null)}
        pastMatches={pastMatches}
      />

      {/* Social Media Share Card Modal */}
      {existingPrediction && (
        <PredictionShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          userPseudo={currentUserPseudo}
          avatarEmoji={currentUserAvatar}
          opponentName={match.opponent}
          predictedBcsn={existingPrediction.predictedBcsn}
          predictedOpponent={existingPrediction.predictedOpponent}
          matchDate={match.dateTime}
          isHome={match.isHome}
        />
      )}

      {/* POP-UP MODAL POUR PLACER SON PRONO */}
      {isModalOpen && !existingPrediction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl anim-fade">
          <div className="relative w-full max-w-sm card-elevated p-6 shadow-2xl border border-border-2 anim-scale">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-text-4 hover:text-text-1 w-9 h-9 rounded-full bg-bg-surface flex items-center justify-center transition-colors"
            >
              <X size={18} />
            </button>

            <div className="text-center mb-5">
              <span className="badge badge-open text-[10px] mb-2 inline-flex items-center gap-1">
                <Sparkles size={11} className="text-primary-text" /> Pronostic Match Officiel
              </span>
              <h3 className="text-lg font-black text-text-1">
                Placer votre pari
              </h3>
              <p className="text-xs text-text-3 mt-0.5 font-medium">
                {match.isHome ? `BCSN vs ${match.opponent}` : `${match.opponent} vs BCSN`}
              </p>
            </div>

            {/* Score Inputs Stepper */}
            <div className="flex items-center justify-center gap-3 my-4 bg-bg-surface p-4 rounded-2xl border border-border-1">
              <ScoreInput
                label="BCSN"
                value={scoreBcsn}
                onChange={setScoreBcsn}
                teamLogo={bcsnLogo}
              />
              <div className="text-2xl font-black text-text-4 mt-6">–</div>
              <ScoreInput
                label={match.opponent.split(" ")[0].toUpperCase()}
                value={scoreOpp}
                onChange={setScoreOpp}
                teamLogo={activeOpponentLogo}
              />
            </div>

            {/* Live Summary Callout */}
            <div className="bg-bg-card rounded-2xl p-3.5 mb-4 text-center border border-border-2">
              <span className="text-[10px] text-text-3 font-bold uppercase tracking-wider block mb-1">
                Aperçu de votre résultat :
              </span>
              <div className="flex items-center justify-center gap-2">
                <span className="text-base font-black text-text-1 tabular-nums">
                  BCSN <strong className="text-primary-text">{scoreBcsn}</strong> – <strong className="text-accent">{scoreOpp}</strong> {match.opponent.split(" ")[0]}
                </span>
              </div>
              <span className={`text-[11px] font-bold mt-1 block ${bcsnFavored ? "text-primary-text" : "text-accent"}`}>
                {bcsnFavored ? `🔥 Victoire BCSN de +${predictedDiff} pts` : `⚠️ Victoire ${match.opponent.split(" ")[0]} de +${predictedDiff} pts`}
              </span>
            </div>

            {/* Message Feedback */}
            {message && (
              <div
                className={`flex items-center gap-2 p-3 rounded-xl mb-4 text-xs font-semibold ${
                  message.type === "success"
                    ? "bg-primary-soft text-primary-text border border-primary/30"
                    : "bg-accent-soft text-accent border border-accent/30"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle size={16} />
                ) : (
                  <AlertCircle size={16} />
                )}
                <span>{message.text}</span>
              </div>
            )}

            {/* Confirm button */}
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="btn-primary w-full py-3.5 text-xs font-black flex items-center justify-center gap-2 shadow-xl"
            >
              <Send size={16} />
              <span>{isPending ? "Validation en cours..." : "Confirmer mon pronostic"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Player Snippet Bar */}
      <div className="flex items-center justify-between mb-4 bg-bg-card/70 backdrop-blur-md p-3 rounded-2xl border border-border-1 anim-fade">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-bcsn-blue p-0.5 shadow-md flex items-center justify-center text-lg shrink-0">
            <div className="w-full h-full rounded-[10px] bg-bg-surface flex items-center justify-center">
              {currentUserAvatar}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold text-text-1 leading-none">
                {currentUserPseudo}
              </span>
              <span className="text-[9px] font-black text-amber-400 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <Flame size={10} className="fill-amber-400 text-amber-400" /> 3
              </span>
            </div>
            <p className="text-[10px] text-text-3 font-medium mt-0.5">
              Prêt pour le choc du week-end
            </p>
          </div>
        </div>

        <button
          onClick={() => router.push("/classement")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-bg-surface hover:bg-bg-card border border-border-1 text-xs font-bold text-text-2 hover:text-text-1 transition-all"
        >
          <Trophy size={14} className="text-gold" />
          <span className="text-[11px]">Classement</span>
        </button>
      </div>

      {/* Hero Match Stadium Card */}
      <div className="card-elevated p-5 mb-4 anim-slide delay-1 relative overflow-hidden">
        {/* Stadium lighting glow overlay */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-gradient-to-b from-primary/20 via-primary/5 to-transparent rounded-full blur-2xl pointer-events-none" />

        {/* Header Venue & Matchday */}
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg-surface border border-border-1 text-[11px] font-bold text-text-2">
            <MapPin size={12} className="text-primary-text" />
            <span>{match.isHome ? "Domicile (Complexe Chantecler)" : "Extérieur"}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {votingOpen ? (
              <span className="badge badge-open">
                <span className="w-2 h-2 rounded-full bg-primary-text anim-pulse-glow" />
                Votes ouverts
              </span>
            ) : (
              <span className="badge badge-closed">
                <Clock size={11} />
                Fermé
              </span>
            )}
          </div>
        </div>

        {/* Teams Display with Pro Stadium Pods */}
        <div className="flex items-center justify-between gap-3 mb-6 relative z-10">
          {/* Team 1: BCSN */}
          <div
            onClick={() => setSelectedClubId("bcsn")}
            className="flex-1 flex flex-col items-center cursor-pointer group"
          >
            <div className="w-20 h-20 rounded-3xl bg-white p-2 shadow-xl flex items-center justify-center mb-2.5 border-2 border-primary/30 group-hover:scale-105 group-hover:border-primary transition-all overflow-hidden shrink-0 relative">
              <img
                src={bcsnLogo}
                alt="BCSN"
                className="w-full h-full object-contain"
              />
              <span className="absolute bottom-0 inset-x-0 bg-primary text-white text-[8px] font-black uppercase text-center py-0.5 tracking-wider">
                DOMICILE
              </span>
            </div>
            <p className="text-xs font-black text-text-1 text-center leading-tight">
              BCSN
            </p>
            <p className="text-[10px] text-text-3 font-semibold mt-0.5">Saint-Nicolas</p>
            <span className="text-[10px] text-primary-text font-bold mt-1 flex items-center gap-0.5 group-hover:underline">
              Fiche Scout <ArrowRight size={10} />
            </span>
          </div>

          {/* VS Center Badge */}
          <div className="flex flex-col items-center gap-1.5 shrink-0 px-1">
            <div className="w-10 h-10 rounded-2xl bg-bg-surface border border-border-2 flex items-center justify-center font-black text-xs text-text-3 shadow-inner">
              VS
            </div>
            <span className="text-[9px] font-bold text-text-4 uppercase tracking-wider">
              {match.matchday > 0 ? `Journée ${match.matchday}` : "Choc FFBB"}
            </span>
          </div>

          {/* Team 2: Opponent */}
          <div
            onClick={() => setSelectedClubId(match.opponent.split(" ")[0].toLowerCase())}
            className="flex-1 flex flex-col items-center cursor-pointer group"
          >
            <div className="w-20 h-20 rounded-3xl bg-white p-2 shadow-xl flex items-center justify-center mb-2.5 border-2 border-border-2 group-hover:scale-105 group-hover:border-accent transition-all overflow-hidden shrink-0 relative">
              {activeOpponentLogo ? (
                <img
                  src={activeOpponentLogo}
                  alt={match.opponent}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full rounded-2xl bg-accent-soft/30 flex items-center justify-center">
                  <span className="text-3xl">🏀</span>
                </div>
              )}
              <span className="absolute bottom-0 inset-x-0 bg-slate-800 text-white text-[8px] font-black uppercase text-center py-0.5 tracking-wider">
                ADVERSAIRE
              </span>
            </div>
            <p className="text-xs font-black text-text-1 text-center leading-tight truncate max-w-[120px]">
              {match.opponent}
            </p>
            <p className="text-[10px] text-text-3 font-semibold mt-0.5">Visiteur</p>
            <span className="text-[10px] text-primary-text font-bold mt-1 flex items-center gap-0.5 group-hover:underline">
              Fiche Scout <ArrowRight size={10} />
            </span>
          </div>
        </div>

        {/* Date & Countdown Flip Bar */}
        <div className="bg-bg-surface/90 backdrop-blur-md rounded-2xl px-4 py-3 flex items-center justify-between mb-4 border border-border-1 relative z-10">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-primary-text" />
            <span className="text-xs text-text-1 capitalize font-extrabold">
              {formatDate(match.dateTime)} · {formatTime(match.dateTime)}
            </span>
          </div>
          {countdown && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-black text-primary-text tabular-nums bg-primary-soft border border-primary/30 px-2 py-0.5 rounded-lg">
                ⏳ {countdown}
              </span>
            </div>
          )}
        </div>

        {/* MAIN CTA BUTTON: PLACER MON PRONOSTIC */}
        {votingOpen && !existingPrediction && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary w-full py-4 text-sm font-black flex items-center justify-center gap-2 shadow-xl relative z-10"
          >
            <Sparkles size={18} />
            <span>Placer mon pronostic maintenant</span>
          </button>
        )}
      </div>

      {/* Prediction Ticket Receipt (Validated & Locked) */}
      {existingPrediction && (
        <div className="ticket-receipt p-5 mb-4 anim-slide delay-2 border border-primary/40 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary-soft text-primary-text flex items-center justify-center font-black">
                <CheckCircle size={16} />
              </div>
              <div>
                <h3 className="text-xs font-black text-text-1">Votre Pronostic Officiel</h3>
                <p className="text-[10px] text-text-3">Enregistré dans la base du club</p>
              </div>
            </div>
            <span className="badge badge-open text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Lock size={10} /> Validé & Verrouillé
            </span>
          </div>

          <div className="bg-bg-surface rounded-2xl p-4 flex items-center justify-around border border-border-1 mb-4">
            <div className="text-center">
              <span className="text-[10px] font-extrabold text-primary-text uppercase tracking-wider block mb-1">
                BCSN
              </span>
              <p className="text-4xl font-black text-text-1 tabular-nums font-mono">
                {existingPrediction.predictedBcsn}
              </p>
            </div>
            <span className="text-2xl text-text-4 font-bold">–</span>
            <div className="text-center">
              <span className="text-[10px] font-extrabold text-accent uppercase tracking-wider block mb-1 max-w-[100px] truncate">
                {match.opponent.split(" ")[0]}
              </span>
              <p className="text-4xl font-black text-text-1 tabular-nums font-mono">
                {existingPrediction.predictedOpponent}
              </p>
            </div>
          </div>

          {/* Social Share Button */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="btn-primary w-full py-3 text-xs font-black flex items-center justify-center gap-2 shadow-lg"
          >
            <Share2 size={16} />
            <span>Partager ma carte officielle (WhatsApp / Insta)</span>
          </button>
        </div>
      )}

      {/* Community Trends Duel Bar */}
      <div className="card p-4 mb-4 anim-slide delay-2 border border-border-1">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary-soft text-primary-text flex items-center justify-center">
              <BarChart3 size={16} />
            </div>
            <div>
              <h3 className="text-xs font-black text-text-1">Tendances de la Communauté</h3>
              <p className="text-[10px] text-text-3">Basé sur {totalVotes} pronostic{totalVotes > 1 ? "s" : ""}</p>
            </div>
          </div>
          <span className="text-xs font-black text-primary-text bg-primary-soft px-2.5 py-1 rounded-lg border border-primary/30">
            {bcsnWinPercent}% BCSN
          </span>
        </div>

        {/* Dual Athletic Progress Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-[11px] font-bold text-text-2 mb-1.5">
            <span className="text-primary-text">Victoire BCSN ({bcsnWinPercent}%)</span>
            <span className="text-accent">{oppWinPercent}% {match.opponent.split(" ")[0]}</span>
          </div>
          <div className="w-full h-3.5 bg-bg-surface rounded-full overflow-hidden flex border border-border-1 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-primary via-emerald-400 to-primary-dark rounded-l-full transition-all duration-500 shadow-sm"
              style={{ width: `${bcsnWinPercent}%` }}
            />
            <div
              className="h-full bg-gradient-to-r from-accent via-rose-500 to-red-600 rounded-r-full transition-all duration-500 shadow-sm"
              style={{ width: `${oppWinPercent}%` }}
            />
          </div>
        </div>

        {/* Average projected score */}
        <div className="bg-bg-surface p-3 rounded-xl flex items-center justify-between border border-border-1 text-xs">
          <span className="text-text-3 font-semibold flex items-center gap-1.5">
            <TrendingUp size={14} className="text-primary-text" />
            Score moyen anticipé :
          </span>
          <span className="font-black text-text-1 tabular-nums">
            BCSN <strong className="text-primary-text">{avgBcsnScore}</strong> – <strong className="text-accent">{avgOppScore}</strong> {match.opponent.split(" ")[0]}
          </span>
        </div>
      </div>

      {/* Upcoming matches schedule timeline */}
      {upcomingMatches.length > 0 && (
        <div className="mt-6 anim-slide delay-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar size={15} className="text-primary-text" />
              <h3 className="text-xs font-black text-text-1 uppercase tracking-wider">
                Calendrier des Rencontres ({upcomingMatches.length})
              </h3>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            {upcomingMatches.map((m) => {
              const opensAtDate = getMatchOpeningDate(m.dateTime);
              const isCurrent = m.id === match.id;
              const oppLogo = getClubLogoPath(m.opponent);

              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedClubId(m.opponent.split(" ")[0].toLowerCase())}
                  className={`card p-3.5 flex items-center justify-between cursor-pointer hover:border-primary/50 transition-all ${
                    isCurrent ? "ring-2 ring-primary/40 bg-primary-soft/10" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-white p-1 shadow-sm border border-border-1 flex items-center justify-center overflow-hidden shrink-0">
                      {oppLogo ? (
                        <img src={oppLogo} alt={m.opponent} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-base">🏀</span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-text-1 flex items-center gap-1">
                        {m.matchday > 0 ? `J${m.matchday} · ` : ""}
                        {m.isHome ? `vs ${m.opponent}` : `à ${m.opponent}`}
                      </p>
                      <p className="text-[10px] text-text-3 font-semibold mt-0.5">
                        {m.isHome ? "Domicile" : "Extérieur"} · {formatTime(m.dateTime)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    {isCurrent && votingOpen ? (
                      <span className="badge badge-open text-[9px]">
                        En cours
                      </span>
                    ) : (
                      <span className="text-[10px] text-text-4 font-bold block">
                        Votes le {opensAtDate.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Match Results */}
      {pastMatches.length > 0 && (
        <div className="mt-6 anim-slide delay-4">
          <div className="flex items-center gap-2 mb-3">
            <History size={15} className="text-primary-text" />
            <h3 className="text-xs font-black text-text-1 uppercase tracking-wider">
              Derniers Résultats du Club
            </h3>
          </div>

          <div className="flex flex-col gap-2.5">
            {pastMatches.map((m, i) => {
              const won =
                m.scoreBcsn !== null &&
                m.scoreOpponent !== null &&
                m.scoreBcsn > m.scoreOpponent;
              const lost =
                m.scoreBcsn !== null &&
                m.scoreOpponent !== null &&
                m.scoreBcsn < m.scoreOpponent;
              const oppLogo = getClubLogoPath(m.opponent);

              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedClubId(m.opponent.split(" ")[0].toLowerCase())}
                  className="card px-4 py-3 flex items-center justify-between cursor-pointer hover:border-primary/40 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-9 rounded-full ${
                        won ? "bg-primary shadow-[0_0_8px_#10B981]" : lost ? "bg-accent shadow-[0_0_8px_#F43F5E]" : "bg-text-4"
                      }`}
                    />
                    <div className="w-10 h-10 rounded-xl bg-white p-1 shadow-sm border border-border-1 flex items-center justify-center overflow-hidden shrink-0">
                      {oppLogo ? (
                        <img src={oppLogo} alt={m.opponent} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-xs">🏀</span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-text-1">
                        {m.isHome ? "BCSN" : m.opponent}{" "}
                        <span className="text-text-4 font-normal">vs</span>{" "}
                        {m.isHome ? m.opponent : "BCSN"}
                      </p>
                      <p className="text-[10px] text-text-4 font-medium mt-0.5">
                        {m.matchday > 0 ? `Journée ${m.matchday} · ` : ""}
                        {new Date(m.dateTime).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-text-1 tabular-nums">
                      {m.scoreBcsn} – {m.scoreOpponent}
                    </span>
                    <span className={`text-[9px] font-black uppercase block ${won ? "text-primary-text" : "text-accent"}`}>
                      {won ? "Victoire" : "Défaite"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
