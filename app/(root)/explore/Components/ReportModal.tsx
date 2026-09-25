"use client";

import { useEffect, useState } from "react";
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

const modalTransition = {
  type: "tween" as const,
  duration: 0.35,
  ease: [0.16, 1, 0.3, 1] as const,
};

export default function ReportModal({
  open,
  onClose,
  letterId,
}: ReportModalProps) {
  const [reason, setReason] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

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
      setSubmitting(false);
    }
  }, [open]);

  // Lock scroll + Esc to close
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

  async function handleSubmit() {
    if (submitting || !reason) return;

    setSubmitting(true);
    const success = await reportLetter(letterId, reason);
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
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#171717]/40 p-4 backdrop-blur-sm"
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
            className="w-full max-w-md rounded-3xl border border-[#171717]/10 bg-[#fbfaf8] p-5 shadow-[0_20px_60px_rgba(23,23,23,0.18)] sm:p-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-medium text-[#171717] sm:text-lg">
                Report this letter
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="-m-1.5 rounded-full p-1.5 text-[#9c9c9c] transition-colors duration-200 hover:text-[#171717]"
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

            <p className="mt-2 text-[13px] leading-relaxed text-[#9c9c9c] sm:text-sm">
              Let us know what's wrong with this letter. Reports are anonymous
              and reviewed by our team.
            </p>

            {/* reason select */}
            <label className="mt-5 flex flex-col gap-1.5">
              <span className="text-xs tracking-wide text-[#9c9c9c] sm:text-sm">
                Reason
              </span>
              <div className="relative">
                <select
                  value={reason}
                  disabled={submitting}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-[#171717]/10 bg-white px-3.5 py-2.5 pr-9 text-[14px] text-[#171717] outline-none transition-colors duration-200 focus:border-[#171717]/30 disabled:cursor-not-allowed disabled:opacity-60 sm:text-[15px]"
                >
                  <option value="" disabled>
                    Select a reason…
                  </option>
                  {REASONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9c9c9c]"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </label>

            {/* actions */}
            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!reason || submitting}
                className="flex-1 rounded-full bg-[#171717] px-4 py-2.5 text-[13px] text-white transition-opacity duration-200 hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Submitting…" : "Submit Report"}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="flex-1 rounded-full border border-[#171717]/15 px-4 py-2.5 text-[13px] text-[#171717] transition-colors duration-200 hover:bg-[#171717]/5 disabled:cursor-not-allowed disabled:opacity-50"
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
