"use client";

import { useEffect, useState } from "react";
import { X, Share2, Download, Copy, Check, Sparkles, Trophy } from "lucide-react";

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
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Draw high-resolution social card on HTML5 Canvas (800x800 px)
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 800;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background Gradient (Deep Obsidian Night to Stadium Emerald)
    const bgGradient = ctx.createRadialGradient(400, 200, 50, 400, 400, 500);
    bgGradient.addColorStop(0, "#0E2A20");
    bgGradient.addColorStop(0.5, "#070D18");
    bgGradient.addColorStop(1, "#03060B");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 800, 800);

    // Decorative stadium court lines & aura
    ctx.strokeStyle = "rgba(16, 185, 129, 0.12)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(400, 400, 260, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.beginPath();
    ctx.moveTo(50, 400);
    ctx.lineTo(750, 400);
    ctx.stroke();

    // Central Card Container
    ctx.fillStyle = "rgba(14, 21, 36, 0.88)";
    ctx.strokeStyle = "rgba(16, 185, 129, 0.35)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(50, 50, 700, 700, 36);
    ctx.fill();
    ctx.stroke();

    // Top Header Badge
    ctx.fillStyle = "#10B981";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🏀 BASKET CLUB DE SAINT-NICOLAS · PRONOSTIC OFFICIEL", 400, 110);

    // User Info (Avatar & Pseudo)
    const isImage =
      typeof avatarEmoji === "string" &&
      (avatarEmoji.startsWith("data:image/") ||
        avatarEmoji.startsWith("http://") ||
        avatarEmoji.startsWith("https://"));

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "900 32px sans-serif";
    const headerTitle = isImage
      ? `PRONOSTIC DE ${userPseudo.toUpperCase()}`
      : `${avatarEmoji} PRONOSTIC DE ${userPseudo.toUpperCase()}`;
    ctx.fillText(headerTitle, 400, 165);


    // Match Details
    const matchLabel = isHome
      ? `BCSN vs ${opponentName} (Domicile)`
      : `${opponentName} vs BCSN (Extérieur)`;
    ctx.fillStyle = "#94A3B8";
    ctx.font = "600 18px sans-serif";
    ctx.fillText(matchLabel, 400, 205);

    // Score Display Box
    ctx.fillStyle = "rgba(7, 10, 17, 0.9)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(90, 240, 620, 280, 28);
    ctx.fill();
    ctx.stroke();

    // Team 1 Name & Score
    ctx.fillStyle = "#34D399";
    ctx.font = "900 22px sans-serif";
    ctx.fillText("BCSN", 240, 295);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "900 96px sans-serif";
    ctx.fillText(String(predictedBcsn), 240, 405);

    // VS Separator
    ctx.fillStyle = "#64748B";
    ctx.font = "900 48px sans-serif";
    ctx.fillText("–", 400, 395);

    // Team 2 Name & Score
    const oppShort = opponentName.split(" ")[0].toUpperCase();
    ctx.fillStyle = "#F43F5E";
    ctx.font = "900 22px sans-serif";
    ctx.fillText(oppShort, 560, 295);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "900 96px sans-serif";
    ctx.fillText(String(predictedOpponent), 560, 405);

    // Prediction Status Pill
    const bcsnWins = predictedBcsn > predictedOpponent;
    const diff = Math.abs(predictedBcsn - predictedOpponent);
    ctx.fillStyle = bcsnWins ? "rgba(16, 185, 129, 0.25)" : "rgba(244, 63, 94, 0.25)";
    ctx.beginPath();
    ctx.roundRect(160, 445, 480, 48, 16);
    ctx.fill();

    ctx.fillStyle = bcsnWins ? "#34D399" : "#FB7185";
    ctx.font = "bold 18px sans-serif";
    const statusText = bcsnWins
      ? `🔥 Prédiction : Victoire BCSN de +${diff} pts`
      : `⚠️ Prédiction : Victoire ${oppShort} de +${diff} pts`;
    ctx.fillText(statusText, 400, 476);

    // Footer Call To Action
    ctx.fillStyle = "#F59E0B";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText("🏆 Et toi, quel est ton pronostic pour ce match ?", 400, 600);

    ctx.fillStyle = "#94A3B8";
    ctx.font = "500 15px sans-serif";
    ctx.fillText("Rejoins la communauté BCSN et gagne des points !", 400, 635);

    // App URL stamp
    ctx.fillStyle = "#10B981";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText("bcsn-pronos.netlify.app", 400, 680);

    setImageUrl(canvas.toDataURL("image/png"));
  }, [isOpen, userPseudo, avatarEmoji, opponentName, predictedBcsn, predictedOpponent, isHome]);

  if (!isOpen) return null;

  const handleNativeShare = async () => {
    if (!imageUrl) return;

    try {
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
        handleCopyText();
      }
    } catch {
      handleCopyText();
    }
  };

  const handleCopyText = () => {
    const text = `🏀 Mon pronostic BCSN vs ${opponentName} : ${predictedBcsn} - ${predictedOpponent} ! Rejoins-nous sur l'application BCSN Pronos ! 🏆 https://bcsn-pronos.netlify.app`;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl anim-fade">
      <div className="relative w-full max-w-sm card-elevated p-5 shadow-2xl border border-border-2 anim-scale">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-4 hover:text-text-1 w-9 h-9 rounded-full bg-bg-surface flex items-center justify-center z-10 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Modal Title */}
        <div className="text-center mb-4">
          <span className="badge badge-open text-[10px] mb-2 inline-flex items-center gap-1">
            <Sparkles size={11} className="text-primary-text" /> Carte Réseaux Sociaux HD
          </span>
          <h3 className="text-lg font-black text-text-1">
            Partager mon pronostic
          </h3>
          <p className="text-xs text-text-3 mt-0.5">
            Publie ton visuel officiel sur WhatsApp ou Story Instagram !
          </p>
        </div>

        {/* Rendered Preview Card Image */}
        {imageUrl ? (
          <div className="relative rounded-2xl overflow-hidden shadow-2xl mb-4 border border-primary/30 group">
            <img src={imageUrl} alt="Mon Prono BCSN" className="w-full h-auto object-contain" />
          </div>
        ) : (
          <div className="w-full h-64 rounded-2xl bg-bg-surface flex items-center justify-center text-xs text-text-3 mb-4">
            Génération de la carte HD...
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={handleNativeShare}
            className="btn-primary w-full py-3.5 text-xs font-black flex items-center justify-center gap-2 shadow-xl"
          >
            <Share2 size={16} />
            Partager sur WhatsApp / Instagram
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDownloadImage}
              className="btn-secondary py-3 text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <Download size={15} />
              Enregistrer PNG
            </button>

            <button
              onClick={handleCopyText}
              className="btn-secondary py-3 text-xs font-bold flex items-center justify-center gap-1.5"
            >
              {copied ? <Check size={15} className="text-primary-text" /> : <Copy size={15} />}
              {copied ? "Copié !" : "Copier le texte"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
