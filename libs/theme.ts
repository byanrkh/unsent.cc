"use client";

import { useCallback, useEffect, useState } from "react";

const THEME_KEY = "unsent-theme";

function applyThemeClass(isDark: boolean) {
  document.documentElement.classList.toggle("dark", isDark);
}

/**
 * Baca/tulis preferensi dark mode. Kelas `.dark` di <html> udah dipasang
 * lebih dulu oleh inline script anti-flash di app/layout.tsx sebelum React
 * sempat hydrate — hook ini cuma "membaca ulang" state itu setelah mount
 * (biar nggak mismatch sama render server yang selalu mulai dari light),
 * lalu nyediain fungsi `toggle` buat switch di Navbar.
 */
export function useTheme() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    setMounted(true);
  }, []);

  // Ikut berubah kalau preferensi sistem berubah SEMENTARA user belum
  // pernah milih manual (belum ada key di localStorage).
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    function onChange(e: MediaQueryListEvent) {
      try {
        if (localStorage.getItem(THEME_KEY)) return; // user punya pilihan sendiri
      } catch {
        // ignore
      }
      applyThemeClass(e.matches);
      setIsDark(e.matches);
    }
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const toggle = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      applyThemeClass(next);
      try {
        localStorage.setItem(THEME_KEY, next ? "dark" : "light");
      } catch {
        // ignore write errors (e.g. private browsing / storage disabled)
      }
      return next;
    });
  }, []);

  return { isDark, toggle, mounted };
}