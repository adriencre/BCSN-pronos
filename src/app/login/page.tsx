"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, LogIn, UserPlus, AlertCircle } from "lucide-react";
import { loginUser, registerUser } from "@/lib/actions";
import { AVATAR_OPTIONS } from "@/lib/constants";

export default function LoginPage() {
  const router = useRouter();
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

  return (
    <div className="min-h-screen bg-bg-base bg-texture flex flex-col items-center justify-center px-6">
      {/* Brand */}
      <div className="text-center mb-10 anim-fade">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-soft flex items-center justify-center mb-4">
          <span className="text-3xl">🏀</span>
        </div>
        <h1 className="text-2xl font-black text-text-1 tracking-tight">
          BCSN Pronos
        </h1>
        <p className="text-xs text-text-3 mt-1.5">
          Basket Club de Saint Nicolas
        </p>
      </div>

      {/* Form */}
      <div className="w-full max-w-sm card-elevated p-6 anim-slide delay-1">
        {/* Mode toggle */}
        <div className="flex gap-1 mb-6 p-1 bg-bg-surface rounded-xl">
          <button
            onClick={() => { setMode("login"); setError(""); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              mode === "login"
                ? "bg-bg-card text-text-1 shadow-sm"
                : "text-text-3 hover:text-text-2"
            }`}
            id="mode-login"
          >
            Connexion
          </button>
          <button
            onClick={() => { setMode("register"); setError(""); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              mode === "register"
                ? "bg-bg-card text-text-1 shadow-sm"
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
            <label className="text-[10px] font-semibold text-text-3 uppercase tracking-widest mb-1.5 block">
              Pseudo
            </label>
            <div className="relative">
              <User
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-4"
              />
              <input
                type="text"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                placeholder="Ton pseudo"
                className="input pl-10"
                required
                minLength={2}
                maxLength={16}
                id="input-pseudo"
              />
            </div>
          </div>

          {/* PIN */}
          <div>
            <label className="text-[10px] font-semibold text-text-3 uppercase tracking-widest mb-1.5 block">
              Code PIN
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-4"
              />
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]{4}"
                value={pin}
                onChange={(e) => handlePinInput(e.target.value)}
                placeholder="4 chiffres"
                className="input pl-10 tracking-[0.3em]"
                required
                maxLength={4}
                id="input-pin"
              />
            </div>
            {/* PIN dots */}
            <div className="flex justify-center gap-2.5 mt-3">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    i < pin.length ? "bg-primary scale-125" : "bg-text-4/30"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Registration-only fields */}
          {mode === "register" && (
            <>
              {/* Role */}
              <div className="anim-fade">
                <label className="text-[10px] font-semibold text-text-3 uppercase tracking-widest mb-1.5 block">
                  Tu es...
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("SUPPORTER")}
                    className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                      role === "SUPPORTER"
                        ? "bg-gold-soft text-gold border border-gold/20"
                        : "bg-bg-surface text-text-3 border border-transparent"
                    }`}
                  >
                    Supporter
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("JOUEUR")}
                    className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                      role === "JOUEUR"
                        ? "bg-primary-soft text-primary-text border border-primary/20"
                        : "bg-bg-surface text-text-3 border border-transparent"
                    }`}
                  >
                    Joueur BCSN
                  </button>
                </div>
              </div>

              {/* Avatar */}
              <div className="anim-fade">
                <label className="text-[10px] font-semibold text-text-3 uppercase tracking-widest mb-1.5 block">
                  Avatar
                </label>
                <div className="grid grid-cols-6 gap-1.5">
                  {avatarOptions.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setAvatar(emoji)}
                      className={`w-full aspect-square rounded-xl flex items-center justify-center text-lg transition-all ${
                        avatar === emoji
                          ? "bg-primary-soft ring-2 ring-primary/30"
                          : "bg-bg-surface hover:bg-bg-card"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-accent-soft text-accent text-sm font-medium anim-fade">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending || pin.length !== 4}
            className={`btn-primary flex items-center justify-center gap-2 mt-1 ${
              pin.length !== 4 ? "!opacity-30" : ""
            }`}
            id="submit-auth"
          >
            {mode === "login" ? (
              <>
                <LogIn size={16} />
                {isPending ? "Connexion..." : "Se connecter"}
              </>
            ) : (
              <>
                <UserPlus size={16} />
                {isPending ? "Création..." : "Créer mon compte"}
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer */}
      <p className="text-[10px] text-text-4 mt-8 anim-fade delay-3">
        Basket Club de Saint Nicolas © {new Date().getFullYear()}
      </p>
    </div>
  );
}
