"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { subscribeToast } from "@/libs/toastBus";

const DISPLAY_MS = 4000;

export default function Toast() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => subscribeToast(setMessage), []);

  useEffect(() => {
    if (!message) return;
    const timeout = setTimeout(() => setMessage(null), DISPLAY_MS);
    return () => clearTimeout(timeout);
  }, [message]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[70] flex justify-center px-6 sm:bottom-8">
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto rounded-full bg-[#171717] px-4 py-2.5 text-center text-xs tracking-wide text-white shadow-lg sm:text-sm"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
