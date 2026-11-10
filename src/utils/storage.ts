import type {
  Assignment,
  Course,
  Group,
  Role,
  Session,
  Submission,
  User,
} from '../types/dashboard'
import { createSimulatedToken } from './helpers'

/**
 * localStorage-backed persistence. A version key lets the demo safely seed (or
 * upgrade) data without trampling over an existing browser session.
 */

const SEED_VERSION = '2'

const KEYS = {
  version: 'joineazy:seed-version',
  users: 'joineazy:users',
  courses: 'joineazy:courses',
  assignments: 'joineazy:assignments',
  groups: 'joineazy:groups',
  submissions: 'joineazy:submissions',
  session: 'joineazy:session',
} as const

export const DEMO_PASSWORD = 'password123'

export interface DemoAccount {
  name: string
  email: string
  password: string
  role: Role
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    name: 'Dr. Alan Turing',
    email: 'alan.turing@joineazy.edu',
    password: DEMO_PASSWORD,
    role: 'professor',
  },
  {
    name: 'Maya Patel',
    email: 'maya.patel@joineazy.edu',
    password: DEMO_PASSWORD,
    role: 'student',
  },
  {
    name: 'Liam Chen',
    email: 'liam.chen@joineazy.edu',
    password: DEMO_PASSWORD,
    role: 'student',
  },
]

type SeedProfile = Omit<User, 'password' | 'token'>

const SEED_PROFILES: SeedProfile[] = [
  {
    id: 'prof-1',
    name: 'Dr. Alan Turing',
    email: 'alan.turing@joineazy.edu',
    role: 'professor',
    avatarColor: '#7c3aed',
  },
  {
    id: 'prof-2',
    name: 'Prof. Ada Lovelace',
    email: 'ada.lovelace@joineazy.edu',
    role: 'professor',
    avatarColor: '#db2777',
  },
  {
    id: 'student-1',
    name: 'Maya Patel',
    email: 'maya.patel@joineazy.edu',
    role: 'student',
    avatarColor: '#0284c7',
  },
  {
    id: 'student-2',
    name: 'Liam Chen',
    email: 'liam.chen@joineazy.edu',
    role: 'student',
    avatarColor: '#0d9488',
  },
  {
    id: 'student-3',
    name: 'Sofia Ramirez',
    email: 'sofia.ramirez@joineazy.edu',
    role: 'student',
    avatarColor: '#d97706',
  },
  {
    id: 'student-4',
    name: 'Noah Williams',
    email: 'noah.williams@joineazy.edu',
    role: 'student',
    avatarColor: '#e11d48',
  },
  {
    id: 'student-5',
    name: 'Ava Johnson',
    email: 'ava.johnson@joineazy.edu',
    role: 'student',
    avatarColor: '#4f46e5',
  },
]

function buildSeedUsers(): User[] {
  return SEED_PROFILES.map((profile) => ({
    ...profile,
    password: DEMO_PASSWORD,
    token: createSimulatedToken(profile.id, profile.role),
  }))
}

const SEED_COURSES: Course[] = [
  {
    id: 'course-1',
    name: 'Advanced Software Engineering',
    code: 'CS-401',
    professorId: 'prof-1',
    enrolledStudentIds: ['student-1', 'student-2', 'student-3', 'student-4', 'student-5'],
  },
  {
    id: 'course-2',
    name: 'Data Structures & Algorithms',
    code: 'CS-302',
    professorId: 'prof-1',
    enrolledStudentIds: ['student-1', 'student-2', 'student-3'],
  },
  {
    id: 'course-3',
    name: 'Human-Computer Interaction',
    code: 'CS-410',
    professorId: 'prof-2',
    enrolledStudentIds: ['student-1', 'student-4', 'student-5'],
  },
]

