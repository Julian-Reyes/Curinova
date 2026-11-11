/* Amazon survival tricks: original "How it works" scenes (license: original). */
import { AQUA, Head, INK, MINT, SUN, SURFACE, TEAL, fine, flow, stroke, type Scene } from './kit';

const OLIVE = '#6F8463';
const MUD = '#B98B5E';
const PINK = '#EBA9A4';

/** A worker ant facing right, about 26 wide; `leaf` adds a leaf piece held overhead. */
function Ant({
  x,
  y,
  leaf = false,
  flip = false,
}: {
  x: number;
  y: number;
  leaf?: boolean;
  flip?: boolean;
}) {
  return (
    <g transform={`translate(${String(x)} ${String(y)})${flip ? ' scale(-1 1)' : ''}`}>
      <path d="M-8 2l-6 6M-2 2l-2 8M4 2l4 7M-6 2l-8-4M2 2l6-6" {...fine} />
      <ellipse cx="-9" cy="0" rx="6" ry="4.5" fill={MUD} {...fine} />
      <ellipse cx="0" cy="0" rx="4" ry="3" fill={MUD} {...fine} />
      <circle cx="7" cy="-1" r="3.5" fill={MUD} {...fine} />
      <path d="M9-4l4-5" {...fine} />
      {leaf && (
        <>
          <path d="M9-4l3-8" {...fine} />
          <path d="M2-14c4-8 14-10 20-6-2 8-12 12-20 6z" fill={MINT} {...fine} />
        </>
      )}
    </g>
  );
}

/** A small poison frog facing right; `toxic` gives it warning spots and toxin drops. */
function Frog({ x, y, accent, toxic }: { x: number; y: number; accent: string; toxic: boolean }) {
  const body = toxic ? SUN : SURFACE;
  return (
    <g transform={`translate(${String(x)} ${String(y)})`}>
      <path d="M-14 8c-8 2-12 8-8 10h10M10 8c6 2 10 8 6 10h-8" fill={body} {...fine} />
      <ellipse cx="0" cy="0" rx="16" ry="11" fill={body} {...fine} />
      <circle cx="10" cy="-9" r="5" fill={body} {...fine} />
      <circle cx="11" cy="-10" r="2" fill={INK} />
      <path d="M8 6c3 4 6 6 10 6" fill="none" {...fine} />
      {toxic && (
        <>
          <circle cx="-6" cy="-3" r="3" fill={accent} />
          <circle cx="2" cy="3" r="2.5" fill={accent} />
          <circle cx="-9" cy="5" r="2" fill={accent} />
          <path
            d="M-14-22c2 3 3 4 3 6a3 3 0 0 1-6 0c0-2 1-3 3-6zM-26-14c2 3 3 4 3 6a3 3 0 0 1-6 0c0-2 1-3 3-6z"
            fill={accent}
            opacity="0.8"
          />
        </>
      )}
    </g>
  );
}

