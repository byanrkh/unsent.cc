"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Mono, newsreader } from "@/libs/Font";
import { showToast } from "@/libs/toastBus";

type Format = "square" | "story";

type ShareModalProps = {
  open: boolean;
  onClose: () => void;
  id: string;
  to: string;
  message: string;
  date?: string;
  feltCount?: number;
};

const FORMATS: { id: Format; label: string; width: number; height: number }[] =
  [
    { id: "square", label: "Square", width: 1080, height: 1080 },
    { id: "story", label: "16:9", width: 1080, height: 1920 },
  ];

const INK = "#171717";
const CREAM = "#fbfaf8";
const MUTED = "#9c9c9c";
const BORDER = "rgba(23, 23, 23, 0.1)";

const modalTransition = {
  type: "tween" as const,
  duration: 0.35,
  ease: [0.16, 1, 0.3, 1] as const,
};

// --- canvas helpers ---------------------------------------------------

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Wraps text at word boundaries. If a single word is wider than
// maxWidth on its own (e.g. a long string with no spaces), it's broken
// character-by-character instead of being left to overflow the card.
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  function flushCurrent() {
    if (current) {
      lines.push(current);
      current = "";
    }
  }

  for (const word of words) {
    if (ctx.measureText(word).width > maxWidth) {
      flushCurrent();
      let chunk = "";
      for (const char of word) {
        const attempt = chunk + char;
        if (ctx.measureText(attempt).width > maxWidth && chunk) {
          lines.push(chunk);
          chunk = char;
        } else {
          chunk = attempt;
        }
      }
      current = chunk;
      continue;
    }

    const attempt = current ? `${current} ${word}` : word;
    if (ctx.measureText(attempt).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = attempt;
    }
  }
  flushCurrent();
  return lines;
}

// Shrinks the font size until the wrapped message fits inside maxHeight,
// or bottoms out at minSize and truncates the last line with an ellipsis.
function fitMessage(
  ctx: CanvasRenderingContext2D,
  text: string,
  fontFamily: string,
  maxWidth: number,
  maxHeight: number,
  maxSize: number,
  minSize: number,
) {
  let fontSize = maxSize;
  let lines: string[] = [];
  let lineHeight = 0;

  while (fontSize >= minSize) {
    ctx.font = `300 ${fontSize}px ${fontFamily}`;
    lineHeight = fontSize * 1.4;
    lines = wrapText(ctx, text, maxWidth);
    if (lines.length * lineHeight <= maxHeight) break;
    fontSize -= 2;
  }

  const maxLines = Math.max(1, Math.floor(maxHeight / lineHeight));
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    let last = kept[maxLines - 1];
    while (ctx.measureText(`${last}…`).width > maxWidth && last.length > 1) {
      last = last.slice(0, -1);
    }
    kept[maxLines - 1] = `${last}…`;
    lines = kept;
  }

  return { fontSize, lineHeight, lines };
}

