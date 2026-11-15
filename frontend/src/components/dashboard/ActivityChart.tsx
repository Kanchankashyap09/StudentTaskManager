import { useMemo, useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import type { ActivityPoint } from '@/types'
import { cn } from '@/lib/utils'

type Metric = 'tasks' | 'hours'

interface ActivityChartProps {
  data: ActivityPoint[]
  trends: { tasks: number; hours: number }
}

interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{ value?: number | string }>
  label?: string
  metric: Metric
}

function ChartTooltip({ active, payload, label, metric }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  const value = payload[0]?.value ?? 0

  return (
    <div className="rounded-xl border border-line bg-surface px-3 py-2 shadow-[var(--shadow-pop)]">
      <p className="text-[10px] font-bold tracking-[0.1em] text-faint uppercase">{label}</p>
      <p className="mt-1 text-sm font-extrabold">
        {value} <span className="text-xs font-semibold text-muted">{metric === 'tasks' ? 'tasks' : 'hours'}</span>
      </p>
    </div>
  )
}

export function ActivityChart({ data, trends }: ActivityChartProps) {
  const [metric, setMetric] = useState<Metric>('tasks')

  const { total, average, best } = useMemo(() => {
    const total = data.reduce((sum, point) => sum + point[metric], 0)
    const best = data.reduce(
      (winner, point) => (point[metric] > winner[metric] ? point : winner),
      data[0] ?? { day: '—', tasks: 0, hours: 0 },
    )
    return {
      total: Math.round(total * 10) / 10,
      average: Math.round((total / Math.max(data.length, 1)) * 10) / 10,
      best,
    }
  }, [data, metric])

  const trend = trends[metric]
  const TrendIcon = trend >= 0 ? ArrowUpRight : ArrowDownRight

  return (
    <section className="card animate-rise p-5" style={{ animationDelay: '360ms' }}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-[17px] font-bold tracking-tight">Study activity</h2>
          <p className="mt-1 text-xs text-muted">Your focus over the last seven days.</p>
        </div>
        <div className="flex w-fit rounded-lg border border-line bg-surface-2 p-0.5" role="group" aria-label="Chart metric">
          {(['tasks', 'hours'] as const).map((option) => (
            <button
              key={option}
              onClick={() => setMetric(option)}
              className={cn(
                'focus-ring rounded-md px-2.5 py-1 text-[11px] font-bold capitalize transition-all',
                metric === option
                  ? 'bg-surface text-ink shadow-sm'
                  : 'text-muted hover:text-ink',
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span className="text-[26px] leading-none font-extrabold tracking-tight tabular-nums">
            {total}
            {metric === 'hours' && 'h'}
          </span>
          <span className="text-xs font-semibold text-muted">
            {metric === 'tasks' ? 'tasks completed' : 'hours focused'}
          </span>
          {trend !== 0 && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                trend > 0 ? 'bg-mint/10 text-mint' : 'bg-rose/10 text-rose',
              )}
            >
              <TrendIcon size={11} strokeWidth={2.6} /> {Math.abs(trend)}%
            </span>
          )}
        </div>
        <p className="text-[11px] text-faint">vs last week</p>
      </div>

      <div className="mt-3 h-[210px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 4, bottom: 0, left: -28 }}>
            <defs>
              <linearGradient id="activity-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b6cff" stopOpacity={0.34} />
                <stop offset="85%" stopColor="#8b6cff" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="4 6" />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--faint)', fontSize: 11, fontWeight: 600 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--faint)', fontSize: 10 }}
              width={48}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ stroke: 'var(--brand)', strokeOpacity: 0.25, strokeWidth: 1.5, strokeDasharray: '4 4' }}
              content={<ChartTooltip metric={metric} />}
            />
            <Area
              type="monotone"
              dataKey={metric}
              stroke="#8b6cff"
              strokeWidth={2.6}
              fill="url(#activity-fill)"
              animationDuration={700}
              activeDot={{ r: 4.5, fill: '#8b6cff', stroke: 'var(--surface)', strokeWidth: 2.5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-center justify-between gap-4 border-t border-line pt-3 text-[11px]">
        <p className="text-muted">
          Daily average <span className="font-bold text-ink tabular-nums">{average}{metric === 'hours' ? 'h' : ''}</span>
        </p>
        <p className="text-muted">
          Best day{' '}
          <span className="font-bold text-ink">
            {best.day} · {best[metric]}
            {metric === 'hours' ? 'h' : ' tasks'}
          </span>
        </p>
      </div>
    </section>
  )
}
