"use client";

import { useEffect, useState } from "react";

// The server can't know the visitor's local time, so we fill this in after mount.
function useNow() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    // One-time mount flag; same pattern as ThemeToggle.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
  }, []);
  return now;
}

export function GreetingText({ className }: { className?: string }) {
  const now = useNow();
  const h = now?.getHours() ?? 12;
  const text = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  return <p className={className}>{now ? text : "Welcome back"}</p>;
}

export function TodayDate({ className }: { className?: string }) {
  const now = useNow();
  return (
    <p className={className}>
      {now
        ? now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
        : "\u00A0"}
    </p>
  );
}
