"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ConfettiPiece {
  id: number;
  x: number;
  delay: number;
  color: string;
  size: number;
  duration: number;
}

/**
 * Lightweight CSS-only confetti animation
 * No external dependencies, respects reduced motion
 */
function Confetti({ count = 30 }: { count?: number }) {
  const [pieces, setPieces] = React.useState<ConfettiPiece[]>([]);
  const [shouldAnimate, setShouldAnimate] = React.useState(false);

  React.useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      return;
    }

    setShouldAnimate(true);

    // Generate confetti pieces
    const colors = ["#10B981", "#1E3A8A", "#F59E0B", "#8B5CF6", "#EC4899"];
    const newPieces: ConfettiPiece[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 6 + Math.random() * 8,
      duration: 2 + Math.random() * 1,
    }));
    setPieces(newPieces);

    // Clean up after animation
    const timer = setTimeout(() => {
      setShouldAnimate(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, [count]);

  if (!shouldAnimate || pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden="true">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${piece.x}%`,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
          }}
        >
          <div
            className="animate-confetti-spin"
            style={{
              width: piece.size,
              height: piece.size * 0.6,
              backgroundColor: piece.color,
              borderRadius: "2px",
            }}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * Animated checkmark that draws itself
 */
function AnimatedCheckmark({ className }: { className?: string }) {
  const [animate, setAnimate] = React.useState(false);

  React.useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setAnimate(!prefersReducedMotion);
  }, []);

  return (
    <svg
      className={cn("w-16 h-16 text-emerald-500", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        className={animate ? "animate-circle-draw" : ""}
        style={{
          strokeDasharray: 63,
          strokeDashoffset: animate ? 0 : 63,
        }}
      />
      <path
        d="M8 12l3 3 5-6"
        className={animate ? "animate-check-draw" : ""}
        style={{
          strokeDasharray: 20,
          strokeDashoffset: animate ? 0 : 20,
        }}
      />
    </svg>
  );
}

interface CelebrationProps {
  variant: "attestation" | "disclosure";
  onComplete?: () => void;
}

/**
 * Celebration component for success states
 * Shows confetti and celebratory message
 */
export function Celebration({ variant, onComplete }: CelebrationProps) {
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    // Auto-dismiss after animation
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 3500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  const messages = {
    attestation: {
      title: "Cryptographically Sealed!",
      subtitle: "Your compliance attestation is now secured on the blockchain.",
    },
    disclosure: {
      title: "Ready to Share!",
      subtitle: "Your selective disclosure is prepared for your auditor.",
    },
  };

  const { title, subtitle } = messages[variant];

  return (
    <>
      <Confetti count={variant === "attestation" ? 40 : 25} />
      <div className="text-center space-y-4">
        <AnimatedCheckmark className="mx-auto" />
        <div className="animate-fade-up">
          <h3 className="text-xl font-semibold text-emerald-400">{title}</h3>
          <p className="text-zinc-400 text-sm mt-1">{subtitle}</p>
        </div>
      </div>
    </>
  );
}
