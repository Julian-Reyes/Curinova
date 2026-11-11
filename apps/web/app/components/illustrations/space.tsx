/* Brazil in space: original "How it works" scenes (license: original). */
import { AQUA, Head, INK, MINT, SUN, SURFACE, TEAL, fine, flow, stroke, type Scene } from './kit';

/** A small rocket, nose up, centred on its body; place it with `transform`. */
function Rocket({ accent, transform }: { accent: string; transform: string }) {
  return (
    <g transform={transform}>
      <path d="M-5 16c0 8 5 15 5 15s5-7 5-15z" fill={SUN} />
      <path d="M-8 8l-6 11h6zM8 8l6 11h-6z" fill={accent} {...fine} />
      <path d="M0-24c6 6 8 14 8 22v18H-8V-2c0-8 2-16 8-22z" fill={SURFACE} {...stroke} />
      <circle cx="0" cy="-6" r="3" fill={accent} {...fine} />
      <path d="M-8 6h16" {...fine} />
    </g>
  );
}

/** A solar panel: a filled rectangle with cell lines. */
function Panel({
  x,
  y,
  w,
  h,
  color,
  cols = 4,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  cols?: number;
}) {
  const lines = Array.from({ length: cols - 1 }, (_, i) => x + ((i + 1) * w) / cols);
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="2" fill={color} opacity="0.85" />
      {lines.map((lx) => (
        <path key={lx} d={`M${String(lx)} ${String(y)}v${String(h)}`} {...fine} opacity="0.5" />
      ))}
      <path d={`M${String(x)} ${String(y + h / 2)}h${String(w)}`} {...fine} opacity="0.5" />
      <rect x={x} y={y} width={w} height={h} rx="2" fill="none" {...fine} />
    </g>
  );
}

