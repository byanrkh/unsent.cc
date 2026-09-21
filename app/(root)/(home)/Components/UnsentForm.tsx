"use client";

import { useEffect, useRef, useState } from "react";
import { jetbrainsMono } from "@/libs/Font";

export default function UnsentForm() {
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const hasWord = message.trim().length > 0;

  useEffect(() => {
    // Autofocus cuma di layar besar, biar keyboard mobile
    // nggak nongol tiba-tiba dan geser scroll.
    if (window.matchMedia("(min-width: 641px)").matches) {
      inputRef.current?.focus({ preventScroll: true });
    }
  }, []);

  function handleContinue() {
    if (!hasWord) return;
    // TODO: sambungin ke step berikutnya di flow
  }

  return (
    <div className="w-full min-w-0">
      <div className="flex min-w-0 min-h-[44px] items-center sm:min-h-[56px]">
        <input
          ref={inputRef}
          type="text"
          placeholder="Type your unsent message here..."
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          maxLength={600}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`${jetbrainsMono.className} min-w-0 w-full flex-1 bg-transparent py-1.5 text-[15px] font-light text-[#171717] outline-none placeholder:text-[#9c9c9c] [caret-shape:bar] caret-[#171717] sm:text-[20px] md:text-[26px] lg:text-[32px]`}
        />
      </div>

      <div className="mt-2.5 flex h-[50px] items-center sm:mt-4 sm:h-[60px]">
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
