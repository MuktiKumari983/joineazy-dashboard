import type { ReactNode } from 'react'
import {
  AlertTriangle,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  GraduationCap,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import type { Assignment, Course, Group, Submission, User } from '../../types/dashboard'
import {
  cn,
  getFirstName,
  getPercent,
  getStudentCourseProgress,
} from '../../utils/helpers'
import { CourseCard } from '../CourseCard'
import { EmptyState } from '../ui/EmptyState'
import { ProgressBar } from '../ui/ProgressBar'
import { Skeleton, StatCardSkeleton } from '../ui/Skeleton'

interface StudentDashboardProps {
  student: User
  courses: Course[]
  assignments: Assignment[]
  groups: Group[]
  submissions: Submission[]
  users: User[]
  onOpenCourse: (courseId: string) => void
  loading: boolean
}

type StatTone = 'violet' | 'emerald' | 'indigo' | 'amber' | 'rose'

const statToneClasses: Record<StatTone, string> = {
  violet: 'bg-violet-100 text-violet-600',
  emerald: 'bg-emerald-100 text-emerald-600',
  indigo: 'bg-indigo-100 text-indigo-600',
  amber: 'bg-amber-100 text-amber-600',
  rose: 'bg-rose-100 text-rose-600',
}

interface StatCardProps {
  label: string
  value: string
  helper: string
  icon: ReactNode
  tone: StatTone
}

function StatCard({ label, value, helper, icon, tone }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
          <p className="mt-1 text-xs text-slate-400">{helper}</p>
        </div>
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
            statToneClasses[tone],
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}

const accents = ['sky', 'violet', 'indigo', 'emerald'] as const

export function StudentDashboard({
  student,
  courses,
  assignments,
  groups,
  submissions,
  users,
  onOpenCourse,
  loading,
}: StudentDashboardProps) {
  const enrolledCourses = courses.filter((course) =>
    course.enrolledStudentIds.includes(student.id),
  )

  const professorName = (professorId: string) =>
    users.find((user) => user.id === professorId)?.name ?? 'Joineazy faculty'

  const courseSummaries = enrolledCourses.map((course) => {
    const progress = getStudentCourseProgress(
      course,
      assignments,
      groups,
      submissions,
      student.id,
    )
    const courseAssignments = assignments.filter(
      (assignment) => assignment.courseId === course.id,
    )

    return { course, progress, courseAssignments }
  })

  const totalAssignments = courseSummaries.reduce(
    (sum, item) => sum + item.progress.total,
    0,
  )
  const totalSubmitted = courseSummaries.reduce(
    (sum, item) => sum + item.progress.submitted,
    0,
  )
  const totalOverdue = courseSummaries.reduce(
    (sum, item) => sum + item.progress.overdue,
    0,
  )
  const overallProgress = getPercent(totalSubmitted, totalAssignments)
  const pendingCount = Math.max(totalAssignments - totalSubmitted, 0)

  return (
    <div className="space-y-6 pb-10">
      <div>
        <div className="flex items-center gap-2 text-sm font-semibold text-violet-600">
          <Sparkles className="h-4 w-4" />
          Student workspace
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Welcome back, {getFirstName(student.name)}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Open a course to review assignments, submit your work, and manage group
          acknowledgments.
        </p>
      </div>

      {loading ? (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((index) => (
              <StatCardSkeleton key={index} />
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((index) => (
              <Skeleton key={index} className="h-64 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      ) : (
        <>
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 p-6 text-white shadow-xl shadow-violet-600/20 sm:p-8">
            <div className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-sky-300/20 blur-3xl" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/20 ring-inset">
                <BookOpen className="h-3.5 w-3.5" />
                Semester progress
              </div>
              <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                {totalSubmitted} of {totalAssignments} assignments submitted
              </h2>
              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-violet-100">
                {totalAssignments === 0
                  ? 'No assignments have been published for your courses yet. Check back soon.'
                  : overallProgress === 100
                    ? 'Everything is submitted. Excellent work — you are all caught up.'
                    : `You are ${overallProgress}% of the way there across all your courses.`}
              </p>

              <ProgressBar
                value={overallProgress}
                className="mt-5 max-w-2xl bg-white/20"
                barClassName="bg-white"
                label="Overall assignment completion"
              />

              <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 ring-1 ring-white/15 ring-inset">
                  <Clock3 className="h-3.5 w-3.5" />
                  {pendingCount} pending
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 ring-1 ring-white/15 ring-inset">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {totalSubmitted} submitted
                </span>
                {totalOverdue > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/25 px-2.5 py-1 text-rose-50 ring-1 ring-rose-200/30 ring-inset">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {totalOverdue} overdue
                  </span>
                )}
              </div>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Courses"
              value={String(enrolledCourses.length)}
              helper="Enrolled this semester"
              tone="violet"
              icon={<BookOpen className="h-5 w-5" />}
            />
            <StatCard
              label="Assignments"
              value={String(totalAssignments)}
              helper="Across all your courses"
              tone="indigo"
              icon={<ClipboardList className="h-5 w-5" />}
            />
            <StatCard
              label="Submitted"
              value={String(totalSubmitted)}
              helper={`${overallProgress}% overall completion`}
              tone="emerald"
              icon={<CheckCircle2 className="h-5 w-5" />}
            />
            <StatCard
              label="Overdue"
              value={String(totalOverdue)}
              helper={totalOverdue > 0 ? 'Submit as soon as possible' : 'Nothing overdue'}
              tone={totalOverdue > 0 ? 'rose' : 'amber'}
              icon={
                totalOverdue > 0 ? (
                  <CalendarDays className="h-5 w-5" />
                ) : (
                  <TrendingUp className="h-5 w-5" />
                )
              }
            />
          </section>

          <section>
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                  Your courses
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  {enrolledCourses.length === 1
                    ? '1 course this semester'
                    : `${enrolledCourses.length} courses this semester`}
                </p>
              </div>
            </div>

            {courseSummaries.length === 0 ? (
              <EmptyState
                icon={<GraduationCap className="h-6 w-6" />}
                title="No courses yet"
                description="Once a professor enrolls you in a course, it will appear here with its assignments and deadlines."
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {courseSummaries.map(({ course, progress, courseAssignments }, index) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    professorName={professorName(course.professorId)}
                    studentCount={course.enrolledStudentIds.length}
                    assignmentCount={courseAssignments.length}
                    progress={progress.percent}
                    progressLabel={`${progress.submitted}/${progress.total} submitted`}
                    accent={accents[index % accents.length]}
                    badge={
                      progress.overdue > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 ring-1 ring-rose-200 ring-inset">
                          <AlertTriangle className="h-3 w-3" />
                          {progress.overdue} overdue
                        </span>
                      ) : progress.total > 0 && progress.submitted === progress.total ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200 ring-inset">
                          <CheckCircle2 className="h-3 w-3" />
                          All caught up
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-200 ring-inset">
                          <Clock3 className="h-3 w-3" />
                          {progress.pending} pending
                        </span>
                      )
                    }
                    onClick={() => onOpenCourse(course.id)}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
