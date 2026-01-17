import { cn } from "@/lib/utils"

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
