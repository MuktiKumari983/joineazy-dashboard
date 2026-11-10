import { useId, useState, type FormEvent } from 'react'
import {
  ArrowRight,
  CircleAlert,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { DEMO_ACCOUNTS } from '../../utils/storage'
import { cn, isValidEmail } from '../../utils/helpers'
import { AuthLayout } from './AuthLayout'

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<string | null>
  onShowRegister: () => void
}

interface FormErrors {
  email?: string
  password?: string
  form?: string
}

const inputClasses =
  'w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-3 pl-10 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 focus:outline-none'

const labelClasses = 'mb-1.5 block text-sm font-semibold text-slate-700'

export function Login({ onLogin, onShowRegister }: LoginProps) {
  const formId = useId()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (loading) return

    const nextErrors: FormErrors = {}
    if (!isValidEmail(email)) nextErrors.email = 'Enter a valid email address.'
    if (password.length < 6) nextErrors.password = 'Password must be at least 6 characters.'

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setLoading(true)
    const error = await onLogin(email, password)
    setLoading(false)
    if (error) setErrors({ form: error })
  }

  const fillDemo = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
    setErrors({})
  }

  return (
    <AuthLayout
      badge="Welcome back"
      title="Sign in to Joineazy"
      subtitle="Access your courses, assignments, and group submissions."
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {errors.form && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
          >
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="leading-relaxed">{errors.form}</p>
          </div>
        )}

        <div>
          <label htmlFor={`${formId}-email`} className={labelClasses}>
            Email address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id={`${formId}-email`}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                setErrors((current) => ({ ...current, email: undefined, form: undefined }))
              }}
              placeholder="you@joineazy.edu"
              className={cn(
                inputClasses,
                errors.email && 'border-rose-300 focus:border-rose-400 focus:ring-rose-100',
              )}
              aria-invalid={Boolean(errors.email)}
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor={`${formId}-password`} className={labelClasses}>
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id={`${formId}-password`}
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                setErrors((current) => ({ ...current, password: undefined, form: undefined }))
              }}
              placeholder="Enter your password"
              className={cn(
                inputClasses,
                'pr-11',
                errors.password && 'border-rose-300 focus:border-rose-400 focus:ring-rose-100',
              )}
              aria-invalid={Boolean(errors.password)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute top-1/2 right-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:from-violet-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              Sign in
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6">
        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-slate-200" />
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            <Sparkles className="h-3 w-3" />
            Try a demo account
          </span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <div className="mt-3 grid gap-2">
          {DEMO_ACCOUNTS.slice(0, 2).map((account) => {
            const isProfessor = account.role === 'professor'
            const Icon = isProfessor ? ShieldCheck : GraduationCap

            return (
              <button
                key={account.email}
                type="button"
                onClick={() => fillDemo(account.email, account.password)}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-violet-200 hover:bg-violet-50/50"
              >
                <span
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                    isProfessor
                      ? 'bg-violet-100 text-violet-600'
                      : 'bg-sky-100 text-sky-600',
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-slate-800">
                    {account.name}
                  </span>
                  <span className="block truncate text-[11px] text-slate-400">
                    {account.email}
                  </span>
                </span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 capitalize">
                  {account.role}
                </span>
              </button>
            )
          })}
        </div>
        <p className="mt-2 text-center text-[11px] text-slate-400">
          Demo password for every account: <span className="font-semibold">password123</span>
        </p>
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        New to Joineazy?{' '}
        <button
          type="button"
          onClick={onShowRegister}
          className="font-semibold text-violet-600 transition hover:text-violet-800"
        >
          Create an account
        </button>
      </p>
    </AuthLayout>
  )
}
