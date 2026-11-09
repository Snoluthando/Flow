"use client";

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from "react";

/**
 * Small replacement for next-themes. next-themes renders a <script> from a
 * client component, which React 19 warns about ("Encountered a script tag
 * while rendering React component"). Here the no-flash script lives in the
 * server-rendered layout instead (see app/layout.tsx), and this provider only
 * keeps the `dark` class on <html> in sync.
 *
 * Same storage key ("theme") as next-themes, so saved preferences carry over.
 */
type Theme = "light" | "dark" | "system";
const KEY = "theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function subscribe(cb: () => void) {
  listeners.add(cb);
  const mq = window.matchMedia(DARK_QUERY);
  mq.addEventListener("change", cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    mq.removeEventListener("change", cb);
    window.removeEventListener("storage", cb);
  };
}

function readTheme(): Theme {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}
const systemPrefersDark = () => window.matchMedia(DARK_QUERY).matches;

type Ctx = { theme: Theme; resolvedTheme: "light" | "dark"; setTheme: (t: Theme) => void };
const ThemeContext = createContext<Ctx>({ theme: "system", resolvedTheme: "light", setTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "system" as Theme);
  const systemDark = useSyncExternalStore(subscribe, systemPrefersDark, () => false);
  const resolvedTheme: "light" | "dark" = theme === "system" ? (systemDark ? "dark" : "light") : theme;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
  }, [resolvedTheme]);

  const value = useMemo<Ctx>(
    () => ({
      theme,
      resolvedTheme,
      setTheme: (t) => {
        try {
          if (t === "system") localStorage.removeItem(KEY);
          else localStorage.setItem(KEY, t);
        } catch {}
        emit();
      },
    }),
    [theme, resolvedTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
