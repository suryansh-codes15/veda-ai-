import clsx from 'clsx';
import { forwardRef } from 'react';

// ── Button ──────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className, disabled, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed select-none';

    const variants = {
      primary: 'bg-brand text-white hover:bg-neutral-800 active:scale-[0.98]',
      secondary:
        'bg-white text-brand border border-[#e8e5df] hover:border-[#d4d0c8] hover:bg-surface-2 active:scale-[0.98]',
      ghost: 'bg-transparent text-[#6b6660] hover:bg-surface-3 hover:text-brand',
      danger: 'bg-white text-[#b02020] border border-[#e8e5df] hover:bg-[#fdeaea] hover:border-[#f0b0b0]',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-[12px]',
      md: 'px-5 py-2.5 text-[13px]',
      lg: 'px-6 py-3 text-[14px]',
    };

    return (
      <button
        ref={ref}
        className={clsx(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : null}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

// ── Input ──────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, rightIcon, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-[13px] font-medium text-brand mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              'w-full px-3.5 py-2.5 border rounded-lg text-[13px] bg-white text-brand outline-none transition-colors',
              error
                ? 'border-[#e85d26] focus:border-[#e85d26]'
                : 'border-[#e8e5df] focus:border-brand',
              rightIcon && 'pr-10',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9b9590] pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-[11px] text-[#b02020] mt-1">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

// ── Textarea ──────────────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-[13px] font-medium text-brand mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={clsx(
            'w-full px-3.5 py-2.5 border rounded-lg text-[13px] bg-white text-brand outline-none transition-colors resize-y min-h-[80px] leading-relaxed',
            error ? 'border-[#e85d26]' : 'border-[#e8e5df] focus:border-brand',
            className
          )}
          {...props}
        />
        {error && <p className="text-[11px] text-[#b02020] mt-1">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

// ── Select ──────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Array<{ value: string; label: string }>;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-[13px] font-medium text-brand mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={clsx(
            'w-full px-3.5 py-2.5 border rounded-lg text-[13px] bg-white text-brand outline-none transition-colors appearance-none cursor-pointer',
            error ? 'border-[#e85d26]' : 'border-[#e8e5df] focus:border-brand',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-[11px] text-[#b02020] mt-1">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';

// ── DifficultyBadge ──────────────────────────────────────────────────────
interface DifficultyBadgeProps {
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const styles = {
    Easy: 'bg-easy-bg text-easy',
    Medium: 'bg-medium-bg text-medium',
    Hard: 'bg-hard-bg text-hard',
  };

  return (
    <span
      className={clsx(
        'text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase',
        styles[difficulty]
      )}
    >
      {difficulty}
    </span>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export function Card({ children, className, title, subtitle }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-white border border-[#e8e5df] rounded-2xl p-7',
        className
      )}
    >
      {title && (
        <div className="mb-5">
          <h3 className="text-[16px] font-semibold">{title}</h3>
          {subtitle && <p className="text-[12px] text-[#6b6660] mt-0.5">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

// ── Alert ──────────────────────────────────────────────────────────────────
interface AlertProps {
  type: 'error' | 'success' | 'info';
  message: string;
  onClose?: () => void;
}

export function Alert({ type, message, onClose }: AlertProps) {
  const styles = {
    error: 'bg-[#fdeaea] border-[#f0b0b0] text-[#b02020]',
    success: 'bg-[#e8f5ee] border-[#a8d8b8] text-[#2d7a4f]',
    info: 'bg-[#e8f0fb] border-[#b0c8f0] text-[#1a4a8a]',
  };

  return (
    <div
      className={clsx(
        'flex items-center gap-2.5 px-4 py-3 border rounded-lg text-[13px] mb-4',
        styles[type]
      )}
    >
      <span>{type === 'error' ? '⚠' : type === 'success' ? '✓' : 'ℹ'}</span>
      <span className="flex-1">{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-auto opacity-60 hover:opacity-100">
          ✕
        </button>
      )}
    </div>
  );
}
