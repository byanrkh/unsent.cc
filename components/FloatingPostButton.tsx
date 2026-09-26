"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Cuma nongol di halaman-halaman ini — bukan di home (udah ada form) atau
// /submit (itu sendiri halaman post-nya).
const VISIBLE_PATHS = ["/explore", "/about", "/terms"];

export default function FloatingPostButton() {
  const pathname = usePathname();

  if (!VISIBLE_PATHS.includes(pathname)) return null;

  return (
    <Link
      href="/submit"
      aria-label="Write an unsent letter"
      className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-inverse-bg)] text-[var(--color-inverse-fg)] shadow-[0_8px_24px_rgba(var(--shadow-rgb),0.18)] transition-transform duration-200 hover:scale-105 active:scale-95 sm:bottom-10 sm:right-10"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M10 3v14M3 10h14"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </Link>
  );
}
