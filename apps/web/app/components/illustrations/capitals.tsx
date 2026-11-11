/* Brazil's three capitals: original "How it works" scenes (license: original). */
import { AQUA, Head, INK, MINT, SUN, SURFACE, TEAL, fine, flow, stroke, type Scene } from './kit';

const LAND = '#E7D9B8';

/** A small sailing ship facing right. */
function Ship({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${String(x)} ${String(y)}) scale(${String(scale)})`}>
      <path d="M-14 0h28l-6 8h-16z" fill={SUN} {...fine} />
      <path d="M0 0v-22" {...fine} />
      <path d="M1-20c8 4 10 10 8 16H1zM-1-18c-6 4-8 9-6 14h6z" fill={SURFACE} {...fine} />
    </g>
  );
}

/** A small crown, centred on (x, y). */
function Crown({
  x,
  y,
  color,
  opacity = 1,
}: {
  x: number;
  y: number;
  color: string;
  opacity?: number;
}) {
  return (
    <path
      d={`M${String(x - 10)} ${String(y + 6)}l-2-12 7 6 5-9 5 9 7-6-2 12z`}
      fill={color}
      opacity={opacity}
      {...fine}
    />
  );
}

export const CAPITALS_SCENES: Record<string, Scene> = {
  'salvador-cliff': (accent) => (
    <>
      <rect x="0" y="132" width="110" height="28" fill={AQUA} />
      <path
        d="M0 132c14-4 28 4 42 0s28 4 42 0 18 2 26 0"
        fill="none"
        stroke={TEAL}
        strokeWidth="2.5"
      />
      <Ship x={44} y={128} />
      <path d="M100 160v-28h76l10-84h134v112z" fill={LAND} />
      <path d="M100 132h76l10-84h134" fill="none" {...stroke} />
      {[112, 134, 156].map((x) => (
        <path key={x} d={`M${String(x)} 132v-14h18v14`} fill={SURFACE} {...fine} />
      ))}
      <rect x="168" y="44" width="10" height="88" fill={SURFACE} {...fine} />
      <rect x="166" y="78" width="14" height="12" rx="2" fill={accent} {...fine} />
      <path d="M178 48h12" {...fine} />
      <path d="M200 48V30h20v18M200 30l10-8 10 8" fill={SURFACE} {...fine} />
      <path d="M232 48V20h8v28M260 48V20h8v28M240 48V30h20v18" fill={SURFACE} {...fine} />
      <path d="M232 20l4-6 4 6M260 20l4-6 4 6M244 30l6-6 6 6" fill="none" {...fine} />
      <path d="M280 48V34h26v14M286 34v-4M300 34v-4" fill={SURFACE} {...fine} />
      <path d="M194 52v76" stroke={INK} strokeWidth="1.5" strokeDasharray="3 4" opacity="0.5" />
      <Head x={194} y={52} deg={-90} size={4} />
      <Head x={194} y={128} deg={90} size={4} />
      <g transform="translate(16 14)">
        <rect width="70" height="56" rx="6" fill={AQUA} opacity="0.7" />
        <path d="M70 0H34c-6 14-4 28 4 40 4 6 6 12 6 16h26z" fill={LAND} {...fine} />
        <path d="M34 0c-10 16-8 34 6 48" fill="none" {...fine} opacity="0.4" />
        <circle cx="40" cy="44" r="4" fill={accent} {...fine} />
        <rect width="70" height="56" rx="6" fill="none" {...fine} />
      </g>
    </>
  ),
  'gold-route': (accent) => (
    <>
      <path d="M210 0c-10 30 10 50 0 80-8 24 6 44 30 60 10 6 14 14 14 20h66V0z" fill={AQUA} />
      <path d="M0 0h210c-10 30 10 50 0 80-8 24 6 44 30 60 10 6 14 14 14 20H0z" fill={LAND} />
      <path d="M210 0c-10 30 10 50 0 80-8 24 6 44 30 60 10 6 14 14 14 20" fill="none" {...stroke} />
      <path d="M40 100l22-30 14 16 14-22 22 36z" fill={MINT} {...stroke} />
      {(
        [
          [62, 108],
          [80, 112],
          [96, 104],
        ] as const
      ).map(([x, y]) => (
        <path key={x} d={`M${String(x - 5)} ${String(y)}l4-5h4l3 5-4 3h-4z`} fill={SUN} {...fine} />
      ))}
      <path d="M116 108c30 6 70 10 106 22" {...flow} />
      <path d="M226 124c4-10 12-12 16-4" fill={MINT} {...fine} />
      <circle cx="226" cy="132" r="6" fill={accent} {...stroke} />
      <Ship x={276} y={122} />
      <path d="M290 112h20" stroke={TEAL} strokeWidth="2.5" strokeLinecap="round" />
      <Head x={312} y={112} deg={0} size={5} color={TEAL} />
      <circle cx="216" cy="34" r="5" fill={SURFACE} {...fine} />
      <Crown x={196} y={30} color={SUN} opacity={0.45} />
      <path
        d="M190 44c-30 30-30 64 14 84"
        fill="none"
        stroke={accent}
        strokeWidth="2.5"
        strokeDasharray="5 5"
        strokeLinecap="round"
      />
      <Crown x={206} y={136} color={SUN} />
      <Head x={206} y={128} deg={40} size={5} color={accent} />
    </>
  ),
  'court-crossing': (accent) => (
    <>
      <rect x="0" y="0" width="320" height="160" fill={AQUA} opacity="0.5" />
      <path
        d="M0 40c20-4 40 8 50 24 10 18 26 22 34 40 8 20-4 38-18 56H0z"
        fill={LAND}
        {...stroke}
      />
      <path d="M240 0c0 14 8 22 6 34-2 10-10 14-8 24h82V0z" fill={LAND} {...stroke} />
      <path d="M284 30h28" stroke={accent} strokeWidth="3" strokeLinecap="round" />
      <Head x={282} y={30} deg={180} size={5} color={accent} />
      <circle cx="242" cy="40" r="5" fill={SURFACE} {...stroke} />
      <path
        d="M236 44C180 70 120 66 82 84"
        fill="none"
        stroke={TEAL}
        strokeWidth="2.5"
        strokeDasharray="4 6"
        strokeLinecap="round"
      />
      <circle cx="80" cy="86" r="4" fill={SURFACE} {...fine} />
      <path
        d="M82 92c4 18 0 32-12 44"
        fill="none"
        stroke={TEAL}
        strokeWidth="2.5"
        strokeDasharray="4 6"
        strokeLinecap="round"
      />
      <Ship x={190} y={64} />
      <Ship x={160} y={74} scale={0.85} />
      <Ship x={130} y={70} scale={0.75} />
      <circle cx="66" cy="138" r="5" fill={accent} {...stroke} />
      <Crown x={52} y={122} color={SUN} />
    </>
  ),
  'inland-plateau': (accent) => (
    <>
      <rect x="0" y="0" width="320" height="160" fill={AQUA} opacity="0.5" />
      <path
        d="M78 40 96 26l18-8 16 4 20-8 18 6 14 10 14 4 18 10 26 12 4 10-16 20-10 18-14 14-18 12-16 18-10 6-8-12-8-16-14-12-12-16-16-10-14-10-10-12z"
        fill={LAND}
        {...stroke}
      />
      <path
        d="M100 44c20 4 40 6 60 2M150 60c4 18 8 30 4 46"
        fill="none"
        stroke={AQUA}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M140 92l10-14h30l10 14z" fill={MINT} {...fine} />
      <rect
        x="140"
        y="64"
        width="52"
        height="40"
        fill="none"
        stroke={accent}
        strokeWidth="2.5"
        strokeDasharray="5 4"
      />
      <path d="M166 74l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill={SUN} {...fine} />
      <circle cx="222" cy="112" r="5" fill={SURFACE} {...stroke} />
      <path d="M216 108c-10-6-18-12-24-18" {...flow} />
      <Head x={192} y={88} deg={-140} size={5} color={TEAL} />
      <g transform="translate(118 132)">
        <path d="M0 0l-8 22M0 0l8 22M0 0v22" {...fine} />
        <rect x="-8" y="-8" width="16" height="8" rx="2" fill={SURFACE} {...fine} />
        <circle cx="10" cy="-4" r="3" fill={AQUA} {...fine} />
      </g>
      <path
        d="M278 40h24M278 52h16"
        stroke={TEAL}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
    </>
  ),
  'brasilia-build': (accent) => (
    <>
      <circle cx="40" cy="36" r="16" fill={SUN} opacity="0.9" />
      <path d="M0 132h320" {...stroke} />
      <rect x="0" y="132" width="320" height="28" fill={LAND} />
      <rect x="150" y="30" width="16" height="102" fill={SURFACE} {...stroke} />
      <rect x="172" y="30" width="16" height="102" fill={SURFACE} {...stroke} />
      <path d="M150 50h38M150 70h38M150 90h38M150 110h38" {...fine} opacity="0.4" />
      <path d="M166 62h6" {...fine} />
      <path
        d="M190 30v102M196 30v102M190 46h6M190 62h6M190 78h6M190 94h6M190 110h6"
        {...fine}
        opacity="0.7"
      />
      <path d="M210 120a20 10 0 0 0 40 0z" fill={SURFACE} {...stroke} />
      <path d="M256 120a20 14 0 0 1 40 0z" fill={SURFACE} {...stroke} />
      <path d="M204 132h100v-12H204z" fill={MINT} {...fine} />
      <path d="M106 132V20h4v112M108 20h-40M108 20h20" {...stroke} />
      <path d="M76 20v30" {...fine} />
      <rect x="70" y="50" width="12" height="8" fill={accent} {...fine} />
      <path d="M96 20l12-12 12 12" fill="none" {...fine} />
      <g transform="translate(36 120)">
        <rect x="-22" y="-14" width="30" height="14" rx="2" fill={accent} {...fine} />
        <path d="M8-10h10l6 8v2H8z" fill={SURFACE} {...fine} />
        <circle cx="-14" cy="2" r="4" fill={INK} />
        <circle cx="14" cy="2" r="4" fill={INK} />
        {[-16, -8, 0].map((hx) => (
          <circle key={hx} cx={hx} cy="-18" r="3" fill={SURFACE} {...fine} />
        ))}
      </g>
      <path d="M68 116h20" stroke={TEAL} strokeWidth="2.5" strokeLinecap="round" />
      <Head x={90} y={116} deg={0} size={5} color={TEAL} />
      {[124, 136, 230, 246].map((x) => (
        <g key={x}>
          <circle cx={x} cy="112" r="3.5" fill={SURFACE} {...fine} />
          <path
            d={`M${String(x)} 116v8M${String(x - 4)} 132l4-8 4 8M${String(x - 4)} 120h8`}
            {...fine}
          />
        </g>
      ))}
      {Array.from({ length: 12 }, (_, i) => (
        <rect
          key={i}
          x={214 + i * 8}
          y="14"
          width="6"
          height="10"
          rx="1.5"
          fill={i < 10 ? accent : INK}
          opacity={i < 10 ? 0.85 : 0.15}
        />
      ))}
    </>
  ),
  'plano-piloto': (accent) => (
    <>
      <path d="M220 0c30 20 40 50 30 80-8 26 6 50 30 80h40V0z" fill={AQUA} />
      <path d="M0 160c20-10 40-12 60-6 20 6 40 6 60 0v6z" fill={AQUA} />
      <path
        d="M220 0c30 20 40 50 30 80-8 26 6 50 30 80"
        fill="none"
        stroke={TEAL}
        strokeWidth="2"
      />
      <path d="M152 12v136" stroke={INK} strokeWidth="2" strokeDasharray="5 6" opacity="0.35" />
      <path d="M30 80h206" stroke={accent} strokeWidth="7" strokeLinecap="round" />
      <path
        d="M132 14c40 30 40 102 0 132"
        fill="none"
        stroke={TEAL}
        strokeWidth="7"
        strokeLinecap="round"
      />
      {(
        [
          [124, 30],
          [140, 46],
          [150, 64],
          [150, 96],
          [140, 114],
          [124, 130],
        ] as const
      ).map(([x, y]) => (
        <g key={`${String(x)}-${String(y)}`}>
          <rect x={x - 22} y={y - 5} width="10" height="10" rx="2" fill={MINT} {...fine} />
          <rect x={x + 12} y={y - 5} width="10" height="10" rx="2" fill={MINT} {...fine} />
        </g>
      ))}
      <path d="M250 70l12 18h-24z" fill={SUN} {...fine} />
      {[60, 80, 100, 180, 200].map((x) => (
        <rect key={x} x={x - 5} y="68" width="10" height="6" rx="1" fill={SURFACE} {...fine} />
      ))}
      {[60, 80, 100, 180, 200].map((x) => (
        <rect
          key={`b${String(x)}`}
          x={x - 5}
          y="86"
          width="10"
          height="6"
          rx="1"
          fill={SURFACE}
          {...fine}
        />
      ))}
      <path
        d="M104 12c10 6 18 14 22 24"
        fill="none"
        stroke={INK}
        strokeWidth="2"
        strokeDasharray="3 4"
        opacity="0.5"
      />
      <Head x={126} y={36} deg={65} size={4} color={INK} />
    </>
  ),
};
