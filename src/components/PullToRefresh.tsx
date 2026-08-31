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

  const THRESHOLD = 70; // minimum pixels to trigger refresh

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      // Only trigger pull to refresh when scrolled at the top
      if (window.scrollY <= 0) {
        startY.current = e.touches[0].clientY;
        isPulling.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling.current || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const diff = currentY - startY.current;

      // Only pull down
      if (diff > 0 && window.scrollY <= 0) {
        // Apply resistance physics
        const resistance = Math.min(diff * 0.45, 100);
        setPullDistance(resistance);
      } else {
        setPullDistance(0);
      }
    };

    const handleTouchEnd = () => {
      if (!isPulling.current) return;
      isPulling.current = false;

      if (pullDistance >= THRESHOLD && !isRefreshing) {
        setIsRefreshing(true);
        setPullDistance(THRESHOLD);
        
        // Trigger Next.js router refresh
        router.refresh();

        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 1000);
      } else {
        setPullDistance(0);
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [pullDistance, isRefreshing, router]);

  return (
    <div className="relative">
      {/* Pull To Refresh Indicator Bar */}
      <div
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center pointer-events-none transition-transform duration-200"
        style={{
          transform: `translateY(${isRefreshing ? 16 : pullDistance > 0 ? pullDistance - 40 : -60}px)`,
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
