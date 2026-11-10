import { useMemo, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  ChevronDown,
  ClipboardList,
  Clock3,
  Crown,
  ExternalLink,
  FileText,
  Inbox,
  Pencil,
  Plus,
  Trash2,
  TrendingUp,
  UserRound,
  UsersRound,
  UserX,
} from 'lucide-react'
import type {
  Assignment,
  AssignmentInput,
  Course,
  Group,
  Submission,
  SubmissionType,
  User,
} from '../../types/dashboard'
import {
  cn,
  findGroupSubmission,
  findIndividualSubmission,
  formatDateTime,
  formatDeadline,
  getAssignmentStats,
  getCourseGroups,
  getDisplayStatus,
  getDueMeta,
  getEnrolledStudents,
  getFirstName,
  getGroupMembers,
  getPercent,
  parseDate,
} from '../../utils/helpers'
import { AssignmentModal } from './AssignmentModal'
import { Avatar } from '../ui/Avatar'
import { EmptyState } from '../ui/EmptyState'
import { Modal } from '../ui/Modal'
import { ProgressBar } from '../ui/ProgressBar'
import { StatusBadge } from '../ui/StatusBadge'

interface CourseAssignmentsProps {
  professor: User
  course: Course
  assignments: Assignment[]
  groups: Group[]
  submissions: Submission[]
  users: User[]
  onBack: () => void
  onCreate: (courseId: string, input: AssignmentInput) => void
  onUpdate: (assignmentId: string, input: AssignmentInput) => void
  onDelete: (assignmentId: string) => void
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
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 sm:text-sm">{label}</p>
          <p className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            {value}
          </p>
          <p className="mt-1 text-[11px] text-slate-400 sm:text-xs">{helper}</p>
        </div>
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10',
            statToneClasses[tone],
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}

function SubmissionTypeBadge({ type }: { type: SubmissionType }) {
  const isGroup = type === 'group'
  const Icon = isGroup ? UsersRound : UserRound

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset',
        isGroup
          ? 'bg-indigo-50 text-indigo-700 ring-indigo-200'
          : 'bg-sky-50 text-sky-700 ring-sky-200',
      )}
    >
      <Icon className="h-3 w-3" />
      {isGroup ? 'Group' : 'Individual'}
    </span>
  )
}

