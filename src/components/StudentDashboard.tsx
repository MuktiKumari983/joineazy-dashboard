import { useMemo, useState } from 'react'
import {
  ArrowUpDown,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  ExternalLink,
  Inbox,
  Search,
  SearchX,
  Send,
  Sparkles,
} from 'lucide-react'
import type { Assignment, DisplayStatus, Submission, User } from '../types/dashboard'
import {
  cn,
  findSubmission,
  formatDate,
  formatDateTime,
  getDisplayStatus,
  getDueMeta,
  getFirstName,
  getPercent,
  parseDate,
} from '../utils/helpers'
import { AssignmentCardSkeleton, Skeleton } from './ui/Skeleton'
import { EmptyState } from './ui/EmptyState'
import { ProgressBar } from './ui/ProgressBar'
import { StatusBadge } from './ui/StatusBadge'
import { SubmissionModal } from './SubmissionModal'

interface StudentDashboardProps {
  student: User
  assignments: Assignment[]
  submissions: Submission[]
  onSubmit: (assignmentId: string) => void
  loading: boolean
}

type StatusFilter = 'all' | 'pending' | 'submitted'
type SortOrder = 'due-asc' | 'due-desc'

interface StudentAssignmentCard {
  assignment: Assignment
  submission: Submission | undefined
  status: DisplayStatus
}

