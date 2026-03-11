import { cn } from '@/lib/utils'

type Variant = 'default' | 'critical' | 'high' | 'medium' | 'low' | 'lang'

interface BadgeProps {
  children: React.ReactNode
  className?: string
  variant?: Variant
}

const variants: Record<Variant, string> = {
  default:  'border-zinc-700 text-zinc-400 bg-zinc-900',
  critical: 'border-red-800 text-red-400 bg-red-950/20',
  high:     'border-orange-800 text-orange-400 bg-orange-950/20',
  medium:   'border-amber-800 text-amber-400 bg-amber-950/20',
  low:      'border-zinc-700 text-zinc-500 bg-zinc-900',
  lang:     'border-zinc-700 text-zinc-300 bg-zinc-800',
}

export function Badge({ children, className, variant = 'default' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-1.5 py-0.5 text-xs font-mono border uppercase tracking-wider shrink-0',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
