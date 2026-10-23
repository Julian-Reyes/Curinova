import { useId } from 'react';

export interface SegmentedOption<T extends string | number> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

/** Accessible single-choice control (radio group) with large tap targets. */
export function Segmented<T extends string | number>({
  label,
  options,
  value,
  onChange,
  hideLabel = false,
}: {
  label: string;
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  hideLabel?: boolean;
}) {
  const id = useId();
  return (
    <fieldset className="min-w-0">
      <legend className={hideLabel ? 'sr-only' : 'mb-2 text-sm font-semibold text-ink'}>
        {label}
      </legend>
      <div className="flex flex-wrap gap-1 rounded-[var(--radius-control)] bg-sunken p-1 ring-1 ring-line">
        {options.map((option) => {
          const checked = option.value === value;
          return (
            <label
              key={String(option.value)}
              className={`pressable relative flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[11px] px-3 text-sm font-medium has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-primary ${
                checked
                  ? 'bg-accent-soft text-ink shadow-sm ring-1 ring-primary/50'
                  : 'text-muted hover:text-ink'
              }`}
            >
              <input
                type="radio"
                name={id}
                className="sr-only"
                checked={checked}
                onChange={() => {
                  onChange(option.value);
                }}
              />
              {option.icon}
              <span className="whitespace-nowrap">{option.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
