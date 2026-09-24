"use client";

type ConfettiParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  color: string;
  shape: "circle" | "rect";
  opacity: number;
  gravity: number;
  drag: number;
};

// Soft, muted palette so it still feels like unsent.cc — not a birthday party.
const COLORS = [
  "#000"
];

let activeCanvas: HTMLCanvasElement | null = null;
let activeFrame: number | null = null;

function createParticles(
  count: number,
  originX: number,
  originY: number,
): ConfettiParticle[] {
  const particles: ConfettiParticle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 9;
    particles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 6,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12,
      size: 5 + Math.random() * 5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: Math.random() > 0.5 ? "circle" : "rect",
      opacity: 1,
      gravity: 0.22 + Math.random() * 0.08,
      drag: 0.985,
    });
  }
  return particles;
}

/**
 * Fires a soft confetti burst from roughly the given point on screen
 * (ratios of viewport width/height — defaults to center, lower-third,
 * near where the "Leave" button usually sits). Fully self-contained:
 * creates its own full-viewport canvas and tears it down when done.
 * Respects prefers-reduced-motion. Safe to call more than once.
 */
export function fireConfetti(originXRatio = 0.5, originYRatio = 0.75) {
  if (typeof window === "undefined") return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (prefersReducedMotion) return;

  if (activeCanvas) {
    activeCanvas.remove();
    activeCanvas = null;
  }
  if (activeFrame) {
    cancelAnimationFrame(activeFrame);
    activeFrame = null;
  }

  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.inset = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "9999";
  document.body.appendChild(canvas);
  activeCanvas = canvas;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const resize = () => {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
  };
  resize();

  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(dpr, dpr);

  const originX = window.innerWidth * originXRatio;
  const originY = window.innerHeight * originYRatio;
  let particles = createParticles(90, originX, originY);

  const start = performance.now();
  const DURATION = 2600;

  function tick(now: number) {
    const elapsed = now - start;
    ctx!.clearRect(0, 0, window.innerWidth, window.innerHeight);

    particles.forEach((p) => {
      p.vx *= p.drag;
      p.vy = p.vy * p.drag + p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      if (elapsed > DURATION * 0.55) {
        p.opacity = Math.max(
          0,
          1 - (elapsed - DURATION * 0.55) / (DURATION * 0.45),
        );
      }

      ctx!.save();
      ctx!.translate(p.x, p.y);
      ctx!.rotate((p.rotation * Math.PI) / 180);
      ctx!.globalAlpha = p.opacity;
      ctx!.fillStyle = p.color;
      if (p.shape === "circle") {
        ctx!.beginPath();
        ctx!.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx!.fill();
      } else {
        ctx!.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      }
      ctx!.restore();
    });

    particles = particles.filter(
      (p) => p.y < window.innerHeight + 40 && p.opacity > 0,
    );

    if (elapsed < DURATION && particles.length > 0) {
      activeFrame = requestAnimationFrame(tick);
    } else {
      canvas.remove();
      if (activeCanvas === canvas) activeCanvas = null;
      activeFrame = null;
    }
  }

  activeFrame = requestAnimationFrame(tick);
  window.addEventListener("resize", resize, { once: true });
}