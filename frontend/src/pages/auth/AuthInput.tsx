import type { ReactNode } from 'react';
export const AuthInput = ({
  id,
  label,
  value,
  onChange,
  error,
  type = 'text',
  autoComplete,
  onToggleVisibility,
  visibilityIcon,
  visibilityLabel,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  autoComplete: string;
  onToggleVisibility?: () => void;
  visibilityIcon?: ReactNode;
  visibilityLabel?: string;
}) => (
  <div>
    <label htmlFor={id} className="sr-only">{label}</label>
    <div
      className={`flex min-h-10 items-center rounded-[5px] border bg-transparent ${
        error ? 'border-red-400' : 'border-[#3D2C24]'
      }`}
    >
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={label}
        autoComplete={autoComplete}
        aria-required="true"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="min-w-0 flex-1 bg-transparent px-3.5 py-2 text-center text-xs text-[#F5F1EB] outline-none placeholder:text-[#B39463] md:text-left"
      />
      {onToggleVisibility && (
        <button
          type="button"
          onClick={onToggleVisibility}
          aria-label={visibilityLabel}
          className="flex h-10 w-10 shrink-0 items-center justify-center"
        >
          {visibilityIcon}
        </button>
      )}
    </div>
    {error && (
      <p id={`${id}-error`} className="mt-1 text-[11px] leading-4 text-red-400">
        {error}
      </p>
    )}
  </div>
);
