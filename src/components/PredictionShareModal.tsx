"use client";

import { useRef, useEffect, useState } from "react";
import { X, Share2, Download, Copy, Check, Sparkles } from "lucide-react";
import { getClubLogoPath } from "@/lib/clubsData";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userPseudo: string;
  avatarEmoji: string;
  opponentName: string;
  predictedBcsn: number;
  predictedOpponent: number;
  matchDate: string;
  isHome: boolean;
}

export default function PredictionShareModal({
  isOpen,
  onClose,
  userPseudo,
  avatarEmoji,
  opponentName,
  predictedBcsn,
  predictedOpponent,
  matchDate,
  isHome,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Draw card on HTML5 Canvas (600x600 px high quality)
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 600;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background Gradient (Dark Emerald to Midnight Slate)
    const bgGradient = ctx.createLinearGradient(0, 0, 600, 600);
    bgGradient.addColorStop(0, "#064e3b");
    bgGradient.addColorStop(0.5, "#090d16");
    bgGradient.addColorStop(1, "#022c22");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 600, 600);

    // Decorative background circles
    ctx.fillStyle = "rgba(16, 185, 129, 0.08)";
    ctx.beginPath();
    ctx.arc(100, 100, 180, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(500, 500, 220, 0, Math.PI * 2);
    ctx.fill();

    // Central Card Container
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.strokeStyle = "rgba(16, 185, 129, 0.3)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(40, 40, 520, 520, 32);
    ctx.fill();
    ctx.stroke();

    // Top Header Badge
    ctx.fillStyle = "#10b981";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🏀 BASKET CLUB DE SAINT-NICOLAS", 300, 85);

    // User Info (Avatar & Pseudo)
    ctx.fillStyle = "#f8fafc";
    ctx.font = "900 24px sans-serif";
    ctx.fillText(`${avatarEmoji} PRONOSTIC DE ${userPseudo.toUpperCase()}`, 300, 125);

    // Match Details
    const matchLabel = isHome
      ? `BCSN vs ${opponentName}`
      : `${opponentName} vs BCSN`;
    ctx.fillStyle = "#94a3b8";
    ctx.font = "600 15px sans-serif";
    ctx.fillText(matchLabel, 300, 155);

    // Score Display Box
    ctx.fillStyle = "rgba(2, 6, 23, 0.7)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(80, 185, 440, 220, 24);
    ctx.fill();
    ctx.stroke();

    // Team 1 Name & Score
    ctx.fillStyle = "#34d399";
    ctx.font = "900 18px sans-serif";
    ctx.fillText("BCSN", 190, 230);

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 72px sans-serif";
    ctx.fillText(String(predictedBcsn), 190, 320);

    // VS Separator
    ctx.fillStyle = "#64748b";
    ctx.font = "900 36px sans-serif";
    ctx.fillText("–", 300, 310);

    // Team 2 Name & Score
    const oppShort = opponentName.split(" ")[0].toUpperCase();
    ctx.fillStyle = "#f43f5e";
    ctx.font = "900 18px sans-serif";
    ctx.fillText(oppShort, 410, 230);

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 72px sans-serif";
    ctx.fillText(String(predictedOpponent), 410, 320);

    // Prediction Status Badge
    const bcsnWins = predictedBcsn > predictedOpponent;
    ctx.fillStyle = bcsnWins ? "rgba(16, 185, 129, 0.2)" : "rgba(244, 63, 94, 0.2)";
    ctx.beginPath();
    ctx.roundRect(140, 350, 320, 36, 12);
    ctx.fill();

    ctx.fillStyle = bcsnWins ? "#34d399" : "#fb7185";
    ctx.font = "bold 14px sans-serif";
    const statusText = bcsnWins
      ? `🔥 Victoire BCSN de +${predictedBcsn - predictedOpponent} pts`
      : `⚠️ Victoire ${oppShort} de +${predictedOpponent - predictedBcsn} pts`;
    ctx.fillText(statusText, 300, 373);

    // Footer Watermark
    ctx.fillStyle = "#64748b";
    ctx.font = "600 14px sans-serif";
    ctx.fillText("Et toi, quel est ton pronostic ? 🏆", 300, 480);

    ctx.fillStyle = "#10b981";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("bcsn-pronos.netlify.app", 300, 510);

    // Export image URL
    setImageUrl(canvas.toDataURL("image/png"));
  }, [isOpen, userPseudo, avatarEmoji, opponentName, predictedBcsn, predictedOpponent, isHome]);

  if (!isOpen) return null;

  const handleNativeShare = async () => {
    if (!imageUrl) return;

    try {
      // Convert DataURL to Blob/File for Web Share API
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const file = new File([blob], "prono-bcsn.png", { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Mon Pronostic BCSN",
          text: `Mon prono pour ${isHome ? `BCSN vs ${opponentName}` : `${opponentName} vs BCSN`} : ${predictedBcsn} - ${predictedOpponent} ! 🏀`,
        });
      } else {
        // Fallback: Copy share link/text
        handleCopyText();
      }
    } catch (err) {
      handleCopyText();
    }
  };

  const handleCopyText = () => {
    const text = `🏀 Mon pronostic BCSN vs ${opponentName} : ${predictedBcsn} - ${predictedOpponent} ! Rejoins-nous sur l'application BCSN Pronos ! 🏆`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadImage = () => {
    if (!imageUrl) return;
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `prono-bcsn-${userPseudo}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md anim-fade">
      <div className="relative w-full max-w-sm bg-bg-card rounded-3xl p-5 shadow-2xl border border-border-1 anim-slide">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-4 hover:text-text-1 w-8 h-8 rounded-full bg-bg-surface flex items-center justify-center z-10"
        >
          <X size={16} />
        </button>

        {/* Modal Title */}
        <div className="text-center mb-4">
          <span className="badge badge-open text-[10px] mb-1.5 inline-flex items-center gap-1">
            <Sparkles size={10} /> Carte Réseaux Sociaux
          </span>
          <h3 className="text-base font-black text-text-1">
            Partager mon pronostic
          </h3>
          <p className="text-xs text-text-3 mt-0.5">
            Partage ton visuel sur WhatsApp ou Instagram !
          </p>
        </div>

        {/* Rendered Preview Card Image */}
        {imageUrl ? (
          <div className="relative rounded-2xl overflow-hidden shadow-2xl mb-4 border border-emerald-500/30 group">
            <img src={imageUrl} alt="Mon Prono BCSN" className="w-full h-auto object-contain" />
          </div>
        ) : (
          <div className="w-full h-64 rounded-2xl bg-bg-surface flex items-center justify-center text-xs text-text-3 mb-4">
            Génération de la carte...
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleNativeShare}
            className="btn-primary w-full py-3 text-xs font-black flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-indigo-600 shadow-lg"
          >
            <Share2 size={16} />
            Partager sur WhatsApp / Instagram
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDownloadImage}
              className="btn-secondary py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <Download size={14} />
              Télécharger PNG
            </button>

            <button
              onClick={handleCopyText}
              className="btn-secondary py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
            >
              {copied ? <Check size={14} className="text-primary-text" /> : <Copy size={14} />}
              {copied ? "Copié !" : "Copier texte"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
