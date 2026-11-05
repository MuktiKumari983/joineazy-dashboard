import { useMemo, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  Clock3,
  ExternalLink,
  FileText,
  Inbox,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  TrendingUp,
  UsersRound,
} from 'lucide-react'
import type { Assignment, AssignmentInput, Submission, User } from '../types/dashboard'
import {
  cn,
  findSubmission,
  formatDate,
  formatDateTime,
  getAssignedStudents,
  getDisplayStatus,
  getDueMeta,
  getFirstName,
  getPercent,
  getSubmissionCount,
  parseDate,
} from '../utils/helpers'
import { AssignmentModal } from './AssignmentModal'
import { Avatar } from './ui/Avatar'
import { EmptyState } from './ui/EmptyState'
import { Modal } from './ui/Modal'
import { ProgressBar } from './ui/ProgressBar'
import { AssignmentCardSkeleton, StatCardSkeleton } from './ui/Skeleton'
import { StatusBadge } from './ui/StatusBadge'

interface AdminDashboardProps {
  admin: User
  assignments: Assignment[]
  submissions: Submission[]
  users: User[]
  onCreate: (input: AssignmentInput) => void
  onUpdate: (assignmentId: string, input: AssignmentInput) => void
  onDelete: (assignmentId: string) => void
  loading: boolean
}

type StatTone = 'violet' | 'emerald' | 'indigo' | 'amber' | 'rose'

interface StatCardProps {
  label: string
  value: string
  helper: string
  icon: ReactNode
  tone: StatTone
}

