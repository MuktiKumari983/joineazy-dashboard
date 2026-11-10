import { GraduationCap, ShieldCheck } from 'lucide-react'
import type { Role } from '../../types/dashboard'
import { cn } from '../../utils/helpers'

interface RoleTagProps {
  role: Role
  className?: string
  compact?: boolean
}

/** Small role pill shared by the navbar and user menus. */
export function RoleTag({ role, className, compact = false }: RoleTagProps) {
  const isProfessor = role === 'professor'
  const Icon = isProfessor ? ShieldCheck : GraduationCap

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset',
        isProfessor
          ? 'bg-violet-50 text-violet-700 ring-violet-200'
          : 'bg-sky-50 text-sky-700 ring-sky-200',
        className,
      )}
    >
      <Icon className={cn(compact ? 'h-3 w-3' : 'h-3.5 w-3.5')} />
      {isProfessor ? 'Professor' : 'Student'}
    </span>
  )
}
