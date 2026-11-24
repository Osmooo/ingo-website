import { SPLIT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Tajarib-style headline: Black part, then Light part (dictionary "|" marks the split).
 * Mirrors the specimen's weight contrast (خط تجارب أسود / خط تجارب رفيع) in one line.
 */
export function Display({ text, className, lightClassName }: { text: string; className?: string; lightClassName?: string }) {
  const [heavy, light] = text.split(SPLIT);
  return (
    <>
      <span className={cn("font-black", className)}>{heavy}</span>
      {light && <span className={cn("block font-light", lightClassName)}>{light}</span>}
    </>
  );
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-sm font-medium text-flame-ink", className)}>
      <span className="h-px w-6 bg-current" />
      {children}
    </span>
  );
}

export function SectionHeading({ eyebrow, title, sub, center, className }: {
  eyebrow?: string; title: string; sub?: string; center?: boolean; className?: string;
}) {
  return (
    <div className={cn("mb-10 max-w-3xl md:mb-14", center && "mx-auto text-center", className)}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="mt-3 text-4xl leading-[1.2] md:text-5xl lg:text-6xl">
        <Display text={title} />
      </h2>
      {sub && <p className="mt-4 text-lg font-light text-muted-foreground md:text-xl">{sub}</p>}
    </div>
  );
}
