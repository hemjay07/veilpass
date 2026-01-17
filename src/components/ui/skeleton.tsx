import { cn } from "@/lib/utils"

/**
 * Skeleton Component - Loading placeholder for content areas
 *
 * Loading State Pattern (consistent across all pages):
 *
 * DATA FETCHING PAGES (verify, analytics):
 * - Use Skeleton for content placeholders during data fetch
 * - Match the layout of the actual content
 * - Include aria-busy on parent container
 *
 * Example:
 * ```tsx
 * if (loading) {
 *   return (
 *     <Card aria-busy="true" aria-label="Loading...">
 *       <CardHeader>
 *         <Skeleton className="h-6 w-48" />
 *       </CardHeader>
 *       <CardContent>
 *         <Skeleton className="h-4 w-full mb-2" />
 *         <Skeleton className="h-4 w-3/4" />
 *       </CardContent>
 *     </Card>
 *   );
 * }
 * ```
 *
 * BUTTON LOADING STATES (forms):
 * - Use Spinner component inside Button
 * - Set aria-busy on button
 * - Disable button during loading
 *
 * Example:
 * ```tsx
 * <Button disabled={loading} aria-busy={loading}>
 *   {loading && <Spinner className="mr-2" />}
 *   {loading ? "Submitting..." : "Submit"}
 * </Button>
 * ```
 *
 * Accessibility:
 * - aria-hidden="true" on skeleton (decorative)
 * - motion-reduce: disables pulse animation
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted motion-reduce:animate-none motion-reduce:bg-muted/70",
        className
      )}
      aria-hidden="true"
      {...props}
    />
  )
}

export { Skeleton }
