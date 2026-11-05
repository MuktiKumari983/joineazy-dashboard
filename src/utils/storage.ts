import type { Assignment, Submission, User } from '../types/dashboard'
import { toDateInputValue } from './helpers'

/**
 * localStorage-backed persistence. A version key lets the demo safely seed (or
 * upgrade) data without trampling over an existing browser session.
 */

const SEED_VERSION = '1'

const KEYS = {
  version: 'joineazy:seed-version',
  users: 'joineazy:users',
  assignments: 'joineazy:assignments',
  submissions: 'joineazy:submissions',
  activeUser: 'joineazy:active-user',
} as const

export const SEED_USERS: User[] = [
  {
    id: 'admin-1',
    name: 'Dr. Alan Turing',
    email: 'alan.turing@joineazy.edu',
    role: 'admin',
    avatarColor: '#7c3aed',
  },
  {
    id: 'admin-2',
    name: 'Prof. Ada Lovelace',
    email: 'ada.lovelace@joineazy.edu',
    role: 'admin',
    avatarColor: '#db2777',
  },
  {
    id: 'student-1',
    name: 'Student 1',
    email: 'student1@joineazy.edu',
    role: 'student',
    avatarColor: '#0284c7',
  },
  {
    id: 'student-2',
    name: 'Student 2',
    email: 'student2@joineazy.edu',
    role: 'student',
    avatarColor: '#0d9488',
  },
  {
    id: 'student-3',
    name: 'Student 3',
    email: 'student3@joineazy.edu',
    role: 'student',
    avatarColor: '#d97706',
  },
  {
    id: 'student-4',
    name: 'Student 4',
    email: 'student4@joineazy.edu',
    role: 'student',
    avatarColor: '#e11d48',
  },
  {
    id: 'student-5',
    name: 'Student 5',
    email: 'student5@joineazy.edu',
    role: 'student',
    avatarColor: '#4f46e5',
  },
]

function getStorage(): Storage | null {
  try {
    if (typeof window === 'undefined') return null
    return window.localStorage
  } catch {
    return null
  }
}

function readJson<T>(key: string, fallback: T): T {
  const storage = getStorage()
  if (!storage) return fallback

  try {
    const raw = storage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown): void {
  const storage = getStorage()
  if (!storage) return

  try {
    storage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage can be unavailable (private mode/quota); the UI still works in memory.
  }
}

function readArray<T>(key: string, fallback: T[]): T[] {
  const value = readJson<unknown>(key, fallback)
  return Array.isArray(value) ? (value as T[]) : fallback
}

/** Build a local `YYYY-MM-DD` date offset from today. */
function dateOffset(days: number): string {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() + days)
  return toDateInputValue(date)
}

function dateTimeOffset(days: number, hours = 0): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  date.setHours(date.getHours() + hours)
  return date.toISOString()
}

function buildSeedAssignments(): Assignment[] {
  return [
    {
      id: 'assignment-1',
      title: 'Data Structures Problem Set',
      description:
        'Solve the five problems covering binary trees, priority queues, and graph traversal. Upload a clear PDF scan of your handwritten work to the class Drive folder before the deadline.',
      dueDate: dateOffset(6),
      driveLink: 'https://drive.google.com/drive/folders/joineazy-data-structures',
      createdBy: 'admin-1',
      assignToAll: true,
      assignedTo: [],
      createdAt: dateTimeOffset(-8),
      updatedAt: dateTimeOffset(-8),
    },
    {
      id: 'assignment-2',
      title: 'Turing Machine Simulation',
      description:
        'Implement a deterministic Turing machine that accepts balanced parentheses. Include a short write-up of your state transition table and submit both files to Drive.',
      dueDate: dateOffset(10),
      driveLink: 'https://drive.google.com/drive/folders/joineazy-turing-machines',
      createdBy: 'admin-1',
      assignToAll: false,
      assignedTo: ['student-1', 'student-2', 'student-3'],
      createdAt: dateTimeOffset(-4),
      updatedAt: dateTimeOffset(-4),
    },
    {
      id: 'assignment-3',
      title: 'Analytical Engine Essay',
      description:
        'Write a 1,000-word essay on how Ada Lovelace’s notes anticipated modern computing. Cite at least three sources and upload your final PDF to the shared folder.',
      dueDate: dateOffset(3),
      driveLink: 'https://drive.google.com/drive/folders/joineazy-analytical-engine',
      createdBy: 'admin-2',
      assignToAll: true,
      assignedTo: [],
      createdAt: dateTimeOffset(-6),
      updatedAt: dateTimeOffset(-2),
    },
    {
      id: 'assignment-4',
      title: 'Flowchart Design Lab',
      description:
        'Design a flowchart for a campus event registration system. Submit the editable diagram and a one-page explanation of your decision points.',
      dueDate: dateOffset(-2),
      driveLink: 'https://drive.google.com/drive/folders/joineazy-flowchart-lab',
      createdBy: 'admin-2',
      assignToAll: false,
      assignedTo: ['student-4', 'student-5'],
      createdAt: dateTimeOffset(-12),
      updatedAt: dateTimeOffset(-12),
    },
  ]
}

