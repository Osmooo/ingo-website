import { useId } from "react";
import type { ArtKind } from "@/lib/products";
import { cn } from "@/lib/utils";
import { LOGO_PATHS } from "./logo";

/**
 * Packaging illustrations drawn to match the real INGO artwork:
 * cream bag (250g / 500g) and orange bag (1kg), each printed with large cropped G shapes
 * taken from the INGO wordmark, the way the real bags are.
 */
const CREAM = { base: "#FDF0E4", rings: ["#F7C9A0", "#F4B88A"], ink: "#231F20" };
const ORANGE = { base: "#EE8A2E", rings: ["#E4601F", "#F29A3C"], ink: "#FFFFFF" };

/** The G of the INGO wordmark (same path as in logo.tsx), centred near (888, 340). */
const G = "M888 556A225 225 0 1 1 1077 205l-18 55-56-12A146 146 0 1 0 1014 385H890l41-35-41-35h212c0 140-90 241-214 241z";

function Rings({ s, rings }: { s: number; rings: string[] }) {
  return (
    <g>
      <path d={G} fill={rings[0]} opacity={0.75} transform={`translate(${170 * s} ${70 * s}) rotate(18) scale(${0.62 * s}) translate(-888 -340)`} />
      <path d={G} fill={rings[1]} opacity={0.55} transform={`translate(${20 * s} ${330 * s}) rotate(-150) scale(${0.55 * s}) translate(-888 -340)`} />
    </g>
  );
}

/** Bag geometry (viewBox units) and where its real packaging details sit, as % of width/height.
 *  Details come from the INGO dielines: pull-tab zipper, valve, full-matte finish, printed weight. */
export function bagGeometry(size?: string) {
  const h = size === "1kg" ? 330 : size === "500g" ? 300 : 250;
  const w = size === "250g" ? 200 : 170;
  return {
    w, h,
    points: {
      zipper: { x: 50, y: (25 / h) * 100 },
      valve: { x: 50, y: (54 / h) * 100 },
      finish: { x: 30, y: 72 },
      weight: { x: 50, y: ((h - 26) / h) * 100 },
    },
  };
}

export function PackArt({ kind, size, className }: { kind: ArtKind; size?: string; className?: string }) {
  const id = useId().replace(/:/g, "");
  const cls = cn("h-full w-auto", className);

  if (kind === "bag") {
    const pal = size === "1kg" ? ORANGE : CREAM;
    const h = size === "1kg" ? 330 : size === "500g" ? 300 : 250;
    const w = size === "250g" ? 200 : 170;
    return (
      <svg viewBox={`0 0 ${w} ${h}`} className={cls} aria-hidden="true">
        <defs>
          <clipPath id={`c${id}`}><rect x="2" y="2" width={w - 4} height={h - 4} rx="14" /></clipPath>
          <linearGradient id={`g${id}`} x1="0" x2="1">
            <stop offset="0" stopColor="#000" stopOpacity=".06" />
            <stop offset=".18" stopColor="#fff" stopOpacity=".12" />
            <stop offset=".5" stopColor="#fff" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity=".08" />
          </linearGradient>
        </defs>
        <g clipPath={`url(#c${id})`}>
          <rect width={w} height={h} fill={pal.base} />
          <Rings s={w / 200} rings={pal.rings} />
          <rect width={w} height={h} fill={`url(#g${id})`} />
          <rect y="24" width={w} height="2" fill={pal.ink} opacity=".08" />
        </g>
        <circle cx={w / 2} cy="54" r="7" fill="none" stroke={pal.ink} strokeOpacity=".2" strokeWidth="2" />
        <svg x={w * 0.2} y={h * 0.36} width={w * 0.6} height={w * 0.2} viewBox="40 100 1560 462" fill={pal.ink}>{LOGO_PATHS}</svg>
        <text x={w / 2} y={h * 0.36 + w * 0.32} textAnchor="middle" fontFamily="Tajarib, sans-serif" fontSize={w * 0.065} fontWeight={600} fill={pal.ink}>
          إن قو - معك في كل مكان
        </text>
        <text x={w / 2} y={h - 22} textAnchor="middle" fontFamily="Tajarib, sans-serif" fontSize="13" fontWeight={700} fill={pal.ink} opacity=".75">
          {size}
        </text>
      </svg>
    );
  }

  if (kind === "drip") {
    return (
      <svg viewBox="0 0 200 220" className={cls} aria-hidden="true">
        <defs><clipPath id={`c${id}`}><rect x="2" y="2" width="196" height="216" rx="12" /></clipPath></defs>
        <g clipPath={`url(#c${id})`}>
          <rect width="200" height="220" fill={CREAM.base} />
          <Rings s={1} rings={CREAM.rings} />
        </g>
        <path d="M2 30h196" stroke="#231F20" strokeOpacity=".14" strokeDasharray="6 5" />
        <svg x="40" y="88" width="120" height="36" viewBox="40 100 1560 462" fill="#231F20">{LOGO_PATHS}</svg>
        <text x="100" y="152" textAnchor="middle" fontFamily="Tajarib, sans-serif" fontSize="14" fontWeight={800} fill="#E4601F" letterSpacing="1">DRIP BAG</text>
      </svg>
    );
  }

  // box — instant products, printed orange like the 1kg pack
  return (
    <svg viewBox="0 0 220 240" className={cls} aria-hidden="true">
      <path d="M30 40l30-24h150l-30 24z" fill="#E4601F" />
      <path d="M180 40l30-24v190l-30 24z" fill="#C9521A" />
      <defs><clipPath id={`c${id}`}><rect x="10" y="40" width="170" height="190" rx="6" /></clipPath></defs>
      <g clipPath={`url(#c${id})`}>
        <rect x="10" y="40" width="170" height="190" fill={ORANGE.base} />
        <g transform="translate(10 40) scale(.85)"><Rings s={1} rings={ORANGE.rings} /></g>
      </g>
      <svg x="40" y="104" width="110" height="34" viewBox="40 100 1560 462" fill="#fff">{LOGO_PATHS}</svg>
      <text x="95" y="166" textAnchor="middle" fontFamily="Tajarib, sans-serif" fontSize="13" fontWeight={800} fill="#fff" letterSpacing="1">INSTANT</text>
      <text x="95" y="210" textAnchor="middle" fontFamily="Tajarib, sans-serif" fontSize="12" fontWeight={600} fill="#fff" opacity=".85">10 × sticks</text>
    </svg>
  );
}
