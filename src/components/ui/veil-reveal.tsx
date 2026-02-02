"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface VeilRevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

/**
 * VeilReveal - Signature animation component for VeilPass
 *
 * Reveals content with a magical "unveil" effect where the content
 * appears from behind a translucent veil with a blur-to-clear transition.
 *
 * Use for disclosed claims on the verify page to create a memorable
 * "moment of truth" as each claim reveals.
 */
export function VeilReveal({ children, delay = 0, className }: VeilRevealProps) {
  const [isRevealed, setIsRevealed] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      // Skip animation for reduced motion preference
      setIsRevealed(true);
      return;
    }

    // Delay the reveal animation
    const timer = setTimeout(() => {
      setIsRevealed(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-400",
        isRevealed ? "animate-veil-reveal" : "veil-hidden",
        className
      )}
    >
      {children}
    </div>
  );
}

