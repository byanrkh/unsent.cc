"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Mono } from "@/libs/Font";
import { showToast } from "@/libs/toastBus";
import { useResponsiveFontSize } from "@/libs/useResponsiveFontSize";
import { useAutoResizeTextarea } from "@/libs/useAutoResizeTextarea";
import { submitLetter } from "@/libs/letters";
import {
  MAX_MESSAGE_LENGTH,
  morphTransition,
  getCounterColor,
} from "@/libs/form";
import PostSubmitSequence from "./PostSubmitSequence";

const UNSENT_MESSAGE_KEY = "unsent-message";
const UNSENT_TO_KEY = "unsent-to";

// Same values that used to live in the `text-[15px] sm:text-[20px]
// md:text-[24px]` Tailwind classes — now resolved in JS so framer-motion
// can animate the value itself. Note this page tops out at 24px (no
// `lg:` override), which is exactly what caused the size to snap when
// coming from the home page's 32px on large screens.
const MESSAGE_FONT_SIZE = { base: 15, sm: 20, md: 24 };

// "form" = the normal, themed submit form. "post" = the always-dark
// post-submit experience (text sequence, then confirmation) rendered by
// PostSubmitSequence. It stays mounted across both of those inner stages
// so the dark background never flashes back to the page's theme until
// the user explicitly leaves it.
type Phase = "form" | "post";

export default function SubmitForm() {
  const [to, setTo] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [phase, setPhase] = useState<Phase>("form");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasSubmittedRef = useRef(false);
  const fontSize = useResponsiveFontSize(MESSAGE_FONT_SIZE);
  const router = useRouter();

  // Keep the latest values in refs so the unmount-detection effect
  // below doesn't need `to`/`message` in its deps.
  const toRef = useRef(to);
  const messageRef = useRef(message);

  useEffect(() => {
    toRef.current = to;
  }, [to]);

  useEffect(() => {
    messageRef.current = message;
  }, [message]);

  // Load any existing draft on mount.
  useEffect(() => {
    const storedMessage = sessionStorage.getItem(UNSENT_MESSAGE_KEY);
    const storedTo = sessionStorage.getItem(UNSENT_TO_KEY);
    if (storedMessage) setMessage(storedMessage.slice(0, MAX_MESSAGE_LENGTH));
    if (storedTo) setTo(storedTo);
  }, []);

  // Auto-save the draft as the user types.
  useEffect(() => {
    sessionStorage.setItem(UNSENT_MESSAGE_KEY, message);
  }, [message]);

  useEffect(() => {
    sessionStorage.setItem(UNSENT_TO_KEY, to);
  }, [to]);

  // If the user navigates away without submitting, let them know
  // the draft is safe and how to get back to it. Deps are empty so
  // this cleanup only fires once, on real unmount — not every keystroke.
  useEffect(() => {
    return () => {
      const hasDraft =
        toRef.current.trim().length > 0 || messageRef.current.trim().length > 0;
      if (!hasSubmittedRef.current && hasDraft) {
        showToast(
          "Draft saved — come back to /submit to pick up where you left off.",
        );
      }
    };
  }, []);

  useAutoResizeTextarea(textareaRef, message, fontSize);

  async function handleLeave() {
    if (submitting || phase !== "form") return;

    if (!message.trim()) {
      showToast("Write something before you leave it.");
      return;
    }

    setSubmitting(true);
    try {
      await submitLetter({ to, message });

      // Only mark as submitted and clear the draft once the write to
      // Supabase actually succeeds — if it fails, the draft (and the
      // "draft saved" warning on unmount) should stay intact.
      hasSubmittedRef.current = true;
      sessionStorage.removeItem(UNSENT_MESSAGE_KEY);
      sessionStorage.removeItem(UNSENT_TO_KEY);

      setSubmitting(false);
      setPhase("post");
    } catch (error) {
      console.error("Failed to submit letter:", error);
      showToast("Something went wrong — please try again.");
      setSubmitting(false);
    }
  }

  function handleExploreUnsent() {
    router.push("/explore");
  }

  function handleLeaveAnother() {
    setTo("");
    setMessage("");
    hasSubmittedRef.current = false;
    setPhase("form");
  }

  const locked = submitting || phase !== "form";

  return (
    <div className="w-full min-w-0">
      {phase === "form" && (
        <>
          <div
            className="flex flex-col gap-7 sm:gap-8 transition-opacity duration-500"
            style={{ opacity: locked ? 0.5 : 1 }}
          >
            <label className="flex min-w-0 flex-col gap-1.5 animate-page-in">
              <span className="text-xs tracking-wide text-[var(--color-muted)] sm:text-sm">
                To
              </span>
              <input
                type="text"
                placeholder="Someone"
                autoComplete="off"
                spellCheck={false}
                maxLength={60}
                value={to}
                disabled={locked}
                onChange={(e) => setTo(e.target.value)}
                className={`${Mono.className} min-w-0 w-full bg-transparent py-1 text-[15px] font-light text-[var(--foreground)] outline-none placeholder:text-[var(--color-muted)] [caret-shape:bar] caret-[var(--foreground)] sm:text-[18px] disabled:cursor-not-allowed`}
              />
            </label>

            <label className="flex min-w-0 flex-col gap-1.5">
              <span className="text-xs tracking-wide text-[var(--color-muted)] sm:text-sm animate-page-in">
                Message
              </span>
              <motion.textarea
                layoutId="unsent-message"
                layout="preserve-aspect"
                ref={textareaRef}
                placeholder="Type your unsent message here..."
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                maxLength={MAX_MESSAGE_LENGTH}
                rows={1}
                value={message}
                disabled={locked}
                onChange={(e) =>
                  setMessage(e.target.value.slice(0, MAX_MESSAGE_LENGTH))
                }
                transition={morphTransition}
                style={{ fontSize }}
                className={`${Mono.className} min-w-0 w-full resize-none overflow-hidden bg-transparent py-1.5 font-light leading-normal text-[var(--foreground)] outline-none placeholder:text-[var(--color-muted)] [caret-shape:bar] caret-[var(--foreground)] disabled:cursor-not-allowed`}
              />
              <motion.span
                layoutId="unsent-count"
                layout="preserve-aspect"
                className={`self-end text-[11px] tabular-nums transition-colors duration-200 sm:text-xs ${getCounterColor(
                  message.length,
                )}`}
                transition={morphTransition}
              >
                {message.length}/{MAX_MESSAGE_LENGTH}
              </motion.span>
            </label>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:mt-10">
            <div className="flex h-12.5 items-center sm:h-15">
              <motion.button
                type="button"
                onClick={handleLeave}
                disabled={locked}
                whileTap={{ scale: 0.94 }}
                className="group inline-flex items-center gap-2 text-[15px] tracking-wide text-[var(--foreground)] transition-opacity duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)] hover:opacity-60 disabled:pointer-events-none disabled:hover:opacity-100 sm:text-[17px] animate-page-in"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {submitting ? (
                    <motion.span
                      key="submitting"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="inline-flex items-center gap-2"
                    >
                      Leaving
                      <motion.span
                        className="inline-block h-1.5 w-1.5 rounded-full bg-current"
                        animate={{ opacity: [0.2, 1, 0.2] }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="inline-flex items-center gap-2"
                    >
                      Leave
                      <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
                        →
                      </span>
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </>
      )}

      <AnimatePresence>
        {phase === "post" && (
          <PostSubmitSequence
            onExploreUnsent={handleExploreUnsent}
            onLeaveAnother={handleLeaveAnother}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
