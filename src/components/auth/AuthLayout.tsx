import type { ReactNode } from 'react'
import {
  BookOpenCheck,
  CheckCircle2,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from 'lucide-react'

interface AuthLayoutProps {
  children: ReactNode
  badge: string
  title: string
  subtitle: string
}

const highlights = [
  {
    icon: BookOpenCheck,
    title: 'Course workspaces',
    description: 'Assignments, deadlines, and OneDrive links in one place.',
  },
  {
    icon: UsersRound,
    title: 'Group acknowledgments',
    description: 'Leaders submit once and the whole team stays in sync.',
  },
  {
    icon: ShieldCheck,
    title: 'Live tracking',
    description: 'Professors see exactly who has submitted and who has not.',
  },
]

/** Shared split-screen shell for the login and registration screens. */
export function AuthLayout({ children, badge, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-violet-700 via-indigo-700 to-blue-700 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div className="pointer-events-none absolute -top-24 -right-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-16 h-80 w-80 rounded-full bg-sky-300/20 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/25 backdrop-blur">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-bold tracking-tight">Joineazy</p>
            <p className="text-xs text-violet-100">Student &amp; course workspace</p>
          </div>
        </div>

        <div className="relative max-w-lg">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/20 ring-inset">
            <Sparkles className="h-3.5 w-3.5" />
            Round 2 assignment management
          </span>
          <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight xl:text-4xl">
            One workspace for courses, groups, and submissions.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-violet-100">
            Sign in as a professor to publish assignments and track progress, or as a
            student to acknowledge your work individually or as a group.
          </p>

          <ul className="mt-8 space-y-4">
            {highlights.map(({ icon: Icon, title: highlightTitle, description }) => (
              <li key={highlightTitle} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
                  <Icon className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-sm font-semibold">{highlightTitle}</span>
                  <span className="block text-xs leading-relaxed text-violet-100">
                    {description}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative inline-flex items-center gap-2 text-xs text-violet-100">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Demo data persists in your browser only.
        </p>
      </aside>

      <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/25">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight text-slate-900">Joineazy</p>
              <p className="text-xs text-slate-500">Student &amp; course workspace</p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-950/5 sm:p-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 ring-1 ring-violet-100 ring-inset">
              {badge}
            </span>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">{subtitle}</p>

            <div className="mt-6">{children}</div>
          </div>
        </div>
      </main>
    </div>
  )
}
