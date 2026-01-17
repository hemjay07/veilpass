import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Input Component - Standardized form input for all pages
 *
 * Styling:
 * - Height: h-10 (40px) for consistent hit targets
 * - Padding: px-3 py-2
 * - Border: border-input (zinc-800)
 * - Focus: Uses focus-ring for consistent focus state
 *
 * Usage Pattern (must be consistent across all forms):
 *
 * <div className="space-y-2">
 *   <Label htmlFor="fieldId">Field Label</Label>
 *   <Input
 *     id="fieldId"
 *     type="text"
 *     placeholder="Placeholder text"
 *     className="bg-zinc-800 border-zinc-700"
 *   />
 * </div>
 *
 * Error State Pattern:
 *
 * {error && (
 *   <div
 *     role="alert"
 *     aria-describedby="fieldId"
 *     className="flex items-center gap-2 text-red-500 text-sm p-3 bg-red-500/10 border border-red-500/20 rounded-md"
 *   >
 *     <ErrorIcon />
 *     {error}
 *   </div>
 * )}
 *
 * DO NOT create one-off input styles. Always use this component.
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
