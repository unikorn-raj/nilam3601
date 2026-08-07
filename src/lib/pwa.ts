import { useState, useEffect } from "react";

export interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOffline: boolean;
  hasUpdate: boolean;
  promptInstall: () => Promise<boolean>;
  updateApp: () => void;
}

let globalDeferredPrompt: any = null;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

if (typeof window !== "undefined") {
  // Capture beforeinstallprompt event globally
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    globalDeferredPrompt = e;
    notifyListeners();
  });

  // Handle appinstalled event
  window.addEventListener("appinstalled", () => {
    globalDeferredPrompt = null;
    notifyListeners();
  });
}

/**
 * Register Service Worker in production / standard environments
 */
export function registerServiceWorker(onUpdateFound?: () => void) {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("[PWA] Service Worker registered successfully with scope:", registration.scope);

        // Check for updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                console.log("[PWA] New update available");
                if (onUpdateFound) onUpdateFound();
              }
            });
          }
        });
      })
      .catch((err) => {
        console.warn("[PWA] Service Worker registration notice:", err);
      });
  });
}

/**
 * Custom React Hook for PWA Install Availability & Service Worker state
 */
export function usePWA(): PWAState {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Register service worker and listen for updates
    registerServiceWorker(() => setHasUpdate(true));

    const handlePromptChange = () => setTick((t) => t + 1);
    listeners.add(handlePromptChange);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      listeners.delete(handlePromptChange);
    };
  }, []);

  const isStandalone =
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true ||
      document.referrer.includes("android-app://"));

  const isInstallable = Boolean(globalDeferredPrompt) && !isStandalone;
  const isInstalled = isStandalone;

  const promptInstall = async (): Promise<boolean> => {
    if (!globalDeferredPrompt) {
      return false;
    }

    try {
      globalDeferredPrompt.prompt();
      const { outcome } = await globalDeferredPrompt.userChoice;
      if (outcome === "accepted") {
        globalDeferredPrompt = null;
        notifyListeners();
        return true;
      }
    } catch (err) {
      console.error("[PWA] Prompt install error:", err);
    }
    return false;
  };

  const updateApp = () => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg && reg.waiting) {
          reg.waiting.postMessage({ type: "SKIP_WAITING" });
          window.location.reload();
        } else {
          window.location.reload();
        }
      });
    } else {
      window.location.reload();
    }
  };

  return {
    isInstallable,
    isInstalled,
    isOffline,
    hasUpdate,
    promptInstall,
    updateApp,
  };
}
