import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  /** Remove vertical padding (useful for custom layouts) */
  noPadding?: boolean;
}

/**
 * Container wraps content with consistent max-width and padding.
 * Uses Tailwind container class which is configured in tailwind.config.ts
 * with max-width of 1280px and responsive padding.
 */
export function Container({ children, className, noPadding = false }: ContainerProps) {
  return (
    <div
      className={cn(
        "container mx-auto",
        !noPadding && "py-10 md:py-16",
        className
      )}
    >
      {children}
    </div>
  );
}
