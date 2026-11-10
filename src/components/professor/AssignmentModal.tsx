import { useId, useState, type FormEvent } from 'react'
import {
  CalendarClock,
  Check,
  FilePlus2,
  Link2,
  PencilLine,
  UserRound,
  UsersRound,
} from 'lucide-react'
import type { Assignment, AssignmentInput, SubmissionType } from '../../types/dashboard'
import {
  cn,
  fromDateTimeInputValue,
  isValidHttpUrl,
  toDateTimeInputValue,
} from '../../utils/helpers'
import { Modal } from '../ui/Modal'

interface AssignmentModalProps {
  open: boolean
  assignment: Assignment | null
  onClose: () => void
  onSave: (input: AssignmentInput) => void
}

type FormErrors = Partial<Record<'title' | 'deadline' | 'driveLink', string>>

const inputClasses =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 focus:outline-none'

const labelClasses = 'mb-1.5 block text-sm font-semibold text-slate-700'

const primaryButtonClasses =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:from-violet-700 hover:to-indigo-700'

const secondaryButtonClasses =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50'

function defaultDeadlineValue(): string {
  const date = new Date()
  date.setDate(date.getDate() + 7)
  date.setHours(23, 59, 0, 0)
  return toDateTimeInputValue(date.toISOString())
}

const submissionOptions: Array<{
  value: SubmissionType
  label: string
  description: string
  icon: typeof UserRound
}> = [
  {
    value: 'individual',
    label: 'Individual',
    description: 'Each student acknowledges their own submission.',
    icon: UserRound,
  },
  {
    value: 'group',
    label: 'Group',
    description: 'Only the group leader acknowledges for the whole team.',
    icon: UsersRound,
  },
]

/**
 * Create/edit form for professors. Mounted on demand so local form state always
 * initializes from the selected assignment.
 */
export function AssignmentModal({
  open,
  assignment,
  onClose,
  onSave,
}: AssignmentModalProps) {
  const formId = useId()
  const [title, setTitle] = useState(assignment?.title ?? '')
  const [description, setDescription] = useState(assignment?.description ?? '')
  const [deadline, setDeadline] = useState(
    assignment ? toDateTimeInputValue(assignment.deadline) : defaultDeadlineValue(),
  )
  const [driveLink, setDriveLink] = useState(assignment?.driveLink ?? '')
  const [submissionType, setSubmissionType] = useState<SubmissionType>(
    assignment?.submissionType ?? 'individual',
  )
  const [errors, setErrors] = useState<FormErrors>({})

  const isEditing = assignment !== null

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors: FormErrors = {}

    if (!title.trim()) nextErrors.title = 'Please enter an assignment title.'
    if (!deadline || Number.isNaN(new Date(deadline).getTime())) {
      nextErrors.deadline = 'Please choose a valid deadline.'
    }
    if (!isValidHttpUrl(driveLink.trim())) {
      nextErrors.driveLink = 'Enter a valid OneDrive link starting with http:// or https://.'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    onSave({
      title: title.trim(),
      description: description.trim(),
      deadline: fromDateTimeInputValue(deadline),
      driveLink: driveLink.trim(),
      submissionType,
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
          ? 'Update the assignment details, deadline, or submission type.'
          : 'Publish a new task to your course with a clear deadline and submission folder.'
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
            placeholder="e.g. Sprint 1: Architecture Review"
            className={cn(inputClasses, errors.title && 'border-rose-300 focus:ring-rose-100')}
            aria-invalid={Boolean(errors.title)}
          />
          {errors.title && (
            <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.title}</p>
          )}
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
            <label htmlFor={`${formId}-deadline`} className={labelClasses}>
              <span className="inline-flex items-center gap-1.5">
                <CalendarClock className="h-3.5 w-3.5 text-slate-400" />
                Deadline
              </span>
            </label>
            <input
              id={`${formId}-deadline`}
              type="datetime-local"
              value={deadline}
              onChange={(event) => {
                setDeadline(event.target.value)
                setErrors((current) => ({ ...current, deadline: undefined }))
              }}
              className={cn(
                inputClasses,
                '[color-scheme:light]',
                errors.deadline && 'border-rose-300 focus:ring-rose-100',
              )}
              aria-invalid={Boolean(errors.deadline)}
            />
            {errors.deadline && (
              <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.deadline}</p>
            )}
          </div>

          <div>
            <label htmlFor={`${formId}-link`} className={labelClasses}>
              <span className="inline-flex items-center gap-1.5">
                <Link2 className="h-3.5 w-3.5 text-slate-400" />
                OneDrive link
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
              placeholder="https://onedrive.live.com/..."
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

        <div>
          <p className={labelClasses}>Submission type</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {submissionOptions.map((option) => {
              const active = submissionType === option.value
              const Icon = option.icon

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSubmissionType(option.value)}
                  aria-pressed={active}
                  className={cn(
                    'flex items-start gap-3 rounded-xl border p-3 text-left transition',
                    active
                      ? 'border-violet-300 bg-violet-50/60 shadow-sm ring-2 ring-violet-100'
                      : 'border-slate-200 bg-white hover:border-slate-300',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                      active ? 'bg-violet-100 text-violet-600' : 'bg-slate-100 text-slate-500',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                      {option.label}
                      {active && <Check className="h-3.5 w-3.5 text-violet-600" />}
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
                      {option.description}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </form>
    </Modal>
  )
}
