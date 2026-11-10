import type { ReactNode } from 'react'
import {
  AlertTriangle,
  BookOpen,
  ClipboardList,
  Clock3,
  GraduationCap,
  Inbox,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'
import type { Assignment, Course, Group, Submission, User } from '../../types/dashboard'
import {
  cn,
  getCourseStats,
  getDueMeta,
  getFirstName,
  getPercent,
} from '../../utils/helpers'
import { CourseCard } from '../CourseCard'
import { EmptyState } from '../ui/EmptyState'
import { Skeleton, StatCardSkeleton } from '../ui/Skeleton'

interface ProfessorDashboardProps {
  professor: User
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

const accents = ['violet', 'sky', 'indigo', 'emerald'] as const

export function ProfessorDashboard({
  professor,
  courses,
  assignments,
  groups,
  submissions,
  users,
  onOpenCourse,
  loading,
}: ProfessorDashboardProps) {
  const myCourses = courses.filter((course) => course.professorId === professor.id)

  const professorName = (professorId: string) =>
    users.find((user) => user.id === professorId)?.name ?? 'Joineazy faculty'

  const courseSummaries = myCourses.map((course) => {
    const stats = getCourseStats(course, assignments, groups, submissions)
    const courseAssignments = assignments.filter(
      (assignment) => assignment.courseId === course.id,
    )
    const overdueCount = courseAssignments.filter(
      (assignment) => getDueMeta(assignment.deadline).overdue,
    ).length

    return { course, stats, courseAssignments, overdueCount }
  })

  const totalStudents = new Set(myCourses.flatMap((course) => course.enrolledStudentIds)).size
  const totalAssignments = courseSummaries.reduce(
    (sum, item) => sum + item.courseAssignments.length,
    0,
  )
  const totalSubmitted = courseSummaries.reduce((sum, item) => sum + item.stats.submitted, 0)
  const totalSlots = courseSummaries.reduce((sum, item) => sum + item.stats.total, 0)
  const completionRate = getPercent(totalSubmitted, totalSlots)
  const overdueAssignments = courseSummaries.reduce(
    (sum, item) => sum + item.overdueCount,
    0,
  )

  return (
    <div className="space-y-6 pb-10">
      <div>
        <div className="flex items-center gap-2 text-sm font-semibold text-violet-600">
          <ShieldCheck className="h-4 w-4" />
          Professor workspace
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Welcome back, {getFirstName(professor.name)}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Open a course to publish assignments, review deadlines, and track submissions.
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
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Courses"
              value={String(myCourses.length)}
              helper={`${totalStudents} enrolled students`}
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
              label="Submissions"
              value={`${totalSubmitted}/${totalSlots}`}
              helper={`${completionRate}% overall completion`}
              tone="emerald"
              icon={<Inbox className="h-5 w-5" />}
            />
            <StatCard
              label="Overdue"
              value={String(overdueAssignments)}
              helper={
                overdueAssignments > 0
                  ? 'Assignments past their deadline'
                  : 'All deadlines in good shape'
              }
              tone={overdueAssignments > 0 ? 'rose' : 'amber'}
              icon={
                overdueAssignments > 0 ? (
                  <AlertTriangle className="h-5 w-5" />
                ) : (
                  <Clock3 className="h-5 w-5" />
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
                  {myCourses.length === 1
                    ? '1 course this semester'
                    : `${myCourses.length} courses this semester`}
                </p>
              </div>
            </div>

            {courseSummaries.length === 0 ? (
              <EmptyState
                icon={<GraduationCap className="h-6 w-6" />}
                title="No courses assigned yet"
                description="When an administrator assigns you a course, it will appear here with its assignments and student roster."
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {courseSummaries.map(({ course, stats, courseAssignments, overdueCount }, index) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    professorName={professorName(course.professorId)}
                    studentCount={course.enrolledStudentIds.length}
                    assignmentCount={courseAssignments.length}
                    progress={stats.percent}
                    progressLabel={`${stats.submitted}/${stats.total} submissions`}
                    accent={accents[index % accents.length]}
                    badge={
                      overdueCount > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 ring-1 ring-rose-200 ring-inset">
                          <AlertTriangle className="h-3 w-3" />
                          {overdueCount} overdue
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200 ring-inset">
                          <TrendingUp className="h-3 w-3" />
                          On track
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
