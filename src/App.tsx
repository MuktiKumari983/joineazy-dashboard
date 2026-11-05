import { useEffect, useMemo, useState } from 'react'
import { Database } from 'lucide-react'
import type {
  Assignment,
  AssignmentInput,
  Submission,
  ToastTone,
} from './types/dashboard'
import { createId } from './utils/helpers'
import {
  loadDashboard,
  saveActiveUserId,
  saveAssignments,
  saveSubmissions,
} from './utils/storage'
import { AdminDashboard } from './components/AdminDashboard'
import { Navbar } from './components/Navbar'
import { StudentDashboard } from './components/StudentDashboard'
import { Toast, type ToastData } from './components/ui/Toast'

/** Loaded once on boot; seeds localStorage if this is the first visit. */
const initialData = loadDashboard()

export default function App() {
  const users = initialData.users
  const [assignments, setAssignments] = useState<Assignment[]>(initialData.assignments)
  const [submissions, setSubmissions] = useState<Submission[]>(initialData.submissions)
  const [activeUserId, setActiveUserId] = useState(initialData.activeUserId)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<ToastData | null>(null)

  const activeUser = useMemo(
    () =>
      users.find((user) => user.id === activeUserId) ??
      users.find((user) => user.id === 'student-1') ??
      users[0],
    [users, activeUserId],
  )

  // Short skeleton state so first paint feels considered rather than abrupt.
  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 600)
    return () => window.clearTimeout(timer)
  }, [])

  // Keep localStorage in sync with every state change.
  useEffect(() => {
    saveAssignments(assignments)
  }, [assignments])

  useEffect(() => {
    saveSubmissions(submissions)
  }, [submissions])

  useEffect(() => {
    saveActiveUserId(activeUserId)
  }, [activeUserId])

  // Auto-dismiss toast notifications.
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 3400)
    return () => window.clearTimeout(timer)
  }, [toast])

  const showToast = (message: string, tone: ToastTone = 'success') => {
    setToast({ id: createId('toast'), message, tone })
  }

  const handleSwitchUser = (userId: string) => {
    if (userId === activeUserId) return
    setActiveUserId(userId)
  }

  const handleSubmitAssignment = (assignmentId: string) => {
    if (!activeUser || activeUser.role !== 'student') return

    const studentId = activeUser.id

    setSubmissions((current) => {
      const alreadySubmitted = current.some(
        (submission) =>
          submission.assignmentId === assignmentId && submission.studentId === studentId,
      )
      if (alreadySubmitted) return current

      return [
        ...current,
        {
          id: createId('submission'),
          assignmentId,
          studentId,
          submittedAt: new Date().toISOString(),
        },
      ]
    })

    showToast('Your assignment has been marked as submitted.')
  }

  const handleCreateAssignment = (input: AssignmentInput) => {
    if (!activeUser || activeUser.role !== 'admin') return

    const now = new Date().toISOString()
    const assignment: Assignment = {
      ...input,
      id: createId('assignment'),
      createdBy: activeUser.id,
      createdAt: now,
      updatedAt: now,
    }

    setAssignments((current) => [assignment, ...current])
    showToast('Assignment created and shared with your students.')
  }

  const handleUpdateAssignment = (assignmentId: string, input: AssignmentInput) => {
    setAssignments((current) =>
      current.map((assignment) =>
        assignment.id === assignmentId
          ? { ...assignment, ...input, updatedAt: new Date().toISOString() }
          : assignment,
      ),
    )

    // If allocation changes, drop submissions from students who are no longer
    // part of the assignment so analytics stay accurate.
    if (!input.assignToAll) {
      const allowedStudents = new Set(input.assignedTo)
      setSubmissions((current) =>
        current.filter(
          (submission) =>
            submission.assignmentId !== assignmentId ||
            allowedStudents.has(submission.studentId),
        ),
      )
    }

    showToast('Assignment updated successfully.')
  }

  const handleDeleteAssignment = (assignmentId: string) => {
    setAssignments((current) =>
      current.filter((assignment) => assignment.id !== assignmentId),
    )
    setSubmissions((current) =>
      current.filter((submission) => submission.assignmentId !== assignmentId),
    )
    showToast('Assignment and its submissions were deleted.', 'info')
  }

  if (!activeUser) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-sm text-slate-500">
        Unable to load dashboard users.
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar users={users} activeUser={activeUser} onSwitchUser={handleSwitchUser} />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {activeUser.role === 'student' ? (
          <StudentDashboard
            key={activeUser.id}
            student={activeUser}
            assignments={assignments}
            submissions={submissions}
            onSubmit={handleSubmitAssignment}
            loading={loading}
          />
        ) : (
          <AdminDashboard
            key={activeUser.id}
            admin={activeUser}
            assignments={assignments}
            submissions={submissions}
            users={users}
            onCreate={handleCreateAssignment}
            onUpdate={handleUpdateAssignment}
            onDelete={handleDeleteAssignment}
            loading={loading}
          />
        )}
      </main>

      <footer className="border-t border-slate-200/70">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-slate-400 sm:flex-row sm:px-6 lg:px-8">
          <p>Joineazy · Assignment &amp; Review Dashboard</p>
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
