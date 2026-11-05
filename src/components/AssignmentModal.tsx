import { useId, useState, type FormEvent } from 'react'
import { CalendarDays, Check, FilePlus2, Link2, PencilLine, UsersRound, UserRound } from 'lucide-react'
import type { Assignment, AssignmentInput, User } from '../types/dashboard'
import { cn, isValidHttpUrl } from '../utils/helpers'
import { Avatar } from './ui/Avatar'
import { Modal } from './ui/Modal'

interface AssignmentModalProps {
  open: boolean
  assignment: Assignment | null
  students: User[]
  onClose: () => void
  onSave: (input: AssignmentInput) => void
}

type FormErrors = Partial<Record<'title' | 'dueDate' | 'driveLink' | 'assignedTo', string>>

const inputClasses =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 focus:outline-none'

const labelClasses = 'mb-1.5 block text-sm font-semibold text-slate-700'

const primaryButtonClasses =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:from-violet-700 hover:to-indigo-700'

const secondaryButtonClasses =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50'

/**
 * Create/edit form for professors. The component is mounted on demand so its
 * local form state always initializes from the selected assignment.
 */
export function AssignmentModal({
  open,
  assignment,
  students,
  onClose,
  onSave,
}: AssignmentModalProps) {
  const formId = useId()
  const [title, setTitle] = useState(assignment?.title ?? '')
  const [description, setDescription] = useState(assignment?.description ?? '')
  const [dueDate, setDueDate] = useState(assignment?.dueDate ?? '')
  const [driveLink, setDriveLink] = useState(assignment?.driveLink ?? '')
  const [assignToAll, setAssignToAll] = useState(assignment?.assignToAll ?? true)
  const [assignedTo, setAssignedTo] = useState<string[]>(assignment?.assignedTo ?? [])
  const [errors, setErrors] = useState<FormErrors>({})

  const isEditing = assignment !== null
  const allSelected = students.length > 0 && assignedTo.length === students.length

  const toggleStudent = (studentId: string) => {
    setAssignedTo((current) =>
      current.includes(studentId)
        ? current.filter((id) => id !== studentId)
        : [...current, studentId],
    )
    setErrors((current) => ({ ...current, assignedTo: undefined }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors: FormErrors = {}

    if (!title.trim()) nextErrors.title = 'Please enter an assignment title.'
    if (!dueDate) nextErrors.dueDate = 'Please choose a due date.'
    if (!isValidHttpUrl(driveLink.trim())) {
      nextErrors.driveLink = 'Enter a valid link that starts with http:// or https://.'
    }
    if (!assignToAll && assignedTo.length === 0) {
      nextErrors.assignedTo = 'Select at least one student, or assign to the whole class.'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    onSave({
      title: title.trim(),
      description: description.trim(),
      dueDate,
      driveLink: driveLink.trim(),
      assignToAll,
      assignedTo: assignToAll ? [] : assignedTo,
    })
  }

  const footer = (
    <>
      <button type="button" className={secondaryButtonClasses} onClick={onClose}>
        Cancel
      </button>
      <button type="submit" form={formId} className={primaryButtonClasses}>
        {isEditing ? <PencilLine className="h-4 w-4" /> : <FilePlus2 className="h-4 w-4" />}
        {isEditing ? 'Save changes' : 'Create assignment'}
      </button>
    </>
  )

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      icon={isEditing ? <PencilLine className="h-5 w-5" /> : <FilePlus2 className="h-5 w-5" />}
      title={isEditing ? 'Edit assignment' : 'Create assignment'}
      description={
        isEditing
          ? 'Update the details or change which students are assigned.'
          : 'Share a new task with your class and set a clear deadline.'
      }
      footer={footer}
    >
      <form id={formId} onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label htmlFor={`${formId}-title`} className={labelClasses}>
            Assignment title
          </label>
          <input
            id={`${formId}-title`}
            value={title}
            onChange={(event) => {
              setTitle(event.target.value)
              setErrors((current) => ({ ...current, title: undefined }))
            }}
            placeholder="e.g. Binary Search Trees Lab"
            className={cn(inputClasses, errors.title && 'border-rose-300 focus:ring-rose-100')}
            aria-invalid={Boolean(errors.title)}
          />
          {errors.title && <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.title}</p>}
        </div>

        <div>
          <label htmlFor={`${formId}-description`} className={labelClasses}>
            Description
          </label>
          <textarea
            id={`${formId}-description`}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            placeholder="Explain the task, deliverables, and any submission requirements..."
            className={cn(inputClasses, 'resize-none leading-relaxed')}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={`${formId}-due`} className={labelClasses}>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                Due date
              </span>
            </label>
            <input
              id={`${formId}-due`}
              type="date"
              value={dueDate}
              onChange={(event) => {
                setDueDate(event.target.value)
                setErrors((current) => ({ ...current, dueDate: undefined }))
              }}
              className={cn(
                inputClasses,
                '[color-scheme:light]',
                errors.dueDate && 'border-rose-300 focus:ring-rose-100',
              )}
              aria-invalid={Boolean(errors.dueDate)}
            />
            {errors.dueDate && (
              <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.dueDate}</p>
            )}
          </div>

          <div>
            <label htmlFor={`${formId}-link`} className={labelClasses}>
              <span className="inline-flex items-center gap-1.5">
                <Link2 className="h-3.5 w-3.5 text-slate-400" />
                Submission drive link
              </span>
            </label>
            <input
              id={`${formId}-link`}
              type="url"
              value={driveLink}
              onChange={(event) => {
                setDriveLink(event.target.value)
                setErrors((current) => ({ ...current, driveLink: undefined }))
              }}
              placeholder="https://drive.google.com/..."
              className={cn(
                inputClasses,
                errors.driveLink && 'border-rose-300 focus:ring-rose-100',
              )}
              aria-invalid={Boolean(errors.driveLink)}
            />
            {errors.driveLink && (
              <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.driveLink}</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
          <p className={labelClasses}>Assign to</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setAssignToAll(true)}
              aria-pressed={assignToAll}
              className={cn(
                'flex items-start gap-3 rounded-xl border p-3 text-left transition',
                assignToAll
                  ? 'border-violet-300 bg-white shadow-sm ring-2 ring-violet-100'
                  : 'border-slate-200 bg-white/70 hover:border-slate-300',
              )}
            >
              <span
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                  assignToAll ? 'bg-violet-100 text-violet-600' : 'bg-slate-100 text-slate-500',
                )}
              >
                <UsersRound className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-slate-900">All students</span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  Every student ({students.length}) is assigned.
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAssignToAll(false)
                if (assignedTo.length === 0) {
                  setAssignedTo(students.map((student) => student.id))
                }
              }}
              aria-pressed={!assignToAll}
              className={cn(
                'flex items-start gap-3 rounded-xl border p-3 text-left transition',
                !assignToAll
                  ? 'border-violet-300 bg-white shadow-sm ring-2 ring-violet-100'
                  : 'border-slate-200 bg-white/70 hover:border-slate-300',
              )}
            >
              <span
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                  !assignToAll ? 'bg-violet-100 text-violet-600' : 'bg-slate-100 text-slate-500',
                )}
              >
                <UserRound className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-slate-900">
                  Specific students
                </span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  Choose who receives this assignment.
                </span>
              </span>
            </button>
          </div>

          {!assignToAll && (
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Selected {assignedTo.length} of {students.length}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setAssignedTo(
                      allSelected ? [] : students.map((student) => student.id),
                    )
                  }
                  className="text-xs font-semibold text-violet-600 transition hover:text-violet-800"
                >
                  {allSelected ? 'Clear all' : 'Select all'}
                </button>
              </div>

              <div className="grid max-h-52 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                {students.map((student) => {
                  const selected = assignedTo.includes(student.id)

                  return (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => toggleStudent(student.id)}
                      aria-pressed={selected}
                      className={cn(
                        'flex items-center gap-2.5 rounded-xl border bg-white p-2.5 text-left transition',
                        selected
                          ? 'border-violet-300 bg-violet-50/50'
                          : 'border-slate-200 hover:border-slate-300',
                      )}
                    >
                      <Avatar
                        name={student.name}
                        color={student.avatarColor}
                        size="sm"
                        ring={false}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-slate-800">
                          {student.name}
                        </span>
                        <span className="block truncate text-[11px] text-slate-400">
                          {student.email}
                        </span>
                      </span>
                      <span
                        className={cn(
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition',
                          selected
                            ? 'border-violet-500 bg-violet-500 text-white'
                            : 'border-slate-300 bg-white',
                        )}
                      >
                        {selected && <Check className="h-3 w-3" />}
                      </span>
                    </button>
                  )
                })}
              </div>

              {errors.assignedTo && (
                <p className="mt-2 text-xs font-medium text-rose-600">{errors.assignedTo}</p>
              )}
            </div>
          )}
        </div>
      </form>
    </Modal>
  )
}
