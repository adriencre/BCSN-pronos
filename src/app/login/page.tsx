"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, LogIn, UserPlus, AlertCircle, Camera, Check, Shield, Trophy } from "lucide-react";
import { loginUser, registerUser } from "@/lib/actions";
import { AVATAR_OPTIONS } from "@/lib/constants";
import UserAvatar from "@/components/UserAvatar";

export default function LoginPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pinInputRefs = [
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
  ];

  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [pseudo, setPseudo] = useState("");
  const [pinDigits, setPinDigits] = useState<string[]>(["", "", "", ""]);
  const [role, setRole] = useState<"SUPPORTER" | "JOUEUR">("SUPPORTER");
  const [avatar, setAvatar] = useState("🏀");
  const [error, setError] = useState("");

  const pin = pinDigits.join("");

  const handlePinChange = (index: number, value: string) => {
    const lastChar = value.slice(-1);
    if (value && !/^\d$/.test(lastChar)) return;

    const newDigits = [...pinDigits];
    newDigits[index] = lastChar;
    setPinDigits(newDigits);

    // Auto-focus next box if digit entered
    if (lastChar && index < 3) {
      pinInputRefs[index + 1].current?.focus();
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pinDigits[index] && index > 0) {
      pinInputRefs[index - 1].current?.focus();
    }
  };

  const handlePinPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!pastedData) return;

    const newDigits = ["", "", "", ""];
    for (let i = 0; i < pastedData.length; i++) {
      newDigits[i] = pastedData[i];
    }
    setPinDigits(newDigits);
    const nextFocusIndex = Math.min(pastedData.length, 3);
    pinInputRefs[nextFocusIndex].current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setError("Le code PIN doit comporter 4 chiffres");
      return;
    }
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
    <div className="min-h-screen bg-bg-base flex flex-col justify-between px-5 py-8 max-w-md mx-auto relative select-none">
      {/* Top Club Identity */}
      <div className="pt-4 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-white p-1.5 shadow-xl border border-white/10 flex items-center justify-center mb-3.5 overflow-hidden">
          <img
            src="/logos/bcsn.jpg"
            alt="BCSN"
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-xl font-black tracking-tight text-text-1">
          BCSN PRONOS
        </h1>
        <p className="text-xs text-text-3 font-medium mt-0.5">
          Basket Club de Saint-Nicolas · Saison 2026–2027
        </p>
      </div>

      {/* Main Authentication Container */}
      <div className="my-auto py-6">
        {/* Clean Segmented Mode Selector */}
        <div className="flex p-1 bg-bg-surface rounded-2xl border border-border-1 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError("");
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
              mode === "login"
                ? "bg-bg-card text-text-1 shadow-sm border border-border-2"
                : "text-text-3 hover:text-text-2"
            }`}
          >
            Se connecter
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError("");
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
              mode === "register"
                ? "bg-bg-card text-text-1 shadow-sm border border-border-2"
                : "text-text-3 hover:text-text-2"
            }`}
          >
            Créer un compte
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pseudo Field */}
          <div>
            <label className="text-[11px] font-bold text-text-3 uppercase tracking-wider block mb-1.5">
              Pseudo
            </label>
            <div className="relative">
              <User
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-text-4"
              />
              <input
                type="text"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                placeholder="Ex: Adrien, Thomas, Hugo..."
                className="input pl-11 text-sm font-semibold"
                required
                minLength={2}
                maxLength={16}
                autoCapitalize="none"
                autoCorrect="off"
              />
            </div>
          </div>

          {/* 4-Box PIN Code Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-text-3 uppercase tracking-wider">
                Code PIN (4 chiffres)
              </label>
              <span className="text-[10px] text-text-4">Confidentiel</span>
            </div>

            <div className="flex items-center justify-between gap-2.5">
              {[0, 1, 2, 3].map((index) => (
                <input
                  key={index}
                  ref={pinInputRefs[index]}
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={pinDigits[index]}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  onKeyDown={(e) => handlePinKeyDown(index, e)}
                  onPaste={handlePinPaste}
                  className={`w-full h-14 rounded-2xl bg-bg-surface border-2 text-center text-xl font-black font-mono tracking-widest text-text-1 outline-none transition-all ${
                    pinDigits[index]
                      ? "border-primary bg-bg-card shadow-sm"
                      : "border-border-1 focus:border-primary/60 focus:bg-bg-card"
                  }`}
                  aria-label={`Chiffre ${index + 1} du code PIN`}
                />
              ))}
            </div>
          </div>

          {/* Registration Specific Fields */}
          {mode === "register" && (
            <div className="space-y-4 pt-1 anim-fade">
              {/* Role Selection */}
              <div>
                <label className="text-[11px] font-bold text-text-3 uppercase tracking-wider block mb-1.5">
                  Statut au sein du club
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("SUPPORTER")}
                    className={`py-3 px-3 rounded-2xl border text-left transition-all ${
                      role === "SUPPORTER"
                        ? "bg-gold-soft border-gold/40 text-gold shadow-sm"
                        : "bg-bg-surface border-border-1 text-text-3 hover:border-border-2"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-black text-text-1">Supporter</span>
                      <Trophy size={14} className={role === "SUPPORTER" ? "text-gold" : "text-text-4"} />
                    </div>
                    <p className="text-[10px] text-text-4">Fan & Public BCSN</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("JOUEUR")}
                    className={`py-3 px-3 rounded-2xl border text-left transition-all ${
                      role === "JOUEUR"
                        ? "bg-primary-soft border-primary/40 text-primary-text shadow-sm"
                        : "bg-bg-surface border-border-1 text-text-3 hover:border-border-2"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-black text-text-1">Joueur</span>
                      <Shield size={14} className={role === "JOUEUR" ? "text-primary-text" : "text-text-4"} />
                    </div>
                    <p className="text-[10px] text-text-4">Licencié de l&apos;équipe</p>
                  </button>
                </div>
              </div>

              {/* Photo & Avatar Customization */}
              <div>
                <label className="text-[11px] font-bold text-text-3 uppercase tracking-wider block mb-1.5">
                  Photo de profil (optionnel)
                </label>

                <div className="flex items-center gap-3 bg-bg-surface p-3 rounded-2xl border border-border-1">
                  <div className="w-12 h-12 rounded-2xl bg-bg-card border border-border-2 overflow-hidden flex items-center justify-center shrink-0">
                    <UserAvatar avatar={avatar} className="w-full h-full text-2xl" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                      id="register-photo-file"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-secondary py-1.5 px-3 text-xs font-bold flex items-center gap-1.5"
                      >
                        <Camera size={13} />
                        <span>{isCustomPhoto ? "Changer" : "Ma photo"}</span>
                      </button>
                      {isCustomPhoto && (
                        <button
                          type="button"
                          onClick={() => setAvatar("🏀")}
                          className="text-[11px] font-bold text-text-4 hover:text-accent"
                        >
                          Réinitialiser
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Emojis selection chips */}
                {!isCustomPhoto && (
                  <div className="flex items-center gap-1.5 overflow-x-auto py-2 px-0.5 mt-1 no-scrollbar">
                    {AVATAR_OPTIONS.slice(0, 12).map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setAvatar(emoji)}
                        className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-sm transition-all ${
                          avatar === emoji
                            ? "bg-primary-soft ring-2 ring-primary scale-105"
                            : "bg-bg-surface hover:bg-bg-card opacity-70 hover:opacity-100"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-2xl bg-accent-soft text-accent text-xs font-bold flex items-center gap-2 border border-accent/20 anim-fade">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending || pin.length !== 4 || pseudo.trim().length < 2}
            className="btn-primary w-full py-4 text-xs font-black flex items-center justify-center gap-2 mt-4 shadow-xl"
          >
            {mode === "login" ? (
              <>
                <LogIn size={16} />
                <span>{isPending ? "Connexion..." : "Accéder à l'application"}</span>
              </>
            ) : (
              <>
                <UserPlus size={16} />
                <span>{isPending ? "Création du compte..." : "Valider mon inscription"}</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Bottom Footer Security Stamp */}
      <div className="text-center pt-4 pb-2 border-t border-border-1/50">
        <p className="text-[11px] text-text-4 font-semibold">
          Basket Club de Saint-Nicolas-lez-Arras · Sécurisé
        </p>
      </div>
    </div>
  );
}
