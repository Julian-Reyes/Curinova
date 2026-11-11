/* Everyday science myths: original "How it works" scenes (license: original). */
import { AQUA, Head, INK, MINT, SUN, SURFACE, TEAL, fine, flow, stroke, type Scene } from './kit';

const SKIN = '#F2C7B0';
const DERMIS = '#EBAE98';
const BLOOD = '#8E2B2B';
const RED_LIGHT = '#E0473A';
const BLUE_LIGHT = '#4C78D8';
const CLOUD = '#A9B6BC';
const SOIL = '#B98B5E';

export const MYTHS_SCENES: Record<string, Scene> = {
  'vein-light': () => (
    <>
      <rect x="0" y="60" width="320" height="100" fill={DERMIS} />
      <rect x="0" y="60" width="320" height="14" fill={SKIN} />
      <path d="M0 60h320" {...stroke} />
      <path d="M0 74h320" {...fine} opacity="0.4" />
      <ellipse cx="96" cy="86" rx="22" ry="7" fill={BLOOD} {...fine} />
      <ellipse cx="214" cy="122" rx="40" ry="13" fill={BLOOD} {...fine} />
      <ellipse cx="96" cy="60" rx="26" ry="4" fill={RED_LIGHT} opacity="0.35" />
      <ellipse cx="214" cy="60" rx="42" ry="5" fill={BLUE_LIGHT} opacity="0.35" />
      <circle cx="28" cy="24" r="12" fill={SUN} {...stroke} />
      <path d="M28 4v-2M8 24h-2M14 10l-2-2M42 10l2-2" {...fine} />
      <path d="M44 32 200 112" stroke={RED_LIGHT} strokeWidth="3.5" strokeLinecap="round" />
      <Head x={200} y={112} deg={27} size={6} color={RED_LIGHT} />
      <path d="M44 22 168 66" stroke={BLUE_LIGHT} strokeWidth="3.5" strokeLinecap="round" />
      <path
        d="M168 66c6 4 12-2 18-8s14-12 22-14 20-8 34-14"
        fill="none"
        stroke={BLUE_LIGHT}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="5 5"
      />
      <Head x={242} y={30} deg={-28} size={6} color={BLUE_LIGHT} />
      <path d="M254 26c14-14 38-14 52 0-14 14-38 14-52 0z" fill={SURFACE} {...stroke} />
      <circle cx="280" cy="26" r="8" fill={TEAL} />
      <circle cx="280" cy="26" r="3" fill={INK} />
      {[130, 160, 174, 150].map((x, i) => (
        <circle key={x} cx={x} cy={64 + i * 2} r="1.6" fill={BLUE_LIGHT} opacity="0.8" />
      ))}
    </>
  ),
  'coin-drag': (accent) => (
    <>
      <rect x="20" y="10" width="54" height="142" rx="3" fill={SURFACE} {...stroke} />
      {Array.from({ length: 8 }, (_, r) =>
        [30, 46, 62].map((x) => (
          <rect
            key={`${String(r)}-${String(x)}`}
            x={x - 4}
            y={20 + r * 16}
            width="8"
            height="9"
            rx="1.5"
            fill={AQUA}
            opacity="0.8"
          />
        )),
      )}
      <path d="M0 152h320" {...stroke} opacity="0.5" />
      {(
        [
          [24, 6],
          [52, 14],
          [86, 20],
          [122, 20],
        ] as const
      ).map(([y, len], i) => (
        <g key={y}>
          <ellipse cx="124" cy={y} rx="9" ry="3.5" fill={SUN} {...fine} />
          {i < 3 && (
            <>
              <path
                d={`M124 ${String(y + 6)}v${String(len)}`}
                stroke={accent}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <Head x={124} y={y + 6 + len} deg={90} size={4} color={accent} />
            </>
          )}
        </g>
      ))}
      <path d="M124 128v18" stroke={accent} strokeWidth="3" strokeLinecap="round" />
      <Head x={124} y={146} deg={90} size={5} color={accent} />
      <path d="M136 122v-18" stroke={TEAL} strokeWidth="3" strokeLinecap="round" />
      <Head x={136} y={104} deg={-90} size={5} color={TEAL} />
      <path
        d="M106 112c-4 4-4 12 0 16M100 108c-6 6-6 18 0 24"
        fill="none"
        stroke={TEAL}
        strokeWidth="1.8"
        opacity="0.6"
      />
      <path d="M190 24v104h112" fill="none" {...stroke} opacity="0.6" />
      <path
        d="M190 128C200 108 216 22 236 18"
        fill="none"
        stroke={INK}
        strokeWidth="2"
        strokeDasharray="4 5"
        opacity="0.4"
      />
      <path
        d="M190 128c14-30 26-52 46-60s40-8 64-8"
        fill="none"
        stroke={TEAL}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path d="M236 60h66" stroke={accent} strokeWidth="2" strokeDasharray="3 5" />
      <ellipse cx="282" cy="46" rx="9" ry="3.5" fill={SUN} {...fine} />
    </>
  ),
  'knuckle-joint': (accent) => (
    <>
      <ellipse cx="160" cy="80" rx="50" ry="40" fill={AQUA} opacity="0.7" />
      <ellipse cx="160" cy="80" rx="50" ry="40" fill="none" stroke={TEAL} strokeWidth="2.5" />
      <path d="M20 62h104c12 0 20 8 20 18s-8 18-20 18H20z" fill={SURFACE} {...stroke} />
      <path
        d="M128 64c8 2 14 8 14 16s-6 14-14 16"
        fill="none"
        stroke={MINT}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path d="M300 62H196c-12 0-20 8-20 18s8 18 20 18h104z" fill={SURFACE} {...stroke} />
      <path
        d="M192 64c-8 2-14 8-14 16s6 14 14 16"
        fill="none"
        stroke={MINT}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle cx="160" cy="80" r="12" fill={SURFACE} {...stroke} />
      <circle cx="156" cy="76" r="3" fill={AQUA} />
      <path d="M60 80H30" stroke={accent} strokeWidth="3" strokeLinecap="round" />
      <Head x={28} y={80} deg={180} size={6} color={accent} />
      <path d="M260 80h30" stroke={accent} strokeWidth="3" strokeLinecap="round" />
      <Head x={292} y={80} deg={0} size={6} color={accent} />
      {[14, 24, 34].map((r) => (
        <path
          key={r}
          d={`M${String(160 - r)} ${String(34 - r * 0.2)}a${String(r)} ${String(r * 0.6)} 0 0 1 ${String(r * 2)} 0`}
          fill="none"
          stroke={SUN}
          strokeWidth="3"
          strokeLinecap="round"
        />
      ))}
      <path d="M118 140c10-8 22-10 32-6M202 140c-10-8-22-10-32-6" {...flow} />
    </>
  ),
  'lightning-tower': (accent) => (
    <>
      <path
        d="M40 40c-14 0-22-10-18-20 4-10 16-12 24-8 4-10 18-14 28-8 8-8 24-8 32 2 10-4 24 0 26 10 12-2 22 6 20 16-2 8-10 10-18 10z"
        fill={CLOUD}
        {...stroke}
      />
      <path
        d="M150 36c-10 0-16-8-12-16 4-8 14-10 20-6 6-10 22-12 32-4 10-6 28-4 32 8 12 0 18 10 14 18z"
        fill={CLOUD}
        {...stroke}
      />
      <path d="M150 150l50-76 20-6 18 10 70 72z" fill={MINT} {...stroke} />
      <path d="M0 150c20-10 40-20 60-20s30 10 50 20" fill={MINT} {...stroke} />
      <path d="M0 150h320" {...stroke} />
      <path d="M212 70V48M204 54h16" {...stroke} strokeWidth="3.5" />
      <circle cx="212" cy="44" r="3.5" fill={SURFACE} {...stroke} />
      <path d="M62 128V100" {...stroke} />
      <circle cx="62" cy="94" r="10" fill={TEAL} opacity="0.85" {...fine} />
      {[90, 112, 132].map((x) => (
        <path key={x} d={`M${String(x)} 150v-10l8-6 8 6v10`} fill={SURFACE} {...fine} />
      ))}
      <path
        d="M190 36l10 10-6 2 12 10"
        fill="none"
        stroke={SUN}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M224 36l-6 8 6 2-8 10"
        fill="none"
        stroke={SUN}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
      <path
        d="M244 42l-14 6 4 4-16 4"
        fill="none"
        stroke={SUN}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.45"
      />
      <path
        d="M56 50l4 14-6 2 6 18"
        fill="none"
        stroke={SUN}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
      {[0, 1, 2, 3, 4].map((i) => (
        <path
          key={i}
          d={`M${String(264 + i * 8)} 26v16`}
          stroke={accent}
          strokeWidth="3"
          strokeLinecap="round"
        />
      ))}
      <path d="M260 40l40-12" stroke={accent} strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  'microwave-depth': (accent) => (
    <>
      <rect x="72" y="34" width="168" height="96" rx="22" fill={accent} opacity="0.9" />
      <rect x="92" y="54" width="128" height="56" rx="12" fill={SUN} opacity="0.9" />
      <rect x="112" y="70" width="88" height="24" rx="8" fill={AQUA} />
      <rect x="72" y="34" width="168" height="96" rx="22" fill="none" {...stroke} />
      {[52, 82, 112].map((y) => (
        <g key={y}>
          <path
            d={`M14 ${String(y)}c6-6 10 6 16 0s10 6 16 0 10 6 16 0`}
            fill="none"
            stroke={SUN}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <Head x={66} y={y} deg={0} size={4} color={SUN} />
        </g>
      ))}
      {[52, 112].map((y) => (
        <g key={y}>
          <path
            d={`M300 ${String(y)}c-6-6-10 6-16 0s-10 6-16 0 -10 6 -16 0`}
            fill="none"
            stroke={SUN}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <Head x={248} y={y} deg={180} size={4} color={SUN} />
        </g>
      ))}
      <path
        d="M100 82h10M212 82h-10M156 62v6M156 102v-6"
        stroke={TEAL}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="2 4"
      />
      <Head x={112} y={82} deg={0} size={4} color={TEAL} />
      <Head x={200} y={82} deg={180} size={4} color={TEAL} />
      <g transform="translate(284 136)">
        <path d="M-16-4a16 16 0 0 1 28-8" fill="none" {...fine} />
        <Head x={12} y={-12} deg={-30} size={3.5} />
        <circle cx="0" cy="4" r="7" fill={accent} {...fine} />
        <circle cx="-9" cy="10" r="4" fill={SURFACE} {...fine} />
        <circle cx="9" cy="10" r="4" fill={SURFACE} {...fine} />
      </g>
    </>
  ),
  'mpemba-cups': (accent) => (
    <>
      <rect x="14" y="20" width="136" height="124" rx="10" fill={AQUA} opacity="0.35" />
      <rect x="14" y="20" width="136" height="124" rx="10" fill="none" {...stroke} />
      <path d="M38 64h36l-4 60H42z" fill={SURFACE} {...stroke} />
      <path d="M40 80h32l-3 44H43z" fill={accent} opacity="0.85" />
      <path
        d="M48 56c-4-6 4-8 0-14M60 56c-4-6 4-8 0-14"
        fill="none"
        stroke={accent}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path d="M92 64h36l-4 60H96z" fill={SURFACE} {...stroke} />
      <path d="M94 80h32l-3 44H97z" fill={TEAL} opacity="0.5" />
      <g transform="translate(130 36)" stroke={TEAL} strokeWidth="2" strokeLinecap="round">
        <path d="M0-8v16M-7-4l14 8M-7 4l14-8" />
      </g>
      <path d="M176 22v112h130" fill="none" {...stroke} opacity="0.6" />
      <path d="M176 112h130" stroke={TEAL} strokeWidth="2" strokeDasharray="4 5" />
      <path
        d="M182 30c20 40 46 70 104 82"
        fill="none"
        stroke={accent}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M182 70c26 20 52 34 104 42"
        fill="none"
        stroke={TEAL}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <ellipse cx="254" cy="102" rx="28" ry="12" fill={INK} opacity="0.08" />
      <path
        d="M232 96c10 6 26 10 44 12"
        fill="none"
        stroke={accent}
        strokeWidth="2"
        strokeDasharray="3 4"
      />
    </>
  ),
  'radium-roots': (accent) => (
    <>
      <rect x="0" y="96" width="320" height="64" fill={SOIL} opacity="0.3" />
      <path d="M0 96h320" {...stroke} opacity="0.6" />
      {Array.from({ length: 22 }, (_, i) => (
        <circle
          key={i}
          cx={8 + ((i * 47) % 306)}
          cy={104 + ((i * 19) % 50)}
          r="2.2"
          fill={accent}
          opacity="0.8"
        />
      ))}
      <path d="M192 96V40" stroke={SOIL} strokeWidth="10" strokeLinecap="round" />
      <path
        d="M192 96c-20 10-40 14-70 18M192 96c-30 20-50 36-80 42M192 96c16 10 40 14 74 18M192 96c24 22 44 36 82 42M192 96v50M150 112c-10 6-20 14-30 26M240 112c12 8 22 16 30 28"
        fill="none"
        stroke={SOIL}
        strokeWidth="3"
        strokeLinecap="round"
      />
      {(
        [
          [150, 110],
          [124, 126],
          [232, 110],
          [252, 128],
          [192, 128],
        ] as const
      ).map(([x, y]) => (
        <circle
          key={`${String(x)}-${String(y)}`}
          cx={x}
          cy={y}
          r="2.6"
          fill={accent}
          {...fine}
          strokeWidth="0.8"
        />
      ))}
      <path d="M200 92V58" {...flow} />
      <Head x={200} y={56} deg={-90} size={4} color={TEAL} />
      <path
        d="M140 46c-10-20 10-34 26-28 8-14 34-14 42 0 18-6 34 10 26 26 6 10-6 22-20 18-12 8-36 8-48 0-14 4-30-4-26-16z"
        fill={MINT}
        {...stroke}
      />
      <circle cx="232" cy="56" r="11" fill={SOIL} {...stroke} />
      <path
        d="M270 70c0-12 12-18 22-14 10 4 12 18 2 24-8 6-24 2-24-10z"
        fill={SOIL}
        opacity="0.5"
        {...fine}
      />
      {(
        [
          [282, 66],
          [292, 70],
          [284, 76],
        ] as const
      ).map(([x, y]) => (
        <path key={x} d={`M${String(x)} ${String(y)}l6-3 2 6-6 3z`} fill={SURFACE} {...fine} />
      ))}
      <path d="M248 56c8 0 14 4 18 10" {...flow} />
      <path d="M34 54c4 20 26 32 46 26-14-2-30-12-36-28z" fill={SUN} {...stroke} />
      <path d="M34 54l-2-6" {...stroke} />
      {(
        [
          [66, 50],
          [86, 62],
          [56, 40],
        ] as const
      ).map(([x, y]) => (
        <circle key={x} cx={x} cy={y} r="2" fill={accent} opacity="0.7" />
      ))}
    </>
  ),
};