const SEED_GROUPS: Group[] = [
  {
    id: 'group-1',
    courseId: 'course-1',
    name: 'Team Alpha',
    leaderId: 'student-1',
    memberIds: ['student-1', 'student-2', 'student-3'],
  },
  {
    id: 'group-2',
    courseId: 'course-1',
    name: 'Team Beta',
    leaderId: 'student-4',
    memberIds: ['student-4', 'student-5'],
  },
  {
    id: 'group-3',
    courseId: 'course-2',
    name: 'Algorithm Alliance',
    leaderId: 'student-2',
    memberIds: ['student-2', 'student-3'],
  },
  {
    id: 'group-4',
    courseId: 'course-3',
    name: 'Design Crew',
    leaderId: 'student-1',
    memberIds: ['student-1', 'student-4'],
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

function dateTimeOffset(days: number, hours = 0): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  date.setHours(date.getHours() + hours)
  return date.toISOString()
}

function deadlineOffset(days: number, hour = 23, minute = 59): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  date.setHours(hour, minute, 0, 0)
  return date.toISOString()
}

function buildSeedAssignments(): Assignment[] {
  return [
    {
      id: 'assignment-1',
      courseId: 'course-1',
      title: 'Sprint 1: Architecture Review',
      description:
        'Document the architecture of your team project using the C4 model. Include context, container, and component diagrams, then upload the PDF and source files to the OneDrive folder.',
      deadline: deadlineOffset(5),
      driveLink: 'https://onedrive.live.com/?id=joineazy-course-1-sprint-1',
      submissionType: 'individual',
      createdBy: 'prof-1',
      createdAt: dateTimeOffset(-10),
      updatedAt: dateTimeOffset(-10),
    },
    {
      id: 'assignment-2',
      courseId: 'course-1',
      title: 'Capstone Project Proposal',
      description:
        'As a group, submit a two-page proposal outlining the problem statement, scope, technology choices, and a milestone plan. One submission per group is required.',
      deadline: deadlineOffset(10),
      driveLink: 'https://onedrive.live.com/?id=joineazy-course-1-capstone',
      submissionType: 'group',
      createdBy: 'prof-1',
      createdAt: dateTimeOffset(-8),
      updatedAt: dateTimeOffset(-8),
    },
    {
      id: 'assignment-3',
      courseId: 'course-1',
      title: 'Code Quality Audit',
      description:
        'Run a static analysis pass over the starter repository, fix the flagged issues, and submit a short report describing the changes and their impact.',
      deadline: deadlineOffset(-2),
      driveLink: 'https://onedrive.live.com/?id=joineazy-course-1-code-audit',
      submissionType: 'individual',
      createdBy: 'prof-1',
      createdAt: dateTimeOffset(-14),
      updatedAt: dateTimeOffset(-12),
    },
    {
      id: 'assignment-4',
      courseId: 'course-2',
      title: 'Graph Algorithms Problem Set',
      description:
        'Solve the five problems covering shortest paths, minimum spanning trees, and topological sort. Show your reasoning and complexity analysis for each solution.',
      deadline: deadlineOffset(4),
      driveLink: 'https://onedrive.live.com/?id=joineazy-course-2-graphs',
      submissionType: 'individual',
      createdBy: 'prof-1',
      createdAt: dateTimeOffset(-7),
      updatedAt: dateTimeOffset(-7),
    },
    {
      id: 'assignment-5',
      courseId: 'course-2',
      title: 'Team Algorithm Design Report',
      description:
        'Collaborate with your group to design an efficient algorithm for the campus navigation problem. Submit the report and a working prototype link as a group.',
      deadline: deadlineOffset(7),
      driveLink: 'https://onedrive.live.com/?id=joineazy-course-2-team-report',
      submissionType: 'group',
      createdBy: 'prof-1',
      createdAt: dateTimeOffset(-5),
      updatedAt: dateTimeOffset(-5),
    },
    {
      id: 'assignment-6',
      courseId: 'course-3',
      title: 'Usability Testing Plan',
      description:
        'Prepare a usability test plan for the provided mobile prototype. Include participant criteria, tasks, metrics, and a moderation script. Submit once per group.',
      deadline: deadlineOffset(6),
      driveLink: 'https://onedrive.live.com/?id=joineazy-course-3-usability',
      submissionType: 'group',
      createdBy: 'prof-2',
      createdAt: dateTimeOffset(-9),
      updatedAt: dateTimeOffset(-9),
    },
  ]
}

