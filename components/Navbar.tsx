"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";

// Tambahin/hapus halaman di sini aja, otomatis kepake di desktop & mobile.
const NAV_LINKS = [
  { href: "/explore", label: "Explore" },
  { href: "/about", label: "About" },
  { href: "/terms", label: "Terms" },
  { href: "/submit", label: "Submit" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Tutup menu tiap kali pindah halaman.
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Kunci scroll body pas menu mobile lagi kebuka.
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  return (
    <nav className="relative z-50 w-full px-6 pt-8 pb-8 sm:px-10 sm:pt-10 sm:pb-9">
      <div className="mx-auto flex max-w-175 items-center justify-between text-sm">
        <Link
          href="/"
          className="tracking-wide text-lg text-[var(--foreground)] transition-opacity hover:opacity-55"
        >
          unsent.cc
        </Link>

        <div className="flex items-center gap-5 sm:gap-8">
          {/* Desktop nav */}
          <ul className="hidden items-center gap-5 sm:flex sm:gap-8">
            {NAV_LINKS.map((link) => (
              <li
                key={link.href}
                className="text-[var(--foreground)] transition-opacity hover:opacity-55"
              >
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>

          {/* Kelihatan di mobile & desktop, gak ketutup di dalem menu */}
          <ThemeToggle />

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            className="relative flex h-8 w-8 flex-col items-center justify-center gap-[5px] sm:hidden"
          >
            <motion.span
              animate={isOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="h-[1.5px] w-5 bg-[var(--foreground)]"
            />
            <motion.span
              animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="h-[1.5px] w-5 bg-[var(--foreground)]"
            />
            <motion.span
              animate={isOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="h-[1.5px] w-5 bg-[var(--foreground)]"
            />
          </button>
        </div>
      </div>

      {/* Mobile expanded menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden sm:hidden"
          >
            <ul className="mx-auto flex max-w-175 flex-col gap-1 pt-6 text-base">
              {NAV_LINKS.map((link, index) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{
                    duration: 0.25,
                    ease: [0.16, 1, 0.3, 1],
                    delay: index * 0.04,
                  }}
                  className="border-b border-[var(--foreground)]/10 text-[var(--foreground)] transition-opacity hover:opacity-55"
                >
                  <Link href={link.href} className="block py-3">
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
