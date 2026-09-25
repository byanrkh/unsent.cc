"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { reportLetter } from "@/libs/letters";
import { showToast } from "@/libs/toastBus";

type ReportModalProps = {
  open: boolean;
  onClose: () => void;
  letterId: string;
};

const REASONS = [
  "Hate speech or harassment",
  "Personal information / Doxxing",
  "Spam or misleading",
  "Explicit or inappropriate content",
  "Other",
] as const;

const OTHER = "Other" as const;

const modalTransition = {
  type: "tween" as const,
  duration: 0.35,
  ease: [0.16, 1, 0.3, 1] as const,
};

const dropdownTransition = {
  type: "tween" as const,
  duration: 0.18,
  ease: [0.16, 1, 0.3, 1] as const,
};

export default function ReportModal({
  open,
  onClose,
  letterId,
}: ReportModalProps) {
  const [reason, setReason] = useState<string>("");
  const [otherText, setOtherText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const otherInputRef = useRef<HTMLInputElement>(null);

  const isOther = reason === OTHER;
  const canSubmit = reason !== "" && (!isOther || otherText.trim() !== "");

  // Portals need a real document.body to attach to, which only exists
  // client-side — avoids an SSR/hydration mismatch.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset the form every time the modal is (re)opened, rather than
  // remembering the last reason picked for a different letter.
  useEffect(() => {
    if (open) {
      setReason("");
      setOtherText("");
      setSubmitting(false);
      setDropdownOpen(false);
    }
  }, [open]);

  // Lock scroll + Esc to close (closes the dropdown first, then the modal)
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (dropdownOpen) {
        setDropdownOpen(false);
        return;
      }
      onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, dropdownOpen]);

  // Close the dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    function onPointerDown(e: PointerEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [dropdownOpen]);

  // Autofocus the "please specify" input as soon as it appears
  useEffect(() => {
    if (isOther) {
      const id = requestAnimationFrame(() => otherInputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [isOther]);

  function selectReason(value: string) {
    setReason(value);
    setDropdownOpen(false);
    if (value !== OTHER) setOtherText("");
  }

  async function handleSubmit() {
    if (submitting || !canSubmit) return;

    const finalReason = isOther ? otherText.trim() : reason;

    setSubmitting(true);
    const success = await reportLetter(letterId, finalReason);
    setSubmitting(false);

    if (success) {
      showToast("Report submitted. Thank you.");
      onClose();
    } else {
      showToast("Something went wrong — please try again.");
    }
  }

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
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={modalTransition}
            className="w-full max-w-md rounded-3xl border border-[var(--foreground)]/10 bg-[var(--color-surface)] p-5 shadow-[0_20px_60px_rgba(var(--shadow-rgb),0.18)] sm:p-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-medium text-[var(--foreground)] sm:text-lg">
                Report this letter
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="-m-1.5 rounded-full p-1.5 text-[var(--color-muted)] transition-colors duration-200 hover:text-[var(--foreground)]"
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

            <p className="mt-2 text-[13px] leading-relaxed text-[var(--color-muted)] sm:text-sm">
              Let us know what&apos;s wrong with this letter. Reports are
              anonymous and reviewed by our team.
            </p>

            {/* reason — custom dropdown */}
            <div className="mt-5 flex flex-col gap-1.5">
              <span className="text-xs tracking-wide text-[var(--color-muted)] sm:text-sm">
                Reason
              </span>

              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setDropdownOpen((v) => !v)}
                  aria-haspopup="listbox"
                  aria-expanded={dropdownOpen}
                  className={`flex w-full items-center justify-between rounded-xl border bg-[var(--color-elevated)] px-3.5 py-2.5 text-left text-[14px] outline-none transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 sm:text-[15px] ${
                    dropdownOpen
                      ? "border-[var(--foreground)]/30"
                      : "border-[var(--foreground)]/10 hover:border-[var(--foreground)]/20"
                  }`}
                >
                  <span
                    className={
                      reason
                        ? "text-[var(--foreground)]"
                        : "text-[var(--color-muted)]"
                    }
                  >
                    {reason || "Select a reason…"}
                  </span>
                  <motion.svg
                    animate={{ rotate: dropdownOpen ? 180 : 0 }}
                    transition={dropdownTransition}
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ml-2 shrink-0 text-[var(--color-muted)]"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </motion.svg>
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.ul
                      role="listbox"
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={dropdownTransition}
                      className="absolute left-0 right-0 top-[calc(100%+6px)] z-10 overflow-hidden rounded-xl border border-[var(--foreground)]/10 bg-[var(--color-elevated)] p-1 shadow-[0_12px_32px_rgba(var(--shadow-rgb),0.14)]"
                    >
                      {REASONS.map((option) => {
                        const selected = option === reason;
                        return (
                          <li
                            key={option}
                            role="option"
                            aria-selected={selected}
                          >
                            <button
                              type="button"
                              onClick={() => selectReason(option)}
                              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[14px] transition-colors duration-150 sm:text-[15px] ${
                                selected
                                  ? "bg-[var(--foreground)]/[0.06] text-[var(--foreground)]"
                                  : "text-[var(--foreground)] hover:bg-[var(--foreground)]/5"
                              }`}
                            >
                              {option}
                              {selected && (
                                <svg
                                  width="14"
                                  height="14"
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

              {/* "please specify" field, only for Other */}
              <AnimatePresence initial={false}>
                {isOther && (
                  <motion.div
                    key="other-input"
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={dropdownTransition}
                    className="overflow-hidden"
                  >
                    <input
                      ref={otherInputRef}
                      type="text"
                      value={otherText}
                      disabled={submitting}
                      onChange={(e) => setOtherText(e.target.value)}
                      placeholder="Please specify…"
                      maxLength={140}
                      className="w-full rounded-xl border border-[var(--foreground)]/10 bg-[var(--color-elevated)] px-3.5 py-2.5 text-[14px] text-[var(--foreground)] outline-none transition-colors duration-200 placeholder:text-[var(--color-muted)] focus:border-[var(--foreground)]/30 disabled:cursor-not-allowed disabled:opacity-60 sm:text-[15px]"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* actions */}
            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                className="flex-1 rounded-full bg-[var(--color-inverse-bg)] px-4 py-2.5 text-[13px] text-[var(--color-inverse-fg)] transition-opacity duration-200 hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Submitting…" : "Submit Report"}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="flex-1 rounded-full border border-[var(--foreground)]/15 px-4 py-2.5 text-[13px] text-[var(--foreground)] transition-colors duration-200 hover:bg-[var(--foreground)]/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
