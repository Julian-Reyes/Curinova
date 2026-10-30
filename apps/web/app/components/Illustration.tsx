/*
 * Original lesson illustrations (license: original). Flat, geometric, drawn on a
 * 320×160 canvas with theme-aware colors: strokes use --ink, fills mix the mint/aqua
 * palette with the topic accent. Purely decorative; the lesson's alt text is set
 * on the wrapper by the caller.
 */

const MINT = '#83E6CD';
const AQUA = '#9FE3F0';
const TEAL = '#0A8F83';
const SUN = '#F4B860';
const INK = 'var(--ink)';
const SURFACE = 'var(--surface)';

type Scene = (accent: string) => React.ReactNode;

const stroke = {
  stroke: INK,
  strokeWidth: 2.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function Earth({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={AQUA} />
      <path
        d={`M${x - r * 0.55} ${y - r * 0.35}c${r * 0.3} -${r * 0.25} ${r * 0.6} -${r * 0.1} ${r * 0.55} ${r * 0.2}s-${r * 0.5} ${r * 0.25} -${r * 0.25} ${r * 0.55}c${r * 0.2} ${r * 0.25} ${r * 0.5} ${r * 0.15} ${r * 0.6} ${r * 0.45}`}
        fill="none"
        stroke={TEAL}
        strokeWidth={r * 0.28}
        strokeLinecap="round"
        opacity="0.85"
      />
      <circle cx={x} cy={y} r={r} fill="none" {...stroke} />
    </g>
  );
}

function Moon({ x, y, r, face = 0 }: { x: number; y: number; r: number; face?: number }) {
  const fx = x + Math.cos(face) * r * 0.45;
  const fy = y + Math.sin(face) * r * 0.45;
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#E9EEF0" />
      <circle cx={fx} cy={fy} r={r * 0.28} fill="#C9D3D6" />
      <circle cx={x - r * 0.35} cy={y + r * 0.4} r={r * 0.14} fill="#C9D3D6" />
      <circle cx={x} cy={y} r={r} fill="none" {...stroke} />
    </g>
  );
}