export const SPACE_SCENES: Record<string, Scene> = {
  'equator-launch': (accent) => (
    <>
      <circle
        cx="104"
        cy="82"
        r="60"
        fill="none"
        stroke={INK}
        strokeWidth="1.5"
        strokeDasharray="3 5"
        opacity="0.35"
      />
      <ellipse cx="104" cy="82" rx="68" ry="60" fill={AQUA} />
      <path
        d="M84 70c10-6 22-4 28 4 6 8 16 10 18 20 2 12-8 18-14 28-6 8-12 14-18 10-6-4-2-14-6-22-6-10-16-14-16-24 0-8 2-14 8-16z"
        fill={TEAL}
        opacity="0.75"
      />
      <ellipse cx="104" cy="82" rx="68" ry="60" fill="none" {...stroke} />
      <path d="M104 14v136" stroke={INK} strokeWidth="1.5" strokeDasharray="4 5" opacity="0.45" />
      <path d="M48 46c30 10 82 10 112 0" fill="none" {...fine} opacity="0.45" />
      <path
        d="M36 82c36 14 100 14 136 0"
        fill="none"
        stroke={SUN}
        strokeWidth="3"
        strokeDasharray="6 5"
      />
      <path d="M82 13c8-6 36-6 44 0" fill="none" {...fine} />
      <Head x={126} y={13} deg={20} size={4} />
      <path d="M92 50h22" stroke={TEAL} strokeWidth="4" strokeLinecap="round" />
      <Head x={116} y={50} deg={0} size={5} color={TEAL} />
      <path d="M78 104h56" stroke={TEAL} strokeWidth="4" strokeLinecap="round" />
      <Head x={136} y={104} deg={0} size={6} color={TEAL} />
      <circle cx="98" cy="93" r="5" fill={accent} {...fine} />
      <path d="M172 88c22-2 40-14 52-34" {...flow} />
      <path d="M190 104c16-2 30-8 42-20" fill="none" stroke={TEAL} strokeWidth="2" opacity="0.5" />
      <path d="M200 116c14-2 26-8 36-18" fill="none" stroke={TEAL} strokeWidth="2" opacity="0.35" />
      <Rocket accent={accent} transform="translate(238 38) rotate(40)" />
      <circle cx="280" cy="26" r="2" fill={INK} opacity="0.3" />
      <circle cx="300" cy="62" r="2" fill={INK} opacity="0.3" />
      <circle cx="270" cy="96" r="2" fill={INK} opacity="0.3" />
    </>
  ),
  'vls-pad': (accent) => (
    <>
      <path d="M0 140h320" {...stroke} opacity="0.5" />
      {[40, 74].map((x) => (
        <g key={x}>
          <path d={`M${String(x)} 140V${String(x === 40 ? 30 : 44)}`} {...stroke} />
          {Array.from({ length: x === 40 ? 9 : 8 }, (_, i) => (
            <rect
              key={i}
              x={x - 3}
              y={(x === 40 ? 30 : 44) + i * 12}
              width="6"
              height="6"
              fill={i % 2 ? SURFACE : accent}
              opacity="0.8"
            />
          ))}
        </g>
      ))}
      <rect x="112" y="24" width="46" height="116" fill={SURFACE} {...stroke} />
      <rect x="106" y="16" width="58" height="12" rx="2" fill={SURFACE} {...stroke} />
      {[46, 66, 86, 106, 126].map((y) => (
        <path key={y} d={`M112 ${String(y)}h46M158 ${String(y)}h10`} {...fine} opacity="0.55" />
      ))}
      <path d="M124 24v116M146 24v116" {...fine} opacity="0.3" />
      <rect x="160" y="128" width="50" height="12" fill={MINT} {...stroke} />
      <path d="M178 38h12v90h-12z" fill={SURFACE} {...stroke} />
      <path d="M178 38c0-10 3-16 6-20 3 4 6 10 6 20z" fill={accent} {...stroke} />
      <path d="M178 62h12M178 96h12" {...fine} />
      <path d="M163 128V96c0-6 2-10 4.5-12 2.5 2 4.5 6 4.5 12v32z" fill={SURFACE} {...stroke} />
      <path d="M196 128V96c0-6 2-10 4.5-12 2.5 2 4.5 6 4.5 12v32z" fill={SUN} {...stroke} />
      <path d="M179.5 130V100c0-6 2-10 4.5-12 2.5 2 4.5 6 4.5 12v30z" fill={SURFACE} {...stroke} />
      <path
        d="M200.5 124l3 4 4-1-2 4 3 3-4 0-1 4-3-3-3 3-1-4-4 0 3-3-2-4 4 1z"
        fill={accent}
        transform="translate(0 -6)"
      />
      <path d="M210 120c20-10 30-30 34-46" {...flow} />
      <circle cx="262" cy="52" r="34" fill={SURFACE} {...stroke} />
      <circle cx="262" cy="52" r="34" fill={AQUA} opacity="0.25" />
      <rect x="240" y="44" width="34" height="16" rx="5" fill={SUN} {...stroke} />
      <path d="M248 44v16M256 44v16" {...fine} opacity="0.5" />
      <path d="M240 52h-8c-6 0-6 10-12 10" fill="none" {...fine} />
      <path
        d="M280 52l5-6 2 5 7-2-4 6 6 3-7 1 1 6-5-4-4 5-1-6"
        fill={accent}
        {...fine}
        strokeWidth="1"
      />
    </>
  ),
  'deforestation-watch': (accent) => (
    <>
      <path d="M150 38 46 112h228z" fill={accent} opacity="0.1" />
      <path
        d="M150 38 46 112M170 38l104 74"
        fill="none"
        stroke={accent}
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />
      <Panel x={112} y={20} w={30} h={14} color={accent} cols={3} />
      <Panel x={178} y={20} w={30} h={14} color={accent} cols={3} />
      <path d="M142 27h8M170 27h8" {...fine} />
      <rect x="150" y="16" width="20" height="22" rx="3" fill={SURFACE} {...stroke} />
      <circle cx="160" cy="34" r="3" fill={INK} />
      <rect x="20" y="112" width="280" height="40" rx="8" fill={MINT} />
      {Array.from({ length: 34 }, (_, i) => (
        <circle
          key={i}
          cx={28 + ((i * 37) % 268)}
          cy={118 + ((i * 13) % 30)}
          r={4 + (i % 3)}
          fill={TEAL}
          opacity="0.45"
        />
      ))}
      <path d="M70 132h180" stroke={SUN} strokeWidth="4" strokeLinecap="round" />
      {[96, 130, 164, 198, 226].map((x, i) => (
        <g key={x}>
          <path
            d={`M${String(x)} 132v${String(i % 2 ? 14 : -14)}`}
            stroke={SUN}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <rect
            x={x - 10}
            y={i % 2 ? 136 : 116}
            width="20"
            height="10"
            rx="2"
            fill={SUN}
            opacity="0.85"
          />
        </g>
      ))}
      <rect
        x="154"
        y="112"
        width="56"
        height="40"
        rx="4"
        fill="none"
        stroke={accent}
        strokeWidth="2.5"
        strokeDasharray="5 4"
      />
      <rect x="20" y="112" width="280" height="40" rx="8" fill="none" {...fine} />
      <circle cx="44" cy="46" r="20" fill={SURFACE} {...stroke} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <path
            key={i}
            d={`M${String(44 + Math.sin(a) * 13)} ${String(46 - Math.cos(a) * 13)}L${String(44 + Math.sin(a) * 17)} ${String(46 - Math.cos(a) * 17)}`}
            stroke={TEAL}
            strokeWidth="3"
            strokeLinecap="round"
          />
        );
      })}
      <circle cx="44" cy="46" r="6" fill={accent} />
      <path d="M268 54a12 12 0 0 1 24 0v8l4 6h-32l4-6z" fill={SUN} {...stroke} />
      <path d="M276 72a4 4 0 0 0 8 0" fill="none" {...stroke} />
      {[262, 270, 278, 286, 294].map((x) => (
        <circle key={x} cx={x} cy="88" r="2.5" fill={accent} />
      ))}
      <path d="M140 30C100 26 76 34 66 42" {...flow} />
      <path d="M180 30c40-4 64 6 76 16" {...flow} />
    </>
  ),
  'cbers-satellite': (accent) => (
    <>
      <path d="M0 160V142c60-30 260-30 320 0v18z" fill={AQUA} />
      <path
        d="M90 140c20-10 50-12 70-6 18 6 40 4 54-2"
        fill="none"
        stroke={TEAL}
        strokeWidth="9"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path d="M0 142c60-30 260-30 320 0" fill="none" {...stroke} />
      <path d="M140 78 104 132h80l-28-54z" fill={accent} opacity="0.14" />
      <path
        d="M140 78 104 132M156 78l28 54"
        fill="none"
        stroke={accent}
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />
      <path d="M166 48h20" {...stroke} />
      <Panel x={186} y={36} w={112} h={24} color={accent} cols={6} />
      <rect x="128" y="30" width="20" height="44" fill={accent} opacity="0.85" />
      <rect x="148" y="30" width="20" height="44" fill={SUN} opacity="0.9" />
      <rect x="128" y="30" width="40" height="44" rx="3" fill="none" {...stroke} />
      <path d="M148 30v44" {...fine} />
      <rect x="142" y="74" width="12" height="7" rx="2" fill={SURFACE} {...stroke} />
      <path d="M136 30v-8M136 22l-6-4" {...fine} />
      <path d="M262 132v-26M256 132h12" {...stroke} />
      <rect x="254" y="96" width="16" height="12" rx="2" fill={SURFACE} {...stroke} />
      <path d="M262 96v-8" {...fine} />
      <path
        d="M252 84a14 14 0 0 1 20 0M246 76a24 24 0 0 1 32 0"
        fill="none"
        stroke={TEAL}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path d="M262 70C252 62 228 70 204 64" {...flow} />
      <g transform="translate(18 30)">
        {[12, 6, 0].map((d, i) => (
          <g key={d} transform={`translate(${String(d)} ${String(d)})`}>
            <rect width="44" height="34" rx="3" fill={i === 2 ? MINT : SURFACE} {...fine} />
            {i === 2 && (
              <path
                d="M4 26c10-8 14 0 22-8s10-6 14-10"
                fill="none"
                stroke={TEAL}
                strokeWidth="3"
                strokeLinecap="round"
              />
            )}
          </g>
        ))}
      </g>
      <path d="M118 52c-16 0-26 6-34 14" {...flow} />
      <Head x={84} y={66} deg={130} size={5} color={TEAL} />
    </>
  ),
  'multimission-platform': (accent) => (
    <>
      <Panel x={198} y={98} w={102} h={24} color={accent} cols={6} />
      <path d="M190 110h8" {...stroke} />
      <rect x="128" y="88" width="62" height="44" rx="4" fill={accent} opacity="0.85" />
      <rect x="128" y="88" width="62" height="44" rx="4" fill="none" {...stroke} />
      {[136, 152, 168].map((x) =>
        [96, 112].map((y) => (
          <rect
            key={`${String(x)}-${String(y)}`}
            x={x}
            y={y}
            width="12"
            height="12"
            rx="2"
            fill={SURFACE}
            opacity="0.55"
          />
        )),
      )}
      <path d="M150 132l-6 12h30l-6-12" fill={SUN} {...stroke} />
      <rect x="92" y="16" width="62" height="40" rx="4" fill={SURFACE} {...stroke} />
      <circle cx="123" cy="36" r="12" fill={AQUA} {...stroke} />
      <circle cx="123" cy="36" r="5" fill={INK} opacity="0.7" />
      <rect
        x="176"
        y="16"
        width="62"
        height="40"
        rx="4"
        fill="none"
        stroke={INK}
        strokeWidth="2"
        strokeDasharray="5 5"
        opacity="0.55"
      />
      <path d="M192 44c4-16 26-16 30 0z" fill="none" stroke={INK} strokeWidth="2" opacity="0.55" />
      <path d="M207 36v-10" stroke={INK} strokeWidth="2" opacity="0.55" />
      <path
        d="M128 60c4 10 10 18 22 24"
        fill="none"
        stroke={TEAL}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <Head x={150} y={84} deg={35} size={6} color={TEAL} />
      <path d="M200 60c-4 10-10 18-22 24" {...flow} opacity="0.7" />
      <Head x={178} y={84} deg={145} size={6} color={TEAL} />
      <rect x="16" y="80" width="80" height="58" rx="6" fill={MINT} />
      {Array.from({ length: 10 }, (_, i) => (
        <circle
          key={i}
          cx={24 + ((i * 29) % 66)}
          cy={88 + ((i * 17) % 44)}
          r="5"
          fill={TEAL}
          opacity="0.4"
        />
      ))}
      <path
        d="M16 120c18-6 26 4 40-6s22-8 40-14"
        fill="none"
        stroke={AQUA}
        strokeWidth="6"
        strokeLinecap="round"
      />
      <rect x="16" y="80" width="80" height="58" rx="6" fill="none" {...stroke} />
    </>
  ),
  'soyuz-iss': (accent) => (
    <>
      <path d="M0 160v-24c70-40 250-40 320 0v24z" fill={AQUA} />
      <path
        d="M40 150c30-14 60-16 90-8 20 6 34 2 46-4"
        fill="none"
        stroke={TEAL}
        strokeWidth="10"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path d="M0 136c70-40 250-40 320 0" fill="none" {...stroke} />
      <path d="M0 128c70-40 250-40 320 0" fill="none" stroke={AQUA} strokeWidth="3" opacity="0.6" />
      <path d="M40 120C48 90 70 70 96 64" {...flow} />
      {(
        [
          [30, 30],
          [96, 18],
          [170, 26],
          [300, 92],
          [160, 96],
        ] as const
      ).map(([x, y]) => (
        <circle key={`${String(x)}-${String(y)}`} cx={x} cy={y} r="1.8" fill={INK} opacity="0.35" />
      ))}
      <path d="M196 52h112" {...stroke} />
      {[200, 226, 262, 288].map((x) => (
        <Panel key={x} x={x - 9} y={x < 245 ? 20 : 20} w={18} h={28} color={SUN} cols={2} />
      ))}
      {[200, 226, 262, 288].map((x) => (
        <Panel key={`b${String(x)}`} x={x - 9} y={56} w={18} h={28} color={SUN} cols={2} />
      ))}
      <rect x="238" y="40" width="14" height="44" rx="5" fill={SURFACE} {...stroke} />
      <rect x="226" y="62" width="38" height="12" rx="5" fill={SURFACE} {...stroke} />
      <rect x="244" y="84" width="10" height="10" rx="3" fill={MINT} {...stroke} />
      <Panel x={102} y={36} w={14} h={18} color={accent} cols={2} />
      <Panel x={102} y={70} w={14} h={18} color={accent} cols={2} />
      <rect x="102" y="54" width="18" height="16" rx="3" fill={MINT} {...stroke} />
      <path d="M120 54h6l8 4v8l-8 4h-6z" fill={SURFACE} {...stroke} />
      <circle cx="140" cy="62" r="6" fill={MINT} {...stroke} />
      <path
        d="M150 62h32"
        stroke={TEAL}
        strokeWidth="2.5"
        strokeDasharray="2 5"
        strokeLinecap="round"
      />
      <Head x={186} y={62} deg={0} size={5} color={TEAL} />
    </>
  ),
};
