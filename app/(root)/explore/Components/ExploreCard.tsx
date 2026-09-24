"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mono } from "@/libs/Font";
import { hasFelt, toggleFelt } from "@/libs/reaction";
import { updateFeltCount } from "@/libs/letters";
import ShareModal from "./ShareModal";

type ExploreCardProps = {
  id: string;
  to: string;
  message: string;
  date?: string;
  feltCount?: number;
};

export default function ExploreCard({
  id,
  to,
  message,
  date,
  feltCount = 0,
}: ExploreCardProps) {
  const [shareOpen, setShareOpen] = useState(false);
  const [felt, setFelt] = useState(false);
  // Local base count so an optimistic bump/rollback doesn't fight with
  // the `feltCount` prop from the initial server fetch.
  const [baseCount, setBaseCount] = useState(feltCount);
  const [pending, setPending] = useState(false);

  // Read the persisted felt state after mount (avoids SSR/client mismatch).
  useEffect(() => {
    setFelt(hasFelt(id));
  }, [id]);

  const displayCount = felt ? baseCount + 1 : baseCount;

  async function handleFeel() {
    if (pending) return;
    setPending(true);

    const next = toggleFelt(id);
    setFelt(next);

    const delta = next ? 1 : -1;
    const updated = await updateFeltCount(id, delta);

    if (updated === null) {
      // Roll back both the local toggle and the persisted flag on failure.
      toggleFelt(id);
      setFelt(!next);
    } else {
      // Reconcile with the authoritative count from the database, keeping
      // the optimistic "+1 if felt" math above consistent.
      setBaseCount(next ? updated - 1 : updated);
    }

    setPending(false);
  }

  return (
    <article className="group relative w-full rounded-2xl border border-[#171717]/8 bg-[#fbfaf8] px-6 py-6 shadow-[0_1px_2px_rgba(23,23,23,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(23,23,23,0.07)] sm:px-8 sm:py-8">
      <div className="flex items-start justify-between gap-4">
        <p className="text-xs tracking-wide text-[#9c9c9c] sm:text-sm">
          To: <span className="text-[#171717]">{to}</span>
        </p>

        <button
          type="button"
          onClick={() => setShareOpen(true)}
          aria-label="Share this message"
          className="relative -m-1.5 shrink-0 rounded-full p-1.5 text-[#9c9c9c] transition-colors duration-200 hover:text-[#171717] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171717]/40"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
        </button>
      </div>

      <p
        className={`${Mono.className} mt-4 text-[16px] font-light leading-relaxed text-[#171717] sm:mt-5 sm:text-[19px]`}
      >
        {message}
      </p>

      <div className="mt-5 flex items-center justify-between gap-4 sm:mt-6">
        {date ? (
          <p className="text-[11px] tracking-wide text-[#9c9c9c] sm:text-xs">
            {date}
          </p>
        ) : (
          <span />
        )}

        <motion.button
          type="button"
          onClick={handleFeel}
          whileTap={{ scale: 0.88 }}
          aria-pressed={felt}
          aria-label="Felt this"
          className={`flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] tracking-wide transition-colors duration-200 sm:text-xs ${
            felt ? "text-[#171717]" : "text-[#9c9c9c] hover:text-[#171717]"
          }`}
        >
          <motion.span
            key={felt ? "felt" : "unfelt"}
            initial={{ scale: 0.6 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
            className="flex items-center"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill={felt ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 21s-6.716-4.273-9.428-8.007C1.104 11.045 1 9.5 1.8 7.9 2.7 6.1 4.6 5 6.6 5c1.7 0 3.2.8 4.1 2.1L12 8.7l1.3-1.6C14.2 5.8 15.7 5 17.4 5c2 0 3.9 1.1 4.8 2.9.8 1.6.7 3.1-.8 5.1C18.716 16.727 12 21 12 21Z" />
            </svg>
          </motion.span>

          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={displayCount}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.18 }}
              className="tabular-nums"
            >
              {displayCount > 0 ? `${displayCount} felt this` : "Felt this"}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>

      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        to={to}
        message={message}
        date={date}
        feltCount={displayCount}
      />
    </article>
  );
}
