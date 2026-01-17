import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageWidth = "narrow" | "default" | "wide" | "full";

interface PageLayoutProps {
  children: ReactNode;
  /** Page width preset: narrow (640px), default (768px), wide (1024px), full (container) */
  width?: PageWidth;
  /** Additional class names */
  className?: string;
  /** Whether to add padding at top (for pages with progress tracker) */
  hasProgressTracker?: boolean;
}

const widthClasses: Record<PageWidth, string> = {
  narrow: "max-w-xl",     // 576px - verify page, simple forms
  default: "max-w-2xl",   // 672px - most forms (attest, disclose)
  wide: "max-w-4xl",      // 896px - dashboard, landing
  full: "",               // Full container width
};

/**
 * PageLayout provides consistent page-level layout:
 * - Centered container with max-width
 * - Consistent padding (responsive)
 * - Consistent vertical spacing
 * - Works with ProgressTracker by adjusting top padding
 */
export function PageLayout({
  children,
  width = "default",
  className,
  hasProgressTracker = false,
}: PageLayoutProps) {
  return (
    <div
      className={cn(
        "container mx-auto",
        // Vertical padding - less if progress tracker is present (it has its own padding)
        hasProgressTracker ? "py-6 md:py-10" : "py-10 md:py-16",
        // Width constraint
        widthClasses[width],
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * PageSection for consistent section spacing within a page
 */
interface PageSectionProps {
  children: ReactNode;
  className?: string;
  /** Title for the section */
  title?: string;
  /** Description below the title */
  description?: string;
}

export function PageSection({
  children,
  className,
  title,
  description,
}: PageSectionProps) {
  return (
    <section className={cn("mb-8 last:mb-0", className)}>
      {(title || description) && (
        <div className="mb-6">
          {title && (
            <h2 className="text-xl font-semibold mb-1">{title}</h2>
          )}
          {description && (
            <p className="text-zinc-400">{description}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

/**
 * PageHeader for consistent page header styling
 */
interface PageHeaderProps {
  title: string;
  description?: string;
  /** Additional element (e.g., help tooltip) */
  titleAddon?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  titleAddon,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-8", className)}>
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
        {title}
        {titleAddon}
      </h1>
      {description && (
        <p className="text-zinc-400">{description}</p>
      )}
    </div>
  );
}
