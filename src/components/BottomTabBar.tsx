"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, Target, User, Shield, ShieldCheck } from "lucide-react";

interface BottomTabBarProps {
  userRole?: string;
}

export default function BottomTabBar({ userRole }: BottomTabBarProps) {
  const pathname = usePathname();

  const isAdmin = userRole === "ADMIN" || userRole === "COACH";

  const tabs = [
    { href: "/matchs", icon: Target, label: "Pronos" },
    { href: "/classement", icon: Trophy, label: "Classement" },
    { href: "/clubs", icon: Shield, label: "Clubs" },
    { href: "/profil", icon: User, label: "Profil" },
  ];

  if (isAdmin) {
    tabs.push({ href: "/admin", icon: ShieldCheck, label: "Admin" });
  }

  return (
    <nav className="tab-bar" id="bottom-tab-bar" aria-label="Navigation principale">
      <div className="flex items-center justify-between py-1.5 px-1.5 w-full max-w-sm mx-auto shadow-2xl">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (tab.href !== "/matchs" && pathname.startsWith(tab.href + "/"));
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              prefetch={true}
              id={`tab-${tab.label.toLowerCase()}`}
              className="relative flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 transition-all duration-200 active:scale-90 group select-none"
            >
              <div
                className={`p-1.5 sm:p-2 rounded-2xl transition-all duration-300 relative flex items-center justify-center ${
                  isActive
                    ? "bg-gradient-to-b from-primary/25 to-primary/10 text-primary-text shadow-[0_0_15px_rgba(16,185,129,0.3)] scale-105"
                    : "text-text-3 group-hover:text-text-2 group-hover:bg-white/5"
                }`}
              >
                <Icon
                  size={19}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={`transition-all duration-200 ${
                    isActive ? "text-primary-text drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" : ""
                  }`}
                />
                {/* Active glow dot */}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_#10B981]" />
                )}
              </div>
              <span
                className={`text-[10px] tracking-tight mt-0.5 transition-colors duration-200 text-center truncate max-w-full ${
                  isActive ? "text-primary-text font-bold" : "text-text-3 font-medium group-hover:text-text-2"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
