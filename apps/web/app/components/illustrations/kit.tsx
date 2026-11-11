/*
 * Shared palette and parts for the original lesson illustrations (see Illustration.tsx).
 * Every scene draws on a 320×160 canvas: strokes use --ink, fills mix the mint/aqua
 * palette with the topic accent, and nothing carries text.
 */

export const MINT = '#83E6CD';
export const AQUA = '#9FE3F0';
export const TEAL = '#0A8F83';
export const SUN = '#F4B860';
export const INK = 'var(--ink)';
export const SURFACE = 'var(--surface)';

export type Scene = (accent: string) => React.ReactNode;

export const stroke = {
  stroke: INK,
  strokeWidth: 2.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/** A thin ink line for small details. */
export const fine = { ...stroke, strokeWidth: 1.6 };

/** A dashed teal path that shows movement or a signal. */
export const flow = {
  fill: 'none',
  stroke: TEAL,
  strokeWidth: 2.5,
  strokeDasharray: '3 7',
  strokeLinecap: 'round' as const,
};

export function Earth({ x, y, r }: { x: number; y: number; r: number }) {
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

export function Moon({ x, y, r, face = 0 }: { x: number; y: number; r: number; face?: number }) {
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

/** An arrowhead at (x, y) pointing in direction `deg` (0 = right, 90 = down). */
export function Head({
  x,
  y,
  deg,
  size = 6,
  color = INK,
}: {
  x: number;
  y: number;
  deg: number;
  size?: number;
  color?: string;
}) {
  return (
    <path
      d={`M${String(-size)} ${String(-size)}L0 0L${String(-size)} ${String(size)}`}
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      transform={`translate(${String(x)} ${String(y)}) rotate(${String(deg)})`}
    />
  );
}
