import { cn, getInitials } from '../../utils/helpers'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface AvatarProps {
  name: string
  color: string
  size?: AvatarSize
  className?: string
  ring?: boolean
}

const sizeClasses: Record<AvatarSize, string> = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-xl',
}

/** Lightweight generated avatar with a subtle gradient and white ring. */
export function Avatar({ name, color, size = 'md', className, ring = true }: AvatarProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold tracking-wide text-white shadow-sm',
        ring && 'ring-2 ring-white',
        sizeClasses[size],
        className,
      )}
      style={{
        backgroundImage: `linear-gradient(135deg, ${color}, ${color}cc)`,
      }}
      title={name}
      aria-hidden="true"
    >
      {getInitials(name)}
    </span>
  )
}
