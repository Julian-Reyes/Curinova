/* Where your attention goes: original "How it works" scenes (license: original). */
import { AQUA, Head, INK, MINT, SUN, SURFACE, TEAL, fine, flow, stroke, type Scene } from './kit';

/** An open eye looking right, centred on (x, y). */
function Eye({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${String(x)} ${String(y)}) scale(${String(scale)})`}>
      <path d="M-20 0c10-12 30-12 40 0-10 12-30 12-40 0z" fill={SURFACE} {...stroke} />
      <circle cx="2" cy="0" r="7" fill={TEAL} />
      <circle cx="3" cy="0" r="3" fill={INK} />
    </g>
  );
}

/** A small player figure; `dark` gives a black shirt. */
function Player({ x, y, dark }: { x: number; y: number; dark: boolean }) {
  return (
    <g transform={`translate(${String(x)} ${String(y)})`}>
      <path d="M-5 14l-3 14M5 14l3 14" {...fine} />
      <path d="M-9 16c0-10 4-16 9-16s9 6 9 16z" fill={dark ? INK : SURFACE} {...fine} />
      <circle cx="0" cy="-6" r="5" fill={SURFACE} {...fine} />
    </g>
  );
}

export const ATTENTION_SCENES: Record<string, Scene> = {
  'name-filter': (accent) => (
    <>
      {(
        [
          [24, 30, 0.35],
          [70, 18, 0.35],
          [30, 112, 0.35],
          [80, 128, 0.35],
          [104, 60, 0.35],
        ] as const
      ).map(([x, y, o]) => (
        <g key={`${String(x)}-${String(y)}`} opacity={o}>
          <path
            d={`M${String(x)} ${String(y)}h34a6 6 0 0 1 6 6v10a6 6 0 0 1-6 6H${String(x + 12)}l-8 6v-6h-4a6 6 0 0 1-6-6V${String(y + 6)}a6 6 0 0 1 6-6z`}
            fill={SURFACE}
            {...fine}
          />
          <path d={`M${String(x + 6)} ${String(y + 11)}h22`} {...fine} />
        </g>
      ))}
      <path
        d="M36 74h40a6 6 0 0 1 6 6v12a6 6 0 0 1-6 6H52l-8 7v-7h-8a6 6 0 0 1-6-6V80a6 6 0 0 1 6-6z"
        fill={accent}
        {...stroke}
      />
      <path d="M56 78l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill={SUN} {...fine} />
      <path
        d="M150 20c-30 10-40 30-40 50M150 140c-30-10-40-30-40-50"
        fill="none"
        stroke={INK}
        strokeWidth="1.5"
        strokeDasharray="3 5"
        opacity="0.4"
      />
      <path
        d="M90 86c40 0 80-6 112-10"
        fill="none"
        stroke={accent}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <Head x={204} y={76} deg={-8} size={6} color={accent} />
      <path
        d="M140 54c18 4 40 8 60 14M140 112c20-8 40-16 60-24"
        fill="none"
        stroke={INK}
        strokeWidth="2"
        strokeDasharray="2 5"
        opacity="0.4"
      />
      <path
        d="M248 152v-22c-12 0-20-6-20-16v-8l-8-2 8-14c-4-34 16-62 48-62 28 0 44 22 44 50 0 22-12 36-22 44v30"
        fill={MINT}
        opacity="0.6"
      />
      <path
        d="M248 152v-22c-12 0-20-6-20-16v-8l-8-2 8-14c-4-34 16-62 48-62 28 0 44 22 44 50 0 22-12 36-22 44v30"
        fill="none"
        {...stroke}
      />
      <ellipse cx="282" cy="82" rx="7" ry="11" fill={SURFACE} {...stroke} />
      <path d="M244 46h40l-14 18v12h-12V64z" fill={SURFACE} {...fine} />
      <circle cx="266" cy="40" r="8" fill={accent} opacity="0.85" />
    </>
  ),
  'gorilla-count': (accent) => (
    <>
      <rect x="10" y="106" width="300" height="46" rx="6" fill={SUN} opacity="0.25" />
      <path
        d="M126 50c8-8 20-12 34-12s26 4 34 12l14 46c2 8-6 12-12 8l-10-28v28h-10v32h-12v-32h-8v32h-12v-32h-10V76l-10 28c-6 4-14 0-12-8z"
        fill={INK}
        opacity="0.18"
      />
      <path
        d="M126 50c8-8 20-12 34-12s26 4 34 12l14 46c2 8-6 12-12 8l-10-28v28h-10v32h-12v-32h-8v32h-12v-32h-10V76l-10 28c-6 4-14 0-12-8z"
        fill="none"
        stroke={INK}
        strokeWidth="2"
        strokeDasharray="4 5"
        opacity="0.45"
      />
      <circle cx="160" cy="32" r="11" fill={INK} opacity="0.18" />
      <circle
        cx="160"
        cy="32"
        r="11"
        fill="none"
        stroke={INK}
        strokeWidth="2"
        strokeDasharray="4 5"
        opacity="0.45"
      />
      <Player x={44} y={90} dark={false} />
      <Player x={262} y={84} dark={false} />
      <Player x={150} y={104} dark={false} />
      <Player x={82} y={110} dark />
      <Player x={226} y={112} dark />
      <Player x={292} y={110} dark />
      <path
        d="M52 78c40-40 160-46 204-2"
        fill="none"
        stroke={accent}
        strokeWidth="2.5"
        strokeDasharray="4 5"
        strokeLinecap="round"
      />
      <path
        d="M256 92c-30 20-70 22-100 18"
        fill="none"
        stroke={accent}
        strokeWidth="2.5"
        strokeDasharray="4 5"
        strokeLinecap="round"
      />
      <circle cx="152" cy="40" r="6" fill={SUN} {...fine} />
      <circle cx="210" cy="104" r="6" fill={SUN} {...fine} />
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M${String(20 + i * 7)} 18v14`}
          stroke={accent}
          strokeWidth="3"
          strokeLinecap="round"
        />
      ))}
    </>
  ),
  'task-switch': (accent) => (
    <>
      <rect x="24" y="14" width="84" height="56" rx="8" fill={SURFACE} {...stroke} />
      <path
        d="M40 34h12M46 28v12M66 34h10M40 54h10M58 52h10M58 56h10M78 50l8 8M86 50l-8 8"
        {...fine}
      />
      <rect x="212" y="14" width="84" height="56" rx="8" fill={SURFACE} {...stroke} />
      <path d="M232 52l10-18 10 18z" fill={MINT} {...fine} />
      <rect x="258" y="34" width="16" height="16" rx="2" fill={AQUA} {...fine} />
      <circle cx="284" cy="56" r="6" fill={SUN} {...fine} />
      <g transform="translate(148 40)">
        <circle cx="0" cy="0" r="10" fill={MINT} {...fine} />
        <circle cx="0" cy="0" r="3.5" fill={SURFACE} {...fine} />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return (
            <circle
              key={i}
              cx={Math.cos(a) * 12}
              cy={Math.sin(a) * 12}
              r="2.5"
              fill={MINT}
              {...fine}
              strokeWidth="1"
            />
          );
        })}
      </g>
      <g transform="translate(172 32)">
        <circle cx="0" cy="0" r="7" fill={accent} opacity="0.85" {...fine} />
        <circle cx="0" cy="0" r="2.5" fill={SURFACE} />
      </g>
      <path
        d="M114 40c6-6 10-6 18-2M206 40c-6 6-10 6-18 2"
        fill="none"
        stroke={TEAL}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <rect x="24" y="96" width="90" height="14" rx="4" fill={accent} opacity="0.85" />
      <rect x="114" y="96" width="90" height="14" rx="4" fill={TEAL} opacity="0.8" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          <rect
            x={24 + i * 46}
            y="124"
            width="30"
            height="14"
            rx="4"
            fill={i % 2 ? TEAL : accent}
            opacity={i % 2 ? 0.8 : 0.85}
          />
          <rect x={56 + i * 46} y="124" width="12" height="14" rx="3" fill={INK} opacity="0.2" />
        </g>
      ))}
      <path
        d="M204 90v54M300 90v54"
        stroke={INK}
        strokeWidth="1.5"
        strokeDasharray="3 4"
        opacity="0.4"
      />
      <path d="M208 146h88" stroke={accent} strokeWidth="2" strokeLinecap="round" />
      <Head x={298} y={146} deg={0} size={4} color={accent} />
    </>
  ),
  'saccade-blink': (accent) => (
    <>
      <rect x="20" y="22" width="280" height="62" rx="10" fill={AQUA} opacity="0.45" />
      <path d="M20 70c30-14 50-4 80-14s50-12 80-4 60 4 120-8v32H20z" fill={MINT} opacity="0.8" />
      {[-8, 0, 8].map((dx) => (
        <path
          key={dx}
          d={`M${String(110 + dx)} 36c10 20 40 30 100 26`}
          fill="none"
          stroke={INK}
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.06"
        />
      ))}
      <circle cx="64" cy="50" r="9" fill={SURFACE} {...stroke} />
      <circle cx="64" cy="50" r="3" fill={INK} />
      <circle cx="256" cy="50" r="9" fill={SURFACE} {...stroke} />
      <circle cx="256" cy="50" r="3" fill={INK} />
      <path
        d="M76 42c40-26 128-26 166 0"
        fill="none"
        stroke={accent}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <Head x={244} y={43} deg={30} size={6} color={accent} />
      <rect x="110" y="22" width="100" height="62" fill={INK} opacity="0.12" />
      <rect x="20" y="22" width="280" height="62" rx="10" fill="none" {...stroke} />
      <Eye x={160} y={118} scale={0.9} />
      <rect x="20" y="138" width="88" height="10" rx="5" fill={TEAL} />
      <rect x="102" y="138" width="112" height="10" rx="5" fill={INK} opacity="0.75" />
      <rect x="208" y="138" width="92" height="10" rx="5" fill={TEAL} />
      <path d="M122 132v20" stroke={accent} strokeWidth="2" strokeDasharray="2 3" />
    </>
  ),
  'clock-stretch': (accent) => (
    <>
      <circle cx="246" cy="60" r="44" fill={SURFACE} {...stroke} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <path
            key={i}
            d={`M${String(246 + Math.sin(a) * 36)} ${String(60 - Math.cos(a) * 36)}L${String(246 + Math.sin(a) * 40)} ${String(60 - Math.cos(a) * 40)}`}
            {...fine}
          />
        );
      })}
      <path d="M246 60l-12-18M246 60h20" {...stroke} />
      <path d="M246 60l20 28" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="246" cy="60" r="3.5" fill={accent} />
      <Eye x={44} y={58} />
      <path d="M70 58c40-20 80-20 120-6" {...flow} />
      <Head x={192} y={53} deg={18} size={5} color={TEAL} />
      <rect x="96" y="124" width="70" height="14" rx="4" fill={accent} opacity="0.85" />
      {[170, 210, 250].map((x) => (
        <rect key={x} x={x} y="124" width="36" height="14" rx="4" fill={TEAL} opacity="0.75" />
      ))}
      <path d="M40 131h50" stroke={INK} strokeWidth="2" strokeDasharray="3 4" opacity="0.4" />
      <path
        d="M130 118c-10-14-40-16-58-4"
        fill="none"
        stroke={accent}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <Head x={70} y={116} deg={150} size={5} color={accent} />
      <path d="M70 124v20" stroke={TEAL} strokeWidth="2" strokeDasharray="2 3" />
    </>
  ),
  'fall-memory': (accent) => (
    <>
      <path d="M30 152V14h40v138" fill="none" {...stroke} />
      <path d="M30 34h40M30 64h40M30 94h40M30 124h40" {...fine} opacity="0.35" />
      <path d="M70 14h36" {...stroke} />
      <path
        d="M78 148c10 8 40 8 50 0"
        fill="none"
        stroke={TEAL}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M78 148l6-8M128 148l-6-8M90 152l2-6M116 152l-2-6" {...fine} />
      <g transform="translate(100 86) rotate(-100)">
        <circle cx="0" cy="-16" r="6" fill={SURFACE} {...fine} />
        <path d="M0-10v16M0 6l-6 12M0 6l6 12M0-4l-10-8M0-4l10-8" {...stroke} />
      </g>
      <path d="M100 40v24" {...flow} />
      <Head x={100} y={66} deg={90} size={4} color={TEAL} />
      <rect x="128" y="28" width="36" height="24" rx="6" fill={SURFACE} {...stroke} />
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={134 + i * 9}
          y="34"
          width="6"
          height="12"
          rx="1.5"
          fill={accent}
          opacity={0.3 + i * 0.3}
        />
      ))}
      <path d="M116 66c4-6 8-10 12-14" {...fine} opacity="0.5" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={186 + i * 22} y="86" width="18" height="16" rx="2" fill={MINT} {...fine} />
      ))}
      <path d="M182 82h92v24h-92z" fill="none" {...stroke} />
      {Array.from({ length: 8 }, (_, i) => (
        <rect
          key={i}
          x={186 + i * 15}
          y="122"
          width="11"
          height="16"
          rx="2"
          fill={accent}
          opacity="0.8"
        />
      ))}
      <path d="M182 118h126v24H182z" fill="none" {...stroke} />
      <path d="M274 74v76" stroke={INK} strokeWidth="1.5" strokeDasharray="3 4" opacity="0.4" />
      <path d="M278 112h26" stroke={SUN} strokeWidth="3" strokeLinecap="round" />
      <Head x={306} y={112} deg={0} size={4} color={SUN} />
    </>
  ),
};
