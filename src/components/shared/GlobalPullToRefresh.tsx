import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type TouchEvent as ReactTouchEvent,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import InlineLoader from "@/components/shared/InlineLoader";
import { TW_BREAKPOINT_LG_PX, useMinWidth } from "@/lib/hooks/useMediaQuery";

const PULL_TO_REFRESH_THRESHOLD_PX = 72;
const PULL_TO_REFRESH_MAX_PX = 112;
const PULL_TO_REFRESH_DAMPING = 0.45;

type GlobalPullToRefreshProps = {
  children: ReactNode;
};

export function GlobalPullToRefresh({ children }: GlobalPullToRefreshProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const isDesktop = useMinWidth(TW_BREAKPOINT_LG_PX);
  const pullContainerRef = useRef<HTMLDivElement | null>(null);
  const pullStartYRef = useRef<number | null>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);

  const canUsePullToRefresh = !isDesktop;
  const pullReadyToRefresh = pullDistance >= PULL_TO_REFRESH_THRESHOLD_PX;
  const pullIndicatorMessage = isPullRefreshing
    ? t("common.loading")
    : pullReadyToRefresh
      ? t("common.pullToRefreshRelease")
      : t("common.pullToRefreshPull");

  const resetPullState = useCallback(() => {
    pullStartYRef.current = null;
    setIsPulling(false);
    setPullDistance(0);
  }, []);

  const handleTouchStart = useCallback(
    (event: ReactTouchEvent<HTMLDivElement>) => {
      if (!canUsePullToRefresh || isPullRefreshing) return;
      if (event.touches.length !== 1) return;
      if (window.scrollY > 0) return;

      pullStartYRef.current = event.touches[0].clientY;
      setIsPulling(true);
    },
    [canUsePullToRefresh, isPullRefreshing]
  );

  useEffect(() => {
    const el = pullContainerRef.current;
    if (!el) return;

    const listener = (event: TouchEvent) => {
      const startY = pullStartYRef.current;
      if (!canUsePullToRefresh || !isPulling || startY == null || isPullRefreshing) return;

      if (window.scrollY > 0) {
        resetPullState();
        return;
      }

      if (event.touches.length !== 1) return;

      const deltaY = event.touches[0].clientY - startY;
      if (deltaY <= 0) {
        setPullDistance(0);
        return;
      }

      const nextDistance = Math.min(PULL_TO_REFRESH_MAX_PX, deltaY * PULL_TO_REFRESH_DAMPING);
      setPullDistance(nextDistance);
      if (event.cancelable) event.preventDefault();
    };

    el.addEventListener("touchmove", listener, { passive: false });
    return () => el.removeEventListener("touchmove", listener);
  }, [canUsePullToRefresh, isPulling, isPullRefreshing, resetPullState]);

  const triggerPullRefresh = useCallback(async () => {
    setIsPullRefreshing(true);
    try {
      await queryClient.refetchQueries({ type: "active" });
    } finally {
      setIsPullRefreshing(false);
      resetPullState();
    }
  }, [queryClient, resetPullState]);

  const handleTouchEnd = useCallback(() => {
    if (!isPulling || isPullRefreshing) return;
    if (pullReadyToRefresh) {
      void triggerPullRefresh();
      return;
    }
    resetPullState();
  }, [isPulling, isPullRefreshing, pullReadyToRefresh, resetPullState, triggerPullRefresh]);

  return (
    <div
      ref={pullContainerRef}
      className="flex min-h-screen flex-col [touch-action:pan-y]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={resetPullState}
    >
      <div
        aria-live="polite"
        className="overflow-hidden px-4 text-center text-xs text-muted-foreground transition-[height] duration-150 lg:hidden"
        style={{ height: canUsePullToRefresh && (pullDistance > 0 || isPullRefreshing) ? 40 : 0 }}
      >
        <div className="flex h-10 items-center justify-center gap-2">
          {isPullRefreshing ? <InlineLoader size="sm" /> : null}
          <span>{pullIndicatorMessage}</span>
        </div>
      </div>
      {children}
    </div>
  );
}
