"use client";

import { useCallback, useEffect, useState } from "react";

const THEME_KEY = "unsent-theme";

export type Theme = "light" | "dark";

function applyThemeClass(isDark: boolean) {
  document.documentElement.classList.toggle("dark", isDark);
}

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "dark") return "dark";
  } catch {
    // ignore
  }
  return "light"; // default — nggak ikut preferensi OS, selalu light
}

/**
 * Baca/tulis preferensi tema. Kelas `.dark` di <html> udah dipasang lebih
 * dulu oleh inline script anti-flash di app/layout.tsx sebelum React sempat
 * hydrate — hook ini cuma "membaca ulang" state itu setelah mount (biar
 * nggak mismatch sama render server yang selalu mulai dari light), lalu
 * nyediain `setTheme` buat dropdown pemilih tema di Navbar.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("light");
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setThemeState(readStoredTheme());
    setIsDark(document.documentElement.classList.contains("dark"));
    setMounted(true);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    const nextIsDark = next === "dark";
    applyThemeClass(nextIsDark);
    setThemeState(next);
    setIsDark(nextIsDark);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // ignore write errors (e.g. private browsing / storage disabled)
    }
  }, []);

  // Dipertahanin buat caller lama yang cuma butuh flip light/dark cepat.
  const toggle = useCallback(() => {
    setTheme(isDark ? "light" : "dark");
  }, [isDark, setTheme]);

  return { theme, isDark, setTheme, toggle, mounted };
}