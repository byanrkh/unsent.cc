"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { jetbrainsMono } from "@/libs/Font";

export default function UnsentForm() {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  const hasWord = message.trim().length > 0;

  useEffect(() => {
    if (window.matchMedia("(min-width: 641px)").matches) {
      textareaRef.current?.focus({ preventScroll: true });
    }
  }, []);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [message]);

  function handleContinue() {
    if (!hasWord) return;
    router.push(`/submit?message=${encodeURIComponent(message)}`);
  }

  return (
    <div className="w-full min-w-0">
      <div className="flex min-w-0 min-h-11 items-start sm:min-h-14">
        <textarea
          ref={textareaRef}
          placeholder="Type your unsent message here..."
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          maxLength={600}
          rows={1}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`${jetbrainsMono.className} min-w-0 w-full flex-1 resize-none overflow-hidden bg-transparent py-1.5 text-[15px] font-light leading-normal text-[#171717] outline-none placeholder:text-[#9c9c9c] [caret-shape:bar] caret-[#171717] transition-[height] duration-100 ease-out sm:text-[20px] md:text-[26px] lg:text-[32px]`}
        />
      </div>

      <div className="mt-2.5 flex h-12.5 items-center sm:mt-4 sm:h-15">
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
      </div>
    </div>
  );
}