async function drawCard(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  to: string,
  message: string,
  date: string | undefined,
  feltCount: number | undefined,
  monoFamily: string,
  serifFamily: string,
) {
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // background
  ctx.fillStyle = CREAM;
  ctx.fillRect(0, 0, width, height);

  const pad = width * 0.08;
  const cardX = pad;
  const cardY = pad;
  const cardW = width - pad * 2;
  const cardH = height - pad * 2;

  ctx.fillStyle = "#ffffff";
  roundedRect(ctx, cardX, cardY, cardW, cardH, width * 0.03);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = BORDER;
  roundedRect(ctx, cardX, cardY, cardW, cardH, width * 0.03);
  ctx.stroke();

  const innerX = cardX + cardW * 0.09;
  const innerW = cardW * 0.82;

  // "To {name}" label
  const labelSize = width * 0.024;
  ctx.textBaseline = "alphabetic";
  ctx.font = `${labelSize}px ${serifFamily}`;
  ctx.fillStyle = MUTED;
  const toLabel = "To: ";
  const toLabelWidth = ctx.measureText(toLabel).width;
  const labelY = cardY + cardH * 0.16;
  ctx.fillText(toLabel, innerX, labelY);
  ctx.fillStyle = INK;
  ctx.fillText(to, innerX + toLabelWidth, labelY);

  // "♥ N felt this" — right-aligned, same row as the "To:" label
  if (feltCount && feltCount > 0) {
    const feltLabel = `♥ ${feltCount} felt this`;
    ctx.font = `${labelSize}px ${serifFamily}`;
    ctx.fillStyle = MUTED;
    const feltWidth = ctx.measureText(feltLabel).width;
    ctx.fillText(feltLabel, cardX + cardW - cardW * 0.09 - feltWidth, labelY);
  }

  // message, vertically centered in the remaining space
  const messageTop = labelY + cardH * 0.06;
  const messageMaxHeight = cardH * 0.6;
  const { fontSize, lineHeight, lines } = fitMessage(
    ctx,
    message,
    monoFamily,
    innerW,
    messageMaxHeight,
    width * 0.052,
    width * 0.026,
  );

  const blockHeight = lines.length * lineHeight;
  const messageCenterY = messageTop + messageMaxHeight / 2;
  let cursorY = messageCenterY - blockHeight / 2 + fontSize * 0.85;

  ctx.font = `300 ${fontSize}px ${monoFamily}`;
  ctx.fillStyle = INK;
  for (const line of lines) {
    ctx.fillText(line, innerX, cursorY);
    cursorY += lineHeight;
  }

  // footer: date (left) + wordmark (right)
  const footerY = cardY + cardH * 0.9;
  const footerSize = width * 0.02;

  if (date) {
    ctx.font = `${footerSize}px ${serifFamily}`;
    ctx.fillStyle = MUTED;
    ctx.fillText(date, innerX, footerY);
  }

  ctx.font = `italic ${footerSize * 1.05}px ${serifFamily}`;
  ctx.fillStyle = MUTED;
  const wordmark = "unsent.cc";
  const wordmarkWidth = ctx.measureText(wordmark).width;
  ctx.fillText(wordmark, cardX + cardW - cardW * 0.09 - wordmarkWidth, footerY);
}

function dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
  return fetch(dataUrl)
    .then((res) => res.blob())
    .then((blob) => new File([blob], filename, { type: "image/png" }));
}

// --- component ----------------------------------------------------------