const SCENES: Record<string, Scene> = {
  'moon-face': () => (
    <>
      <ellipse
        cx="160"
        cy="82"
        rx="118"
        ry="52"
        fill="none"
        stroke={INK}
        strokeWidth="2"
        strokeDasharray="4 8"
        opacity="0.35"
      />
      <Earth x={160} y={82} r={34} />
      <Moon x={278} y={82} r={15} face={Math.PI} />
      <Moon x={160} y={30} r={15} face={Math.PI / 2} />
      <Moon x={42} y={82} r={15} face={0} />
      <Moon x={160} y={134} r={15} face={-Math.PI / 2} />
    </>
  ),
  tides: () => (
    <>
      <ellipse cx="130" cy="80" rx="70" ry="46" fill={MINT} opacity="0.55" />
      <ellipse
        cx="130"
        cy="80"
        rx="70"
        ry="46"
        fill="none"
        stroke={TEAL}
        strokeWidth="2"
        strokeDasharray="5 6"
      />
      <Earth x={130} y={80} r={40} />
      <Moon x={262} y={80} r={20} face={Math.PI} />
      <path d="M232 80h-20m6-6-6 6 6 6" {...stroke} fill="none" opacity="0.6" />
    </>
  ),
  'day-length': () => (
    <>
      <Earth x={110} y={84} r={46} />
      <circle cx="110" cy="84" r="20" fill={SURFACE} {...stroke} />
      <path d="M110 72v12l8 5" {...stroke} fill="none" />
      <Moon x={248} y={70} r={16} />
      <path d="M272 70h22m-6-6 6 6-6 6" {...stroke} fill="none" />
      <path
        d="M180 120c20 6 46 6 66-2"
        fill="none"
        stroke={TEAL}
        strokeWidth="2.5"
        strokeDasharray="2 7"
        strokeLinecap="round"
      />
    </>
  ),
  eclipse: () => (
    <>
      <circle cx="60" cy="80" r="44" fill={SUN} opacity="0.9" />
      <circle cx="60" cy="80" r="56" fill={SUN} opacity="0.2" />
      <path d="M104 72 L250 64 L250 96 L104 88 Z" fill={INK} opacity="0.08" />
      <Moon x={168} y={80} r={12} />
      <Earth x={262} y={80} r={30} />
      <circle cx="236" cy="80" r="5" fill={INK} opacity="0.55" />
    </>
  ),
  'forgetting-curve': () => (
    <>
      <path d="M48 24v108h236" {...stroke} fill="none" opacity="0.5" />
      <path
        d="M52 32C80 96 110 112 280 120"
        fill="none"
        stroke={INK}
        strokeWidth="2.5"
        strokeDasharray="4 6"
        opacity="0.4"
      />
      <path
        d="M52 32c18 42 30 52 46 56v-46c18 30 32 38 52 40v-34c22 22 44 28 70 30v-24c20 14 38 18 60 18"
        fill="none"
        stroke={TEAL}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {[98, 150, 220].map((x) => (
        <circle
          key={x}
          cx={x}
          cy={x === 98 ? 42 : x === 150 ? 48 : 52}
          r="7"
          fill={MINT}
          {...stroke}
        />
      ))}
    </>
  ),
  spacing: (accent) => (
    <>
      <rect x="56" y="22" width="208" height="122" rx="16" fill={SURFACE} {...stroke} />
      <path d="M56 50h208" {...stroke} />
      {[0, 1, 2, 3, 4, 5, 6].map((c) =>
        [0, 1, 2].map((r) => {
          const on =
            (r === 0 && (c === 0 || c === 1 || c === 4)) ||
            (r === 2 && c === 3) ||
            (r === 1 && c === 4);
          return (
            <rect
              key={`${c}-${r}`}
              x={68 + c * 28}
              y={60 + r * 26}
              width="20"
              height="18"
              rx="5"
              fill={on ? (r === 0 ? TEAL : accent) : INK}
              opacity={on ? 0.9 : 0.08}
            />
          );
        }),
      )}
      <circle cx="96" cy="36" r="4" fill={INK} opacity="0.4" />
      <circle cx="224" cy="36" r="4" fill={INK} opacity="0.4" />
    </>
  ),
  recall: (accent) => (
    <>
      <rect
        x="44"
        y="40"
        width="112"
        height="80"
        rx="14"
        fill={SURFACE}
        {...stroke}
        transform="rotate(-6 100 80)"
      />
      <path
        d="M78 64c2-12 26-12 26 2 0 10-12 10-12 20M92 98v.5"
        {...stroke}
        fill="none"
        transform="rotate(-6 100 80)"
      />
      <path
        d="M160 80c30 0 34-34 64-34"
        fill="none"
        stroke={TEAL}
        strokeWidth="3"
        strokeDasharray="3 7"
        strokeLinecap="round"
      />
      <circle cx="248" cy="58" r="30" fill={MINT} opacity="0.6" />
      <path
        d="M248 36c8 14 12 18 26 22-14 4-18 8-26 22-8-14-12-18-26-22 14-4 18-8 26-22z"
        fill={accent}
        opacity="0.85"
      />
      <path d="M232 104h40M240 118h24" {...stroke} opacity="0.5" />
    </>
  ),
  sleep: (accent) => (
    <>
      <path d="M98 36a46 46 0 1 0 54 62 38 38 0 0 1-54-62z" fill={accent} opacity="0.85" />
      {(
        [
          [204, 52],
          [236, 84],
          [264, 48],
          [222, 118],
          [270, 114],
        ] as const
      ).map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 2 ? 6 : 8} fill={MINT} {...stroke} />
      ))}
      <path
        d="M204 52 236 84 264 48M236 84l-14 34M236 84l34 30"
        fill="none"
        stroke={TEAL}
        strokeWidth="2.5"
        opacity="0.7"
      />
      <path d="M166 30h14l-14 16h14M184 14h10l-10 12h10" {...stroke} fill="none" opacity="0.55" />
    </>
  ),
  'red-cell': (accent) => (
    <>
      <path d="M0 40c80-14 240-14 320 0v80c-80 14-240 14-320 0z" fill={accent} opacity="0.14" />
      {(
        [
          [60, 70, -12],
          [130, 96, 18],
          [196, 62, -4],
          [262, 94, 24],
          [100, 128, 6],
        ] as const
      ).map(([x, y, rot], i) => (
        <g key={i} transform={`rotate(${rot} ${x} ${y})`}>
          <ellipse cx={x} cy={y} rx="28" ry="18" fill={accent} />
          <ellipse cx={x} cy={y} rx="13" ry="7" fill="#000" opacity="0.14" />
          <ellipse cx={x} cy={y} rx="28" ry="18" fill="none" {...stroke} />
        </g>
      ))}
    </>
  ),
  stomach: (accent) => (
    <>
      <path
        d="M124 22c0 26 8 34 26 36 34 4 60 22 60 54 0 26-24 34-56 30-32-4-48-22-56-44-6-18-6-50-4-76"
        fill={accent}
        opacity="0.85"
      />
      <path
        d="M132 50c4 28 14 42 34 46 28 6 40 14 34 32"
        fill="none"
        stroke={MINT}
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M124 22c0 26 8 34 26 36 34 4 60 22 60 54 0 26-24 34-56 30-32-4-48-22-56-44-6-18-6-50-4-76"
        fill="none"
        {...stroke}
      />
      {(
        [
          [168, 108],
          [182, 120],
          [156, 122],
        ] as const
      ).map(([x, y], i) => (
        <path
          key={i}
          d={`M${x} ${y - 7}c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z`}
          fill={SUN}
          {...stroke}
          strokeWidth="1.8"
        />
      ))}
      <path
        d="M232 60c14 6 22 16 24 30M244 40c10 4 18 10 22 20"
        fill="none"
        stroke={TEAL}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="1 7"
      />
    </>
  ),
  bone: (accent) => (
    <>
      <path
        d="M72 66a18 18 0 1 1 22-26h132a18 18 0 1 1 22 26 18 18 0 1 1-22 26H94a18 18 0 1 1-22-26z"
        fill={SURFACE}
        transform="translate(0 14)"
      />
      <path
        d="M72 66a18 18 0 1 1 22-26h132a18 18 0 1 1 22 26 18 18 0 1 1-22 26H94a18 18 0 1 1-22-26z"
        fill="none"
        {...stroke}
        transform="translate(0 14)"
      />
      {[120, 150, 180, 210].map((x, i) => (
        <polygon
          key={x}
          points={`${x},${70 + (i % 2) * 8} ${x + 8},${74 + (i % 2) * 8} ${x + 8},${84 + (i % 2) * 8} ${x},${88 + (i % 2) * 8} ${x - 8},${84 + (i % 2) * 8} ${x - 8},${74 + (i % 2) * 8}`}
          fill={i % 2 ? accent : MINT}
          opacity="0.9"
        />
      ))}
      <path
        d="M140 132c14 8 26 8 40 0M180 132l-4-8M140 132l4-8"
        fill="none"
        stroke={TEAL}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </>
  ),
  renewal: (accent) => (
    <>
      <circle cx="160" cy="40" r="18" fill={MINT} {...stroke} />
      <path d="M124 150c0-46 14-82 36-82s36 36 36 82" fill={AQUA} opacity="0.7" />
      <path d="M124 150c0-46 14-82 36-82s36 36 36 82" fill="none" {...stroke} />
      <circle cx="160" cy="98" r="9" fill={accent} />
      <circle cx="146" cy="126" r="6" fill={SUN} />
      <circle cx="174" cy="122" r="6" fill={TEAL} />
      <path d="M232 60a26 26 0 1 1-8-18m8-4v12h-12" fill="none" {...stroke} opacity="0.6" />
      <path d="M88 108a26 26 0 1 1 8 18m-8 4v-12h12" fill="none" {...stroke} opacity="0.6" />
    </>
  ),
  'skin-layers': (accent) => (
    <>
      <rect x="36" y="114" width="236" height="34" rx="10" fill={accent} opacity="0.22" />
      <path d="M36 114h236" {...stroke} opacity="0.5" />
      {[58, 84, 110, 136, 162, 188, 214, 240].map((x) => (
        <circle key={x} cx={x} cy="102" r="9" fill={MINT} {...stroke} />
      ))}
      {[71, 97, 123, 149, 175, 201, 227].map((x) => (
        <ellipse key={x} cx={x} cy="80" rx="12" ry="7" fill={AQUA} {...stroke} />
      ))}
      {[48, 74, 100, 126, 152, 178, 204, 230].map((x) => (
        <rect key={x} x={x} y="58" width="22" height="6" rx="3" fill={SURFACE} {...stroke} />
      ))}
      <rect
        x="92"
        y="34"
        width="20"
        height="5"
        rx="2.5"
        fill={SURFACE}
        {...stroke}
        opacity="0.6"
        transform="rotate(-14 102 36)"
      />
      <rect
        x="170"
        y="22"
        width="18"
        height="5"
        rx="2.5"
        fill={SURFACE}
        {...stroke}
        opacity="0.4"
        transform="rotate(12 179 24)"
      />
      <path
        d="M292 104V40"
        stroke={TEAL}
        strokeWidth="3"
        strokeDasharray="3 7"
        strokeLinecap="round"
      />
      <path d="M284 48l8-10 8 10" fill="none" stroke={TEAL} strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  cue: (accent) => (
    <>
      <path d="M36 62h72l18 18-18 18H36z" fill={accent} opacity="0.85" />
      <path d="M36 62h72l18 18-18 18H36z" fill="none" {...stroke} />
      <circle cx="54" cy="80" r="5" fill={SURFACE} {...stroke} />
      <path
        d="M132 80c26 0 28-37 52-37"
        fill="none"
        stroke={TEAL}
        strokeWidth="3"
        strokeDasharray="3 7"
        strokeLinecap="round"
      />
      {(
        [
          [246, 28],
          [196, 64],
          [246, 64],
          [196, 100],
          [246, 100],
        ] as const
      ).map(([x, y]) => (
        <g key={`${String(x)}-${String(y)}`}>
          <rect x={x} y={y} width="44" height="30" rx="6" fill={SURFACE} {...stroke} />
          <path d={`M${String(x + 16)} ${String(y + 15)}h12`} {...stroke} />
        </g>
      ))}
      <rect x="186" y="28" width="52" height="30" rx="6" fill={MINT} {...stroke} />
      <path d="M204 43h16" {...stroke} />
    </>
  ),
  maillard: (accent) => (
    <>
      <path d="M44 128c-4-40 20-70 70-70s76 30 70 70z" fill={accent} opacity="0.9" />
      <path d="M44 128c-4-40 20-70 70-70s76 30 70 70z" fill="none" {...stroke} />
      <path
        d="M84 80c8 6 12 14 12 24M114 74c6 8 8 18 6 28M144 80c6 6 8 14 8 22"
        fill="none"
        stroke={SURFACE}
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path d="M214 92h54v26a18 18 0 0 1-18 18h-18a18 18 0 0 1-18-18z" fill={SURFACE} {...stroke} />
      <path d="M268 100h6a10 10 0 0 1 0 20h-8" fill="none" {...stroke} />
      <path
        d="M226 74c-6-8 6-12 0-22M244 74c-6-8 6-12 0-22"
        fill="none"
        stroke={TEAL}
        strokeWidth="3"
        strokeLinecap="round"
      />
      {(
        [
          [96, 40],
          [124, 30],
          [150, 44],
        ] as const
      ).map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="5" fill={MINT} {...stroke} strokeWidth="1.8" />
      ))}
    </>
  ),
  onion: (accent) => (
    <>
      <path
        d="M70 136c-34-6-40-56-10-82 10-8 18-18 20-34 2 16 10 26 20 34 30 26 24 76-10 82z"
        fill={accent}
        opacity="0.35"
      />
      <path
        d="M80 136c-18-8-20-46-2-70M80 136c18-8 20-46 2-70"
        fill="none"
        stroke={accent}
        strokeWidth="3"
      />
      <path
        d="M70 136c-34-6-40-56-10-82 10-8 18-18 20-34 2 16 10 26 20 34 30 26 24 76-10 82z"
        fill="none"
        {...stroke}
      />
      {(
        [
          [138, 70, 9],
          [162, 54, 12],
          [190, 46, 9],
        ] as const
      ).map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={MINT} opacity="0.75" />
      ))}
      <path d="M212 70c18-16 50-16 68 0-18 16-50 16-68 0z" fill={SURFACE} {...stroke} />
      <circle cx="246" cy="70" r="9" fill={TEAL} />
      <path
        d="M250 92c5 7 8 11 8 15a8 8 0 0 1-16 0c0-4 3-8 8-15z"
        fill={AQUA}
        {...stroke}
        strokeWidth="2"
      />
    </>
  ),
  'salt-pot': (accent) => (
    <>
      <path
        d="M58 72h164v44a24 24 0 0 1-24 24H82a24 24 0 0 1-24-24z"
        fill={accent}
        opacity="0.85"
      />
      <path
        d="M58 72h164v44a24 24 0 0 1-24 24H82a24 24 0 0 1-24-24zM44 72h192"
        fill="none"
        {...stroke}
      />
      <path
        d="M58 84c30 8 134 8 164 0"
        fill="none"
        stroke={AQUA}
        strokeWidth="6"
        strokeLinecap="round"
      />
      {(
        [
          [96, 62],
          [130, 54],
          [160, 64],
          [188, 56],
        ] as const
      ).map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="6" fill="none" stroke={TEAL} strokeWidth="2.5" />
      ))}
      <path d="M248 18h30l4 34h-38z" fill={SURFACE} {...stroke} />
      <path d="M252 18v-6h22v6" fill="none" {...stroke} />
      {(
        [
          [244, 64],
          [256, 74],
          [238, 82],
          [250, 92],
        ] as const
      ).map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="4" height="4" rx="1" fill={INK} opacity="0.6" />
      ))}
    </>
  ),
  'mountain-pot': (accent) => (
    <>
      <path d="M10 150 112 40l46 50 32-30 120 90z" fill={accent} opacity="0.3" />
      <path d="M112 40 92 62l12-2 8 10 10-12 10 4z" fill={SURFACE} />
      <path d="M10 150 112 40l46 50 32-30 120 90" fill="none" {...stroke} />
      <path
        d="M96 22h32v12a8 8 0 0 1-8 8h-16a8 8 0 0 1-8-8z"
        fill={SURFACE}
        {...stroke}
        strokeWidth="2"
      />
      <path
        d="M104 16c-3-4 3-6 0-10M118 16c-3-4 3-6 0-10"
        fill="none"
        stroke={TEAL}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect x="248" y="20" width="16" height="84" rx="8" fill={SURFACE} {...stroke} />
      <circle cx="256" cy="110" r="14" fill={TEAL} {...stroke} />
      <rect x="252" y="56" width="8" height="50" rx="4" fill={TEAL} />
      <path d="M268 40h8M268 56h8M268 72h8" {...stroke} strokeWidth="2" opacity="0.5" />
    </>
  ),
  tordesillas: (accent) => (
    <>
      <path d="M60 16h200l-6 128H66z" fill={SUN} opacity="0.25" />
      <path d="M60 16h200l-6 128H66z" fill="none" {...stroke} />
      <path
        d="M128 34c22-6 46 2 58 18 12 16 26 20 30 34 4 16-12 22-22 34-10 12-18 22-30 18-8-4-4-18-10-28-8-14-26-18-30-34-4-16-2-38 4-42z"
        fill={accent}
        opacity="0.6"
      />
      <path
        d="M128 34c22-6 46 2 58 18 12 16 26 20 30 34 4 16-12 22-22 34-10 12-18 22-30 18-8-4-4-18-10-28-8-14-26-18-30-34-4-16-2-38 4-42z"
        fill="none"
        {...stroke}
        strokeWidth="2"
      />
      <path
        d="M176 22v116"
        stroke={TEAL}
        strokeWidth="3.5"
        strokeDasharray="6 6"
        strokeLinecap="round"
      />
      <circle cx="232" cy="118" r="10" fill={SURFACE} {...stroke} strokeWidth="2" />
      <path d="M232 110v16M224 118h16" {...stroke} strokeWidth="2" />
    </>
  ),
  'lingua-geral': (accent) => (
    <>
      <path d="M0 128c40-12 80 12 120 0s80 12 120 0 60 8 80 4v28H0z" fill={AQUA} opacity="0.8" />
      <path
        d="M0 128c40-12 80 12 120 0s80 12 120 0 60 8 80 4"
        fill="none"
        stroke={TEAL}
        strokeWidth="2.5"
      />
      <path
        d="M40 30h90a14 14 0 0 1 14 14v22a14 14 0 0 1-14 14H74l-16 14V80H40a14 14 0 0 1-14-14V44a14 14 0 0 1 14-14z"
        fill={accent}
        opacity="0.85"
      />
      <path
        d="M40 30h90a14 14 0 0 1 14 14v22a14 14 0 0 1-14 14H74l-16 14V80H40a14 14 0 0 1-14-14V44a14 14 0 0 1 14-14z"
        fill="none"
        {...stroke}
      />
      <path
        d="M190 20h90a14 14 0 0 1 14 14v22a14 14 0 0 1-14 14h-18v14l-16-14h-56a14 14 0 0 1-14-14V34a14 14 0 0 1 14-14z"
        fill={MINT}
      />
      <path
        d="M190 20h90a14 14 0 0 1 14 14v22a14 14 0 0 1-14 14h-18v14l-16-14h-56a14 14 0 0 1-14-14V34a14 14 0 0 1 14-14z"
        fill="none"
        {...stroke}
      />
      <path
        d="M48 52h60M48 64h36M200 42h70M200 54h40"
        stroke={SURFACE}
        strokeWidth="5"
        strokeLinecap="round"
      />
    </>
  ),
  decree: (accent) => (
    <>
      <path d="M84 24h138v104a12 12 0 0 1-12 12H84z" fill={SURFACE} {...stroke} />
      <path d="M72 24a12 12 0 0 1 24 0v108" fill="none" {...stroke} />
      <path
        d="M108 50h90M108 64h90M108 78h64M108 92h80"
        stroke={INK}
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.25"
      />
      <circle cx="194" cy="116" r="16" fill={accent} {...stroke} />
      <path d="M186 130l-4 18 12-6 12 6-4-18" fill={accent} {...stroke} strokeWidth="2" />
      <path d="M244 140c10-40 28-82 52-112-6 34-20 74-44 108" fill={MINT} {...stroke} />
      <path d="M244 140l-6 10" {...stroke} />
    </>
  ),
  'tupi-words': (accent) => (
    <>
      <path
        d="M78 20c-6 10-2 18 4 22-10-2-16 4-14 12 6-6 14-6 20 0 4-6 12-8 20-2 0-8-6-14-16-12 8-4 10-14 2-22-4 8-8 10-12 10-2-2-4-6-4-8z"
        fill={TEAL}
      />
      <ellipse cx="86" cy="98" rx="34" ry="44" fill={SUN} />
      <path
        d="M62 74l48 48M56 98l40 40M76 62l40 40M110 74l-48 48M116 98l-40 40M96 62l-40 40"
        stroke={INK}
        strokeWidth="1.8"
        opacity="0.3"
      />
      <ellipse cx="86" cy="98" rx="34" ry="44" fill="none" {...stroke} />
      <path
        d="M166 92c0-22 20-38 46-38 14 0 26 6 34 14l40-6c6 0 8 8 2 12l-28 14c-4 18-22 32-48 32-26 0-46-12-46-28z"
        fill={accent}
        opacity="0.85"
      />
      <path
        d="M166 92c0-22 20-38 46-38 14 0 26 6 34 14l40-6c6 0 8 8 2 12l-28 14c-4 18-22 32-48 32-26 0-46-12-46-28z"
        fill="none"
        {...stroke}
      />
      <circle cx="232" cy="76" r="4" fill={INK} />
      <path d="M246 68l40-6c6 0 8 8 2 12l-28 14" fill={SUN} {...stroke} strokeWidth="2" />
    </>
  ),
  fixture: () => (
    <>
      <rect
        x="20"
        y="20"
        width="280"
        height="120"
        rx="16"
        fill="none"
        stroke={INK}
        strokeWidth="2"
        strokeDasharray="8 8"
        opacity="0.4"
      />
      <path d="M140 60l40 40M180 60l-40 40" {...stroke} opacity="0.4" />
    </>
  ),
};

export function Illustration({
  id,
  accent,
  className,
}: {
  id: string;
  accent: string;
  className?: string;
}) {
  const scene = SCENES[id] ?? SCENES.fixture;
  return (
    <svg
      viewBox="0 0 320 160"
      className={className}
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
    >
      {scene?.(accent)}
    </svg>
  );
}

export const ILLUSTRATION_IDS = Object.keys(SCENES);
