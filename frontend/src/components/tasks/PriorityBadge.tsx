import type { Priority } from '@/types'
import { cn } from '@/lib/utils'

const styles: Record<Priority, { label: string; className: string; dot: string }> = {
  high: {
    label: 'High',
    className: 'bg-rose/10 text-rose border-rose/15',
    dot: 'bg-rose',
  },
  medium: {
    label: 'Medium',
    className: 'bg-amber/10 text-amber border-amber/15',
    dot: 'bg-amber',
  },
  low: {
    label: 'Low',
    className: 'bg-sky/10 text-sky border-sky/15',
    dot: 'bg-sky',
  },
}

export function PriorityBadge({ priority, compact = false }: { priority: Priority; compact?: boolean }) {
  const style = styles[priority]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-semibold',
        compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]',
        style.className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', style.dot)} />
      {style.label}
    </span>
  )
}

export const priorityMeta = styles
