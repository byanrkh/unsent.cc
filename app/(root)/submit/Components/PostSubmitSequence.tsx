"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const SEQUENCE_MESSAGES = [
  "You finally said it.",
  "Even if no one hears it.",
  "Even if they never know.",
] as const;

const LAST_INDEX = SEQUENCE_MESSAGES.length - 1;

// Normal-motion timing (ms). Slower and heavier than a normal transition
// on purpose — a held breath, not a loading screen — but nudged down a
// bit from the first pass so it doesn't drag.
const FADE_MS = 1600;
const HOLD_MS = 2000;
const HOLD_LAST_MS = 3000; // the final line lingers noticeably longer
const GAP_MS = 700; // blank, silent pause between lines
const FINAL_PAUSE_MS = 500; // blank pause before the confirmation settles in

// Reduced-motion timing: fades are nearly instant, holds are shortened,
// but every line is still shown in full — meaning preserved, motion cut.
const FADE_MS_REDUCED = 150;
const HOLD_MS_REDUCED = 1400;
const HOLD_LAST_MS_REDUCED = 1900;
const GAP_MS_REDUCED = 400;
const FINAL_PAUSE_MS_REDUCED = 250;

// Skip fades out whatever's currently on screen instead of cutting it off
// abruptly, then settles into the confirmation.
const SKIP_FADE_MS = 450;

// Hardcoded to the site's own dark-theme values (see the `.dark` class in
// globals.css) rather than the `--background`/`--foreground` CSS vars —
// this experience stays dark regardless of which theme is active.
const DARK_BG = "#121212";
const DARK_FG = "#ededed";
const DARK_MUTED = "#86837e";

type Stage = "sequence" | "confirmed";

type PostSubmitSequenceProps = {
  onExploreUnsent: () => void;
  onLeaveAnother: () => void;
};

/**
 * Full-viewport, always-dark "quiet moment" shown right after a message is
 * successfully submitted. Fades slowly through three lines of text, then
 * settles into a confirmation with two ways forward. No confetti, no
 * success iconography, no theme-following — just text, near-silence, and
 * a slow pace.
 *
 * `fixed inset-0` with a solid background and a z-index above the navbar
 * (z-50) and toast (z-[70]) means it visually — and, since it isn't
 * pointer-events-none, interactively — hides the rest of the interface
 * without needing to touch Navbar/Toast/layout code. It stays mounted
 * (and stays dark) across both the text sequence and the confirmation, so
 * there's no flash back to the page's own theme until the user picks
 * "Explore unsent" or "Leave another".
 */
