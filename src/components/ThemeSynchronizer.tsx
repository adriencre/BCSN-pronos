"use client";

import { useEffect } from "react";

export default function ThemeSynchronizer({ initialTheme }: { initialTheme?: string }) {
  useEffect(() => {
    try {
      const stored = localStorage.getItem("bcsn_theme");
      const activeTheme = stored || initialTheme || "dark";

      if (activeTheme === "light") {
        document.documentElement.classList.add("light");
      } else {
        document.documentElement.classList.remove("light");
      }

      // Ensure cookie matches for SSR
      document.cookie = `bcsn_theme=${activeTheme}; path=/; max-age=31536000; SameSite=Lax`;
    } catch (e) {
      console.warn("Theme sync warning:", e);
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "bcsn_theme") {
        if (e.newValue === "light") {
          document.documentElement.classList.add("light");
        } else {
          document.documentElement.classList.remove("light");
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [initialTheme]);

  return null;
}