export default function ShareModal({
  open,
  onClose,
  id,
  to,
  message,
  date,
  feltCount = 0,
}: ShareModalProps) {
  const [format, setFormat] = useState<Format>("square");
  const [showFeltCount, setShowFeltCount] = useState(false);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const active = FORMATS.find((f) => f.id === format)!;

  // Portals need a real document.body to attach to, which only exists
  // client-side — avoids an SSR/hydration mismatch.
  useEffect(() => {
    setMounted(true);
  }, []);

  // The felt count badge is opt-in and off by default every time the
  // modal is (re)opened, rather than remembering the last toggle state.
  useEffect(() => {
    if (open) {
      setShowFeltCount(false);
      setCopied(false);
    }
  }, [open]);

  // Lock scroll + Esc to close
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
    };
  }, []);

  // Redraw whenever the modal opens or the format changes
  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    async function render() {
      setRendering(true);
      const monoFamily = Mono.style.fontFamily;
      const serifFamily = newsreader.style.fontFamily;

      try {
        await document.fonts.ready;
      } catch {
        // continue anyway — worst case the fallback font is used
      }

      const canvas = canvasRef.current;
      if (!canvas || cancelled) return;

      await drawCard(
        canvas,
        active.width,
        active.height,
        to,
        message,
        date,
        showFeltCount ? feltCount : undefined,
        monoFamily,
        serifFamily,
      );

      if (!cancelled) {
        setDataUrl(canvas.toDataURL("image/png"));
        setRendering(false);
      }
    }

    render();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, format, to, message, date, feltCount, showFeltCount]);

  async function handleDownload() {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `unsent-${to.toLowerCase().replace(/\s+/g, "-")}.png`;
    a.click();
    showToast("Downloaded");
  }

  async function handleShare() {
    if (!dataUrl) return;
    const file = await dataUrlToFile(dataUrl, "unsent.png");

    if (
      typeof navigator !== "undefined" &&
      navigator.canShare?.({ files: [file] })
    ) {
      try {
        await navigator.share({
          files: [file],
          title: "unsent.cc",
          text: `An unsent message to ${to} — read it on unsent.cc`,
        });
      } catch {
        // user cancelled the share sheet — nothing to do
      }
      return;
    }

    handleDownload();
  }

  // Bikin link langsung ke surat ini — bukan slug, cuma ?letter=<id>
  // di /explore. Pas dibuka, ExploreSearch yang nge-pin surat ini ke atas.
  function getShareUrl() {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/explore?letter=${id}`;
  }

  async function handleCopyLink() {
    const url = getShareUrl();

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback buat browser lama / non-secure context yang gak punya
        // Clipboard API.
        const textarea = document.createElement("textarea");
        textarea.value = url;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setCopied(true);
      showToast("Link copied");
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
      copiedTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("Couldn't copy the link");
    }
  }

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#171717]/40 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={modalTransition}
            className="w-full max-w-md rounded-3xl border border-[#171717]/10 bg-[#fbfaf8] p-5 shadow-[0_20px_60px_rgba(23,23,23,0.18)] sm:p-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-medium text-[#171717] sm:text-lg">
                Share this letter
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="-m-1.5 rounded-full p-1.5 text-[#9c9c9c] transition-colors duration-200 hover:text-[#171717]"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                >
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </svg>
              </button>
            </div>

            {/* copy link */}
            <button
              type="button"
              onClick={handleCopyLink}
              className={`mt-4 flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-[13px] transition-colors duration-200 ${
                copied
                  ? "border-[#171717]/15 bg-[#171717]/5 text-[#171717]"
                  : "border-[#171717]/15 text-[#171717] hover:bg-[#171717]/5"
              }`}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 text-[#9c9c9c]"
              >
                <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
                <path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 0 0 7.07 7.07l1.5-1.5" />
              </svg>
              {copied ? "Link copied!" : "Copy link to this letter"}
            </button>

            {/* format toggle + felt count */}
            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="inline-flex rounded-full border border-[#171717]/10 bg-white p-1">
                {FORMATS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFormat(f.id)}
                    className={`relative rounded-full px-4 py-1.5 text-[13px] transition-colors duration-200 ${
                      format === f.id
                        ? "text-[#171717]"
                        : "text-[#9c9c9c] hover:text-[#171717]"
                    }`}
                  >
                    {format === f.id && (
                      <motion.span
                        layoutId="share-format-pill"
                        className="absolute inset-0 rounded-full bg-[#fbfaf8] border border-[#171717]/10"
                        transition={modalTransition}
                      />
                    )}
                    <span className="relative">{f.label}</span>
                  </button>
                ))}
              </div>

              {feltCount > 0 && (
                <label className="flex shrink-0 items-center gap-2 text-[11px] tracking-wide text-[#9c9c9c] sm:text-xs">
                  <span className="whitespace-nowrap">Felt Count</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={showFeltCount}
                    aria-label="Show felt count on the shared image"
                    onClick={() => setShowFeltCount((prev) => !prev)}
                    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ${
                      showFeltCount ? "bg-[#171717]" : "bg-[#171717]/15"
                    }`}
                  >
                    <motion.span
                      animate={{ x: showFeltCount ? 16 : 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 32,
                      }}
                      className="absolute left-0.5 h-4 w-4 rounded-full bg-white shadow-sm"
                    />
                  </button>
                </label>
              )}
            </div>

            {/* preview */}
            <div className="mt-4 flex justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={format}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={modalTransition}
                  className={`relative overflow-hidden rounded-2xl border border-[#171717]/10 bg-white ${
                    format === "square"
                      ? "aspect-square w-full"
                      : "aspect-[9/16] h-[52vh] max-h-[420px] w-auto"
                  }`}
                >
                  {dataUrl && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={dataUrl}
                      alt="Share preview"
                      className="h-full w-full object-cover"
                    />
                  )}
                  {rendering && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        className="animate-spin text-[#9c9c9c]"
                      >
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* actions */}
            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={handleShare}
                disabled={!dataUrl || rendering}
                className="flex-1 rounded-full bg-[#171717] px-4 py-2.5 text-[13px] text-white transition-opacity duration-200 hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Share
              </button>
              <button
                type="button"
                onClick={handleDownload}
                disabled={!dataUrl || rendering}
                className="flex-1 rounded-full border border-[#171717]/15 px-4 py-2.5 text-[13px] text-[#171717] transition-colors duration-200 hover:bg-[#171717]/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Download
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
