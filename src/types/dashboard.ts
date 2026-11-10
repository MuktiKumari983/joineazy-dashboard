/**
 * Core domain types for the Joineazy assignment management system.
 */

export type Role = 'student' | 'professor'

/** Visual status used by badges, filters, and analytics. */
export type DisplayStatus = 'pending' | 'submitted' | 'overdue'

export type ToastTone = 'success' | 'error' | 'info'

/** How an assignment is submitted: by an individual student or by a group. */
export type SubmissionType = 'individual' | 'group'

export type SubmissionStatus = 'pending' | 'submitted'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  /** Demo-only credential. Never store real passwords in localStorage. */
  password: string
  /** Simulated JWT used to represent the user's active session. */
  token: string
  /** Hex color used for the user's generated avatar. */
  avatarColor: string
}

export interface Course {
  id: string
  name: string
  code: string
  professorId: string
  enrolledStudentIds: string[]
}

export interface Assignment {
  id: string
  courseId: string
  title: string
  description: string
  /** ISO timestamp for the assignment deadline. */
  deadline: string
  /** OneDrive (or other cloud drive) submission folder. */
  driveLink: string
  submissionType: SubmissionType
  createdBy: string
  createdAt: string
  updatedAt: string
}

/** Payload accepted by the create/edit assignment form. */
export interface AssignmentInput {
  title: string
  description: string
  /** ISO timestamp for the assignment deadline. */
  deadline: string
  driveLink: string
  submissionType: SubmissionType
}

export interface Group {
  id: string
  courseId: string
  name: string
  leaderId: string
  memberIds: string[]
}

/**
 * A submission acknowledgment. Individual submissions use `userId`; group
 * submissions use `groupId` plus `acknowledgedBy` (the leader who submitted).
 */
export interface Submission {
  id: string
  assignmentId: string
  userId?: string
  groupId?: string
  status: SubmissionStatus
  timestamp: string
  acknowledgedBy?: string
}

/** Persisted session descriptor. The token mirrors the user's simulated JWT. */
export interface Session {
  userId: string
  token: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
  role: Role
}
