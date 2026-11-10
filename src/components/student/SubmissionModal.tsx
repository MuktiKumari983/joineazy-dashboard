import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  CheckCircle2,
  CloudUpload,
  ExternalLink,
  Loader2,
  ShieldCheck,
  UserRound,
  UsersRound,
} from 'lucide-react'
import type { Assignment, Group } from '../../types/dashboard'
import { cn, formatDeadline } from '../../utils/helpers'
import { Modal } from '../ui/Modal'

interface SubmissionModalProps {
  assignment: Assignment | null
  group?: Group
  onClose: () => void
  onConfirm: () => void
}

const primaryButtonClasses =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:from-violet-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-70'

const secondaryButtonClasses =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60'

/**
 * Two-step acknowledgment. Individual students confirm their own submission;
 * group leaders confirm on behalf of the whole group.
 */
export function SubmissionModal({
  assignment,
  group,
  onClose,
  onConfirm,
}: SubmissionModalProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [submitting, setSubmitting] = useState(false)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    }
  }, [])

  const open = assignment !== null
  const isGroup = Boolean(group)
  const Icon = isGroup ? UsersRound : UserRound

  const handleClose = () => {
    if (!submitting) onClose()
  }

  const handleConfirm = () => {
    if (!assignment || submitting) return

    setSubmitting(true)
    timerRef.current = window.setTimeout(() => {
      onConfirm()
      setSubmitting(false)
      onClose()
    }, 550)
  }

  const footer =
    step === 1 ? (
      <>
        <button type="button" className={secondaryButtonClasses} onClick={handleClose}>
          Cancel
        </button>
        <button type="button" className={primaryButtonClasses} onClick={() => setStep(2)}>
          <CloudUpload className="h-4 w-4" />
          {isGroup
            ? 'Yes, our group has submitted'
            : 'Yes, I have submitted my work to OneDrive'}
        </button>
      </>
    ) : (
      <>
        <button
          type="button"
          className={secondaryButtonClasses}
          onClick={() => setStep(1)}
          disabled={submitting}
        >
          <ArrowLeft className="h-4 w-4" />
          Go back
        </button>
        <button
          type="button"
          className={cn(
            primaryButtonClasses,
            'bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-700',
          )}
          onClick={handleConfirm}
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Confirming...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Confirm submission
            </>
          )}
        </button>
      </>
    )

  return (
    <Modal
      open={open}
      onClose={handleClose}
      size="md"
      icon={<CloudUpload className="h-5 w-5" />}
      title={isGroup ? 'Acknowledge group submission' : 'Acknowledge submission'}
      description="Two quick checks before your status is updated."
      footer={footer}
    >
      {assignment && (
        <div>
          <div className="mb-5 flex items-center gap-2">
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Step {step} of 2
            </span>
            <div className="flex flex-1 gap-1.5">
              <span
                className={cn(
                  'h-1.5 flex-1 rounded-full transition-colors',
                  step >= 1 ? 'bg-violet-500' : 'bg-slate-200',
                )}
              />
              <span
                className={cn(
                  'h-1.5 flex-1 rounded-full transition-colors',
                  step >= 2 ? 'bg-violet-500' : 'bg-slate-200',
                )}
              />
            </div>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {step === 1 ? (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-4">
                  <p className="text-xs font-semibold tracking-wide text-violet-600 uppercase">
                    Assignment
                  </p>
                  <p className="mt-1 text-base font-semibold text-slate-900">
                    {assignment.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Deadline {formatDeadline(assignment.deadline)}
                  </p>
                  {group && (
                    <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-1 text-xs font-semibold text-violet-700 ring-1 ring-violet-200 ring-inset">
                      <UsersRound className="h-3.5 w-3.5" />
                      {group.name}
                    </p>
                  )}
                </div>

                <p className="text-sm leading-relaxed text-slate-600">
                  {isGroup
                    ? 'Confirm that your group has uploaded the completed work to the OneDrive folder. This will acknowledge the submission for every member of the group.'
                    : 'Please confirm that you have uploaded your completed work to the OneDrive folder. Your professor will see the acknowledgment immediately.'}
                </p>

                <a
                  href={assignment.driveLink}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-violet-200 hover:bg-violet-50/40"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <CloudUpload className="h-4 w-4" />
                    </span>
                    <span className="truncate">Open the OneDrive submission folder</span>
                  </span>
                  <ExternalLink className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-violet-500" />
                </a>
              </motion.div>
            ) : (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900">
                      Final confirmation: are you sure?
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-amber-800">
                      {isGroup ? (
                        <>
                          This will mark{' '}
                          <span className="font-semibold">{group?.name}</span> as{' '}
                          <span className="font-semibold">Submitted</span> for all group
                          members and notify your professor.
                        </>
                      ) : (
                        <>
                          This will mark the assignment as{' '}
                          <span className="font-semibold">Submitted</span> and share your
                          status with the professor immediately.
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 ring-1 ring-slate-200">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                      You are acknowledging
                    </p>
                    <p className="mt-0.5 truncate text-sm font-semibold text-slate-900">
                      {assignment.title}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </Modal>
  )
}
