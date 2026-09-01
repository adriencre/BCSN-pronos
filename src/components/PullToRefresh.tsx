"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

export default function PullToRefresh({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const startY = useRef(0);
  const isPulling = useRef(false);
  const pullDistanceRef = useRef(0);
  const isRefreshingRef = useRef(false);

  const THRESHOLD = 70;

  useEffect(() => {
    isRefreshingRef.current = isRefreshing;
  }, [isRefreshing]);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY <= 0 && !isRefreshingRef.current) {
        startY.current = e.touches[0].clientY;
        isPulling.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling.current || isRefreshingRef.current) return;

      const currentY = e.touches[0].clientY;
      const diff = currentY - startY.current;

      if (diff > 0 && window.scrollY <= 0) {
        const resistance = Math.min(diff * 0.45, 95);
        pullDistanceRef.current = resistance;
        setPullDistance(resistance);
      } else {
        pullDistanceRef.current = 0;
        setPullDistance(0);
      }
    };

    const handleTouchEnd = () => {
      if (!isPulling.current) return;
      isPulling.current = false;

      if (pullDistanceRef.current >= THRESHOLD && !isRefreshingRef.current) {
        setIsRefreshing(true);
        isRefreshingRef.current = true;
        setPullDistance(THRESHOLD);

        router.refresh();

        setTimeout(() => {
          setIsRefreshing(false);
          isRefreshingRef.current = false;
          setPullDistance(0);
          pullDistanceRef.current = 0;
        }, 800);
      } else {
        setPullDistance(0);
        pullDistanceRef.current = 0;
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [router]);

  return (
    <div className="relative">
      {/* Pull To Refresh Indicator Bar */}
      <div
        className="fixed left-0 right-0 z-50 flex items-center justify-center pointer-events-none transition-transform duration-150 will-change-transform"
        style={{
          top: "max(8px, env(safe-area-inset-top, 8px))",
          transform: `translateY(${isRefreshing ? 12 : pullDistance > 0 ? pullDistance - 45 : -65}px)`,
          opacity: pullDistance > 10 || isRefreshing ? 1 : 0,
        }}
      >
        <div className="bg-bg-card/90 backdrop-blur-md border border-border-1 px-4 py-2 rounded-full shadow-xl flex items-center gap-2 text-xs font-bold text-primary-text">
          <RefreshCw
            size={16}
            className={`text-primary-text ${
              isRefreshing || pullDistance >= THRESHOLD ? "animate-spin" : ""
            }`}
            style={{
              transform: isRefreshing ? undefined : `rotate(${pullDistance * 4}deg)`,
            }}
          />
          <span>
            {isRefreshing
              ? "Mise à jour..."
              : pullDistance >= THRESHOLD
              ? "Relâchez pour actualiser"
              : "Tirez pour actualiser"}
          </span>
        </div>
      </div>

      {children}
    </div>
  );
}
