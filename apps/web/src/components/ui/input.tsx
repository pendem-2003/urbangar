import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string
  error?: string
  prefix?: React.ReactNode
  suffix?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, prefix, suffix, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className={cn('relative flex items-center', prefix && 'pl-0', suffix && 'pr-0')}>
          {prefix && (
            <div className="pointer-events-none absolute left-3 flex items-center text-gray-400">
              {prefix}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400',
              'focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20',
              'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
              'transition-colors duration-150',
              error && 'border-red-400 focus:border-red-500 focus:ring-red-500/20',
              prefix && 'pl-9',
              suffix && 'pr-9',
              className
            )}
            {...props}
          />
          {suffix && (
            <div className="absolute right-3 flex items-center text-gray-400">{suffix}</div>
          )}
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
