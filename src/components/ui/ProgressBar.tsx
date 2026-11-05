import { cn } from '../../utils/helpers'

interface ProgressBarProps {
  value: number
  className?: string
  barClassName?: string
  size?: 'sm' | 'md'
  label?: string
}

/** Accessible progress bar that animates width changes. */
export function ProgressBar({
  value,
  className,
  barClassName,
  size = 'md',
  label = 'Completion progress',
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)))

  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-full bg-slate-200/80',
        size === 'sm' ? 'h-1.5' : 'h-2.5',
        className,
      )}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className={cn(
          'h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-[width] duration-700 ease-out',
          barClassName,
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
