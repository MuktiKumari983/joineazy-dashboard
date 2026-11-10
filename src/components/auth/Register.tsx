import { useId, useState, type FormEvent } from 'react'
import {
  Check,
  CircleAlert,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  UserPlus,
  UserRound,
} from 'lucide-react'
import type { RegisterInput, Role } from '../../types/dashboard'
import { cn, isValidEmail } from '../../utils/helpers'
import { AuthLayout } from './AuthLayout'

interface RegisterProps {
  onRegister: (input: RegisterInput) => Promise<string | null>
  onShowLogin: () => void
}

interface FormErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
  form?: string
}

const inputClasses =
  'w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-3 pl-10 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 focus:outline-none'

const labelClasses = 'mb-1.5 block text-sm font-semibold text-slate-700'

const roleOptions: Array<{
  value: Role
  label: string
  description: string
  icon: typeof GraduationCap
}> = [
  {
    value: 'student',
    label: 'Student',
    description: 'Join courses and submit assignments.',
    icon: GraduationCap,
  },
  {
    value: 'professor',
    label: 'Professor',
    description: 'Publish assignments and track progress.',
    icon: ShieldCheck,
  },
]

export function Register({ onRegister, onShowLogin }: RegisterProps) {
  const formId = useId()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<Role>('student')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)

  const clearError = (key: keyof FormErrors) => {
    setErrors((current) => ({ ...current, [key]: undefined, form: undefined }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (loading) return

    const nextErrors: FormErrors = {}
    if (name.trim().length < 2) nextErrors.name = 'Please enter your full name.'
    if (!isValidEmail(email)) nextErrors.email = 'Enter a valid email address.'
    if (password.length < 6) nextErrors.password = 'Use at least 6 characters.'
    if (confirmPassword !== password) nextErrors.confirmPassword = 'Passwords do not match.'

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setLoading(true)
    const error = await onRegister({
      name: name.trim(),
      email: email.trim(),
      password,
      role,
    })
    setLoading(false)
    if (error) setErrors({ form: error })
  }

  return (
    <AuthLayout
      badge="Get started"
      title="Create your account"
      subtitle="Choose your role and start managing courses, assignments, and groups."
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
          <label htmlFor={`${formId}-name`} className={labelClasses}>
            Full name
          </label>
          <div className="relative">
            <UserRound className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id={`${formId}-name`}
              value={name}
              onChange={(event) => {
                setName(event.target.value)
                clearError('name')
              }}
              autoComplete="name"
              placeholder="e.g. Jordan Lee"
              className={cn(
                inputClasses,
                errors.name && 'border-rose-300 focus:border-rose-400 focus:ring-rose-100',
              )}
              aria-invalid={Boolean(errors.name)}
            />
          </div>
          {errors.name && (
            <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor={`${formId}-email`} className={labelClasses}>
            Email address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id={`${formId}-email`}
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                clearError('email')
              }}
              autoComplete="email"
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

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={`${formId}-password`} className={labelClasses}>
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id={`${formId}-password`}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  clearError('password')
                }}
                autoComplete="new-password"
                placeholder="Min. 6 characters"
                className={cn(
                  inputClasses,
                  'pr-10',
                  errors.password && 'border-rose-300 focus:border-rose-400 focus:ring-rose-100',
                )}
                aria-invalid={Boolean(errors.password)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute top-1/2 right-1.5 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.password}</p>
            )}
          </div>

          <div>
            <label htmlFor={`${formId}-confirm`} className={labelClasses}>
              Confirm password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id={`${formId}-confirm`}
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value)
                  clearError('confirmPassword')
                }}
                autoComplete="new-password"
                placeholder="Repeat password"
                className={cn(
                  inputClasses,
                  errors.confirmPassword &&
                    'border-rose-300 focus:border-rose-400 focus:ring-rose-100',
                )}
                aria-invalid={Boolean(errors.confirmPassword)}
              />
            </div>
            {errors.confirmPassword && (
              <p className="mt-1.5 text-xs font-medium text-rose-600">
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </div>

        <div>
          <p className={labelClasses}>I am a</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {roleOptions.map((option) => {
              const active = role === option.value
              const Icon = option.icon

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRole(option.value)}
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

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:from-violet-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              Create account
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onShowLogin}
          className="font-semibold text-violet-600 transition hover:text-violet-800"
        >
          Sign in
        </button>
      </p>
    </AuthLayout>
  )
}
