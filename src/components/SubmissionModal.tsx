import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  CheckCircle2,
  CloudUpload,
  ExternalLink,
  Loader2,
  ShieldCheck,
} from 'lucide-react'
import type { Assignment } from '../types/dashboard'
import { cn, formatDate } from '../utils/helpers'
import { Modal } from './ui/Modal'

interface SubmissionModalProps {
  assignment: Assignment | null
  onClose: () => void
  onConfirm: (assignmentId: string) => void
}

const primaryButtonClasses =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:from-violet-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-70'

const secondaryButtonClasses =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60'

/**
 * Two-step submission confirmation. The component is mounted only while an
 * assignment is selected, so the flow always starts at step 1.
 */
export function SubmissionModal({ assignment, onClose, onConfirm }: SubmissionModalProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [submitting, setSubmitting] = useState(false)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    }
  }, [])

  const open = assignment !== null

  const handleClose = () => {
    if (!submitting) onClose()
  }

  const handleConfirm = () => {
    if (!assignment || submitting) return

    setSubmitting(true)
    timerRef.current = window.setTimeout(() => {
      onConfirm(assignment.id)
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
          Yes, I have submitted my work to Google Drive
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
              Submitting...
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
      title="Submit assignment"
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
                    Due {formatDate(assignment.dueDate)}
                  </p>
                </div>

                <p className="text-sm leading-relaxed text-slate-600">
                  Please confirm that you have uploaded your completed work to the class
                  Google Drive folder. Your professor will be notified once you confirm.
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
                    <span className="truncate">Open the Drive submission folder</span>
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
                      Final Confirmation: Are you sure?
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-amber-800">
                      This will mark the assignment as{' '}
                      <span className="font-semibold">Submitted</span> and share your status
                      with the professor immediately.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                    You are submitting
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {assignment.title}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </Modal>
  )
}
