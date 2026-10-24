import type { ComponentProps, ReactNode } from 'react';

// ── TextField: a label, an input, and a hint or error message underneath ──

type TextFieldProps = ComponentProps<'input'> & {
  label: string;
  error?: string; // shown in red when there's a problem
  hint?: string; // shown in grey when there isn't
};

export function TextField({ label, error, hint, id, ...props }: TextFieldProps) {
  const inputId = id ?? props.name;
  const messageId = `${inputId}-message`;
  const message = error ?? hint;

  return (
    <div className="space-y-1">
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={message ? messageId : undefined}
        className={`block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 ${
          error ? 'border-red-500' : 'border-gray-300 focus:border-indigo-500'
        }`}
        {...props}
      />
      {message && (
        <p id={messageId} className={`text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {message}
        </p>
      )}
    </div>
  );
}

// ── Button ──

export function Button({ className = '', ...props }: ComponentProps<'button'>) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    />
  );
}

// ── Alert: an error message for the whole form (we use it in 3.3) ──

export function Alert({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
      {children}
    </div>
  );
}
