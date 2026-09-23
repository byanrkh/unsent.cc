"use client";

import { useLayoutEffect, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Mono } from "@/libs/Font";
import { showToast } from "@/libs/toastBus";
import { useResponsiveFontSize } from "@/libs/useResponsiveFontSize";

const UNSENT_MESSAGE_KEY = "unsent-message";
const UNSENT_TO_KEY = "unsent-to";
const MAX_MESSAGE_LENGTH = 100;

const morphTransition = {
  type: "tween" as const,
  duration: 0.6,
  ease: [0.16, 1, 0.3, 1] as const,
};

// Same values that used to live in the `text-[15px] sm:text-[20px]
// md:text-[24px]` Tailwind classes — now resolved in JS so framer-motion
// can animate the value itself. Note this page tops out at 24px (no
// `lg:` override), which is exactly what caused the size to snap when
// coming from the home page's 32px on large screens.
const MESSAGE_FONT_SIZE = { base: 15, sm: 20, md: 24 };

function getCounterColor(length: number) {
  if (length >= MAX_MESSAGE_LENGTH) return "text-[#9a3b32]";
  if (length > 80) return "text-[#171717]";
  return "text-[#9c9c9c]";
}

export default function SubmitForm() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [message, setMessage] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasSubmittedRef = useRef(false);
  const fontSize = useResponsiveFontSize(MESSAGE_FONT_SIZE);

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

  // `fontSize` is also a dep here for the same reason as on the home
  // page: it's resolved asynchronously by useResponsiveFontSize, so the
  // height must be recomputed once it lands or the box stays sized for
  // the smaller base font and the larger text gets clipped.
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [message, fontSize]);

  function handleLeave() {
    // Frontend only for now — no submission logic yet.
    hasSubmittedRef.current = true;
    sessionStorage.removeItem(UNSENT_MESSAGE_KEY);
    sessionStorage.removeItem(UNSENT_TO_KEY);
  }

  return (
    <div className="w-full min-w-0">
      <div className="flex flex-col gap-7 sm:gap-8">
        <label className="flex min-w-0 flex-col gap-1.5 animate-page-in">
          <span className="text-xs tracking-wide text-[#9c9c9c] sm:text-sm">
            To
          </span>
          <input
            type="text"
            placeholder="Someone"
            autoComplete="off"
            spellCheck={false}
            maxLength={60}
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className={`${Mono.className} min-w-0 w-full bg-transparent py-1 text-[15px] font-light text-[#171717] outline-none placeholder:text-[#9c9c9c] [caret-shape:bar] caret-[#171717] sm:text-[18px]`}
          />
        </label>

        <label className="flex min-w-0 flex-col gap-1.5">
          <span className="text-xs tracking-wide text-[#9c9c9c] sm:text-sm animate-page-in">
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
            onChange={(e) =>
              setMessage(e.target.value.slice(0, MAX_MESSAGE_LENGTH))
            }
            transition={morphTransition}
            style={{ fontSize }}
            className={`${Mono.className} min-w-0 w-full resize-none overflow-hidden bg-transparent py-1.5 font-light leading-normal text-[#171717] outline-none placeholder:text-[#9c9c9c] [caret-shape:bar] caret-[#171717]`}
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

      <div className="mt-8 flex h-12.5 items-center sm:mt-10 sm:h-15">
        <button
          type="button"
          onClick={handleLeave}
          className="group inline-flex items-center gap-2 text-[15px] tracking-wide text-[#171717] transition-all duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)] hover:opacity-60 sm:text-[17px] animate-page-in"
        >
          Leave
          <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
            →
          </span>
        </button>
      </div>
    </div>
  );
}
