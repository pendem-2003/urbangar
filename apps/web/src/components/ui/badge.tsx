import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-brand-50 text-brand-700 border border-brand-100',
        secondary: 'bg-gray-100 text-gray-700',
        success: 'bg-green-50 text-green-700 border border-green-100',
        warning: 'bg-amber-50 text-amber-700 border border-amber-100',
        destructive: 'bg-red-50 text-red-700 border border-red-100',
        outline: 'border border-gray-200 text-gray-600',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
