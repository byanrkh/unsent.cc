"use client";

import { motion } from "framer-motion";
import { useTheme } from "@/libs/theme";

const switchTransition = {
  type: "spring" as const,
  stiffness: 500,
  damping: 32,
};

export default function ThemeToggle({
  className = "",
}: {
  className?: string;
}) {
  const { isDark, toggle, mounted } = useTheme();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggle}
      // Sembunyiin visual sampe mounted biar nggak ada micro-flicker icon
      // salah pas hydration, tapi tetep reserve ruang (nggak layout-shift).
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-[var(--foreground)]/15 bg-[var(--foreground)]/8 transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]/40 ${
        mounted ? "opacity-100" : "opacity-0"
      } ${className}`}
    >
      <motion.span
        animate={{ x: isDark ? 21 : 3 }}
        transition={switchTransition}
        className="absolute flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[var(--color-elevated)] text-[var(--foreground)] shadow-sm"
      >
        {/* Sun */}
        <motion.svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{
            opacity: isDark ? 0 : 1,
            scale: isDark ? 0.5 : 1,
            rotate: isDark ? -90 : 0,
          }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="absolute"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </motion.svg>

        {/* Moon */}
        <motion.svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{
            opacity: isDark ? 1 : 0,
            scale: isDark ? 1 : 0.5,
            rotate: isDark ? 0 : 90,
          }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="absolute"
        >
          <path d="M20.354 15.354A9 9 0 0 1 8.646 3.646 9.003 9.003 0 1 0 20.354 15.354Z" />
        </motion.svg>
      </motion.span>
    </button>
  );
}
