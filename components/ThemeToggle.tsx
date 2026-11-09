"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // Avoid rendering theme-dependent UI until mounted, since the server
  // can't know the user's preference and would otherwise mismatch on hydrate.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // Hydration guard: we cannot know the resolved
    // theme until after mount, so this one-time flag is intentional.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-8 w-8" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="h-8 w-8 flex items-center justify-center rounded-sm border border-btn-outline text-muted hover:text-body hover:border-btn-outline-hover transition-colors"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
