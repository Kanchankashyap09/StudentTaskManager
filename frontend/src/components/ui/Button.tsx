import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'icon'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const variants: Record<Variant, string> = {
  primary:
    'bg-brand text-white shadow-[0_10px_30px_-12px_rgba(109,74,255,0.65)] hover:brightness-110 active:brightness-95',
  secondary:
    'border border-line bg-surface text-ink hover:bg-surface-2 hover:border-brand/30',
  ghost: 'text-muted hover:bg-surface-2 hover:text-ink',
  danger: 'text-rose hover:bg-rose/10',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 gap-1.5 rounded-lg px-3 text-[13px] font-semibold',
  md: 'h-[42px] gap-2 rounded-xl px-4 text-sm font-semibold',
  icon: 'h-10 w-10 rounded-xl',
}

export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'focus-ring inline-flex shrink-0 cursor-pointer items-center justify-center transition-all duration-200 disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  )
}
