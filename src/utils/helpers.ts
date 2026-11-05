import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Assignment, DisplayStatus, Submission, User } from '../types/dashboard'

const DAY_IN_MS = 24 * 60 * 60 * 1000
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

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

export interface DueMeta {
  days: number
  label: string
  overdue: boolean
  isToday: boolean
}

/** Relative due-date copy used on cards and in analytics. */
export function getDueMeta(dueDate: string): DueMeta {
  const due = startOfDay(parseDate(dueDate))
  if (Number.isNaN(due.getTime())) {
    return { days: 0, label: 'No due date', overdue: false, isToday: false }
  }

  const today = startOfDay(new Date())
  const days = Math.round((due.getTime() - today.getTime()) / DAY_IN_MS)

  if (days < 0) {
    const count = Math.abs(days)
    return {
      days,
      label: `${count} day${count === 1 ? '' : 's'} overdue`,
      overdue: true,
      isToday: false,
    }
  }

  if (days === 0) return { days, label: 'Due today', overdue: false, isToday: true }
  if (days === 1) return { days, label: 'Due tomorrow', overdue: false, isToday: false }

  return { days, label: `Due in ${days} days`, overdue: false, isToday: false }
}

/** Submitted always wins; otherwise overdue is derived from the due date. */
export function getDisplayStatus(dueDate: string, isSubmitted: boolean): DisplayStatus {
  if (isSubmitted) return 'submitted'
  return getDueMeta(dueDate).overdue ? 'overdue' : 'pending'
}

export function findSubmission(
  submissions: Submission[],
  assignmentId: string,
  studentId: string,
): Submission | undefined {
  return submissions.find(
    (submission) =>
      submission.assignmentId === assignmentId && submission.studentId === studentId,
  )
}

/** Resolve the students actually assigned to an assignment. */
export function getAssignedStudents(assignment: Assignment, students: User[]): User[] {
  if (assignment.assignToAll) return students

  const assignedIds = new Set(assignment.assignedTo)
  return students.filter((student) => assignedIds.has(student.id))
}

export function getSubmissionCount(
  assignment: Assignment,
  students: User[],
  submissions: Submission[],
): number {
  const assignedIds = new Set(getAssignedStudents(assignment, students).map((student) => student.id))

  return submissions.filter(
    (submission) =>
      submission.assignmentId === assignment.id && assignedIds.has(submission.studentId),
  ).length
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

/** Local `YYYY-MM-DD` value, useful for date inputs and seed data. */
export function toDateInputValue(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function createId(prefix: string): string {
  const suffix =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`

  return `${prefix}-${suffix}`
}
