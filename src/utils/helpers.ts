import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type {
  Assignment,
  Course,
  DisplayStatus,
  Group,
  Submission,
  User,
} from '../types/dashboard'

const DAY_IN_MS = 24 * 60 * 60 * 1000
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export const AVATAR_COLORS = [
  '#7c3aed',
  '#0284c7',
  '#0d9488',
  '#d97706',
  '#e11d48',
  '#4f46e5',
  '#db2777',
  '#059669',
]

/** Merge conditional Tailwind classes while resolving conflicts. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/** Extract up to two initials, ignoring common academic titles. */
export function getInitials(name: string): string {
  const cleaned = name.replace(/^(dr\.?|prof\.?|mr\.?|ms\.?|mrs\.?)\s+/i, '').trim()
  const parts = cleaned.split(/\s+/).filter(Boolean)

  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

/** Friendly first name for headings, without academic titles. */
export function getFirstName(name: string): string {
  const cleaned = name.replace(/^(dr\.?|prof\.?|mr\.?|ms\.?|mrs\.?)\s+/i, '').trim()
  return cleaned.split(/\s+/)[0] || name
}

export function pickAvatarColor(seed = Math.random()): string {
  const index = Math.floor(seed * AVATAR_COLORS.length) % AVATAR_COLORS.length
  return AVATAR_COLORS[index]
}

/** Parse `YYYY-MM-DD` as local time so dates never shift across timezones. */
export function parseDate(value: string): Date {
  if (DATE_ONLY_PATTERN.test(value)) {
    const [year, month, day] = value.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  return new Date(value)
}

export function startOfDay(date: Date): Date {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

export function formatDate(
  value: string,
  options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' },
): string {
  const date = parseDate(value)
  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('en-US', options).format(date)
}

export function formatDateTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export function formatDeadline(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export interface DueMeta {
  days: number
  label: string
  overdue: boolean
  isToday: boolean
}

/** Relative deadline copy used on cards and in analytics. */
export function getDueMeta(deadline: string): DueMeta {
  const due = new Date(deadline)
  if (Number.isNaN(due.getTime())) {
    return { days: 0, label: 'No deadline', overdue: false, isToday: false }
  }

  const now = new Date()
  const overdue = due.getTime() < now.getTime()
  const days = Math.round(
    (startOfDay(due).getTime() - startOfDay(now).getTime()) / DAY_IN_MS,
  )

  if (overdue) {
    const count = Math.max(Math.abs(days), 0)
    return {
      days,
      label: count === 0 ? 'Overdue' : `${count} day${count === 1 ? '' : 's'} overdue`,
      overdue: true,
      isToday: false,
    }
  }

  if (days === 0) return { days, label: 'Due today', overdue: false, isToday: true }
  if (days === 1) return { days, label: 'Due tomorrow', overdue: false, isToday: false }

  return { days, label: `Due in ${days} days`, overdue: false, isToday: false }
}

/** Submitted always wins; otherwise overdue is derived from the deadline. */
export function getDisplayStatus(deadline: string, isSubmitted: boolean): DisplayStatus {
  if (isSubmitted) return 'submitted'
  return getDueMeta(deadline).overdue ? 'overdue' : 'pending'
}

export function getPercent(value: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((value / total) * 100)
}

export function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

/** Local `YYYY-MM-DD` value, useful for date inputs and seed data. */
export function toDateInputValue(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Convert an ISO timestamp into a local `datetime-local` input value. */
export function toDateTimeInputValue(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

/** Convert a local `datetime-local` input value into an ISO timestamp. */
export function fromDateTimeInputValue(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toISOString()
}

export function createId(prefix: string): string {
  const suffix =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`

  return `${prefix}-${suffix}`
}

/** Build a simulated, unsigned JWT for the demo session. */
export function createSimulatedToken(userId: string, role: string): string {
  const encode = (value: unknown) => {
    try {
      return btoa(JSON.stringify(value)).replace(/=+$/, '')
    } catch {
      return ''
    }
  }

  const header = encode({ alg: 'HS256', typ: 'JWT' })
  const payload = encode({
    sub: userId,
    role,
    iat: Date.now(),
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
  })
  const signature = Math.random().toString(36).slice(2, 12)

  return `${header}.${payload}.${signature}`
}

export function getCourseById(courses: Course[], courseId: string): Course | undefined {
  return courses.find((course) => course.id === courseId)
}

export function getEnrolledStudents(course: Course, users: User[]): User[] {
  const ids = new Set(course.enrolledStudentIds)
  return users.filter((user) => user.role === 'student' && ids.has(user.id))
}

export function getCourseGroups(groups: Group[], courseId: string): Group[] {
  return groups.filter((group) => group.courseId === courseId)
}

export function getUserGroup(
  groups: Group[],
  courseId: string,
  userId: string,
): Group | undefined {
  return groups.find(
    (group) => group.courseId === courseId && group.memberIds.includes(userId),
  )
}

export function getGroupMembers(group: Group, users: User[]): User[] {
  const ids = new Set(group.memberIds)
  return users.filter((user) => ids.has(user.id))
}

export function findIndividualSubmission(
  submissions: Submission[],
  assignmentId: string,
  userId: string,
): Submission | undefined {
  return submissions.find(
    (submission) =>
      submission.assignmentId === assignmentId &&
      submission.userId === userId &&
      submission.groupId === undefined &&
      submission.status === 'submitted',
  )
}

export function findGroupSubmission(
  submissions: Submission[],
  assignmentId: string,
  groupId: string,
): Submission | undefined {
  return submissions.find(
    (submission) =>
      submission.assignmentId === assignmentId &&
      submission.groupId === groupId &&
      submission.status === 'submitted',
  )
}

export interface StudentAssignmentState {
  submitted: boolean
  submission?: Submission
  group?: Group
  isLeader: boolean
}

/** Resolve a student's submission state (individual or group) for an assignment. */
export function getStudentAssignmentState(
  assignment: Assignment,
  submissions: Submission[],
  groups: Group[],
  userId: string,
): StudentAssignmentState {
  if (assignment.submissionType === 'individual') {
    const submission = findIndividualSubmission(submissions, assignment.id, userId)
    return { submitted: Boolean(submission), submission, isLeader: false }
  }

  const group = getUserGroup(groups, assignment.courseId, userId)
  if (!group) return { submitted: false, isLeader: false }

  const submission = findGroupSubmission(submissions, assignment.id, group.id)
  return {
    submitted: Boolean(submission),
    submission,
    group,
    isLeader: group.leaderId === userId,
  }
}

export interface AssignmentStats {
  submitted: number
  total: number
  percent: number
  isOverdue: boolean
  ungroupedCount: number
}

/** Submission analytics for a single assignment (students or groups). */
export function getAssignmentStats(
  assignment: Assignment,
  course: Course | undefined,
  groups: Group[],
  submissions: Submission[],
): AssignmentStats {
  const overdue = getDueMeta(assignment.deadline).overdue

  if (!course) {
    return { submitted: 0, total: 0, percent: 0, isOverdue: overdue, ungroupedCount: 0 }
  }

  if (assignment.submissionType === 'individual') {
    const enrolled = new Set(course.enrolledStudentIds)
    const total = enrolled.size
    const submitted = submissions.filter(
      (submission) =>
        submission.assignmentId === assignment.id &&
        submission.status === 'submitted' &&
        submission.userId !== undefined &&
        submission.groupId === undefined &&
        enrolled.has(submission.userId),
    ).length

    return {
      submitted,
      total,
      percent: getPercent(submitted, total),
      isOverdue: overdue && submitted < total,
      ungroupedCount: 0,
    }
  }

  const courseGroups = getCourseGroups(groups, assignment.courseId)
  const groupIds = new Set(courseGroups.map((group) => group.id))
  const total = courseGroups.length
  const submitted = submissions.filter(
    (submission) =>
      submission.assignmentId === assignment.id &&
      submission.status === 'submitted' &&
      submission.groupId !== undefined &&
      groupIds.has(submission.groupId),
  ).length

  const groupedStudentIds = new Set(courseGroups.flatMap((group) => group.memberIds))
  const ungroupedCount = course.enrolledStudentIds.filter(
    (studentId) => !groupedStudentIds.has(studentId),
  ).length

  return {
    submitted,
    total,
    percent: getPercent(submitted, total),
    isOverdue: overdue && submitted < total,
    ungroupedCount,
  }
}

export interface CourseProgress {
  total: number
  submitted: number
  pending: number
  overdue: number
  percent: number
}

/** A student's completion across every assignment in a course. */
export function getStudentCourseProgress(
  course: Course,
  assignments: Assignment[],
  groups: Group[],
  submissions: Submission[],
  userId: string,
): CourseProgress {
  const courseAssignments = assignments.filter(
    (assignment) => assignment.courseId === course.id,
  )

  let submitted = 0
  let overdue = 0

  for (const assignment of courseAssignments) {
    const state = getStudentAssignmentState(assignment, submissions, groups, userId)
    if (state.submitted) {
      submitted += 1
    } else if (getDueMeta(assignment.deadline).overdue) {
      overdue += 1
    }
  }

  return {
    total: courseAssignments.length,
    submitted,
    pending: courseAssignments.length - submitted,
    overdue,
    percent: getPercent(submitted, courseAssignments.length),
  }
}

export interface CourseStats {
  submitted: number
  total: number
  percent: number
}

/** Overall professor analytics for a course (all assignment slots). */
export function getCourseStats(
  course: Course,
  assignments: Assignment[],
  groups: Group[],
  submissions: Submission[],
): CourseStats {
  const courseAssignments = assignments.filter(
    (assignment) => assignment.courseId === course.id,
  )

  let submitted = 0
  let total = 0

  for (const assignment of courseAssignments) {
    const stats = getAssignmentStats(assignment, course, groups, submissions)
    submitted += stats.submitted
    total += stats.total
  }

  return { submitted, total, percent: getPercent(submitted, total) }
}
