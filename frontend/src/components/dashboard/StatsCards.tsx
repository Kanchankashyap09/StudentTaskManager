import { ArrowDownRight, ArrowUpRight, CircleCheckBig, Flame, Layers3, TriangleAlert } from 'lucide-react'
import type { StatCardData } from '@/types'
import { Sparkline } from '@/components/ui/Sparkline'
import { cn } from '@/lib/utils'

const toneStyles = {
  brand: { icon: 'bg-brand/10 text-brand', spark: '#8b6cff', pill: 'bg-brand/10 text-brand' },
  mint: { icon: 'bg-mint/10 text-mint', spark: '#10b981', pill: 'bg-mint/10 text-mint' },
  amber: { icon: 'bg-amber/10 text-amber', spark: '#f59e0b', pill: 'bg-amber/10 text-amber' },
  rose: { icon: 'bg-rose/10 text-rose', spark: '#f43f5e', pill: 'bg-rose/10 text-rose' },
} as const

const icons = {
  check: CircleCheckBig,
  active: Layers3,
  overdue: TriangleAlert,
  streak: Flame,
} as const

export function StatsCards({ stats }: { stats: StatCardData[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = icons[stat.icon]
        const tone = toneStyles[stat.tone]
        const TrendIcon = stat.trend >= 0 ? ArrowUpRight : ArrowDownRight

        return (
          <div
            key={stat.label}
            className="card surface-hover animate-rise group relative overflow-hidden p-5"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <div className="flex items-start justify-between gap-3">
              <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl', tone.icon)}>
                <Icon size={19} strokeWidth={2.2} />
              </span>
              {stat.trend !== 0 ? (
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 rounded-full px-1.5 py-1 text-[10px] font-bold tabular-nums',
                    tone.pill,
                  )}
                >
                  <TrendIcon size={11} strokeWidth={2.5} />
                  {Math.abs(stat.trend)}%
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-faint">—</span>
              )}
            </div>

            <p className="mt-4 text-[28px] leading-none font-extrabold tracking-tight tabular-nums">{stat.value}</p>
            <div className="mt-2 flex items-baseline justify-between gap-2">
              <p className="text-[13px] font-semibold text-muted">{stat.label}</p>
              <p className="text-[10px] text-faint">{stat.hint}</p>
            </div>

            <div className="mt-3 -mb-1 opacity-80 transition-opacity group-hover:opacity-100">
              <Sparkline data={stat.spark} color={tone.spark} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
