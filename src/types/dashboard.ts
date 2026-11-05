/**
 * Core domain types for the Assignment & Review Dashboard.
 */

export type Role = 'admin' | 'student'

/** Visual status used by badges, filters, and analytics. */
export type DisplayStatus = 'pending' | 'submitted' | 'overdue'

export type ToastTone = 'success' | 'error' | 'info'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  /** Hex color used for the user's generated avatar. */
  avatarColor: string
}

export interface Submission {
  id: string
  assignmentId: string
  studentId: string
  submittedAt: string
}

export interface Assignment {
  id: string
  title: string
  description: string
  /** Date-only string in `YYYY-MM-DD` format. */
  dueDate: string
  driveLink: string
  createdBy: string
  /** When true, every student currently in the class is assigned. */
  assignToAll: boolean
  /** Student IDs used when `assignToAll` is false. */
  assignedTo: string[]
  createdAt: string
  updatedAt: string
}

/** Payload accepted by the create/edit assignment form. */
export interface AssignmentInput {
  title: string
  description: string
  dueDate: string
  driveLink: string
  assignToAll: boolean
  assignedTo: string[]
}
