"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, LogIn, UserPlus, AlertCircle, Sparkles, Shield, Trophy, Camera, Trash2 } from "lucide-react";
import { loginUser, registerUser } from "@/lib/actions";
import { AVATAR_OPTIONS } from "@/lib/constants";
import UserAvatar from "@/components/UserAvatar";

export default function LoginPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [pseudo, setPseudo] = useState("");
  const [pin, setPin] = useState("");
  const [role, setRole] = useState<"SUPPORTER" | "JOUEUR">("SUPPORTER");
  const [avatar, setAvatar] = useState("🏀");
  const [error, setError] = useState("");

  const avatarOptions = AVATAR_OPTIONS;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      const result =
        mode === "login"
          ? await loginUser(pseudo, pin)
          : await registerUser(pseudo, pin, role, avatar);

      if (result.error) {
        setError(result.error);
      } else {
        router.push("/matchs");
        router.refresh();
      }
    });
  };

  const handlePinInput = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 4);
    setPin(cleaned);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const size = 256;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const minDim = Math.min(img.width, img.height);
        const startX = (img.width - minDim) / 2;
        const startY = (img.height - minDim) / 2;

        ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, size, size);
        const dataUrl = canvas.toDataURL("image/webp", 0.85);

        setAvatar(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const isCustomPhoto =
    avatar.startsWith("data:image/") ||
    avatar.startsWith("http://") ||
    avatar.startsWith("https://");

  return (
    <div className="min-h-screen bg-bg-base bg-texture flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background ambient lighting effects */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-bcsn-blue/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="text-center mb-8 anim-fade relative z-10">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-primary via-emerald-600 to-indigo-700 p-1 shadow-[0_0_30px_rgba(16,185,129,0.35)] flex items-center justify-center mb-4 anim-float">
          <div className="w-full h-full rounded-[22px] bg-slate-950 flex items-center justify-center shadow-inner">
            <span className="text-4xl">🏀</span>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft border border-primary/30 text-primary-text text-[11px] font-bold uppercase tracking-wider mb-2">
          <Sparkles size={12} /> Application Officielle
        </div>
        <h1 className="text-3xl font-black text-text-1 tracking-tight">
          BCSN Pronos
        </h1>
        <p className="text-xs text-text-3 font-medium mt-1">
          Basket Club de Saint-Nicolas-lez-Arras
        </p>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-sm card-elevated p-6 anim-slide delay-1 relative z-10 border border-border-2">
        {/* Mode toggle */}
        <div className="flex gap-1 mb-6 p-1.5 bg-bg-surface rounded-2xl border border-border-1">
          <button
            type="button"
            onClick={() => { setMode("login"); setError(""); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 ${
              mode === "login"
                ? "bg-bg-card text-text-1 shadow-md border border-border-2"
                : "text-text-3 hover:text-text-2"
            }`}
            id="mode-login"
          >
            Connexion
          </button>
          <button
            type="button"
            onClick={() => { setMode("register"); setError(""); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 ${
              mode === "register"
                ? "bg-bg-card text-text-1 shadow-md border border-border-2"
                : "text-text-3 hover:text-text-2"
            }`}
            id="mode-register"
          >
            Inscription
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Pseudo */}
          <div>
            <label className="text-[10px] font-bold text-text-3 uppercase tracking-wider mb-1.5 block">
              Pseudo joueur ou supporter
            </label>
            <div className="relative">
              <User
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-text-3"
              />
              <input
                type="text"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                placeholder="Ex: AdrienBCSN"
                className="input pl-11"
                required
                minLength={2}
                maxLength={16}
                id="input-pseudo"
              />
            </div>
          </div>

          {/* PIN */}
          <div>
            <label className="text-[10px] font-bold text-text-3 uppercase tracking-wider mb-1.5 block">
              Code PIN secret (4 chiffres)
            </label>
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-text-3"
              />
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]{4}"
                value={pin}
                onChange={(e) => handlePinInput(e.target.value)}
                placeholder="••••"
                className="input pl-11 text-center font-mono tracking-[0.4em] text-lg font-bold"
                required
                maxLength={4}
                id="input-pin"
              />
            </div>

            {/* Visual PIN Dots Indicator */}
            <div className="flex justify-center items-center gap-3 mt-3">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    i < pin.length
                      ? "bg-primary scale-125 shadow-[0_0_10px_#10B981]"
                      : "bg-border-2"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Registration Extra Fields */}
          {mode === "register" && (
            <>
              {/* Role Picker */}
              <div className="anim-fade space-y-1.5">
                <label className="text-[10px] font-bold text-text-3 uppercase tracking-wider block">
                  Ton statut au club
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRole("SUPPORTER")}
                    className={`p-3 rounded-2xl text-left transition-all border ${
                      role === "SUPPORTER"
                        ? "bg-gold-soft border-gold/40 text-gold shadow-md shadow-amber-500/10"
                        : "bg-bg-surface border-border-1 text-text-3 hover:border-border-2"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Trophy size={16} />
                      <span className="text-[9px] font-black uppercase">Supporter</span>
                    </div>
                    <p className="text-xs font-bold text-text-1">Supporter</p>
                    <p className="text-[10px] text-text-3 mt-0.5">Fan & Public BCSN</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("JOUEUR")}
                    className={`p-3 rounded-2xl text-left transition-all border ${
                      role === "JOUEUR"
                        ? "bg-primary-soft border-primary/40 text-primary-text shadow-md shadow-emerald-500/10"
                        : "bg-bg-surface border-border-1 text-text-3 hover:border-border-2"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Shield size={16} />
                      <span className="text-[9px] font-black uppercase">Équipe</span>
                    </div>
                    <p className="text-xs font-bold text-text-1">Joueur BCSN</p>
                    <p className="text-[10px] text-text-3 mt-0.5">Licencié du club</p>
                  </button>
                </div>
              </div>

              {/* Avatar / Photo Selector */}
              <div className="anim-fade space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-text-3 uppercase tracking-wider">
                    Photo de profil ou avatar
                  </label>
                  {isCustomPhoto && (
                    <button
                      type="button"
                      onClick={() => setAvatar("🏀")}
                      className="text-[10px] font-bold text-accent flex items-center gap-1"
                    >
                      <Trash2 size={11} /> Remettre un emoji
                    </button>
                  )}
                </div>

                {/* Custom Photo Button & Preview */}
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                    id="register-photo-input"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-secondary flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <Camera size={15} />
                    <span>{isCustomPhoto ? "Changer la photo" : "Importer ma photo"}</span>
                  </button>
                  {isCustomPhoto && (
                    <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-primary shrink-0">
                      <UserAvatar avatar={avatar} className="w-full h-full" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-6 gap-1.5 bg-bg-surface p-2 rounded-2xl border border-border-1">
                  {avatarOptions.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setAvatar(emoji)}
                      className={`aspect-square rounded-xl flex items-center justify-center text-lg transition-all ${
                        avatar === emoji
                          ? "bg-primary-soft ring-2 ring-primary scale-110 shadow-sm"
                          : "hover:bg-bg-card opacity-80 hover:opacity-100"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-accent-soft text-accent text-xs font-semibold border border-accent/20 anim-fade">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isPending || pin.length !== 4}
            className={`btn-primary flex items-center justify-center gap-2 mt-2 ${
              pin.length !== 4 ? "!opacity-40" : ""
            }`}
            id="submit-auth"
          >
            {mode === "login" ? (
              <>
                <LogIn size={18} />
                <span>{isPending ? "Connexion en cours..." : "Accéder à l'application"}</span>
              </>
            ) : (
              <>
                <UserPlus size={18} />
                <span>{isPending ? "Création du profil..." : "Créer mon compte joueur"}</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer Info */}
      <div className="text-center mt-6 anim-fade delay-3 relative z-10">
        <p className="text-[11px] text-text-3 font-semibold">
          Saison Régionale 2026–2027 · FFBB
        </p>
        <p className="text-[10px] text-text-4 mt-0.5">
          Basket Club de Saint-Nicolas © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
