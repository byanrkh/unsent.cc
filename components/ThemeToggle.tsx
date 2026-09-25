"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme, type Theme } from "@/libs/theme";

const OPTIONS: { value: Theme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

const dropdownTransition = {
  type: "tween" as const,
  duration: 0.18,
  ease: [0.16, 1, 0.3, 1] as const,
};

export default function ThemeToggle({
  className = "",
}: {
  className?: string;
}) {
  const { theme, setTheme, mounted } = useTheme();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const current = OPTIONS.find((o) => o.value === theme) ?? OPTIONS[0];

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Close on Esc
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={`relative inline-block text-left ${
        // Sembunyiin visual sampe mounted biar nggak ada micro-flicker
        // label salah pas hydration, tapi tetep reserve ruang (nggak
        // layout-shift).
        mounted ? "opacity-100" : "opacity-0"
      } ${className}`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change theme"
        className="flex items-center gap-1.5 text-[var(--foreground)] transition-opacity hover:opacity-55"
      >
        <span>{current.label}</span>
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={dropdownTransition}
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0"
        >
          <polyline points="6 9 12 15 18 9" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={dropdownTransition}
            className="absolute right-0 top-[calc(100%+8px)] z-10 w-28 overflow-hidden rounded-xl border border-[var(--foreground)]/10 bg-[var(--color-elevated)] p-1 shadow-[0_12px_32px_rgba(var(--shadow-rgb),0.14)]"
          >
            {OPTIONS.map((option) => {
              const selected = option.value === theme;
              return (
                <li key={option.value} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onClick={() => {
                      setTheme(option.value);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-[13px] transition-colors duration-150 ${
                      selected
                        ? "bg-[var(--foreground)]/[0.06] text-[var(--foreground)]"
                        : "text-[var(--foreground)] hover:bg-[var(--foreground)]/5"
                    }`}
                  >
                    {option.label}
                    {selected && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="shrink-0"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
