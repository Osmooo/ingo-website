import { useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowDown, Check, ClipboardList, Coffee, CupSoda, Droplets, FileText, Fuel, HandCoins, MapPinned,
  Minimize2, Settings, ShoppingBasket, Store, Timer, UtensilsCrossed, Wrench,
} from "lucide-react";
import { toast } from "sonner";
import AnimatedContent from "@/components/AnimatedContent";
import CountUp from "@/components/CountUp";
import SpotlightCard from "@/components/SpotlightCard";
import { ChoiceChips, Field, SuccessMark, fieldCls, formToObject } from "@/components/site/form-bits";
import { FLAVOURS, MachineDrinks } from "@/components/site/machine-drinks";
import { Display, Eyebrow, SectionHeading } from "@/components/site/section-heading";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CONFIG, sendSubmission } from "@/lib/config";
import { useI18n } from "@/lib/i18n";
import { usePageTitle } from "@/lib/use-title";
import { asset } from "@/lib/asset";

const PHONE = "^(05|\\+9665|9665)[0-9]{8}$";
const MACHINE = asset("img/ingo-machine.webp");
const BROCHURE = asset("img/ingo-machine-brochure.webp");

export default function Business() {
  const { t, lang, num } = useI18n();
  usePageTitle(t("title.business"));
  const formRef = useRef<HTMLDivElement>(null);
  const toForm = () => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const features = [
    { icon: Coffee, k: "1" }, { icon: HandCoins, k: "2" }, { icon: Wrench, k: "3" }, { icon: Minimize2, k: "4" },
  ] as const;

  const places = [
    { icon: ShoppingBasket, k: "biz.p1" }, { icon: Store, k: "biz.p2" }, { icon: UtensilsCrossed, k: "biz.p3" }, { icon: Fuel, k: "biz.p4" },
  ] as const;

  const steps = [
    { icon: ClipboardList, t: t("biz.st1.t"), b: t("biz.st1.b") },
    { icon: MapPinned, t: t("biz.st2.t"), b: t("biz.st2.b") },
    { icon: Wrench, t: t("biz.st3.t"), b: t("biz.st3.b") },
    { icon: Coffee, t: t("biz.st4.t"), b: t("biz.st4.b") },
  ];

  return (
    <>
      {/* hero — the real machine */}
      <section className="relative -mt-18 overflow-hidden bg-pattern-orange pt-18">
        <div className="container-ingo grid items-center gap-10 py-14 md:grid-cols-[1.1fr_.9fr] md:py-20">
          <AnimatedContent trigger="mount" distance={30} duration={0.8}>
            <Eyebrow className="text-foreground [&>span]:bg-foreground">{t("biz.eyebrow")}</Eyebrow>
            <h1 className="mt-4 max-w-3xl text-5xl leading-[1.15] md:text-6xl lg:text-7xl"><Display text={t("biz.title")} /></h1>
            <p className="mt-5 max-w-2xl text-lg font-medium md:text-xl">{t("biz.sub")}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              {/* buttons stay put; only the arrow nudges down on hover to hint at the form below */}
              <Button size="lg" onClick={toForm} className="group h-14 rounded-full bg-foreground px-8 text-base font-bold text-background hover:bg-black">
                {t("biz.cta")} <ArrowDown aria-hidden className="size-5 transition-transform duration-200 group-hover:translate-y-0.5 motion-reduce:transition-none" />
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 rounded-full border-2 border-foreground bg-transparent px-8 text-base font-bold text-foreground hover:bg-foreground hover:text-background">
                <a href={BROCHURE} target="_blank" rel="noopener">
                  <FileText className="size-5" /> {t("biz.brochure")}
                </a>
              </Button>
            </div>
          </AnimatedContent>

          <AnimatedContent trigger="mount" delay={0.15} distance={50} duration={1}>
            <div className="relative mx-auto w-full max-w-[420px]">
              {/* cream stage so the photo's white backdrop melts in */}
              <div className="relative overflow-hidden rounded-[2rem] bg-background p-6 shadow-[0_40px_80px_-30px_rgba(90,30,0,.55)]">
                <img
                  src={MACHINE}
                  alt={t("biz.machineAlt")}
                  width={1285}
                  height={2000}
                  className="mx-auto h-[380px] w-auto mix-blend-multiply md:h-[520px]"
                  fetchPriority="high"
                />
              </div>
              <div className="absolute start-3 bottom-10 flex items-center gap-3 rounded-2xl bg-card px-4 py-3 text-foreground shadow-xl lg:-start-8">
                <span className="grid size-10 place-items-center rounded-xl bg-orange text-foreground"><Timer className="size-5" /></span>
                <span className="text-sm leading-tight">
                  <b className="block text-base">{t("biz.badge.time")}</b>
                  {t("biz.w1.t")}
                </span>
              </div>
              <div className="absolute end-3 top-10 flex items-center gap-3 rounded-2xl bg-card px-4 py-3 text-foreground shadow-xl">
                <span className="grid size-10 place-items-center rounded-xl bg-foreground text-background"><CupSoda className="size-5" /></span>
                <span className="text-sm leading-tight">
                  <b className="block text-base">{t("biz.badge.drinks")}</b>
                  {t("biz.drinks")}
                </span>
              </div>
            </div>
          </AnimatedContent>
        </div>
      </section>

      {/* the INGO 2-drink machine: two drinks at a time, picked from 10+ flavours */}
      <MachineDrinks machine={MACHINE} />

      {/* 1. is it for my kind of place? */}
      <section className="pb-20 md:pb-24">
        <div className="container-ingo">
          <SectionHeading title={t("biz.places")} />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {places.map(({ icon: Icon, k }, i) => (
              <AnimatedContent className="h-full" key={k} distance={30} delay={i * 0.06} duration={0.7}>
                <div className="motion-lift group flex h-full flex-col items-center justify-center gap-4 rounded-3xl bg-card px-4 py-10 text-center ring-1 ring-border transition-transform duration-300 hover:-translate-y-1">
                  <span className="grid size-16 place-items-center rounded-2xl bg-card text-flame-ink shadow-sm transition-colors group-hover:bg-orange group-hover:text-foreground">
                    <Icon className="size-8" />
                  </span>
                  <span className="text-lg font-bold">{t(k)}</span>
                </div>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      {/* 2. how it works */}
      <section className="pb-20 md:pb-24">
        <div className="container-ingo">
          <SectionHeading title={t("biz.how")} />
          <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ icon: Icon, ...s }, i) => (
              <AnimatedContent className="h-full" key={s.t} distance={40} delay={i * 0.08} duration={0.8}>
                <li className="relative h-full list-none rounded-3xl border bg-card p-7">
                  <span className="absolute top-6 end-7 text-5xl font-black text-secondary">{num(i + 1)}</span>
                  <div className="mb-6 grid size-14 place-items-center rounded-2xl bg-orange text-foreground">
                    <Icon className="size-7" />
                  </div>
                  <h3 className="text-xl font-bold">{s.t}</h3>
                  <p className="mt-2 text-muted-foreground">{s.b}</p>
                </li>
              </AnimatedContent>
            ))}
          </ol>
        </div>
      </section>

      {/* 3. the machine: the orange band from the brochure */}
      <section className="bg-flame text-foreground">
        <div className="container-ingo grid gap-px py-2 sm:grid-cols-2 lg:grid-cols-[auto_1fr_1fr_1fr_1fr] lg:items-center">
          <h2 className="py-6 text-4xl sm:col-span-2 lg:col-span-1 lg:pe-10"><Display text={t("biz.why")} /></h2>
          {[
            { icon: Timer, stat: <CountUp to={30} duration={1.6} prefix={lang === "ar" ? "أقل من " : "< "} suffix={lang === "ar" ? " ثانية" : "s"} />, head: t("biz.w1.t"), b: t("biz.w1.b") },
            { icon: CupSoda, stat: <CountUp to={10} duration={1.6} prefix={lang === "ar" ? "أكثر من " : ""} suffix={lang === "ar" ? "" : "+"} />, head: t("biz.w2.t"), b: t("biz.w2.b") },
            { icon: Droplets, stat: null, head: t("biz.w3.t"), b: t("biz.w3.b") },
            { icon: Settings, stat: null, head: t("biz.w4.t"), b: t("biz.w4.b") },
          ].map(({ icon: Icon, stat, head, b }, i) => (
            <div key={i} className="flex items-start gap-4 border-foreground/20 py-6 lg:border-s lg:ps-8">
              <Icon className="mt-1 size-7 shrink-0" />
              <div>
                {stat && <p className="text-2xl leading-none font-black">{stat}</p>}
                <p className={stat ? "mt-1 font-bold" : "text-lg font-bold"}>{head}</p>
                <p>{b}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. the four brochure features */}
      <section className="py-20 md:py-24">
        <div className="container-ingo">
          <SectionHeading eyebrow={t("biz.eyebrow")} title={t("biz.feat.title")} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, k }, i) => (
              <AnimatedContent className="h-full" key={k} distance={40} delay={i * 0.08} duration={0.8}>
                <SpotlightCard theme="light" spotlightColor="rgba(238, 138, 46, 0.35)" className="h-full rounded-3xl p-7">
                  <div className="mb-6 grid size-14 place-items-center rounded-2xl bg-secondary text-flame-ink">
                    <Icon className="size-7" />
                  </div>
                  <h3 className="text-xl font-bold">{t(`biz.f${k}.t`)}</h3>
                  <p className="mt-2 text-muted-foreground">{t(`biz.f${k}.b`)}</p>
                </SpotlightCard>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      {/* 5. form + benefits, then 6. FAQ */}
      <section id="register" className="scroll-mt-21 pb-20 md:pb-28" ref={formRef}>
        <div className="container-ingo grid items-start gap-8 lg:grid-cols-[.8fr_1.2fr]">
          <aside className="grid gap-5 lg:sticky lg:top-28">
            <div className="rounded-[2rem] bg-card p-8 ring-1 ring-border">
              <img src={MACHINE} alt="" aria-hidden className="float-end -mt-2 -me-2 ms-3 h-36 w-auto mix-blend-multiply" />
              <h2 className="text-3xl"><Display text={t("biz.ben")} /></h2>
              <ul className="mt-5 grid gap-3.5">
                {(["biz.ben1", "biz.ben2", "biz.ben3", "biz.ben4", "biz.ben5", "biz.ben6"] as const).map((k) => (
                  <li key={k} className="flex items-start gap-3">
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-orange text-foreground"><Check className="size-3.5" /></span>
                    <span className="font-medium">{t(k)}</span>
                  </li>
                ))}
              </ul>
              {/* direct channels beside the enquiry (existing contact details from the packaging) */}
              <p className="mt-6 border-t border-foreground/10 pt-4 text-sm text-muted-foreground">
                {t("biz.direct")}{" "}
                <a href={`tel:${CONFIG.phone}`} dir="ltr" className="font-bold text-foreground hover:underline">{CONFIG.phone}</a>
                {" · "}
                <a href={`mailto:${CONFIG.email}`} dir="ltr" className="font-bold text-foreground hover:underline">{CONFIG.email}</a>
              </p>
            </div>
            <a
              href={BROCHURE}
              target="_blank"
              rel="noopener"
              className="group flex items-center gap-4 overflow-hidden rounded-[2rem] border bg-card p-4 transition-shadow hover:shadow-[0_20px_40px_-20px_rgba(150,70,20,.45)]"
            >
              <img src={BROCHURE} alt="" aria-hidden className="h-28 w-auto rounded-xl ring-1 ring-border" loading="lazy" />
              <span className="flex-1">
                <span className="block font-bold">{t("biz.brochure")}</span>
                <span className="text-sm text-muted-foreground">{t("biz.brochureSub")}</span>
              </span>
              <FileText className="size-6 text-flame-ink transition-transform group-hover:-translate-y-0.5" />
            </a>
          </aside>
          <RegistrationForm />
        </div>
      </section>

      {/* FAQ */}
      <section className="pb-24">
        <div className="container-ingo">
          <SectionHeading title={t("biz.faq")} />
          <Accordion type="single" collapsible className="max-w-3xl rounded-3xl border bg-card px-6">
            {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16] as const).map((n) => (
              <AccordionItem key={n} value={`q${n}`}>
                <AccordionTrigger className="py-5 text-start text-base font-bold hover:no-underline">{t(`biz.q${n}`)}</AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground">{t(`biz.a${n}`)}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </>
  );
}

function Group({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  const { num } = useI18n();
  return (
    <fieldset className="grid gap-5 border-b pb-8 last-of-type:border-0">
      <legend className="mb-5 flex items-center gap-3 text-lg font-extrabold">
        <span className="grid size-8 place-items-center rounded-full bg-orange text-sm text-foreground">{num(n)}</span>
        {title}
      </legend>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function RegistrationForm() {
  const { t, range } = useI18n();
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const formKey = useRef(0);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.reportValidity()) { toast.error(t("form.required")); return; }
    setBusy(true);
    try {
      const data = formToObject(form);
      await sendSubmission(CONFIG.businessEndpoint, `INGO — Machine registration: ${data.company}`, data);
      setDone(true);
    } catch {
      toast.error(t("form.error"));
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-[2rem] border bg-card p-10 text-center md:p-14">
        <SuccessMark />
        <h2 className="mt-6 text-3xl font-extrabold">{t("biz.doneT")}</h2>
        <p className="mx-auto mt-3 max-w-md text-lg text-muted-foreground">{t("biz.doneB")}</p>
        <Button variant="outline" className="mt-8 h-12 rounded-full border-2 border-foreground px-6 font-bold" onClick={() => { formKey.current++; setDone(false); }}>
          {t("biz.again")}
        </Button>
      </div>
    );
  }


  return (
    <form key={formKey.current} onSubmit={submit} noValidate className="grid gap-8 rounded-[2rem] border bg-card p-6 shadow-[0_30px_60px_-40px_rgba(150,70,20,.4)] sm:p-10">
      <div>
        <h2 className="text-3xl md:text-4xl"><Display text={t("biz.formT")} /></h2>
        <p className="mt-1 text-muted-foreground">{t("biz.formB")}</p>
      </div>

      <Group n={1} title={t("biz.g1")}>
        <Field label={t("biz.company")} required htmlFor="b-company" className="sm:col-span-2">
          <Input id="b-company" name="company" required autoComplete="organization" className={fieldCls} />
        </Field>
        <Field label={t("biz.cr")} required htmlFor="b-cr">
          <Input id="b-cr" name="cr_number" required inputMode="numeric" pattern="[0-9]{10}" placeholder="1010xxxxxx" dir="ltr" className={fieldCls} />
        </Field>
        <Field label={t("biz.vat")} optional={t("optional")} htmlFor="b-vat">
          <Input id="b-vat" name="vat_number" inputMode="numeric" pattern="[0-9]{15}" placeholder="3xxxxxxxxxxxxx3" dir="ltr" className={fieldCls} />
        </Field>
        <Field label={t("biz.type")} required className="sm:col-span-2">
          <ChoiceChips
            name="business_type"
            label={t("biz.type")}
            defaultValue="Grocery"
            options={[
              { value: "Grocery", label: t("biz.t.grocery") },
              { value: "Mini market", label: t("biz.t.mini") },
              { value: "Kiosk", label: t("biz.t.kiosk") },
              { value: "Supermarket", label: t("biz.t.super") },
              { value: "Fuel station", label: t("biz.t.fuel") },
              { value: "Restaurant", label: t("biz.t.restaurant") },
              { value: "Cafeteria", label: t("biz.t.cafeteria") },
              { value: "Office", label: t("biz.t.office") },
              { value: "Other", label: t("biz.t.other") },
            ]}
          />
        </Field>
      </Group>

      <Group n={2} title={t("biz.g2")}>
        <Field label={t("biz.contact")} required htmlFor="b-name">
          <Input id="b-name" name="contact_name" required autoComplete="name" className={fieldCls} />
        </Field>
        <Field label={t("biz.role")} optional={t("optional")} htmlFor="b-role">
          <Input id="b-role" name="job_title" autoComplete="organization-title" className={fieldCls} />
        </Field>
        <Field label={t("biz.phone")} required htmlFor="b-phone">
          <Input id="b-phone" name="phone" type="tel" required pattern={PHONE} placeholder="05xxxxxxxx" dir="ltr" autoComplete="tel" className={fieldCls} />
        </Field>
        <Field label={t("biz.email")} required htmlFor="b-email">
          <Input id="b-email" name="email" type="email" required dir="ltr" autoComplete="email" className={fieldCls} />
        </Field>
      </Group>

      <Group n={3} title={t("biz.g3")}>
        <Field label={t("biz.arr")} required className="sm:col-span-2">
          <ChoiceChips name="preferred_option" label={t("biz.arr")} defaultValue="Free loan 12 months" options={[
            { value: "Free loan 12 months", label: t("biz.arr.loan") },
            { value: "Free loan 6 months", label: t("biz.arr.loan6") },
            { value: "Purchase (SAR 2,500 incl. VAT)", label: t("biz.arr.buy") },
            { value: "Not sure", label: t("biz.arr.unsure") },
          ]} />
        </Field>
        <Field label={t("biz.branches")} required htmlFor="b-branches">
          <Input id="b-branches" name="branches" type="number" min={1} defaultValue={1} required className={fieldCls} />
        </Field>
        <Field label={t("biz.traffic")}>
          <Select name="daily_customers" defaultValue="100-300">
            <SelectTrigger className={`${fieldCls} w-full data-[size=default]:h-12`}><SelectValue /></SelectTrigger>
            <SelectContent>
              {["< 100", "100-300", "300-600", "600+"].map((v) => <SelectItem key={v} value={v}>{range(v)}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label={t("biz.cups")}>
          <Select name="expected_cups_per_day" defaultValue="unsure">
            <SelectTrigger className={`${fieldCls} w-full data-[size=default]:h-12`}><SelectValue /></SelectTrigger>
            <SelectContent>
              {["< 30", "30-60", "60-100", "100+"].map((v) => <SelectItem key={v} value={v}>{range(v)}</SelectItem>)}
              <SelectItem value="unsure">{t("biz.cupsUnsure")}</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label={t("biz.start")}>
          <Select name="start_timing" defaultValue="unsure">
            <SelectTrigger className={`${fieldCls} w-full data-[size=default]:h-12`}><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="asap">{t("biz.start.now")}</SelectItem>
              <SelectItem value="within-1-month">{t("biz.start.month")}</SelectItem>
              <SelectItem value="1-3-months">{t("biz.start.later")}</SelectItem>
              <SelectItem value="unsure">{t("biz.start.unsure")}</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label={t("biz.space")}>
          <Select name="space" defaultValue="1-2 m²">
            <SelectTrigger className={`${fieldCls} w-full data-[size=default]:h-12`}><SelectValue /></SelectTrigger>
            <SelectContent>
              {["< 1 m²", "1-2 m²", "2+ m²"].map((v) => <SelectItem key={v} value={v}>{range(v)}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label={t("biz.power")}>
          <ChoiceChips name="power_outlet" label={t("biz.power")} defaultValue="Yes" options={[
            { value: "Yes", label: t("biz.yes") }, { value: "No", label: t("biz.no") }, { value: "Not sure", label: t("biz.unsure") },
          ]} />
        </Field>
        <Field label={t("biz.bev")} optional={t("optional")} className="sm:col-span-2">
          <ChoiceChips name="preferred_drinks" multiple label={t("biz.bev")} options={[
            ...FLAVOURS.map((f) => ({ value: f.value, label: t(f.name) })),
            { value: "Not sure", label: t("biz.bev.unsure") },
          ]} />
        </Field>
        <Field label={t("biz.hours")} className="sm:col-span-2">
          <ChoiceChips name="hours" label={t("biz.hours")} defaultValue="24h" options={[
            { value: "24h", label: t("biz.h24") }, { value: "Daytime", label: t("biz.hday") }, { value: "Late", label: t("biz.hlate") },
          ]} />
        </Field>
      </Group>

      <Group n={4} title={t("biz.g4")}>
        <Field label={t("biz.city")} required htmlFor="b-city">
          <Input id="b-city" name="city" required autoComplete="address-level2" className={fieldCls} />
        </Field>
        <Field label={t("biz.district")} required htmlFor="b-district">
          <Input id="b-district" name="district" required className={fieldCls} />
        </Field>
        <Field label={t("biz.maps")} optional={t("optional")} htmlFor="b-maps" className="sm:col-span-2">
          <Input id="b-maps" name="maps_link" type="url" placeholder="https://maps.app.goo.gl/…" dir="ltr" className={fieldCls} />
        </Field>
        <Field label={t("biz.notes")} optional={t("optional")} htmlFor="b-notes" className="sm:col-span-2">
          <Textarea id="b-notes" name="notes" rows={3} className="rounded-xl bg-background" />
        </Field>
        <div className="flex items-start gap-3 sm:col-span-2">
          <Checkbox id="b-agree" name="consent" value="yes" required className="mt-0.5 size-5 data-[state=checked]:border-orange data-[state=checked]:bg-orange" />
          <Label htmlFor="b-agree" className="leading-relaxed font-normal">{t("biz.agree")}</Label>
        </div>
      </Group>

      <Button type="submit" disabled={busy} size="lg" className="h-14 rounded-full bg-orange text-base font-bold text-foreground hover:bg-flame">
        {t("biz.submit")}
      </Button>
    </form>
  );
}
