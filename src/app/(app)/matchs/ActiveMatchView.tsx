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
        setCountdown(active.isVotingOpen ? "Votes fermés" : "Ouverture imminente");
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      if (d > 0) {
        setCountdown(`${d}j ${h}h ${m}min`);
      } else if (h > 0) {
        setCountdown(`${h}h ${m}min ${s}s`);
      } else {
        setCountdown(`${m}min ${s}s`);
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
        }, 1000);
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
        <div className="text-center py-20 anim-fade">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-bg-surface flex items-center justify-center mb-4">
            <CalendarClock size={28} className="text-text-3" />
          </div>
          <h2 className="text-lg font-bold text-text-1 mb-2">
            Aucun match à venir
          </h2>
          <p className="text-sm text-text-3 max-w-[260px] mx-auto">
            Le prochain match n&apos;a pas encore été programmé. Reviens bientôt !
          </p>
        </div>
      </div>
    );
  }

  const match = active.match;
  const votingOpen = active.isVotingOpen;
  const participantCount = match.predictions.length;
  const activeOpponentLogo = getClubLogoPath(match.opponent);
  const bcsnLogo = getClubLogoPath("bcsn") || "/logos/bcsn.jpg";

  // Community Trends Calculation
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

  return (
    <div className="px-5 pt-6 pb-12">
      {/* Club Profile Modal Overlay */}
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

      {/* POP-UP MODAL POUR PLACER SON PRONO (ACCESSIBLE SEULEMENT SI PAS ENCORE DE PRONO) */}
      {isModalOpen && !existingPrediction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md anim-fade">
          <div className="relative w-full max-w-sm bg-bg-card rounded-3xl p-5 shadow-2xl border border-border-1 anim-slide">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-text-4 hover:text-text-1 w-8 h-8 rounded-full bg-bg-surface flex items-center justify-center"
            >
              <X size={16} />
            </button>

            <div className="text-center mb-4">
              <span className="badge badge-open text-[10px] mb-2 inline-flex items-center gap-1">
                <Sparkles size={10} /> Pronostic Officiel BCSN
              </span>
              <h3 className="text-base font-black text-text-1">
                Placer votre pari
              </h3>
              <p className="text-xs text-text-3 mt-0.5">
                {match.isHome ? `BCSN vs ${match.opponent}` : `${match.opponent} vs BCSN`}
              </p>
            </div>

            {/* Score Inputs Stepper */}
            <div className="flex items-center justify-center gap-4 my-5 bg-bg-surface p-4 rounded-2xl border border-border-1">
              <ScoreInput label="BCSN" value={scoreBcsn} onChange={setScoreBcsn} />
              <div className="text-xl font-bold text-text-4 mt-8">–</div>
              <ScoreInput
                label={match.opponent.split(" ")[0].toUpperCase()}
                value={scoreOpp}
                onChange={setScoreOpp}
              />
            </div>

            {/* Live Summary */}
            <div className="bg-bg-surface rounded-xl p-3 mb-4 text-center border border-border-1">
              <span className="text-[11px] text-text-3 block mb-0.5">Votre pronostic :</span>
              <span className="text-sm font-black text-primary-text tabular-nums">
                BCSN {scoreBcsn} – {scoreOpp} {match.opponent.split(" ")[0]}
              </span>
            </div>

            {/* Message Feedback */}
            {message && (
              <div
                className={`flex items-center gap-2 p-3 rounded-xl mb-4 text-xs font-medium ${
                  message.type === "success"
                    ? "bg-primary-soft text-primary-text"
                    : "bg-accent-soft text-accent"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle size={16} />
                ) : (
                  <AlertCircle size={16} />
                )}
                {message.text}
              </div>
            )}

            {/* Confirm button */}
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="btn-primary w-full py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-lg"
            >
              <Send size={16} />
              {isPending ? "Enregistrement..." : "Valider mon pronostic"}
            </button>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="flex items-center justify-between mb-6 anim-fade">
        <div>
          <h1 className="text-lg font-bold text-text-1">Prochain Match</h1>
          <p className="text-xs text-text-3 mt-0.5">
            {match.matchday > 0 ? `Journée ${match.matchday}` : "Match amical / Coupe"}
          </p>
        </div>
        {votingOpen ? (
          <div className="badge badge-open">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-text anim-pulse" />
            Votes ouverts
          </div>
        ) : (
          <div className="badge badge-closed">
            <Clock size={10} />
            Ouverture prochaine
          </div>
        )}
      </div>

      {/* Hero Match Card */}
      <div className="card-elevated p-5 mb-4 anim-slide delay-1">
        {/* Location + Time */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5 text-text-3">
            <MapPin size={12} />
            <span className="text-xs font-semibold">
              {match.isHome ? "Domicile (Saint-Nicolas)" : "Extérieur"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-text-3">
            <Clock size={12} />
            <span className="text-xs font-semibold">{formatTime(match.dateTime)}</span>
          </div>
        </div>

        {/* Teams Display with crisp logos */}
        <div className="flex items-center justify-between gap-3 mb-5">
          {/* BCSN Logo Box */}
          <div
            onClick={() => setSelectedClubId("bcsn")}
            className="flex-1 flex flex-col items-center cursor-pointer group"
          >
            <div className="w-16 h-16 rounded-2xl bg-white p-1.5 shadow-md flex items-center justify-center mb-2 border border-border-1 group-hover:scale-105 transition-transform overflow-hidden shrink-0">
              <img
                src={bcsnLogo}
                alt="BCSN"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-xs font-bold text-text-1 leading-tight text-center">
              Basket Club
              <br />
              de Saint Nicolas
            </p>
            <span className="text-[10px] text-primary-text font-bold mt-1">Fiche Club →</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-extrabold text-text-4 uppercase tracking-widest bg-bg-surface px-2.5 py-1 rounded-md">
              VS
            </span>
          </div>

          {/* Opponent Logo Box */}
          <div
            onClick={() => setSelectedClubId(match.opponent.split(" ")[0].toLowerCase())}
            className="flex-1 flex flex-col items-center cursor-pointer group"
          >
            <div className="w-16 h-16 rounded-2xl bg-white p-1.5 shadow-md flex items-center justify-center mb-2 border border-border-1 group-hover:scale-105 transition-transform overflow-hidden shrink-0">
              {activeOpponentLogo ? (
                <img
                  src={activeOpponentLogo}
                  alt={match.opponent}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full rounded-xl bg-accent-soft/30 flex items-center justify-center">
                  <span className="text-2xl">🏀</span>
                </div>
              )}
            </div>
            <p className="text-xs font-bold text-text-1 leading-tight text-center max-w-[120px] truncate">
              {match.opponent}
            </p>
            <span className="text-[10px] text-primary-text font-bold mt-1">Fiche Club →</span>
          </div>
        </div>

        {/* Date & Countdown bar */}
        <div className="bg-bg-surface rounded-xl px-4 py-2.5 flex items-center justify-between mb-4 border border-border-1">
          <span className="text-xs text-text-2 capitalize font-bold">
            {formatDate(match.dateTime)}
          </span>
          {countdown && (
            <span className="text-xs font-bold text-primary-text tabular-nums">
              {votingOpen ? `Clôture: ${countdown}` : `Ouverture dans: ${countdown}`}
            </span>
          )}
        </div>

        {/* MAIN CTA BUTTON: PLACER VOTRE PARI (VISIBLE UNIQUEMENT SI AUCUN PARI ENCORE PLACÉ) */}
        {votingOpen && !existingPrediction && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary w-full py-3.5 text-sm font-extrabold flex items-center justify-center gap-2 shadow-xl bg-gradient-to-r from-primary via-emerald-500 to-indigo-600 hover:scale-[1.01] transition-all"
          >
            <Sparkles size={18} />
            Placer votre pari
          </button>
        )}
      </div>

      {/* Prediction already submitted (IMMUTABLE & LOCKED) - NOW PLACED ABOVE COMMUNITY TRENDS */}
      {existingPrediction && (
        <div className="card p-5 mb-4 anim-slide delay-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-primary-text" />
              <h2 className="text-sm font-bold text-text-1">Votre pari enregistré</h2>
            </div>
            <span className="badge badge-open text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Lock size={10} /> Pari définitif & verrouillé
            </span>
          </div>

          <div className="bg-bg-surface rounded-xl p-4 flex items-center justify-center gap-6 border border-border-1 mb-4">
            <div className="text-center">
              <p className="text-[10px] font-bold text-text-3 uppercase tracking-wider mb-1">
                BCSN
              </p>
              <p className="text-3xl font-black text-text-1 tabular-nums">
                {existingPrediction.predictedBcsn}
              </p>
            </div>
            <span className="text-xl text-text-4 font-bold">–</span>
            <div className="text-center">
              <p className="text-[10px] font-bold text-text-3 uppercase tracking-wider mb-1 max-w-[100px] truncate">
                {match.opponent.split(" ")[0].toUpperCase()}
              </p>
              <p className="text-3xl font-black text-text-1 tabular-nums">
                {existingPrediction.predictedOpponent}
              </p>
            </div>
          </div>

          <p className="text-[11px] text-text-3 text-center mb-3 font-medium">
            🔒 Votre pronostic est validé. Il ne peut plus être modifié.
          </p>

          {/* Social Share Button */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="btn-secondary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 text-primary-text border-primary/30 hover:bg-primary-soft/20"
          >
            <Share2 size={15} />
            Partager mon pronostic (WhatsApp / Insta)
          </button>
        </div>
      )}

      {/* Community Trends Card (Tendances de la Communauté) */}
      <div className="card p-4 mb-4 anim-slide delay-2 border border-border-1">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary-soft text-primary-text flex items-center justify-center">
              <BarChart3 size={15} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-text-1">Tendances de la Communauté</h3>
              <p className="text-[10px] text-text-4">Basé sur {totalVotes} pronostic{totalVotes > 1 ? "s" : ""}</p>
            </div>
          </div>
          <span className="text-xs font-black text-primary-text bg-primary-soft px-2 py-0.5 rounded-md">
            {bcsnWinPercent}% BCSN
          </span>
        </div>

        {/* Dual Progress Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-[11px] font-bold text-text-2 mb-1">
            <span className="text-primary-text">Victoire BCSN ({bcsnWinPercent}%)</span>
            <span className="text-accent">{oppWinPercent}% {match.opponent.split(" ")[0]}</span>
          </div>
          <div className="w-full h-3 bg-bg-surface rounded-full overflow-hidden flex border border-border-1 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-primary rounded-l-full transition-all duration-500"
              style={{ width: `${bcsnWinPercent}%` }}
            />
            <div
              className="h-full bg-gradient-to-r from-accent to-rose-600 rounded-r-full transition-all duration-500"
              style={{ width: `${oppWinPercent}%` }}
            />
          </div>
        </div>

        {/* Average predicted score */}
        <div className="bg-bg-surface p-2.5 rounded-xl flex items-center justify-between border border-border-1 text-xs">
          <span className="text-text-3 font-semibold flex items-center gap-1.5">
            <TrendingUp size={14} className="text-primary-text" />
            Score moyen pronostiqué :
          </span>
          <span className="font-black text-text-1 tabular-nums">
            BCSN <strong className="text-primary-text">{avgBcsnScore}</strong> – <strong className="text-text-1">{avgOppScore}</strong> {match.opponent.split(" ")[0]}
          </span>
        </div>
      </div>

      {/* Not voted and voting closed */}
      {!votingOpen && !existingPrediction && (
        <div className="card p-5 mb-4 anim-slide delay-2 text-center">
          <div className="w-10 h-10 mx-auto rounded-xl bg-bg-surface flex items-center justify-center mb-3">
            <CalendarClock size={20} className="text-primary-text" />
          </div>
          <h3 className="text-sm font-bold text-text-1 mb-1">
            Les votes ouvrent bientôt !
          </h3>
          <p className="text-xs text-text-3 mb-3">
            Rendez-vous le <strong className="text-text-1">{formatFullDateTime(active.opensAt)}</strong> pour valider votre pronostic.
          </p>
          <div className="bg-bg-surface rounded-xl p-3 text-xs text-text-3 inline-block border border-border-1">
            ⏳ Heure du match : <span className="font-bold text-text-1">{formatFullDateTime(match.dateTime)}</span>
          </div>
        </div>
      )}

      {/* Upcoming matches schedule */}
      {upcomingMatches.length > 0 && (
        <div className="mt-6 anim-slide delay-3">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={14} className="text-text-3" />
            <h3 className="text-xs font-semibold text-text-3 uppercase tracking-wider">
              Calendrier des prochains matchs ({upcomingMatches.length})
            </h3>
          </div>
          <div className="flex flex-col gap-2">
            {upcomingMatches.map((m) => {
              const opensAtDate = getMatchOpeningDate(m.dateTime);
              const isCurrent = m.id === match.id;
              const oppLogo = getClubLogoPath(m.opponent);

              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedClubId(m.opponent.split(" ")[0].toLowerCase())}
                  className={`card p-3 flex items-center justify-between cursor-pointer hover:border-primary/40 transition-all ${
                    isCurrent ? "ring-2 ring-primary/40 bg-primary-soft/10" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white p-1 shadow-sm border border-border-1 flex items-center justify-center overflow-hidden shrink-0">
                      {oppLogo ? (
                        <img src={oppLogo} alt={m.opponent} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-sm">🏀</span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-text-1 flex items-center gap-1">
                        {m.matchday > 0 ? `J${m.matchday} · ` : ""}
                        {m.isHome ? `vs ${m.opponent}` : `à ${m.opponent}`}
                        <Info size={11} className="text-text-4" />
                      </p>
                      <p className="text-[10px] text-text-4 mt-0.5">
                        {m.isHome ? "Domicile" : "Extérieur"} · {formatTime(m.dateTime)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    {isCurrent && votingOpen ? (
                      <span className="badge badge-open text-[10px]">
                        En cours
                      </span>
                    ) : (
                      <span className="text-[10px] text-text-4 font-medium block">
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

      {/* Recent past matches */}
      {pastMatches.length > 0 && (
        <div className="mt-6 mb-6 anim-slide delay-4">
          <div className="flex items-center gap-2 mb-3">
            <History size={14} className="text-text-3" />
            <h3 className="text-xs font-semibold text-text-3 uppercase tracking-wider">
              Résultats récents
            </h3>
          </div>
          <div className="flex flex-col gap-2">
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
                  className="card px-4 py-3 flex items-center justify-between cursor-pointer hover:border-primary/40 transition-all anim-fade"
                  style={{ animationDelay: `${300 + i * 60}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-1.5 h-8 rounded-full ${
                        won
                          ? "bg-primary"
                          : lost
                          ? "bg-accent"
                          : "bg-text-4"
                      }`}
                    />
                    <div className="w-9 h-9 rounded-xl bg-white p-1 shadow-sm border border-border-1 flex items-center justify-center overflow-hidden shrink-0">
                      {oppLogo ? (
                        <img src={oppLogo} alt={m.opponent} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-xs">🏀</span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-text-1">
                        {m.isHome ? "BCSN" : m.opponent}
                        <span className="text-text-3 font-normal mx-1">vs</span>
                        {m.isHome ? m.opponent : "BCSN"}
                      </p>
                      <p className="text-[10px] text-text-4 mt-0.5">
                        {m.matchday > 0 ? `J${m.matchday} · ` : ""}
                        {new Date(m.dateTime).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                  </div>
                  <span className="text-base font-bold text-text-1 tabular-nums">
                    {m.scoreBcsn} – {m.scoreOpponent}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
