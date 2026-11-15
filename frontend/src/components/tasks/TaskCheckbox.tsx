import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TaskCheckboxProps {
  checked: boolean
  onChange: () => void
  label: string
  className?: string
}

export function TaskCheckbox({ checked, onChange, label, className }: TaskCheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={checked ? `Mark "${label}" as not done` : `Mark "${label}" as done`}
      onClick={onChange}
      className={cn(
        'focus-ring group flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200',
        checked
          ? 'border-brand bg-brand text-white shadow-[0_0_0_4px_color-mix(in_srgb,var(--brand)_12%,transparent)]'
          : 'border-line bg-surface-2 text-transparent hover:border-brand/60 hover:bg-brand/5',
        className,
      )}
    >
      <Check size={12} strokeWidth={3.5} className={cn('transition-transform', checked ? 'scale-100' : 'scale-75')} />
    </button>
  )
}
