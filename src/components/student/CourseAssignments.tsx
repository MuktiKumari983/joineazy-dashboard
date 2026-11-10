import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Crown,
  ExternalLink,
  Inbox,
  Send,
  UserPlus,
  UserRound,
  UsersRound,
} from 'lucide-react'
import type { Assignment, Course, Group, Submission, User } from '../../types/dashboard'
import {
  cn,
  formatDateTime,
  formatDeadline,
  getDisplayStatus,
  getDueMeta,
  getFirstName,
  getGroupMembers,
  getStudentAssignmentState,
  getStudentCourseProgress,
  getUserGroup,
  parseDate,
} from '../../utils/helpers'
import { Avatar } from '../ui/Avatar'
import { EmptyState } from '../ui/EmptyState'
import { ProgressBar } from '../ui/ProgressBar'
import { StatusBadge } from '../ui/StatusBadge'
import { GroupModal } from './GroupModal'
import { SubmissionModal } from './SubmissionModal'

interface CourseAssignmentsProps {
  student: User
  course: Course
  assignments: Assignment[]
  groups: Group[]
  submissions: Submission[]
  users: User[]
  onBack: () => void
  onAcknowledgeIndividual: (assignmentId: string) => void
  onAcknowledgeGroup: (assignmentId: string, groupId: string) => void
  onCreateGroup: (courseId: string, name: string) => string | null
  onJoinGroup: (groupId: string) => string | null
  onLeaveGroup: (groupId: string) => string | null
}

