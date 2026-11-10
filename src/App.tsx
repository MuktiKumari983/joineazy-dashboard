import { useEffect, useMemo, useState } from 'react'
import { Database } from 'lucide-react'
import type {
  Assignment,
  AssignmentInput,
  Group,
  RegisterInput,
  Session,
  Submission,
  ToastTone,
  User,
} from './types/dashboard'
import {
  createId,
  createSimulatedToken,
  findGroupSubmission,
  findIndividualSubmission,
  getFirstName,
  pickAvatarColor,
} from './utils/helpers'
import {
  clearSession,
  loadDashboard,
  loadSession,
  saveAssignments,
  saveCourses,
  saveGroups,
  saveSession,
  saveSubmissions,
  saveUsers,
} from './utils/storage'
import { Login } from './components/auth/Login'
import { Register } from './components/auth/Register'
import { Navbar } from './components/Navbar'
import { ProfessorDashboard } from './components/professor/ProfessorDashboard'
import { CourseAssignments as ProfessorCourseAssignments } from './components/professor/CourseAssignments'
import { StudentDashboard } from './components/student/StudentDashboard'
import { CourseAssignments as StudentCourseAssignments } from './components/student/CourseAssignments'
import { Toast, type ToastData } from './components/ui/Toast'

type AuthView = 'login' | 'register'
type View = { name: 'courses' } | { name: 'course'; courseId: string }

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

