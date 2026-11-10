import type { ReactNode } from 'react'
import { ArrowRight, BookOpen, ClipboardList, UsersRound } from 'lucide-react'
import type { Course } from '../types/dashboard'
import { cn } from '../utils/helpers'
import { ProgressBar } from './ui/ProgressBar'

type Accent = 'violet' | 'sky' | 'indigo' | 'emerald'

interface CourseCardProps {
  course: Course
  professorName: string
  studentCount: number
  assignmentCount: number
  progress: number
  progressLabel: string
  badge?: ReactNode
  accent?: Accent
  onClick: () => void
}

const accentClasses: Record<
  Accent,
  { icon: string; code: string; bar: string; ring: string }
> = {
  violet: {
    icon: 'bg-violet-100 text-violet-600',
    code: 'bg-violet-50 text-violet-700 ring-violet-200',
    bar: 'bg-gradient-to-r from-violet-500 to-indigo-500',
    ring: 'group-hover:border-violet-200',
  },
  sky: {
    icon: 'bg-sky-100 text-sky-600',
    code: 'bg-sky-50 text-sky-700 ring-sky-200',
    bar: 'bg-gradient-to-r from-sky-500 to-cyan-500',
    ring: 'group-hover:border-sky-200',
  },
  indigo: {
    icon: 'bg-indigo-100 text-indigo-600',
    code: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
    bar: 'bg-gradient-to-r from-indigo-500 to-blue-500',
    ring: 'group-hover:border-indigo-200',
  },
  emerald: {
    icon: 'bg-emerald-100 text-emerald-600',
    code: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    bar: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    ring: 'group-hover:border-emerald-200',
  },
}

export function CourseCard({
  course,
  professorName,
  studentCount,
  assignmentCount,
  progress,
  progressLabel,
  badge,
  accent = 'violet',
  onClick,
}: CourseCardProps) {
  const tones = accentClasses[accent]

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex w-full flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-950/5',
        tones.ring,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
            tones.icon,
          )}
        >
          <BookOpen className="h-5 w-5" />
        </span>
        <div className="flex items-center gap-2">
          {badge}
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset',
              tones.code,
            )}
          >
            {course.code}
          </span>
        </div>
      </div>

      <h3 className="mt-4 line-clamp-2 text-lg font-semibold tracking-tight text-slate-900">
        {course.name}
      </h3>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
        <BookOpen className="h-3.5 w-3.5" />
        Taught by {professorName}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 ring-1 ring-slate-200 ring-inset">
          <UsersRound className="h-3.5 w-3.5 text-slate-400" />
          {studentCount} {studentCount === 1 ? 'student' : 'students'}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 ring-1 ring-slate-200 ring-inset">
          <ClipboardList className="h-3.5 w-3.5 text-slate-400" />
          {assignmentCount} {assignmentCount === 1 ? 'assignment' : 'assignments'}
        </span>
      </div>

      <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-slate-600">{progressLabel}</span>
          <span className="font-bold text-slate-900">{progress}%</span>
        </div>
        <ProgressBar
          value={progress}
          size="sm"
          className="mt-2"
          barClassName={tones.bar}
          label={`${course.name} progress`}
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <span className="text-xs text-slate-400">Open course workspace</span>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 transition group-hover:gap-2">
          Open
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </button>
  )
}