export default function PostSubmitSequence({
  onExploreUnsent,
  onLeaveAnother,
}: PostSubmitSequenceProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;

  const [stage, setStage] = useState<Stage>("sequence");

  // -1 = nothing shown (a blank gap). Otherwise the index of the line
  // currently mounted (and therefore fading in / holding / fading out).
  const [activeIndex, setActiveIndex] = useState(-1);
  const [skipped, setSkipped] = useState(false);

  const settledRef = useRef(false);
  const skippedRef = useRef(false);
  const timeoutIdsRef = useRef<number[]>([]);

  const fade = prefersReducedMotion ? FADE_MS_REDUCED : FADE_MS;
  const hold = prefersReducedMotion ? HOLD_MS_REDUCED : HOLD_MS;
  const holdLast = prefersReducedMotion ? HOLD_LAST_MS_REDUCED : HOLD_LAST_MS;
  const gap = prefersReducedMotion ? GAP_MS_REDUCED : GAP_MS;
  const finalPause = prefersReducedMotion
    ? FINAL_PAUSE_MS_REDUCED
    : FINAL_PAUSE_MS;

  const clearAllTimeouts = () => {
    timeoutIdsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutIdsRef.current = [];
  };

  const schedule = (fn: () => void, delay: number) => {
    const id = window.setTimeout(() => {
      if (skippedRef.current) return;
      fn();
    }, delay);
    timeoutIdsRef.current.push(id);
  };

  const settleIntoConfirmation = () => {
    if (settledRef.current) return;
    settledRef.current = true;
    setStage("confirmed");
  };

  // Drives the text sequence once, on mount: fade a line in, hold it,
  // fade it out, pause in silence, move to the next line, then settle
  // into the confirmation.
  useEffect(() => {
    let elapsed = 0;

    SEQUENCE_MESSAGES.forEach((_, index) => {
      const isLast = index === LAST_INDEX;
      const lineHold = isLast ? holdLast : hold;

      schedule(() => setActiveIndex(index), elapsed);
      elapsed += fade + lineHold + fade;
      if (!isLast) elapsed += gap;
    });

    schedule(() => setActiveIndex(-1), elapsed);
    elapsed += finalPause;
    schedule(settleIntoConfirmation, elapsed);

    return () => {
      clearAllTimeouts();
    };
    // Timing values are derived from prefersReducedMotion and are stable
    // for the lifetime of this component, so this effect is meant to run
    // exactly once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fade, hold, holdLast, gap, finalPause]);

  // Marking `skipped` first (without touching activeIndex) lets the
  // currently-mounted line pick up the faster SKIP_FADE_MS transition
  // before it actually starts exiting, in the effect below.
  function handleSkip() {
    if (skippedRef.current || settledRef.current) return;
    skippedRef.current = true;
    clearAllTimeouts();
    setSkipped(true);
  }

  useEffect(() => {
    if (!skipped) return;
    setActiveIndex(-1);
    const id = window.setTimeout(settleIntoConfirmation, SKIP_FADE_MS);
    timeoutIdsRef.current.push(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skipped]);

  const activeMessage =
    activeIndex >= 0 ? SEQUENCE_MESSAGES[activeIndex] : null;
  const currentFadeMs = skipped ? SKIP_FADE_MS : fade;
  const textTransition = prefersReducedMotion
    ? { duration: currentFadeMs / 1000 }
    : {
        duration: currentFadeMs / 1000,
        ease: [0.16, 1, 0.3, 1] as const,
      };

  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden px-6"
      style={{ backgroundColor: DARK_BG }}
    >
      {/* Faint film-grain texture — static, no motion, just adds depth. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Slow ambient glow, breathing behind the text. Subtle by design —
          this is the only "special effect" in the piece. */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[65vmax] w-[65vmax] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(237,237,237,0.12) 0%, rgba(237,237,237,0) 70%)",
          filter: "blur(40px)",
        }}
        animate={
          prefersReducedMotion
            ? undefined
            : { opacity: [0.5, 1, 0.5], scale: [1, 1.05, 1] }
        }
        transition={
          prefersReducedMotion
            ? undefined
            : { duration: 8, repeat: Infinity, ease: "easeInOut" }
        }
      />

      <div className="relative flex w-full flex-col items-center justify-center">
        {stage === "sequence" && (
          <AnimatePresence mode="wait">
            {activeMessage && (
              <motion.p
                key={activeIndex}
                initial={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: 14, filter: "blur(10px)" }
                }
                animate={
                  prefersReducedMotion
                    ? { opacity: 1 }
                    : { opacity: 1, y: 0, filter: "blur(0px)" }
                }
                exit={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: -10, filter: "blur(10px)" }
                }
                transition={textTransition}
                className="max-w-100 text-center text-lg italic leading-relaxed sm:text-xl"
                style={{ color: DARK_FG }}
              >
                {activeMessage}
              </motion.p>
            )}
          </AnimatePresence>
        )}

        {stage === "confirmed" && (
          <motion.div
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 10, filter: "blur(8px)" }
            }
            animate={
              prefersReducedMotion
                ? { opacity: 1 }
                : { opacity: 1, y: 0, filter: "blur(0px)" }
            }
            transition={{
              duration: prefersReducedMotion ? 0.2 : 1.1,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="flex flex-col items-center gap-7 text-center"
          >
            <p
              className="max-w-100 text-lg italic leading-relaxed sm:text-xl"
              style={{ color: DARK_FG }}
            >
              You&apos;ve let it go, gently.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
              <button
                type="button"
                onClick={onExploreUnsent}
                className="group inline-flex items-center gap-2 text-[15px] tracking-wide transition-opacity duration-300 hover:opacity-60 sm:text-[17px]"
                style={{ color: DARK_FG }}
              >
                Explore unsent
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </button>
              <button
                type="button"
                onClick={onLeaveAnother}
                className="text-[15px] tracking-wide transition-opacity duration-300 hover:opacity-70 sm:text-[17px]"
                style={{ color: DARK_MUTED }}
              >
                Leave another
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {stage === "sequence" && (
        <div className="absolute inset-x-0 bottom-6 flex justify-center px-6 sm:bottom-8">
          <button
            type="button"
            onClick={handleSkip}
            className="text-xs tracking-wide opacity-40 outline-none transition-opacity duration-300 hover:opacity-80 focus-visible:opacity-80"
            style={{ color: DARK_MUTED }}
          >
            skip →
          </button>
        </div>
      )}
    </motion.div>
  );
}
