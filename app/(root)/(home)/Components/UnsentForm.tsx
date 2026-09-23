"use client";

import { useLayoutEffect, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mono } from "@/libs/Font";
import { useResponsiveFontSize } from "@/libs/useResponsiveFontSize";

const UNSENT_MESSAGE_KEY = "unsent-message";
const MAX_MESSAGE_LENGTH = 100;

const morphTransition = {
  type: "tween" as const,
  duration: 0.6,
  ease: [0.16, 1, 0.3, 1] as const,
};

// Same values that used to live in the `text-[15px] sm:text-[20px]
// md:text-[26px] lg:text-[32px]` Tailwind classes — now resolved in JS
// so framer-motion can animate the value itself.
const MESSAGE_FONT_SIZE = { base: 15, sm: 20, md: 26, lg: 32 };

function getCounterColor(length: number) {
  if (length >= MAX_MESSAGE_LENGTH) return "text-[#9a3b32]";
  if (length > 80) return "text-[#171717]";
  return "text-[#9c9c9c]";
}

export default function UnsentForm() {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const fontSize = useResponsiveFontSize(MESSAGE_FONT_SIZE);

  const hasWord = message.trim().length > 0;

  useEffect(() => {
    if (window.matchMedia("(min-width: 641px)").matches) {
      textareaRef.current?.focus({ preventScroll: true });
    }
  }, []);

  useEffect(() => {
    router.prefetch("/submit");
  }, [router]);

  // useLayoutEffect (not useEffect) so the height is final BEFORE the
  // browser paints — this stops framer-motion from measuring a
  // mid-resize size and causing a visible jump during the transition.
  // `fontSize` is also a dep: it's resolved asynchronously (after the
  // initial paint) by useResponsiveFontSize, so the height must be
  // recomputed once it lands — otherwise the box stays sized for the
  // smaller base font and the larger text gets clipped by
  // overflow-hidden.
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [message, fontSize]);

  function handleContinue() {
    if (!hasWord) return;
    sessionStorage.setItem(UNSENT_MESSAGE_KEY, message);
    router.push("/submit");
  }

  return (
    <div className="w-full min-w-0">
      <div className="flex min-w-0 min-h-11 items-start sm:min-h-14">
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
          className={`${Mono.className} min-w-0 w-full flex-1 resize-none overflow-hidden bg-transparent py-1.5 font-light leading-normal text-[#171717] outline-none placeholder:text-[#9c9c9c] [caret-shape:bar] caret-[#171717]`}
        />
      </div>

      <div className="mt-2.5 flex h-12.5 items-center justify-between sm:mt-4 sm:h-15">
        <button
          type="button"
          onClick={handleContinue}
          className={`group inline-flex items-center gap-2 text-[15px] tracking-wide text-[#171717] transition-all duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)] hover:opacity-60 sm:text-[17px] ${
            hasWord
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "pointer-events-none translate-y-2 opacity-0"
          }`}
        >
          Continue
          <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
            →
          </span>
        </button>

        <motion.span
          layoutId="unsent-count"
          layout="preserve-aspect"
          className={`text-[11px] tabular-nums transition-colors duration-200 sm:text-xs ${getCounterColor(
            message.length,
          )}`}
          transition={morphTransition}
        >
          {message.length}/{MAX_MESSAGE_LENGTH}
        </motion.span>
      </div>
    </div>
  );
}
