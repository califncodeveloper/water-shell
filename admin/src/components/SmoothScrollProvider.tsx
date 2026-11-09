import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { useLocation } from 'react-router-dom';

interface ScrollToOptions {
  offset?: number;
  duration?: number;
  immediate?: boolean;
  easing?: (t: number) => number;
}

interface SmoothScrollContextType {
  lenis: Lenis | null;
  scrollTo: (
    target: string | number | HTMLElement,
    options?: ScrollToOptions
  ) => void;
  stop: () => void;
  start: () => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextType>({
  lenis: null,
  scrollTo: () => {},
  stop: () => {},
  start: () => {},
});

export const useSmoothScroll = () => useContext(SmoothScrollContext);

/**
 * ScrollRestorationHandler ensures that when navigating across pages:
 * 1. The browser's native automatic scroll restoration is disabled to prevent conflicts.
 * 2. Any active Lenis momentum from previous page is halted immediately.
 * 3. The new page immediately displays from its top section (scrollY = 0) with zero delay.
 * 4. No unwanted delayed scroll-to-top animations occur.
 * 5. Hash anchors glide smoothly to target.
 */
function ScrollRestorationHandler({ lenis }: { lenis: Lenis | null }) {
  const { pathname, search, hash } = useLocation();
  const isInitialMount = useRef(true);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const resetToTop = () => {
      window.scrollTo(0, 0);
      lenis?.scrollTo(0, { immediate: true });
    };

    window.addEventListener('beforeunload', resetToTop);
    window.addEventListener('load', resetToTop);

    return () => {
      window.removeEventListener('beforeunload', resetToTop);
      window.removeEventListener('load', resetToTop);
    };
  }, [lenis]);

  useLayoutEffect(() => {
    // On initial page load or page refresh, ALWAYS start at top (0, 0)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
      if (lenis) {
        lenis.stop();
        lenis.scrollTo(0, { immediate: true });
        const rafId = requestAnimationFrame(() => {
          lenis.start();
          lenis.resize();
          window.dispatchEvent(new Event('scroll'));
        });
        return () => cancelAnimationFrame(rafId);
      }
      return;
    }

    if (!lenis) {
      if (!hash) {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
      }
      return;
    }

    if (hash) {
      const timer = setTimeout(() => {
        const targetEl = document.querySelector(hash);
        if (targetEl) {
          lenis.scrollTo(targetEl as HTMLElement, {
            offset: -70,
            duration: 1.0,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          });
        }
      }, 50);
      return () => clearTimeout(timer);
    }

    // When navigating to a new admin route:
    // 1. Immediately halt previous scroll inertia
    lenis.stop();

    // 2. Synchronously snap window and Lenis scroll positions to the top (0, 0)
    // Using immediate: true prevents delayed/unwanted animated scroll-to-top
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    lenis.scrollTo(0, { immediate: true });

    // 3. Immediately notify window listeners
    window.dispatchEvent(new Event('scroll'));

    // 4. In next frame, resume Lenis and recalculate document geometry
    const rafId = requestAnimationFrame(() => {
      lenis.start();
      lenis.resize();
      window.dispatchEvent(new Event('scroll'));
    });

    return () => cancelAnimationFrame(rafId);
  }, [pathname, search, hash, lenis]);

  return null;
}

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.2,
      infinite: false,
    });

    lenisRef.current = lenis;
    setLenisInstance(lenis);

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    lenis.scrollTo(0, { immediate: true });

    lenis.on('scroll', () => {
      window.dispatchEvent(new Event('scroll'));
    });

    let rafId: number;
    function updateRaf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(updateRaf);
    }
    rafId = requestAnimationFrame(updateRaf);

    const resizeObserver = new ResizeObserver(() => {
      lenis.resize();
    });
    resizeObserver.observe(document.body);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      lenis.destroy();
      lenisRef.current = null;
      setLenisInstance(null);
    };
  }, []);

  const scrollTo = useCallback(
    (target: string | number | HTMLElement, options?: ScrollToOptions) => {
      if (!lenisRef.current) {
        if (typeof target === 'number') {
          window.scrollTo({ top: target, behavior: options?.immediate ? 'instant' : 'smooth' });
        } else if (typeof target === 'string') {
          const el = document.querySelector(target);
          if (el) {
            const top = el.getBoundingClientRect().top + window.scrollY + (options?.offset ?? -70);
            window.scrollTo({ top, behavior: options?.immediate ? 'instant' : 'smooth' });
          }
        }
        return;
      }

      lenisRef.current.scrollTo(target, {
        offset: options?.offset ?? -70,
        duration: options?.duration ?? 1.15,
        immediate: options?.immediate ?? false,
        easing: options?.easing ?? ((t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))),
      });
    },
    []
  );

  const stop = useCallback(() => {
    lenisRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    lenisRef.current?.start();
  }, []);

  return (
    <SmoothScrollContext.Provider
      value={{
        lenis: lenisInstance,
        scrollTo,
        stop,
        start,
      }}
    >
      <ScrollRestorationHandler lenis={lenisInstance} />
      {children}
    </SmoothScrollContext.Provider>
  );
}

