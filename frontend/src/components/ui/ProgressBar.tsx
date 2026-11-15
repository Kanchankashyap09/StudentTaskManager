import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  color?: string
  className?: string
  height?: number
}

export function ProgressBar({ value, color = 'var(--brand)', className, height = 6 }: ProgressBarProps) {
  const clamped = Math.min(Math.max(value, 0), 100)
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('w-full overflow-hidden rounded-full bg-surface-3', className)}
      style={{ height }}
    >
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-out"
        style={{
          width: `${clamped}%`,
          background: `linear-gradient(90deg, ${color}aa, ${color})`,
        }}
      />
    </div>
  )
}
