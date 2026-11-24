import { cn } from "@/lib/utils";

/** INGO wordmark, traced from the packaging artwork. Inherits `color`. */
export const LOGO_PATHS = (
  <>
    <rect x="47" y="106" width="87" height="450" />
    <path d="M225 556V132h87v18c30-17 60-25 93-25 100 0 182 80 182 180v251h-87V305c0-52-42-93-95-93-52 0-93 41-93 93v251z" />
    <path d="M888 556A225 225 0 1 1 1077 205l-18 55-56-12A146 146 0 1 0 1014 385H890l41-35-41-35h212c0 140-90 241-214 241z" />
    <path fillRule="evenodd" d="M1376 125a216 216 0 1 1 0 432a216 216 0 1 1 0-432zm0 88a128 128 0 1 0 0 256a128 128 0 1 0 0-256z" />
  </>
);

export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="40 100 1560 462" fill="currentColor" role="img" aria-label="INGO" className={cn("h-7 w-auto", className)}>
      {LOGO_PATHS}
    </svg>
  );
}
