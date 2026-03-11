'use client'

import { PieChart, Pie, Cell } from 'recharts'
import { motion } from 'framer-motion'
import { getScoreColor, getScoreLabel } from '@/lib/utils'

interface ScoreGaugeProps {
  score: number
}

export function ScoreGauge({ score: rawScore }: ScoreGaugeProps) {
  const score = Math.max(0, Math.min(100, rawScore))
  const color = getScoreColor(score)
  const label = getScoreLabel(score)

  const data = [
    { value: score },
    { value: 100 - score },
  ]

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: 148, height: 148 }}>
        <PieChart width={148} height={148}>
          <Pie
            data={data}
            cx={70}
            cy={70}
            startAngle={90}
            endAngle={-270}
            innerRadius={50}
            outerRadius={66}
            dataKey="value"
            strokeWidth={0}
            isAnimationActive={true}
            animationDuration={800}
          >
            <Cell fill={color} />
            <Cell fill="#27272a" />
          </Pie>
        </PieChart>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <motion.span
            className="text-4xl font-mono font-bold leading-none"
            style={{ color }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {score}
          </motion.span>
          <span className="text-xs font-mono text-zinc-600 mt-0.5">/100</span>
        </div>
      </div>

      <motion.span
        className="text-xs font-mono tracking-[0.2em] uppercase"
        style={{ color }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {label}
      </motion.span>
    </div>
  )
}