export default function App() {
  const [snapshot] = useState(() => loadDashboard())
  const [users, setUsers] = useState<User[]>(snapshot.users)
  const [courses] = useState(snapshot.courses)
  const [assignments, setAssignments] = useState<Assignment[]>(snapshot.assignments)
  const [groups, setGroups] = useState<Group[]>(snapshot.groups)
  const [submissions, setSubmissions] = useState<Submission[]>(snapshot.submissions)

  const [session, setSession] = useState<Session | null>(() => {
    const stored = loadSession()
    if (!stored) return null

    const user = snapshot.users.find((candidate) => candidate.id === stored.userId)
    if (!user || user.token !== stored.token) {
      clearSession()
      return null
    }

    return stored
  })
  const [authView, setAuthView] = useState<AuthView>('login')
  const [view, setView] = useState<View>({ name: 'courses' })
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<ToastData | null>(null)

  const activeUser = useMemo(() => {
    if (!session) return null
    const user = users.find((candidate) => candidate.id === session.userId)
    if (!user || user.token !== session.token) return null
    return user
  }, [session, users])

  // Short skeleton state so first paint feels considered rather than abrupt.
  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 600)
    return () => window.clearTimeout(timer)
  }, [])

  // Keep localStorage in sync with every state change.
  useEffect(() => {
    saveUsers(users)
  }, [users])

  useEffect(() => {
    saveCourses(courses)
  }, [courses])

  useEffect(() => {
    saveAssignments(assignments)
  }, [assignments])

  useEffect(() => {
    saveGroups(groups)
  }, [groups])

  useEffect(() => {
    saveSubmissions(submissions)
  }, [submissions])

  useEffect(() => {
    if (session) {
      saveSession(session)
    } else {
      clearSession()
    }
  }, [session])

  // Auto-dismiss toast notifications.
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 3400)
    return () => window.clearTimeout(timer)
  }, [toast])

  const showToast = (message: string, tone: ToastTone = 'success') => {
    setToast({ id: createId('toast'), message, tone })
  }

  const handleLogin = async (email: string, password: string): Promise<string | null> => {
    await wait(450)

    const normalized = email.trim().toLowerCase()
    const user = users.find(
      (candidate) => candidate.email.toLowerCase() === normalized,
    )

    if (!user) return 'No account found with that email address.'
    if (user.password !== password) return 'Incorrect password. Please try again.'

    const token = user.token || createSimulatedToken(user.id, user.role)
    if (user.token !== token) {
      setUsers((current) =>
        current.map((candidate) =>
          candidate.id === user.id ? { ...candidate, token } : candidate,
        ),
      )
    }

    setSession({ userId: user.id, token })
    setView({ name: 'courses' })
    showToast(`Welcome back, ${getFirstName(user.name)}.`)
    return null
  }

  const handleRegister = async (input: RegisterInput): Promise<string | null> => {
    await wait(500)

    const email = input.email.trim().toLowerCase()
    if (users.some((user) => user.email.toLowerCase() === email)) {
      return 'An account with this email already exists.'
    }

    const id = createId(input.role === 'professor' ? 'prof' : 'student')
    const token = createSimulatedToken(id, input.role)
    const user: User = {
      id,
      name: input.name.trim(),
      email,
      role: input.role,
      password: input.password,
      token,
      avatarColor: pickAvatarColor(),
    }

    setUsers((current) => [...current, user])
    setSession({ userId: id, token })
    setView({ name: 'courses' })
    showToast('Account created. Welcome to Joineazy!')
    return null
  }

  const handleLogout = () => {
    clearSession()
    setSession(null)
    setAuthView('login')
    setView({ name: 'courses' })
    showToast('You have been signed out.', 'info')
  }

  const handleCreateAssignment = (courseId: string, input: AssignmentInput) => {
    if (!activeUser || activeUser.role !== 'professor') return

    const course = courses.find((candidate) => candidate.id === courseId)
    if (!course || course.professorId !== activeUser.id) return

    const now = new Date().toISOString()
    const assignment: Assignment = {
      ...input,
      id: createId('assignment'),
      courseId,
      createdBy: activeUser.id,
      createdAt: now,
      updatedAt: now,
    }

    setAssignments((current) => [assignment, ...current])
    showToast('Assignment created and shared with the course.')
  }

  const handleUpdateAssignment = (assignmentId: string, input: AssignmentInput) => {
    if (!activeUser || activeUser.role !== 'professor') return

    const existing = assignments.find((assignment) => assignment.id === assignmentId)
    if (!existing || existing.createdBy !== activeUser.id) return

    setAssignments((current) =>
      current.map((assignment) =>
        assignment.id === assignmentId
          ? { ...assignment, ...input, updatedAt: new Date().toISOString() }
          : assignment,
      ),
    )

    // Switching between individual and group invalidates existing submissions.
    if (existing.submissionType !== input.submissionType) {
      setSubmissions((current) =>
        current.filter((submission) => submission.assignmentId !== assignmentId),
      )
    }

    showToast('Assignment updated successfully.')
  }

  const handleDeleteAssignment = (assignmentId: string) => {
    if (!activeUser || activeUser.role !== 'professor') return

    const existing = assignments.find((assignment) => assignment.id === assignmentId)
    if (!existing || existing.createdBy !== activeUser.id) return

    setAssignments((current) =>
      current.filter((assignment) => assignment.id !== assignmentId),
    )
    setSubmissions((current) =>
      current.filter((submission) => submission.assignmentId !== assignmentId),
    )
    showToast('Assignment and its submissions were deleted.', 'info')
  }

  const handleAcknowledgeIndividual = (assignmentId: string) => {
    if (!activeUser || activeUser.role !== 'student') return

    const assignment = assignments.find((candidate) => candidate.id === assignmentId)
    if (!assignment || assignment.submissionType !== 'individual') return

    const course = courses.find((candidate) => candidate.id === assignment.courseId)
    if (!course || !course.enrolledStudentIds.includes(activeUser.id)) return

    const alreadySubmitted = findIndividualSubmission(
      submissions,
      assignmentId,
      activeUser.id,
    )
    if (alreadySubmitted) {
      showToast('You have already acknowledged this assignment.', 'info')
      return
    }

    const submission: Submission = {
      id: createId('submission'),
      assignmentId,
      userId: activeUser.id,
      status: 'submitted',
      timestamp: new Date().toISOString(),
    }

    setSubmissions((current) => [...current, submission])
    showToast('Your submission has been acknowledged.')
  }

  const handleAcknowledgeGroup = (assignmentId: string, groupId: string) => {
    if (!activeUser || activeUser.role !== 'student') return

    const assignment = assignments.find((candidate) => candidate.id === assignmentId)
    const group = groups.find((candidate) => candidate.id === groupId)
    if (!assignment || assignment.submissionType !== 'group' || !group) return
    if (group.courseId !== assignment.courseId) return

    if (group.leaderId !== activeUser.id) {
      showToast('Only the group leader can acknowledge this assignment.', 'error')
      return
    }

    const alreadySubmitted = findGroupSubmission(submissions, assignmentId, groupId)
    if (alreadySubmitted) {
      showToast('Your group has already been acknowledged.', 'info')
      return
    }

    const submission: Submission = {
      id: createId('submission'),
      assignmentId,
      groupId,
      userId: activeUser.id,
      status: 'submitted',
      timestamp: new Date().toISOString(),
      acknowledgedBy: activeUser.id,
    }

    setSubmissions((current) => [...current, submission])
    showToast(`Group "${group.name}" has been acknowledged.`)
  }

  const handleCreateGroup = (courseId: string, name: string): string | null => {
    if (!activeUser || activeUser.role !== 'student') {
      return 'Only students can create groups.'
    }

    const course = courses.find((candidate) => candidate.id === courseId)
    if (!course || !course.enrolledStudentIds.includes(activeUser.id)) {
      return 'You are not enrolled in this course.'
    }

    if (
      groups.some(
        (group) => group.courseId === courseId && group.memberIds.includes(activeUser.id),
      )
    ) {
      return 'You are already in a group for this course.'
    }

    const trimmed = name.trim()
    if (trimmed.length < 2) {
      return 'Group name must be at least 2 characters.'
    }

    if (
      groups.some(
        (group) =>
          group.courseId === courseId &&
          group.name.toLowerCase() === trimmed.toLowerCase(),
      )
    ) {
      return 'A group with that name already exists in this course.'
    }

    const group: Group = {
      id: createId('group'),
      courseId,
      name: trimmed,
      leaderId: activeUser.id,
      memberIds: [activeUser.id],
    }

    setGroups((current) => [...current, group])
    showToast(`Group "${trimmed}" created. You are the leader.`)
    return null
  }

  const handleJoinGroup = (groupId: string): string | null => {
    if (!activeUser || activeUser.role !== 'student') {
      return 'Only students can join groups.'
    }

    const group = groups.find((candidate) => candidate.id === groupId)
    if (!group) return 'That group could not be found.'

    const course = courses.find((candidate) => candidate.id === group.courseId)
    if (!course || !course.enrolledStudentIds.includes(activeUser.id)) {
      return 'You are not enrolled in this course.'
    }

    if (
      groups.some(
        (candidate) =>
          candidate.courseId === group.courseId &&
          candidate.memberIds.includes(activeUser.id),
      )
    ) {
      return 'You are already in a group for this course.'
    }

    setGroups((current) =>
      current.map((candidate) =>
        candidate.id === groupId
          ? { ...candidate, memberIds: [...candidate.memberIds, activeUser.id] }
          : candidate,
      ),
    )
    showToast(`You joined "${group.name}".`)
    return null
  }

  const handleLeaveGroup = (groupId: string): string | null => {
    if (!activeUser || activeUser.role !== 'student') {
      return 'Only students can leave groups.'
    }

    const group = groups.find((candidate) => candidate.id === groupId)
    if (!group) return 'That group could not be found.'

    if (group.leaderId === activeUser.id) {
      return 'Group leaders cannot leave their own group.'
    }

    if (!group.memberIds.includes(activeUser.id)) {
      return 'You are not a member of this group.'
    }

    setGroups((current) =>
      current.map((candidate) =>
        candidate.id === groupId
          ? {
              ...candidate,
              memberIds: candidate.memberIds.filter((id) => id !== activeUser.id),
            }
          : candidate,
      ),
    )
    showToast(`You left "${group.name}".`, 'info')
    return null
  }

  if (!activeUser) {
    return (
      <div className="min-h-screen">
        {authView === 'login' ? (
          <Login
            onLogin={handleLogin}
            onShowRegister={() => setAuthView('register')}
          />
        ) : (
          <Register
            onRegister={handleRegister}
            onShowLogin={() => setAuthView('login')}
          />
        )}
        <Toast toast={toast} onDismiss={() => setToast(null)} />
      </div>
    )
  }

  const activeCourse =
    view.name === 'course'
      ? courses.find((course) => course.id === view.courseId)
      : undefined

  const canAccessCourse =
    activeCourse !== undefined &&
    (activeUser.role === 'professor'
      ? activeCourse.professorId === activeUser.id
      : activeCourse.enrolledStudentIds.includes(activeUser.id))

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar
        user={activeUser}
        onHome={() => setView({ name: 'courses' })}
        onLogout={handleLogout}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {view.name === 'course' && activeCourse && canAccessCourse ? (
          activeUser.role === 'professor' ? (
            <ProfessorCourseAssignments
              key={activeCourse.id}
              professor={activeUser}
              course={activeCourse}
              assignments={assignments}
              groups={groups}
              submissions={submissions}
              users={users}
              onBack={() => setView({ name: 'courses' })}
              onCreate={handleCreateAssignment}
              onUpdate={handleUpdateAssignment}
              onDelete={handleDeleteAssignment}
            />
          ) : (
            <StudentCourseAssignments
              key={activeCourse.id}
              student={activeUser}
              course={activeCourse}
              assignments={assignments}
              groups={groups}
              submissions={submissions}
              users={users}
              onBack={() => setView({ name: 'courses' })}
              onAcknowledgeIndividual={handleAcknowledgeIndividual}
              onAcknowledgeGroup={handleAcknowledgeGroup}
              onCreateGroup={handleCreateGroup}
              onJoinGroup={handleJoinGroup}
              onLeaveGroup={handleLeaveGroup}
            />
          )
        ) : view.name === 'course' ? (
          <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center">
            <h2 className="text-lg font-semibold text-slate-900">Course unavailable</h2>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              This course could not be found, or you do not have access to it.
            </p>
            <button
              type="button"
              onClick={() => setView({ name: 'courses' })}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Back to my courses
            </button>
          </div>
        ) : activeUser.role === 'professor' ? (
          <ProfessorDashboard
            professor={activeUser}
            courses={courses}
            assignments={assignments}
            groups={groups}
            submissions={submissions}
            users={users}
            onOpenCourse={(courseId) => setView({ name: 'course', courseId })}
            loading={loading}
          />
        ) : (
          <StudentDashboard
            student={activeUser}
            courses={courses}
            assignments={assignments}
            groups={groups}
            submissions={submissions}
            users={users}
            onOpenCourse={(courseId) => setView({ name: 'course', courseId })}
            loading={loading}
          />
        )}
      </main>

      <footer className="border-t border-slate-200/70">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-slate-400 sm:flex-row sm:px-6 lg:px-8">
          <p>Joineazy · Course &amp; Assignment Management</p>
          <p className="inline-flex items-center gap-1.5">
            <Database className="h-3.5 w-3.5" />
            Demo data persists in your browser
          </p>
        </div>
      </footer>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}
