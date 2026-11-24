import { cn } from "@/lib/utils";

/** Hamburger that morphs into an X when `open`. Pure CSS transforms; no motion with prefers-reduced-motion. */
export function MenuToggleIcon({ open, className, duration = 300 }: { open: boolean; className?: string; duration?: number }) {
  const line = "absolute inset-x-0 h-[2px] rounded-full bg-current transition-all ease-out motion-reduce:transition-none";
  return (
    <span aria-hidden className={cn("relative inline-block size-5", className)} style={{ ["--d" as string]: `${duration}ms` }}>
      <span className={cn(line, "[transition-duration:var(--d)]", open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-[20%]")} />
      <span className={cn(line, "top-1/2 -translate-y-1/2 [transition-duration:var(--d)]", open ? "scale-x-0 opacity-0" : "opacity-100")} />
      <span className={cn(line, "[transition-duration:var(--d)]", open ? "top-1/2 -translate-y-1/2 -rotate-45" : "top-[80%] -translate-y-full")} />
    </span>
  );
}
