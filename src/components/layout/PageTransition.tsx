"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

interface PageTransitionProps {
  children: React.ReactNode;
}

/**
 * PageTransition - Fade animation wrapper for smooth page navigation
 *
 * Features:
 * - 150ms fade-in animation on page change
 * - Respects prefers-reduced-motion (animation disabled)
 * - No layout shift during transition
 * - Works with Next.js App Router
 */
export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [currentChildren, setCurrentChildren] = useState(children);
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      // Skip animation for reduced motion preference
      setCurrentChildren(children);
      return;
    }

    // Only animate if path actually changed
    if (prevPathRef.current !== pathname) {
      // Quick fade out
      setIsVisible(false);

      // After fade out, update content and fade in
      const timeout = setTimeout(() => {
        setCurrentChildren(children);
        setIsVisible(true);
        prevPathRef.current = pathname;
      }, 100); // 100ms for fade-out, then fade-in

      return () => clearTimeout(timeout);
    } else {
      // Same path, just update children directly
      setCurrentChildren(children);
    }
  }, [pathname, children]);

  return (
    <div
      className="page-transition-wrapper"
      style={{
        opacity: isVisible ? 1 : 0,
        transition: "opacity 150ms ease-out",
      }}
    >
      {currentChildren}
    </div>
  );
}