export function StudentDashboard({
  student,
  assignments,
  submissions,
  onSubmit,
  loading,
}: StudentDashboardProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('due-asc')
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)

  const myAssignments = useMemo<StudentAssignmentCard[]>(() => {
    return assignments
      .filter(
        (assignment) =>
          assignment.assignToAll || assignment.assignedTo.includes(student.id),
      )
      .map((assignment) => {
        const submission = findSubmission(submissions, assignment.id, student.id)
        return {
          assignment,
          submission,
          status: getDisplayStatus(assignment.dueDate, Boolean(submission)),
        }
      })
  }, [assignments, submissions, student.id])

  const submittedCount = myAssignments.filter((item) => item.status === 'submitted').length
  const overdueCount = myAssignments.filter((item) => item.status === 'overdue').length
  const pendingCount = myAssignments.length - submittedCount
  const progress = getPercent(submittedCount, myAssignments.length)

  const visibleAssignments = useMemo(() => {
    const query = search.trim().toLowerCase()

    return myAssignments
      .filter((item) => {
        if (statusFilter === 'submitted') return item.status === 'submitted'
        if (statusFilter === 'pending') return item.status !== 'submitted'
        return true
      })
      .filter((item) => {
        if (!query) return true
        return (
          item.assignment.title.toLowerCase().includes(query) ||
          item.assignment.description.toLowerCase().includes(query)
        )
      })
      .sort((a, b) => {
        const difference =
          parseDate(a.assignment.dueDate).getTime() -
          parseDate(b.assignment.dueDate).getTime()
        return sortOrder === 'due-asc' ? difference : -difference
      })
  }, [myAssignments, search, sortOrder, statusFilter])

  const filterOptions: Array<{ value: StatusFilter; label: string; count: number }> = [
    { value: 'all', label: 'All', count: myAssignments.length },
    { value: 'pending', label: 'Pending', count: pendingCount },
    { value: 'submitted', label: 'Submitted', count: submittedCount },
  ]

  const clearFilters = () => {
    setStatusFilter('all')
    setSearch('')
  }

  const circumference = 2 * Math.PI * 52

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
          Track your assignments, submit your work, and stay ahead of every deadline.
        </p>
      </div>

      {loading ? (
        <div className="space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <Skeleton className="h-7 w-36 rounded-full" />
                <Skeleton className="mt-4 h-9 w-2/3" />
                <Skeleton className="mt-3 h-4 w-1/2" />
                <Skeleton className="mt-6 h-2.5 w-full rounded-full" />
              </div>
              <Skeleton className="mx-auto h-32 w-32 rounded-full lg:mx-0" />
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Skeleton className="h-10 w-64 rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl sm:w-72" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((index) => (
              <AssignmentCardSkeleton key={index} />
            ))}
          </div>
        </div>
      ) : (
        <>
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 p-6 text-white shadow-xl shadow-violet-600/20 sm:p-8">
            <div className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-sky-300/20 blur-3xl" />

            <div className="relative grid gap-7 lg:grid-cols-[1.2fr_auto] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/20 ring-inset">
                  <BookOpenCheck className="h-3.5 w-3.5" />
                  Progress tracker
                </div>
                <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                  {submittedCount} of {myAssignments.length} assignments submitted
                </h2>
                <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-violet-100">
                  {myAssignments.length === 0
                    ? 'No assignments have been assigned yet. Check back soon.'
                    : progress === 100
                      ? 'Everything is submitted. Excellent work — you are all caught up.'
                      : `You are ${progress}% of the way there. Finish the remaining assignments before their deadlines.`}
                </p>

                <ProgressBar
                  value={progress}
                  className="mt-5 max-w-xl bg-white/20"
                  barClassName="bg-white"
                  label="Your assignment completion"
                />

                <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 ring-1 ring-white/15 ring-inset">
                    <Clock3 className="h-3.5 w-3.5" />
                    {pendingCount} pending
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 ring-1 ring-white/15 ring-inset">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {submittedCount} submitted
                  </span>
                  {overdueCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/25 px-2.5 py-1 text-rose-50 ring-1 ring-rose-200/30 ring-inset">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {overdueCount} overdue
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-center lg:justify-end">
                <div className="relative flex h-36 w-36 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
                  <svg viewBox="0 0 120 120" className="h-full w-full">
                    <circle
                      cx="60"
                      cy="60"
                      r="52"
                      fill="none"
                      stroke="rgba(255,255,255,0.18)"
                      strokeWidth="9"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="52"
                      fill="none"
                      stroke="white"
                      strokeWidth="9"
                      strokeLinecap="round"
                      strokeDasharray={`${(progress / 100) * circumference} ${circumference}`}
                      transform="rotate(-90 60 60)"
                      className="transition-[stroke-dasharray] duration-700 ease-out"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-bold tracking-tight">{progress}%</span>
                    <span className="text-[10px] font-semibold tracking-[0.18em] text-violet-100 uppercase">
                      complete
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-1 rounded-xl bg-slate-100 p-1">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setStatusFilter(option.value)}
                    aria-pressed={statusFilter === option.value}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition',
                      statusFilter === option.value
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800',
                    )}
                  >
                    {option.label}
                    <span
                      className={cn(
                        'rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                        statusFilter === option.value
                          ? 'bg-violet-100 text-violet-700'
                          : 'bg-slate-200 text-slate-500',
                      )}
                    >
                      {option.count}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative min-w-0 sm:w-64">
                  <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search assignments..."
                    aria-label="Search assignments"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-3 pl-9 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 focus:outline-none"
                  />
                </div>

                <div className="relative">
                  <ArrowUpDown className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <select
                    value={sortOrder}
                    onChange={(event) => setSortOrder(event.target.value as SortOrder)}
                    aria-label="Sort assignments by due date"
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pr-9 pl-9 text-sm font-medium text-slate-700 shadow-sm transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100 focus:outline-none sm:w-auto"
                  >
                    <option value="due-asc">Due date: soonest</option>
                    <option value="due-desc">Due date: latest</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>
          </section>

          {visibleAssignments.length === 0 ? (
            myAssignments.length === 0 ? (
              <EmptyState
                icon={<Inbox className="h-6 w-6" />}
                title="No assignments yet"
                description="When a professor assigns new work, it will show up here with its due date and submission link."
              />
            ) : (
              <EmptyState
                icon={<SearchX className="h-6 w-6" />}
                title="No assignments found"
                description="Nothing matches the current filter or search. Try a different status or clear your search."
                action={
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Clear filters
                  </button>
                }
              />
            )
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visibleAssignments.map(({ assignment, submission, status }) => {
                const dueMeta = getDueMeta(assignment.dueDate)

                return (
                  <article
                    key={assignment.id}
                    className={cn(
                      'group flex flex-col rounded-2xl border bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-950/5',
                      status === 'overdue'
                        ? 'border-rose-200 hover:border-rose-300'
                        : 'border-slate-200 hover:border-violet-200',
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <StatusBadge status={status} />
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 text-xs font-medium',
                          status === 'overdue' ? 'text-rose-600' : 'text-slate-500',
                        )}
                      >
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatDate(assignment.dueDate, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <h3 className="mt-3 line-clamp-2 text-lg font-semibold tracking-tight text-slate-900">
                      {assignment.title}
                    </h3>
                    <p className="mt-1.5 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-500">
                      {assignment.description || 'No description provided.'}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset',
                          status === 'overdue'
                            ? 'bg-rose-50 text-rose-700 ring-rose-200'
                            : dueMeta.isToday
                              ? 'bg-amber-50 text-amber-700 ring-amber-200'
                              : 'bg-slate-50 text-slate-600 ring-slate-200',
                        )}
                      >
                        <Clock3 className="h-3.5 w-3.5" />
                        {status === 'submitted' ? formatDate(assignment.dueDate) : dueMeta.label}
                      </span>

                      <a
                        href={assignment.driveLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Drive link
                      </a>
                    </div>

                    <div className="mt-5 border-t border-slate-100 pt-4">
                      {submission ? (
                        <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                          <CheckCircle2 className="h-4 w-4 shrink-0" />
                          <span>
                            Submitted {formatDateTime(submission.submittedAt)}
                          </span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedAssignment(assignment)}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:from-violet-700 hover:to-indigo-700"
                        >
                          <Send className="h-4 w-4" />
                          Submit Assignment
                        </button>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </>
      )}

      {selectedAssignment && (
        <SubmissionModal
          assignment={selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
          onConfirm={onSubmit}
        />
      )}
    </div>
  )
}
