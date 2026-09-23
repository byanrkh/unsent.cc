"use client";

import { useLayoutEffect, type RefObject } from "react";

export function useAutoResizeTextarea(
  ref: RefObject<HTMLTextAreaElement | null>,
  message: string,
  fontSize: number,
) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [ref, message, fontSize]);
}