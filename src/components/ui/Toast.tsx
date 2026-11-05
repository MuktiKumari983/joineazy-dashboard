import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import type { ToastTone } from '../../types/dashboard'
import { cn } from '../../utils/helpers'

export interface ToastData {
  id: string
  message: string
  tone: ToastTone
}

interface ToastProps {
  toast: ToastData | null
  onDismiss: () => void
}

const toneConfig = {
  success: {
    Icon: CheckCircle2,
    iconClasses: 'bg-emerald-100 text-emerald-700',
    title: 'Success',
  },
  error: {
    Icon: AlertCircle,
    iconClasses: 'bg-rose-100 text-rose-700',
    title: 'Something went wrong',
  },
  info: {
    Icon: Info,
    iconClasses: 'bg-sky-100 text-sky-700',
    title: 'Heads up',
  },
} as const

/** Fixed-position toast used for all persistence actions. */
export function Toast({ toast, onDismiss }: ToastProps) {
  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex justify-end sm:inset-x-auto sm:right-6 sm:bottom-6">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-950/10"
            role="status"
            aria-live="polite"
          >
            <div
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                toneConfig[toast.tone].iconClasses,
              )}
            >
              {(() => {
                const Icon = toneConfig[toast.tone].Icon
                return <Icon className="h-5 w-5" />
              })()}
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-sm font-semibold text-slate-900">
                {toneConfig[toast.tone].title}
              </p>
              <p className="mt-0.5 text-sm leading-snug text-slate-500">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss notification"
              className="-mr-1 -mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
