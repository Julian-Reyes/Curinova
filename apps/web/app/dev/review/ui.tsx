import type { Claim, Locale } from '@lumen/domain';

export const LOCALE_LABEL: Record<Locale, string> = { 'pt-BR': 'pt-BR', en: 'en' };

const STATE_STYLE: Record<string, string> = {
  waiting: 'bg-sunken text-ink',
  approved: 'bg-success-soft text-ink',
  rejected: 'bg-danger-soft text-ink',
  missing: 'bg-sunken text-muted',
};

export function StateBadge({ state }: { state: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATE_STYLE[state] ?? ''}`}>
      {state}
    </span>
  );
}

const VERDICT_STYLE: Record<string, string> = {
  supported: 'bg-success-soft',
  partial: 'bg-accent-soft',
  unsupported: 'bg-danger-soft',
  pending: 'bg-sunken',
  approved: 'bg-success-soft',
  edited: 'bg-accent-soft',
  rejected: 'bg-danger-soft',
};

export function VerdictBadge({ label, value }: { label: string; value: string }) {
  return (
    <span
      className={`rounded-md px-1.5 py-0.5 text-[11px] font-medium ${VERDICT_STYLE[value] ?? ''}`}
    >
      {label}: {value}
    </span>
  );
}

/** Verifier verdict counts, e.g. "5 supported · 1 partial". */
export function Verdicts({ verdicts }: { verdicts: Record<Claim['autoVerdict'], number> }) {
  const parts = (['supported', 'partial', 'unsupported', 'pending'] as const)
    .filter((k) => verdicts[k] > 0)
    .map((k) => (
      <span key={k} className={`rounded-md px-1.5 py-0.5 ${VERDICT_STYLE[k] ?? ''}`}>
        {verdicts[k]} {k}
      </span>
    ));
  return (
    <span className="flex gap-1">
      {parts.length > 0 ? parts : <span className="text-muted">no claims</span>}
    </span>
  );
}

export const SHORTCUTS: [string, string][] = [
  ['j / k', 'Next / previous claim (the locale headers are in the list too)'],
  ['a', 'Approve the focused claim, or the locale when its header is focused'],
  ['e', 'Edit the focused locale'],
  ['r', 'Reject the focused locale (a note is required)'],
  ['n', 'Add a note'],
  ['[ / ]', 'Previous / next lesson'],
  ['?', 'This list'],
  ['Esc', 'Close a dialog, or leave edit mode'],
];