function buildSeedSubmissions(): Submission[] {
  return [
    {
      id: 'submission-seed-1',
      assignmentId: 'assignment-1',
      userId: 'student-1',
      status: 'submitted',
      timestamp: dateTimeOffset(-1),
    },
    {
      id: 'submission-seed-2',
      assignmentId: 'assignment-1',
      userId: 'student-2',
      status: 'submitted',
      timestamp: dateTimeOffset(0, -4),
    },
    {
      id: 'submission-seed-3',
      assignmentId: 'assignment-2',
      groupId: 'group-1',
      userId: 'student-1',
      status: 'submitted',
      timestamp: dateTimeOffset(-2),
      acknowledgedBy: 'student-1',
    },
    {
      id: 'submission-seed-4',
      assignmentId: 'assignment-3',
      userId: 'student-2',
      status: 'submitted',
      timestamp: dateTimeOffset(-3),
    },
    {
      id: 'submission-seed-5',
      assignmentId: 'assignment-4',
      userId: 'student-1',
      status: 'submitted',
      timestamp: dateTimeOffset(-1),
    },
    {
      id: 'submission-seed-6',
      assignmentId: 'assignment-6',
      groupId: 'group-4',
      userId: 'student-1',
      status: 'submitted',
      timestamp: dateTimeOffset(0, -6),
      acknowledgedBy: 'student-1',
    },
  ]
}

/** Seed missing data on first load and repair any individually missing keys. */
export function initializeStorage(): void {
  const storage = getStorage()
  if (!storage) return

  const version = storage.getItem(KEYS.version)

  if (version !== SEED_VERSION) {
    writeJson(KEYS.users, buildSeedUsers())
    writeJson(KEYS.courses, SEED_COURSES)
    writeJson(KEYS.groups, SEED_GROUPS)
    writeJson(KEYS.assignments, buildSeedAssignments())
    writeJson(KEYS.submissions, buildSeedSubmissions())
    storage.removeItem(KEYS.session)
    storage.setItem(KEYS.version, SEED_VERSION)
    return
  }

  if (!storage.getItem(KEYS.users)) writeJson(KEYS.users, buildSeedUsers())
  if (!storage.getItem(KEYS.courses)) writeJson(KEYS.courses, SEED_COURSES)
  if (!storage.getItem(KEYS.groups)) writeJson(KEYS.groups, SEED_GROUPS)
  if (!storage.getItem(KEYS.assignments)) writeJson(KEYS.assignments, buildSeedAssignments())
  if (!storage.getItem(KEYS.submissions)) writeJson(KEYS.submissions, buildSeedSubmissions())
}

export interface DashboardSnapshot {
  users: User[]
  courses: Course[]
  assignments: Assignment[]
  groups: Group[]
  submissions: Submission[]
}

export function loadDashboard(): DashboardSnapshot {
  initializeStorage()

  return {
    users: readArray<User>(KEYS.users, buildSeedUsers()),
    courses: readArray<Course>(KEYS.courses, SEED_COURSES),
    assignments: readArray<Assignment>(KEYS.assignments, []),
    groups: readArray<Group>(KEYS.groups, []),
    submissions: readArray<Submission>(KEYS.submissions, []),
  }
}

export function loadSession(): Session | null {
  const value = readJson<unknown>(KEYS.session, null)
  if (!value || typeof value !== 'object') return null

  const session = value as Partial<Session>
  if (typeof session.userId !== 'string' || typeof session.token !== 'string') {
    return null
  }

  return { userId: session.userId, token: session.token }
}

export function saveUsers(users: User[]): void {
  writeJson(KEYS.users, users)
}

export function saveCourses(courses: Course[]): void {
  writeJson(KEYS.courses, courses)
}

export function saveAssignments(assignments: Assignment[]): void {
  writeJson(KEYS.assignments, assignments)
}

export function saveGroups(groups: Group[]): void {
  writeJson(KEYS.groups, groups)
}

export function saveSubmissions(submissions: Submission[]): void {
  writeJson(KEYS.submissions, submissions)
}

export function saveSession(session: Session): void {
  writeJson(KEYS.session, session)
}

export function clearSession(): void {
  const storage = getStorage()
  if (!storage) return

  try {
    storage.removeItem(KEYS.session)
  } catch {
    // Ignore storage failures; signing out still works for the current session.
  }
}
