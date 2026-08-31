"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, Target, User, ShieldCheck } from "lucide-react";

interface BottomTabBarProps {
  userRole?: string;
}

export default function BottomTabBar({ userRole }: BottomTabBarProps) {
  const pathname = usePathname();

  const isAdmin = userRole === "ADMIN" || userRole === "COACH";

  const tabs = [
    { href: "/matchs", icon: Target, label: "Pronostic" },
    { href: "/classement", icon: Trophy, label: "Classement" },
    { href: "/profil", icon: User, label: "Profil" },
  ];

  if (isAdmin) {
    tabs.push({ href: "/admin", icon: ShieldCheck, label: "Gestion" });
  }

  return (
    <nav className="tab-bar" id="bottom-tab-bar">
      <div className="flex items-center justify-around py-2.5 px-4 max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href || (tab.href !== "/matchs" && pathname.startsWith(tab.href + "/"));
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              prefetch={true}
              id={`tab-${tab.label.toLowerCase()}`}
              className="flex flex-col items-center gap-1 py-1.5 px-3 transition-all duration-150 active:scale-95"
            >
              <div
                className={`p-1.5 rounded-xl transition-all duration-150 ${
                  isActive ? "bg-primary-soft scale-105" : ""
                }`}
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.2 : 1.5}
                  className={`transition-colors duration-150 ${
                    isActive ? "text-primary-text" : "text-text-4"
                  }`}
                />
              </div>
              <span
                className={`text-[10px] font-semibold transition-colors duration-150 ${
                  isActive ? "text-primary-text font-bold" : "text-text-4"
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
