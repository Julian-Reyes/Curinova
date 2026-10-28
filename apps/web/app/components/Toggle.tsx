import { useId } from 'react';

/** Accessible on/off switch with a full-width tap target. */
export function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="flex min-h-12 items-center gap-3">
      <label htmlFor={id} className="min-w-0 flex-1 cursor-pointer">
        <span className="block font-medium">{label}</span>
        {description !== undefined && (
          <span className="block text-sm text-muted">{description}</span>
        )}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => {
          onChange(!checked);
        }}
        className={`relative h-8 w-[52px] shrink-0 rounded-full transition-colors duration-[var(--dur)] ${checked ? 'bg-primary' : 'bg-line-strong'}`}
      >
        <span
          className={`absolute top-1 left-1 size-6 rounded-full shadow transition-transform duration-[var(--dur)] ease-[var(--ease-out)] ${checked ? 'translate-x-5 bg-on-primary' : 'bg-white'}`}
        />
      </button>
    </div>
  );
}
