"use client";

import { useState } from "react";
import { Mono } from "@/libs/Font";

type ExploreCardProps = {
  to: string;
  message: string;
  date?: string;
};

export default function ExploreCard({ to, message, date }: ExploreCardProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const shareData = {
      title: "unsent.cc",
      text: `An unsent message to ${to} — read it on unsent.cc`,
      url: typeof window !== "undefined" ? window.location.href : "",
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user closed the share sheet — nothing to do
      }
      return;
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(shareData.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }

  return (
    <article className="group relative w-full rounded-2xl border border-[#171717]/8 bg-[#fbfaf8] px-6 py-6 shadow-[0_1px_2px_rgba(23,23,23,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(23,23,23,0.07)] sm:px-8 sm:py-8">
      <div className="flex items-start justify-between gap-4">
        <p className="text-xs tracking-wide text-[#9c9c9c] sm:text-sm">
          To <span className="text-[#171717]">{to}</span>
        </p>

        <button
          type="button"
          onClick={handleShare}
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

          <span
            role="status"
            className={`pointer-events-none absolute -top-8 right-0 whitespace-nowrap rounded-md bg-[#171717] px-2 py-1 text-[11px] text-white transition-opacity duration-200 ${
              copied ? "opacity-100" : "opacity-0"
            }`}
          >
            Link copied
          </span>
        </button>
      </div>

      <p
        className={`${Mono.className} mt-4 text-[16px] font-light leading-relaxed text-[#171717] sm:mt-5 sm:text-[19px]`}
      >
        {message}
      </p>

      {date && (
        <p className="mt-5 text-[11px] tracking-wide text-[#9c9c9c] sm:mt-6 sm:text-xs">
          {date}
        </p>
      )}
    </article>
  );
}
