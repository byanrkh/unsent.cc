"use client";

import { useLayoutEffect, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Mono } from "@/libs/Font";

const UNSENT_MESSAGE_KEY = "unsent-message";
const MAX_MESSAGE_LENGTH = 100;

const morphTransition = {
  type: "tween" as const,
  duration: 0.6,
  ease: [0.16, 1, 0.3, 1] as const,
};

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

  useEffect(() => {
    const stored = sessionStorage.getItem(UNSENT_MESSAGE_KEY);
    if (stored) {
      setMessage(stored.slice(0, MAX_MESSAGE_LENGTH));
    }
  }, []);

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [message]);

  function handleLeave() {
    // Frontend only for now — no submission logic yet.
  }

  return (
    <div className="w-full min-w-0">
      <div className="flex flex-col gap-7 sm:gap-8">
        <label className="flex min-w-0 flex-col gap-1.5">
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
          <span className="text-xs tracking-wide text-[#9c9c9c] sm:text-sm">
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
            className={`${Mono.className} min-w-0 w-full resize-none overflow-hidden bg-transparent py-1.5 text-[15px] font-light leading-normal text-[#171717] outline-none placeholder:text-[#9c9c9c] [caret-shape:bar] caret-[#171717] sm:text-[20px] md:text-[24px]`}
          />
          <span
            className={`self-end text-[11px] tabular-nums transition-colors duration-200 sm:text-xs ${getCounterColor(
              message.length,
            )}`}
          >
            {message.length}/{MAX_MESSAGE_LENGTH}
          </span>
        </label>
      </div>

      <div className="mt-8 flex h-12.5 items-center sm:mt-10 sm:h-15">
        <button
          type="button"
          onClick={handleLeave}
          className="group inline-flex items-center gap-2 text-[15px] tracking-wide text-[#171717] transition-all duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)] hover:opacity-60 sm:text-[17px]"
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
