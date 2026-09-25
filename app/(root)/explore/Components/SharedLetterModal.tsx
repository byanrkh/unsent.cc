"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Mono } from "@/libs/Font";
import type { Letter } from "@/libs/letters";

type SharedLetterModalProps = {
  open: boolean;
  onClose: () => void;
  letter: Letter;
  date?: string;
};

// Sama persis kayak transition yang dipake ShareModal/ReportModal, biar
// morph antara modal ini <-> card di feed berasa konsisten sama modal lain.
const modalTransition = {
  type: "tween" as const,
  duration: 0.4,
  ease: [0.16, 1, 0.3, 1] as const,
};

/**
 * Dipakai pas orang buka link share (?letter=<id>). `layoutId` di bawah
 * ini HARUS sama persis dengan `layoutId` yang dipasang di wrapper card-nya
 * di ExploreSearch — itu yang bikin Framer Motion "morph" boks ini balik
 * ke posisi & ukuran card asli pas modal-nya ditutup, alih-alih cuma
 * fade out/in yang keliatan lompat.
 */
export default function SharedLetterModal({
  open,
  onClose,
  letter,
  date,
}: SharedLetterModalProps) {
  const [mounted, setMounted] = useState(false);

  // Portal butuh document.body yang beneran, dan itu cuma ada di client —
  // ngindarin SSR/hydration mismatch.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock scroll body + Esc buat nutup, sama kayak modal lain di app ini.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[var(--foreground)]/40 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            layoutId={`letter-preview-${letter.id}`}
            transition={modalTransition}
            className="w-full max-w-xl rounded-2xl border border-[var(--foreground)]/8 bg-[var(--color-surface)] p-6 shadow-[0_20px_60px_rgba(var(--shadow-rgb),0.18)] sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-1.5 text-[11px] tracking-wide text-[var(--color-muted)] sm:text-xs">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0"
                >
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                Someone shared this with you
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="-m-1.5 shrink-0 rounded-full p-1.5 text-[var(--color-muted)] transition-colors duration-200 hover:text-[var(--foreground)]"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                >
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </svg>
              </button>
            </div>

            <p className="mt-4 text-xs tracking-wide text-[var(--color-muted)] sm:text-sm">
              To: <span className="text-[var(--foreground)]">{letter.to}</span>
            </p>

            <p
              className={`${Mono.className} mt-4 text-[17px] font-light leading-relaxed text-[var(--foreground)] sm:mt-5 sm:text-[20px]`}
            >
              {letter.message}
            </p>

            <div className="mt-6 flex items-center justify-between gap-4 border-t border-[var(--foreground)]/8 pt-4 sm:mt-8">
              <div className="flex items-center gap-4">
                {date && (
                  <p className="text-[11px] tracking-wide text-[var(--color-muted)] sm:text-xs">
                    {date}
                  </p>
                )}
                {letter.feltCount > 0 && (
                  <p className="flex items-center gap-1.5 text-[11px] tracking-wide text-[var(--color-muted)] sm:text-xs">
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 21s-6.716-4.273-9.428-8.007C1.104 11.045 1 9.5 1.8 7.9 2.7 6.1 4.6 5 6.6 5c1.7 0 3.2.8 4.1 2.1L12 8.7l1.3-1.6C14.2 5.8 15.7 5 17.4 5c2 0 3.9 1.1 4.8 2.9.8 1.6.7 3.1-.8 5.1C18.716 16.727 12 21 12 21Z" />
                    </svg>
                    {letter.feltCount} felt this
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-full border border-[var(--foreground)]/10 bg-[var(--color-elevated)] px-4 py-2 text-[11px] font-medium tracking-wide text-[var(--foreground)] transition-colors duration-200 hover:bg-[var(--foreground)]/5 sm:text-xs"
              >
                View in feed
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
