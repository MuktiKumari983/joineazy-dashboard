import { AlertTriangle, CheckCircle2, Clock3 } from 'lucide-react'
import type { DisplayStatus } from '../../types/dashboard'
import { cn } from '../../utils/helpers'

interface StatusBadgeProps {
  status: DisplayStatus
  className?: string
  showIcon?: boolean
}

const statusConfig = {
  submitted: {
    label: 'Submitted',
    Icon: CheckCircle2,
    classes: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  },
  pending: {
    label: 'Pending',
    Icon: Clock3,
    classes: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  },
  overdue: {
    label: 'Overdue',
    Icon: AlertTriangle,
    classes: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  },
} as const

export function StatusBadge({ status, className, showIcon = true }: StatusBadgeProps) {
  const { label, Icon, classes } = statusConfig[status]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
        classes,
        className,
      )}
    >
      {showIcon && <Icon className="h-3.5 w-3.5" />}
      {label}
    </span>
  )
}