export const AMAZON_SCENES: Record<string, Scene> = {
  'eel-cells': (accent) => (
    <>
      <rect x="0" y="0" width="320" height="160" fill={AQUA} opacity="0.25" />
      <path
        d="M14 92c24-18 56-22 92-16 40 7 76 10 112-2 14-5 30-8 42-2 12 6 12 20-2 26-14 6-30 2-44 4-36 6-74 10-112 4-34-6-62-6-88-14z"
        fill={OLIVE}
      />
      <path
        d="M40 104c40 8 120 12 180 2"
        fill="none"
        stroke={SUN}
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M14 92c24-18 56-22 92-16 40 7 76 10 112-2 14-5 30-8 42-2 12 6 12 20-2 26-14 6-30 2-44 4-36 6-74 10-112 4-34-6-62-6-88-14z"
        fill="none"
        {...stroke}
      />
      <circle cx="252" cy="80" r="3" fill={INK} />
      <path d="M262 92c-6 2-10 2-14 0" fill="none" {...fine} />
      <rect x="78" y="70" width="128" height="30" rx="8" fill={SURFACE} {...stroke} />
      {[0, 1].map((row) =>
        Array.from({ length: 18 }, (_, i) => (
          <rect
            key={`${String(row)}-${String(i)}`}
            x={84 + i * 6.6}
            y={74 + row * 12}
            width="4"
            height="10"
            rx="1.5"
            fill={i % 2 ? accent : SUN}
            opacity="0.9"
          />
        )),
      )}
      <path d="M58 54h12" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <path d="M210 54h12M216 48v12" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <path d="M70 62c-6 0-8 4-8 8M210 62c6 0 8 4 8 8" fill="none" {...fine} opacity="0.5" />
      <path
        d="M276 82l8-8 4 6 8-10 4 8 8-8"
        fill="none"
        stroke={SUN}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M278 100l8 6 4-6 8 10 4-8 8 6"
        fill="none"
        stroke={SUN}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M286 40c8-8 22-8 28 0-6 8-20 8-28 0z" fill={SURFACE} {...fine} />
      <path d="M286 40l-8-6v12z" fill={SURFACE} {...fine} />
      <path d="M290 132c8-8 22-8 28 0-6 8-20 8-28 0z" fill={SURFACE} {...fine} />
      <path d="M290 132l-8-6v12z" fill={SURFACE} {...fine} />
    </>
  ),
  'boto-sonar': (accent) => (
    <>
      <rect x="0" y="18" width="320" height="142" fill={MUD} opacity="0.28" />
      <path
        d="M0 18c20-5 40 5 60 0s40 5 60 0 40 5 60 0 40 5 60 0 40 5 80 0"
        fill="none"
        stroke={TEAL}
        strokeWidth="2.5"
      />
      {[268, 302].map((x) => (
        <g key={x} opacity="0.45">
          <rect x={x - 6} y="0" width="12" height="150" fill={MUD} />
          <path
            d={`M${String(x - 6)} 150c-8 4-12 8-14 10M${String(x + 6)} 150c8 4 12 8 14 10`}
            fill="none"
            stroke={MUD}
            strokeWidth="4"
          />
        </g>
      ))}
      <path d="M36 92l-20-14 6 16-8 14 22-10z" fill={PINK} {...stroke} />
      <path
        d="M34 94c20-20 58-30 96-24 12 2 20 0 26-6 6-4 12-2 14 4l2 8 24 4c4 1 4 6 0 7l-26 3c-8 12-28 18-50 18-36 0-66-4-86-14z"
        fill={PINK}
      />
      <path
        d="M34 94c20-20 58-30 96-24 12 2 20 0 26-6 6-4 12-2 14 4l2 8 24 4c4 1 4 6 0 7l-26 3c-8 12-28 18-50 18-36 0-66-4-86-14z"
        fill="none"
        {...stroke}
      />
      <path d="M100 104c-4 10-2 18 6 22 2-8 2-16-2-22z" fill={PINK} {...fine} />
      <circle cx="160" cy="80" r="2.5" fill={INK} />
      <path
        d="M150 66c6-4 14-4 18 2"
        fill="none"
        stroke={accent}
        strokeWidth="3"
        strokeLinecap="round"
      />
      {[16, 30, 44].map((r) => (
        <path
          key={r}
          d={`M${String(172 + r * 0.6)} ${String(70 - r * 0.8)}a${String(r)} ${String(r)} 0 0 1 0 ${String(r * 1.6)}`}
          fill="none"
          stroke={SUN}
          strokeWidth="3"
          strokeLinecap="round"
        />
      ))}
      <path d="M238 96c8-8 20-8 26 0-6 8-18 8-26 0z" fill={SURFACE} {...fine} />
      <path d="M264 96l8-6v12z" fill={SURFACE} {...fine} />
      <circle cx="244" cy="94" r="1.5" fill={INK} />
      {[14, 26].map((r) => (
        <path
          key={r}
          d={`M${String(232 - r * 0.6)} ${String(96 - r * 0.8)}a${String(r)} ${String(r)} 0 0 0 0 ${String(r * 1.6)}`}
          fill="none"
          stroke={TEAL}
          strokeWidth="2.5"
          strokeDasharray="3 5"
          strokeLinecap="round"
        />
      ))}
    </>
  ),
  'pirarucu-breath': (accent) => (
    <>
      <rect x="0" y="40" width="320" height="120" fill={AQUA} opacity="0.55" />
      <path
        d="M0 40c20-4 40 4 60 0s40 4 60 0 40 4 60 0 40 4 60 0 40 4 80 0"
        fill="none"
        stroke={TEAL}
        strokeWidth="2.5"
      />
      <g transform="translate(0 -32) rotate(-12 150 90)">
        <path d="M44 92l-26-16 6 18-6 18z" fill={accent} {...stroke} />
        <path
          d="M44 92c30-24 110-30 168-18 16 4 26 10 30 18-4 8-14 14-30 18-58 12-138 6-168-18z"
          fill={OLIVE}
        />
        <path d="M44 92c14-12 30-18 46-20v40c-16-2-32-8-46-20z" fill={accent} opacity="0.75" />
        <path d="M84 84c30-12 90-14 120-4-30 6-90 8-120 4z" fill={MINT} {...fine} />
        {Array.from({ length: 9 }, (_, i) => (
          <circle
            key={i}
            cx={98 + i * 11}
            cy={i % 2 ? 82 : 85}
            r="2.6"
            fill={SURFACE}
            opacity="0.85"
          />
        ))}
        <path
          d="M44 92c30-24 110-30 168-18 16 4 26 10 30 18-4 8-14 14-30 18-58 12-138 6-168-18z"
          fill="none"
          {...stroke}
        />
        <path d="M206 82c4 6 4 14 0 20M198 84c3 5 3 11 0 16" fill="none" {...fine} opacity="0.35" />
        <circle cx="226" cy="88" r="3" fill={INK} />
        <path d="M242 92h-10" {...fine} />
      </g>
      {(
        [
          [252, 26, 4],
          [264, 16, 3],
          [246, 10, 2.5],
        ] as const
      ).map(([x, y, r]) => (
        <circle key={x} cx={x} cy={y} r={r} fill={SURFACE} {...fine} />
      ))}
      <path d="M256 32c-2 6-4 10-8 14" {...flow} />
      <Head x={248} y={46} deg={115} size={4} color={TEAL} />
      <circle cx="288" cy="120" r="16" fill={SURFACE} {...stroke} />
      <path d="M288 110v10l7 4" fill="none" {...stroke} />
      <path d="M262 132c-20 14-60 16-86 4" {...flow} />
      <path d="M40 132c-14-12-16-30-6-44" {...flow} />
      <Head x={34} y={88} deg={-70} size={5} color={TEAL} />
    </>
  ),
  'ant-fungus': (accent) => (
    <>
      <rect x="0" y="56" width="320" height="104" fill={MUD} opacity="0.3" />
      <path d="M0 56h120c10 0 14-8 24-8s14 8 24 8h152" fill="none" {...stroke} />
      <path d="M36 56V22" {...stroke} />
      <path
        d="M36 34c-14-10-26-6-30 0 10 6 22 6 30 0zM36 26c12-12 26-10 30-4-10 8-22 8-30 4z"
        fill={MINT}
        {...fine}
      />
      <path d="M56 28l-8 2 4 6z" fill={SURFACE} {...fine} />
      <Ant x={74} y={50} leaf />
      <Ant x={108} y={50} leaf />
      <path
        d="M144 58c0 20 6 34 22 44"
        fill="none"
        stroke={SURFACE}
        strokeWidth="12"
        strokeLinecap="round"
      />
      <path d="M144 58c0 20 6 34 22 44" fill="none" stroke={MUD} strokeWidth="1.5" opacity="0.6" />
      <ellipse cx="226" cy="114" rx="70" ry="34" fill={SURFACE} {...stroke} />
      {Array.from({ length: 16 }, (_, i) => (
        <circle
          key={i}
          cx={186 + ((i * 23) % 84)}
          cy={110 + ((i * 11) % 22)}
          r={8 + (i % 3) * 2}
          fill={i % 3 ? '#F4F1E8' : MINT}
          {...fine}
          strokeWidth="1.2"
        />
      ))}
      <Ant x={176} y={140} />
      <path d="M118 36c40-10 80 10 92 50" {...flow} />
      <Head x={210} y={86} deg={70} size={5} color={TEAL} />
      <path
        d="M186 138c-4-8-2-14 4-18"
        fill="none"
        stroke={accent}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </>
  ),
  'frog-diet': (accent) => (
    <>
      <path d="M12 80h296" stroke={INK} strokeWidth="1.5" strokeDasharray="4 6" opacity="0.4" />
      <path d="M28 52c10-22 34-28 50-20-6 20-30 30-50 20z" fill={MINT} {...stroke} />
      <path d="M30 52l30-14" {...fine} />
      <path d="M88 42h24" stroke={TEAL} strokeWidth="2.5" strokeLinecap="round" />
      <Head x={114} y={42} deg={0} size={5} color={TEAL} />
      <Ant x={140} y={44} />
      <circle cx="160" cy="54" r="4" fill={accent} {...fine} />
      <path d="M156 54l-4 3M164 54l4 3M158 50l-2-3M162 50l2-3" {...fine} />
      <path d="M180 42h24" stroke={TEAL} strokeWidth="2.5" strokeLinecap="round" />
      <Head x={206} y={42} deg={0} size={5} color={TEAL} />
      <Frog x={248} y={46} accent={accent} toxic />
      <g transform="translate(96 122)">
        <ellipse
          cx="-4"
          cy="-7"
          rx="7"
          ry="4"
          fill={SURFACE}
          {...fine}
          transform="rotate(-25 -4 -7)"
        />
        <ellipse
          cx="4"
          cy="-7"
          rx="7"
          ry="4"
          fill={SURFACE}
          {...fine}
          transform="rotate(25 4 -7)"
        />
        <ellipse cx="0" cy="0" rx="9" ry="5" fill={SUN} {...fine} />
        <circle cx="9" cy="-1" r="3" fill={accent} />
      </g>
      <g transform="translate(150 124)">
        <path d="M-4 2l-10 8M6 2l6 8" {...fine} />
        <path d="M-2-2l-8-10 -6 14" fill="none" {...fine} />
        <ellipse cx="0" cy="0" rx="14" ry="5" fill={OLIVE} {...fine} />
        <circle cx="14" cy="-2" r="4" fill={OLIVE} {...fine} />
        <path d="M17-5c6-6 12-8 16-8M16-5c4-8 8-12 12-12" fill="none" {...fine} />
      </g>
      <path d="M180 122h24" stroke={TEAL} strokeWidth="2.5" strokeLinecap="round" />
      <Head x={206} y={122} deg={0} size={5} color={TEAL} />
      <Frog x={248} y={126} accent={accent} toxic={false} />
      <circle cx="292" cy="104" r="9" fill="none" {...fine} />
      <path d="M292 98c2 3 3 4 3 6a3 3 0 0 1-6 0c0-2 1-3 3-6z" fill={accent} opacity="0.5" />
      <path d="M286 98l12 12" {...fine} />
    </>
  ),
  'lily-ribs': (accent) => (
    <>
      <rect x="0" y="74" width="154" height="86" rx="0" fill={AQUA} opacity="0.55" />
      <path d="M0 74h150" stroke={TEAL} strokeWidth="2" />
      <path
        d="M14 58v12h124V58"
        fill="none"
        stroke={accent}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path d="M14 70h124" stroke={MINT} strokeWidth="5" />
      <path d="M14 58v12h124V58" fill="none" {...fine} />
      {[26, 46, 66, 86, 106, 126].map((x) => (
        <g key={x}>
          <path d={`M${String(x - 6)} 72l6 12 6-12`} fill={accent} opacity="0.75" {...fine} />
          <ellipse cx={x} cy="76" rx="2.5" ry="2" fill={SURFACE} />
        </g>
      ))}
      {[30, 54, 78, 102, 126].map((x) => (
        <g key={x}>
          <rect x={x - 7} y="52" width="14" height="10" rx="2" fill={SUN} {...fine} />
          <path
            d={`M${String(x)} 30v14`}
            stroke={INK}
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.6"
          />
          <Head x={x} y={46} deg={90} size={4} />
        </g>
      ))}
      <circle cx="236" cy="82" r="64" fill={accent} opacity="0.28" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <path
            key={i}
            d={`M236 82L${String(236 + Math.cos(a) * 62)} ${String(82 + Math.sin(a) * 62)}`}
            stroke={accent}
            strokeWidth="5"
            strokeLinecap="round"
            opacity="0.85"
          />
        );
      })}
      {[22, 38, 52].map((r) => (
        <circle
          key={r}
          cx="236"
          cy="82"
          r={r}
          fill="none"
          stroke={accent}
          strokeWidth="2.5"
          opacity="0.7"
        />
      ))}
      {Array.from({ length: 12 }, (_, i) => {
        const a = ((i + 0.5) / 12) * Math.PI * 2;
        return (
          <ellipse
            key={i}
            cx={236 + Math.cos(a) * 30}
            cy={82 + Math.sin(a) * 30}
            rx="3.5"
            ry="2.5"
            fill={AQUA}
            {...fine}
            strokeWidth="1"
          />
        );
      })}
      {Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2 + 0.2;
        return (
          <circle
            key={i}
            cx={236 + Math.cos(a) * 45}
            cy={82 + Math.sin(a) * 45}
            r="1.6"
            fill={INK}
            opacity="0.6"
          />
        );
      })}
      <circle cx="236" cy="82" r="64" fill="none" {...stroke} />
      <path d="M156 42c-8 10-8 30 0 40" {...flow} />
    </>
  ),
};
