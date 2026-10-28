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
      <div className="flex flex-wrap gap-1 rounded-[24px] bg-surface-2 p-1">
        {options.map((option) => {
          const checked = option.value === value;
          return (
            <label
              key={String(option.value)}
              className={`pressable relative flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full px-3 text-[13.5px] font-semibold has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-primary ${
                checked ? 'bg-surface text-ink shadow-card' : 'text-ink-soft hover:text-ink'
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