export function CourseAssignments({
  professor,
  course,
  assignments,
  groups,
  submissions,
  users,
  onBack,
  onCreate,
  onUpdate,
  onDelete,
}: CourseAssignmentsProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Assignment | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const courseAssignments = useMemo(
    () =>
      assignments
        .filter((assignment) => assignment.courseId === course.id)
        .sort(
          (a, b) => parseDate(a.deadline).getTime() - parseDate(b.deadline).getTime(),
        ),
    [assignments, course.id],
  )

  const enrolledStudents = useMemo(
    () => getEnrolledStudents(course, users),
    [course, users],
  )

  const courseGroups = useMemo(
    () => getCourseGroups(groups, course.id),
    [groups, course.id],
  )

  const analytics = courseAssignments.map((assignment) => ({
    assignment,
    stats: getAssignmentStats(assignment, course, groups, submissions),
  }))

  const totalSlots = analytics.reduce((sum, item) => sum + item.stats.total, 0)
  const totalSubmitted = analytics.reduce((sum, item) => sum + item.stats.submitted, 0)
  const completionRate = getPercent(totalSubmitted, totalSlots)
  const overdueCount = analytics.filter((item) => item.stats.isOverdue).length
  const awaitingCount = Math.max(totalSlots - totalSubmitted, 0)

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
      onCreate(course.id, input)
    }
    closeForm()
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    if (expandedId === deleteTarget.id) setExpandedId(null)
    onDelete(deleteTarget.id)
    setDeleteTarget(null)
  }

  const deleteStats = deleteTarget
    ? getAssignmentStats(deleteTarget, course, groups, submissions)
    : null

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex w-fit items-center gap-1.5 rounded-lg text-sm font-semibold text-slate-500 transition hover:text-violet-700"
        >
          <ArrowLeft className="h-4 w-4" />
          All courses
        </button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700 ring-1 ring-violet-200 ring-inset">
                {course.code}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                <UsersRound className="h-3.5 w-3.5" />
                {enrolledStudents.length} students enrolled
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {course.name}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Professor workspace · {getFirstName(professor.name)}
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
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 sm:gap-4">
        <StatCard
          label="Assignments"
          value={String(courseAssignments.length)}
          helper="Published in this course"
          tone="violet"
          icon={<FileText className="h-5 w-5" />}
        />
        <StatCard
          label="Submissions"
          value={`${totalSubmitted}/${totalSlots}`}
          helper="Across all assignments"
          tone="emerald"
          icon={<Inbox className="h-5 w-5" />}
        />
        <StatCard
          label="Completion"
          value={`${completionRate}%`}
          helper={`${awaitingCount} still pending`}
          tone="indigo"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          label="Overdue"
          value={String(overdueCount)}
          helper={overdueCount > 0 ? 'Need your attention' : 'Everything on track'}
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
              Assignments &amp; tracking
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {courseAssignments.length} assignment{courseAssignments.length === 1 ? '' : 's'} ·{' '}
              {overdueCount > 0 ? `${overdueCount} overdue` : 'all deadlines in good shape'}
            </p>
          </div>
        </div>

        {analytics.length === 0 ? (
          <EmptyState
            icon={<ClipboardList className="h-6 w-6" />}
            title="No assignments yet"
            description="Create your first assignment to start collecting submissions and tracking course completion."
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
            {analytics.map(({ assignment, stats }) => {
              const expanded = expandedId === assignment.id
              const dueMeta = getDueMeta(assignment.deadline)
              const barClassName =
                stats.percent === 100
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : stats.percent < 40
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                    : 'bg-gradient-to-r from-violet-500 to-indigo-500'

              return (
                <article
                  key={assignment.id}
                  className={cn(
                    'overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md',
                    stats.isOverdue ? 'border-rose-200' : 'border-slate-200',
                  )}
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
                            {assignment.title}
                          </h3>
                          <SubmissionTypeBadge type={assignment.submissionType} />
                          {stats.isOverdue && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 ring-1 ring-rose-200 ring-inset">
                              <AlertTriangle className="h-3 w-3" />
                              Overdue
                            </span>
                          )}
                        </div>

                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">
                          {assignment.description || 'No description provided.'}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5',
                              dueMeta.overdue && 'font-medium text-rose-600',
                            )}
                          >
                            <CalendarClock className="h-3.5 w-3.5" />
                            Due {formatDeadline(assignment.deadline)}
                          </span>
                          <a
                            href={assignment.driveLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 font-medium text-violet-600 transition hover:text-violet-800"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            OneDrive folder
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

                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 sm:mt-5 sm:p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-700">
                          {stats.submitted}/{stats.total}{' '}
                          {assignment.submissionType === 'group' ? 'groups' : 'students'} submitted
                        </p>
                        <p
                          className={cn(
                            'text-sm font-bold',
                            stats.percent === 100
                              ? 'text-emerald-600'
                              : stats.percent < 40
                                ? 'text-amber-600'
                                : 'text-violet-600',
                          )}
                        >
                          {stats.percent}%
                        </p>
                      </div>

                      <ProgressBar
                        value={stats.percent}
                        className="mt-2"
                        barClassName={barClassName}
                        label={`${assignment.title} completion`}
                      />

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs text-slate-500">
                          {stats.total === 0
                            ? assignment.submissionType === 'group'
                              ? 'No groups formed yet'
                              : 'No students enrolled'
                            : stats.submitted === stats.total
                              ? 'All submissions received'
                              : `${stats.total - stats.submitted} still pending`}
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
                          {expanded ? 'Hide tracking' : 'View tracking'}
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
                          {assignment.submissionType === 'individual' ? (
                            enrolledStudents.length === 0 ? (
                              <p className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-center text-sm text-slate-500">
                                No students are enrolled in this course yet.
                              </p>
                            ) : (
                              enrolledStudents.map((student) => {
                                const submission = findIndividualSubmission(
                                  submissions,
                                  assignment.id,
                                  student.id,
                                )
                                const status = getDisplayStatus(
                                  assignment.deadline,
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
                                            ? `Submitted ${formatDateTime(submission.timestamp)}`
                                            : dueMeta.label}
                                        </p>
                                      </div>
                                    </div>
                                    <StatusBadge status={status} />
                                  </div>
                                )
                              })
                            )
                          ) : courseGroups.length === 0 ? (
                            <p className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-center text-sm text-slate-500">
                              No groups have been formed for this course yet.
                            </p>
                          ) : (
                            <>
                              {courseGroups.map((group) => {
                                const submission = findGroupSubmission(
                                  submissions,
                                  assignment.id,
                                  group.id,
                                )
                                const status = getDisplayStatus(
                                  assignment.deadline,
                                  Boolean(submission),
                                )
                                const members = getGroupMembers(group, users)
                                const leader = users.find(
                                  (user) => user.id === group.leaderId,
                                )

                                return (
                                  <div
                                    key={group.id}
                                    className="rounded-xl border border-slate-200 bg-white px-3 py-3"
                                  >
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                      <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <p className="truncate text-sm font-semibold text-slate-800">
                                            {group.name}
                                          </p>
                                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-200 ring-inset">
                                            <Crown className="h-3 w-3" />
                                            {leader ? getFirstName(leader.name) : 'Leader'}
                                          </span>
                                        </div>
                                        <p className="mt-1 truncate text-xs text-slate-400">
                                          {submission
                                            ? `Acknowledged ${formatDateTime(submission.timestamp)}`
                                            : `${members.length} member${members.length === 1 ? '' : 's'} · ${dueMeta.label}`}
                                        </p>
                                      </div>
                                      <StatusBadge status={status} />
                                    </div>

                                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                                      {members.map((member) => (
                                        <span
                                          key={member.id}
                                          className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 py-0.5 pr-2 pl-0.5 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200 ring-inset"
                                        >
                                          <Avatar
                                            name={member.name}
                                            color={member.avatarColor}
                                            size="xs"
                                            ring={false}
                                            className="h-5 w-5 text-[9px]"
                                          />
                                          {member.name}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )
                              })}

                              {stats.ungroupedCount > 0 && (
                                <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
                                  <UserX className="mt-0.5 h-4 w-4 shrink-0" />
                                  <p>
                                    {stats.ungroupedCount} enrolled student
                                    {stats.ungroupedCount === 1 ? ' is' : 's are'} not in a
                                    group yet and cannot submit this group assignment.
                                  </p>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {formOpen && (
        <AssignmentModal
          open={formOpen}
          assignment={editingAssignment}
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
        {deleteTarget && deleteStats && (
          <div className="rounded-xl border border-rose-100 bg-rose-50 p-4">
            <p className="text-sm font-semibold text-rose-900">{deleteTarget.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-rose-800">
              Deleting this assignment will also remove {deleteStats.submitted} recorded
              submission{deleteStats.submitted === 1 ? '' : 's'}. Students will no longer see
              it.
            </p>
          </div>
        )}
      </Modal>
    </div>
  )
}