export function CourseAssignments({
  student,
  course,
  assignments,
  groups,
  submissions,
  users,
  onBack,
  onAcknowledgeIndividual,
  onAcknowledgeGroup,
  onCreateGroup,
  onJoinGroup,
  onLeaveGroup,
}: CourseAssignmentsProps) {
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [groupModalOpen, setGroupModalOpen] = useState(false)

  const courseAssignments = useMemo(
    () =>
      assignments
        .filter((assignment) => assignment.courseId === course.id)
        .sort(
          (a, b) => parseDate(a.deadline).getTime() - parseDate(b.deadline).getTime(),
        ),
    [assignments, course.id],
  )

  const currentGroup = getUserGroup(groups, course.id, student.id)
  const groupMembers = currentGroup ? getGroupMembers(currentGroup, users) : []
  const groupLeader = currentGroup
    ? users.find((user) => user.id === currentGroup.leaderId)
    : undefined

  const progress = getStudentCourseProgress(
    course,
    assignments,
    groups,
    submissions,
    student.id,
  )

  const hasGroupAssignments = courseAssignments.some(
    (assignment) => assignment.submissionType === 'group',
  )

  const professor = users.find((user) => user.id === course.professorId)

  const handleConfirmSubmission = () => {
    if (!selectedAssignment) return

    if (selectedAssignment.submissionType === 'group' && currentGroup) {
      onAcknowledgeGroup(selectedAssignment.id, currentGroup.id)
      return
    }

    onAcknowledgeIndividual(selectedAssignment.id)
  }

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
              <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700 ring-1 ring-sky-200 ring-inset">
                {course.code}
              </span>
              <span className="text-xs font-medium text-slate-500">
                {professor ? `Taught by ${professor.name}` : 'Joineazy faculty'}
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {course.name}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Review assignments and acknowledge your submissions.
            </p>
          </div>

          {hasGroupAssignments && (
            <button
              type="button"
              onClick={() => setGroupModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-200 bg-white px-4 py-2.5 text-sm font-semibold text-violet-700 shadow-sm transition hover:bg-violet-50"
            >
              <UsersRound className="h-4 w-4" />
              {currentGroup ? 'Manage group' : 'Create or join group'}
            </button>
          )}
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-slate-700">
            {progress.submitted} of {progress.total} assignments submitted
          </p>
          <p className="text-sm font-bold text-violet-600">{progress.percent}%</p>
        </div>
        <ProgressBar
          value={progress.percent}
          className="mt-2"
          label={`${course.name} completion`}
        />
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-amber-700 ring-1 ring-amber-200 ring-inset">
            <Clock3 className="h-3.5 w-3.5" />
            {progress.pending} pending
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700 ring-1 ring-emerald-200 ring-inset">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {progress.submitted} submitted
          </span>
          {progress.overdue > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-rose-700 ring-1 ring-rose-200 ring-inset">
              <AlertTriangle className="h-3.5 w-3.5" />
              {progress.overdue} overdue
            </span>
          )}
        </div>
      </section>

      {hasGroupAssignments && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                <UsersRound className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {currentGroup ? currentGroup.name : 'You are not in a group yet'}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {currentGroup
                    ? `${groupMembers.length} member${groupMembers.length === 1 ? '' : 's'} · Leader: ${groupLeader ? getFirstName(groupLeader.name) : 'Unknown'}`
                    : 'Create or join a group to submit group assignments.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {currentGroup ? (
                <>
                  {groupMembers.map((member) => (
                    <span
                      key={member.id}
                      className="inline-flex items-center gap-1 rounded-full bg-slate-50 py-0.5 pr-2 pl-0.5 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200 ring-inset"
                    >
                      <Avatar
                        name={member.name}
                        color={member.avatarColor}
                        size="xs"
                        ring={false}
                        className="h-5 w-5 text-[9px]"
                      />
                      {getFirstName(member.name)}
                      {member.id === currentGroup.leaderId && (
                        <Crown className="h-3 w-3 text-amber-500" />
                      )}
                    </span>
                  ))}
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setGroupModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-violet-700"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Create or join
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      <section>
        <div className="mb-3">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">
            Assignments
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            {courseAssignments.length} assignment{courseAssignments.length === 1 ? '' : 's'} ·{' '}
            sorted by deadline
          </p>
        </div>

        {courseAssignments.length === 0 ? (
          <EmptyState
            icon={<Inbox className="h-6 w-6" />}
            title="No assignments yet"
            description="When your professor publishes an assignment, it will show up here with its deadline and OneDrive submission link."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {courseAssignments.map((assignment) => {
              const state = getStudentAssignmentState(
                assignment,
                submissions,
                groups,
                student.id,
              )
              const status = getDisplayStatus(assignment.deadline, state.submitted)
              const dueMeta = getDueMeta(assignment.deadline)
              const isGroup = assignment.submissionType === 'group'
              const TypeIcon = isGroup ? UsersRound : UserRound
              const acknowledgedBy = state.submission?.acknowledgedBy
                ? users.find((user) => user.id === state.submission?.acknowledgedBy)
                : undefined
              const submissionGroupLeader = state.group
                ? users.find((user) => user.id === state.group?.leaderId)
                : undefined

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
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={status} />
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset',
                          isGroup
                            ? 'bg-indigo-50 text-indigo-700 ring-indigo-200'
                            : 'bg-sky-50 text-sky-700 ring-sky-200',
                        )}
                      >
                        <TypeIcon className="h-3 w-3" />
                        {isGroup ? 'Group' : 'Individual'}
                      </span>
                    </div>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 text-xs font-medium',
                        status === 'overdue' ? 'text-rose-600' : 'text-slate-500',
                      )}
                    >
                      <CalendarClock className="h-3.5 w-3.5" />
                      {formatDeadline(assignment.deadline)}
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
                      {dueMeta.label}
                    </span>

                    <a
                      href={assignment.driveLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      OneDrive link
                    </a>
                  </div>

                  <div className="mt-5 border-t border-slate-100 pt-4">
                    {state.submitted ? (
                      isGroup ? (
                        <div className="flex items-start gap-2 text-sm font-medium text-emerald-600">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                          <span>
                            Acknowledged by{' '}
                            {acknowledgedBy
                              ? getFirstName(acknowledgedBy.name)
                              : submissionGroupLeader
                                ? getFirstName(submissionGroupLeader.name)
                                : 'the group leader'}{' '}
                            on {state.submission ? formatDateTime(state.submission.timestamp) : '—'}
                            {state.group && (
                              <span className="mt-0.5 block text-xs font-normal text-emerald-600/80">
                                {state.group.name}
                              </span>
                            )}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                          <CheckCircle2 className="h-4 w-4 shrink-0" />
                          <span>
                            Submitted{' '}
                            {state.submission
                              ? formatDateTime(state.submission.timestamp)
                              : '—'}
                          </span>
                        </div>
                      )
                    ) : isGroup ? (
                      !state.group ? (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                          <p className="flex items-start gap-2 text-xs leading-relaxed font-medium text-amber-800">
                            <UsersRound className="mt-0.5 h-4 w-4 shrink-0" />
                            You are not part of any group. Create or join one to submit
                            this assignment.
                          </p>
                          <button
                            type="button"
                            onClick={() => setGroupModalOpen(true)}
                            className="mt-2.5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-amber-700"
                          >
                            <UserPlus className="h-3.5 w-3.5" />
                            Create or join a group
                          </button>
                        </div>
                      ) : state.isLeader ? (
                        <button
                          type="button"
                          onClick={() => setSelectedAssignment(assignment)}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:from-violet-700 hover:to-indigo-700"
                        >
                          <Send className="h-4 w-4" />
                          Acknowledge for {state.group.name}
                        </button>
                      ) : (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <p className="flex items-start gap-2 text-xs leading-relaxed font-medium text-slate-600">
                            <Clock3 className="mt-0.5 h-4 w-4 shrink-0" />
                            Waiting for{' '}
                            {submissionGroupLeader
                              ? getFirstName(submissionGroupLeader.name)
                              : 'the group leader'}{' '}
                            to acknowledge for {state.group.name}.
                          </p>
                        </div>
                      )
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSelectedAssignment(assignment)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:from-violet-700 hover:to-indigo-700"
                      >
                        <Send className="h-4 w-4" />
                        Yes, I have submitted
                      </button>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {selectedAssignment && (
        <SubmissionModal
          assignment={selectedAssignment}
          group={
            selectedAssignment.submissionType === 'group' ? currentGroup : undefined
          }
          onClose={() => setSelectedAssignment(null)}
          onConfirm={handleConfirmSubmission}
        />
      )}

      {groupModalOpen && (
        <GroupModal
          open
          course={course}
          student={student}
          groups={groups}
          users={users}
          onClose={() => setGroupModalOpen(false)}
          onCreate={(name) => onCreateGroup(course.id, name)}
          onJoin={onJoinGroup}
          onLeave={onLeaveGroup}
        />
      )}
    </div>
  )
}
