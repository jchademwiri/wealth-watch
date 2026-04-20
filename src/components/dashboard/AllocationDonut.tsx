'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { formatZAR, formatPct } from '@/lib/formatting'
import type { AssetWithLatestSnapshot } from '@/types'

interface Props {
  assets: AssetWithLatestSnapshot[]
}

export function AllocationDonut({ assets }: Props) {
  const totalValue = assets.reduce((s, a) => s + a.latestValue, 0)

  const data = assets
    .filter(a => a.latestValue > 0)
    .map(a => ({
      name:    a.name,
      value:   a.latestValue,
      color:   a.color,
      weight:  totalValue > 0 ? (a.latestValue / totalValue) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value)

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    const d = payload[0]
    return (
      <div className="rounded-lg border bg-background p-3 text-sm shadow-md">
        <p className="font-medium">{d.name}</p>
        <p className="font-mono text-foreground">{formatZAR(d.value)}</p>
        <p className="text-xs text-muted-foreground">{d.payload.weight.toFixed(1)}% of portfolio</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="mb-4 text-sm font-medium text-muted-foreground">Current allocation</h3>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={76}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, i) => (
              <Cell key={`cell-${i}`} fill={entry.color} strokeWidth={0} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-3 space-y-1.5">
        {data.map((d) => (
          <div key={d.name} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-sm" style={{ background: d.color }} />
              <span className="text-muted-foreground">{d.name}</span>
            </span>
            <span className="font-mono text-foreground">{d.weight.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
