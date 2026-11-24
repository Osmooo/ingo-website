import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const fieldCls =
  "h-12 rounded-xl border-border bg-background px-4 text-base shadow-none focus-visible:bg-card focus-visible:ring-orange/30 focus-visible:border-orange md:text-[15px]";

export function Field({ label, required, optional, htmlFor, className, children }: {
  label: string; required?: boolean; /** visible "(optional)" hint, already translated */ optional?: string;
  htmlFor?: string; className?: string; children: ReactNode;
}) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
        {required && <span className="text-flame-ink">*</span>}
        {optional && <span className="font-normal text-muted-foreground">({optional})</span>}
      </Label>
      {children}
    </div>
  );
}

/** Pill-style radio group built on native inputs (works with FormData and keyboard).
 *  `multiple` = same pills as checkboxes (several answers; FormData joins them). */
export function ChoiceChips({ name, options, defaultValue, label, multiple }: {
  name: string; options: { value: string; label: string }[]; defaultValue?: string; label?: string; multiple?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2" role={multiple ? "group" : "radiogroup"} aria-label={label}>
      {options.map((o) => (
        <label key={o.value} className="cursor-pointer">
          <input type={multiple ? "checkbox" : "radio"} name={name} value={o.value} defaultChecked={o.value === defaultValue} className="peer sr-only" />
          <span className="inline-flex h-10 items-center rounded-full border bg-background px-4 text-sm font-medium transition-colors peer-checked:border-foreground peer-checked:bg-foreground peer-checked:text-background peer-focus-visible:ring-2 peer-focus-visible:ring-orange hover:border-apricot">
            {o.label}
          </span>
        </label>
      ))}
    </div>
  );
}

export function formToObject(form: HTMLFormElement) {
  const out: Record<string, string> = {};
  new FormData(form).forEach((v, k) => {
    out[k] = out[k] ? `${out[k]}, ${v}` : String(v);
  });
  return out;
}

export function SuccessMark() {
  return (
    <div className="mx-auto grid size-18 place-items-center rounded-full bg-orange text-foreground shadow-[0_12px_30px_-10px_var(--ingo-flame)]">
      <svg viewBox="0 0 24 24" className="size-9" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </div>
  );
}