function buildSeedSubmissions(): Submission[] {
  return [
    {
      id: 'submission-seed-1',
      assignmentId: 'assignment-1',
      studentId: 'student-1',
      submittedAt: dateTimeOffset(-1),
    },
    {
      id: 'submission-seed-2',
      assignmentId: 'assignment-1',
      studentId: 'student-2',
      submittedAt: dateTimeOffset(0, -4),
    },
    {
      id: 'submission-seed-3',
      assignmentId: 'assignment-3',
      studentId: 'student-1',
      submittedAt: dateTimeOffset(-2),
    },
    {
      id: 'submission-seed-4',
      assignmentId: 'assignment-3',
      studentId: 'student-3',
      submittedAt: dateTimeOffset(0, -5),
    },
    {
      id: 'submission-seed-5',
      assignmentId: 'assignment-4',
      studentId: 'student-4',
      submittedAt: dateTimeOffset(-3),
    },
  ]
}

/** Seed missing data on first load and repair any individually missing keys. */
export function initializeStorage(): void {
  const storage = getStorage()
  if (!storage) return

  const version = storage.getItem(KEYS.version)

  if (version !== SEED_VERSION) {
    writeJson(KEYS.users, SEED_USERS)
    writeJson(KEYS.assignments, buildSeedAssignments())
    writeJson(KEYS.submissions, buildSeedSubmissions())
    storage.setItem(KEYS.activeUser, 'student-1')
    storage.setItem(KEYS.version, SEED_VERSION)
    return
  }

  if (!storage.getItem(KEYS.users)) writeJson(KEYS.users, SEED_USERS)
  if (!storage.getItem(KEYS.assignments)) writeJson(KEYS.assignments, buildSeedAssignments())
  if (!storage.getItem(KEYS.submissions)) writeJson(KEYS.submissions, buildSeedSubmissions())
  if (!storage.getItem(KEYS.activeUser)) storage.setItem(KEYS.activeUser, 'student-1')
}

export interface DashboardSnapshot {
  users: User[]
  assignments: Assignment[]
  submissions: Submission[]
  activeUserId: string
}

export function loadDashboard(): DashboardSnapshot {
  initializeStorage()

  const users = readArray<User>(KEYS.users, SEED_USERS)
  const assignments = readArray<Assignment>(KEYS.assignments, [])
  const submissions = readArray<Submission>(KEYS.submissions, [])
  const storedActiveUser = getStorage()?.getItem(KEYS.activeUser) ?? null

  const activeUserId =
    storedActiveUser && users.some((user) => user.id === storedActiveUser)
      ? storedActiveUser
      : (users.find((user) => user.id === 'student-1')?.id ?? users[0]?.id ?? '')

  return { users, assignments, submissions, activeUserId }
}

export function saveAssignments(assignments: Assignment[]): void {
  writeJson(KEYS.assignments, assignments)
}

export function saveSubmissions(submissions: Submission[]): void {
  writeJson(KEYS.submissions, submissions)
}

export function saveActiveUserId(userId: string): void {
  const storage = getStorage()
  if (!storage) return

  try {
    storage.setItem(KEYS.activeUser, userId)
  } catch {
    // Ignore storage failures; switching still works for the current session.
  }
}