const statToneClasses: Record<StatTone, string> = {
  violet: 'bg-violet-100 text-violet-600',
  emerald: 'bg-emerald-100 text-emerald-600',
  indigo: 'bg-indigo-100 text-indigo-600',
  amber: 'bg-amber-100 text-amber-600',
  rose: 'bg-rose-100 text-rose-600',
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

/**
 * Professor dashboard. Assignments are isolated to the active admin, and each
 * card exposes per-student submission analytics.
 */
export function AdminDashboard({
  admin,
  assignments,
  submissions,
  users,
  onCreate,
  onUpdate,
  onDelete,
  loading,
}: AdminDashboardProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Assignment | null>(null)

  const students = useMemo(() => users.filter((user) => user.role === 'student'), [users])

  const myAssignments = useMemo(
    () =>
      assignments
        .filter((assignment) => assignment.createdBy === admin.id)
        .sort(
          (a, b) =>
            parseDate(a.dueDate).getTime() - parseDate(b.dueDate).getTime(),
        ),
    [assignments, admin.id],
  )

  const analytics = useMemo(
    () =>
      myAssignments.map((assignment) => {
        const assignedStudents = getAssignedStudents(assignment, students)
        const submittedCount = getSubmissionCount(assignment, students, submissions)
        const total = assignedStudents.length
        const completion = getPercent(submittedCount, total)
        const isOverdue = getDueMeta(assignment.dueDate).overdue && submittedCount < total

        return {
          assignment,
          assignedStudents,
          submittedCount,
          total,
          completion,
          isOverdue,
        }
      }),
    [myAssignments, students, submissions],
  )

  const totalSlots = analytics.reduce((sum, item) => sum + item.total, 0)
  const totalSubmissions = analytics.reduce((sum, item) => sum + item.submittedCount, 0)
  const completionRate = getPercent(totalSubmissions, totalSlots)
  const awaitingCount = Math.max(totalSlots - totalSubmissions, 0)
  const overdueCount = analytics.filter((item) => item.isOverdue).length

  const openCreate = () => {
    setEditingAssignment(null)
    setFormOpen(true)
  }

  const openEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingAssignment(null)
  }

  const handleSave = (input: AssignmentInput) => {
    if (editingAssignment) {
      onUpdate(editingAssignment.id, input)
    } else {
      onCreate(input)
    }
    closeForm()
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    if (expandedId === deleteTarget.id) setExpandedId(null)
    onDelete(deleteTarget.id)
    setDeleteTarget(null)
  }

  const deleteSubmissionCount = deleteTarget
    ? getSubmissionCount(deleteTarget, students, submissions)
    : 0

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-violet-600">
            <ShieldCheck className="h-4 w-4" />
            Professor workspace
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Welcome back, {getFirstName(admin.name)}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your assignments and monitor every student&apos;s progress.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:from-violet-700 hover:to-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Create assignment
        </button>
      </div>

      {loading ? (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((index) => (
              <StatCardSkeleton key={index} />
            ))}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <SkeletonLine />
          </div>
          <div className="space-y-4">
            <AssignmentCardSkeleton />
            <AssignmentCardSkeleton />
          </div>
        </div>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="My assignments"
              value={String(myAssignments.length)}
              helper="Created by you"
              tone="violet"
              icon={<FileText className="h-5 w-5" />}
            />
            <StatCard
              label="Submissions"
              value={`${totalSubmissions}/${totalSlots}`}
              helper="Received across all assignments"
              tone="emerald"
              icon={<Inbox className="h-5 w-5" />}
            />
            <StatCard
              label="Completion rate"
              value={`${completionRate}%`}
              helper="Overall class completion"
              tone="indigo"
              icon={<TrendingUp className="h-5 w-5" />}
            />
            <StatCard
              label="Awaiting submission"
              value={String(awaitingCount)}
              helper={
                overdueCount > 0
                  ? `${overdueCount} assignment${overdueCount === 1 ? '' : 's'} overdue`
                  : 'No overdue assignments'
              }
              tone={overdueCount > 0 ? 'rose' : 'amber'}
              icon={
                overdueCount > 0 ? (
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
                  My assignments
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  {myAssignments.length} assignment{myAssignments.length === 1 ? '' : 's'} ·{' '}
                  {overdueCount > 0
                    ? `${overdueCount} overdue`
                    : 'all deadlines in good shape'}
                </p>
              </div>
            </div>

            {analytics.length === 0 ? (
              <EmptyState
                icon={<ClipboardList className="h-6 w-6" />}
                title="No assignments yet"
                description="Create your first assignment to start collecting submissions and tracking class completion."
                action={
                  <button
                    type="button"
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:from-violet-700 hover:to-indigo-700"
                  >
                    <Plus className="h-4 w-4" />
                    Create assignment
                  </button>
                }
              />
            ) : (
              <div className="space-y-4">
                {analytics.map(
                  ({
                    assignment,
                    assignedStudents,
                    submittedCount,
                    total,
                    completion,
                    isOverdue,
                  }) => {
                    const expanded = expandedId === assignment.id
                    const barClassName =
                      completion === 100
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : completion < 40
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                          : 'bg-gradient-to-r from-violet-500 to-indigo-500'

                    return (
                      <article
                        key={assignment.id}
                        className={cn(
                          'overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md',
                          isOverdue ? 'border-rose-200' : 'border-slate-200',
                        )}
                      >
                        <div className="p-5 sm:p-6">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                                  {assignment.title}
                                </h3>
                                {isOverdue && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 ring-1 ring-rose-200 ring-inset">
                                    <AlertTriangle className="h-3 w-3" />
                                    Overdue
                                  </span>
                                )}
                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                                  <UsersRound className="h-3 w-3" />
                                  {assignment.assignToAll
                                    ? `All ${students.length} students`
                                    : `${assignedStudents.length} selected`}
                                </span>
                              </div>

                              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">
                                {assignment.description || 'No description provided.'}
                              </p>

                              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                                <span className="inline-flex items-center gap-1.5">
                                  <CalendarDays className="h-3.5 w-3.5" />
                                  Due {formatDate(assignment.dueDate)}
                                </span>
                                <a
                                  href={assignment.driveLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 font-medium text-violet-600 transition hover:text-violet-800"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                  Drive folder
                                </a>
                              </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-1 self-start">
                              <button
                                type="button"
                                onClick={() => openEdit(assignment)}
                                aria-label={`Edit ${assignment.title}`}
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-violet-50 hover:text-violet-600"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(assignment)}
                                aria-label={`Delete ${assignment.title}`}
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-slate-700">
                                {submittedCount}/{total} students submitted
                              </p>
                              <p
                                className={cn(
                                  'text-sm font-bold',
                                  completion === 100
                                    ? 'text-emerald-600'
                                    : completion < 40
                                      ? 'text-amber-600'
                                      : 'text-violet-600',
                                )}
                              >
                                {completion}%
                              </p>
                            </div>

                            <ProgressBar
                              value={completion}
                              className="mt-2"
                              barClassName={barClassName}
                              label={`${assignment.title} completion`}
                            />

                            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                              <span className="text-xs text-slate-500">
                                {total === 0
                                  ? 'No students assigned'
                                  : submittedCount === total
                                    ? 'All submissions received'
                                    : `${total - submittedCount} still pending`}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedId((current) =>
                                    current === assignment.id ? null : assignment.id,
                                  )
                                }
                                aria-expanded={expanded}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 transition hover:text-violet-800"
                              >
                                {expanded ? 'Hide student status' : 'View student status'}
                                <ChevronDown
                                  className={cn(
                                    'h-4 w-4 transition-transform duration-200',
                                    expanded && 'rotate-180',
                                  )}
                                />
                              </button>
                            </div>
                          </div>
                        </div>

                        <AnimatePresence initial={false}>
                          {expanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.24, ease: 'easeInOut' }}
                              className="overflow-hidden border-t border-slate-100 bg-slate-50/40"
                            >
                              <div className="space-y-2 p-4 sm:p-5">
                                {assignedStudents.length === 0 ? (
                                  <p className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-center text-sm text-slate-500">
                                    No students are assigned to this assignment.
                                  </p>
                                ) : (
                                  assignedStudents.map((student) => {
                                    const submission = findSubmission(
                                      submissions,
                                      assignment.id,
                                      student.id,
                                    )
                                    const status = getDisplayStatus(
                                      assignment.dueDate,
                                      Boolean(submission),
                                    )

                                    return (
                                      <div
                                        key={student.id}
                                        className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                                      >
                                        <div className="flex min-w-0 items-center gap-3">
                                          <Avatar
                                            name={student.name}
                                            color={student.avatarColor}
                                            size="sm"
                                            ring={false}
                                          />
                                          <div className="min-w-0">
                                            <p className="truncate text-sm font-medium text-slate-800">
                                              {student.name}
                                            </p>
                                            <p className="truncate text-xs text-slate-400">
                                              {submission
                                                ? `Submitted ${formatDateTime(submission.submittedAt)}`
                                                : getDueMeta(assignment.dueDate).label}
                                            </p>
                                          </div>
                                        </div>
                                        <StatusBadge status={status} />
                                      </div>
                                    )
                                  })
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </article>
                    )
                  },
                )}
              </div>
            )}
          </section>
        </>
      )}

      {formOpen && (
        <AssignmentModal
          open={formOpen}
          assignment={editingAssignment}
          students={students}
          onClose={closeForm}
          onSave={handleSave}
        />
      )}

      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        size="sm"
        icon={<Trash2 className="h-5 w-5" />}
        iconTone="danger"
        title="Delete assignment?"
        description="This action cannot be undone."
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700"
            >
              <Trash2 className="h-4 w-4" />
              Delete assignment
            </button>
          </>
        }
      >
        {deleteTarget && (
          <div className="rounded-xl border border-rose-100 bg-rose-50 p-4">
            <p className="text-sm font-semibold text-rose-900">{deleteTarget.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-rose-800">
              Deleting this assignment will also remove{' '}
              {deleteSubmissionCount} recorded submission
              {deleteSubmissionCount === 1 ? '' : 's'}. Students will no longer see it.
            </p>
          </div>
        )}
      </Modal>
    </div>
  )
}

/** Tiny inline skeleton used while admin analytics are loading. */
function SkeletonLine() {
  return (
    <div className="space-y-3">
      <div className="skeleton-shimmer h-5 w-40 rounded-lg bg-slate-200/70" />
      <div className="skeleton-shimmer h-4 w-2/3 rounded-lg bg-slate-200/70" />
      <div className="skeleton-shimmer h-2.5 w-full rounded-full bg-slate-200/70" />
    </div>
  )
}
