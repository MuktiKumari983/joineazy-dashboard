import { GraduationCap, LayoutDashboard, LogOut } from 'lucide-react'
import type { User } from '../types/dashboard'
import { Avatar } from './ui/Avatar'
import { RoleTag } from './ui/RoleTag'

interface NavbarProps {
  user: User
  onHome: () => void
  onLogout: () => void
}

/** Sticky authenticated header with the signed-in user and logout action. */
export function Navbar({ user, onHome, onLogout }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onHome}
          className="flex min-w-0 items-center gap-3 rounded-xl text-left transition hover:opacity-90"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/25">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold tracking-tight text-slate-900">
              Joineazy
            </p>
            <p className="hidden truncate text-xs text-slate-500 sm:block">
              Course &amp; assignment workspace
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onHome}
            className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 sm:inline-flex"
          >
            <LayoutDashboard className="h-4 w-4" />
            My courses
          </button>

          <div className="hidden flex-col items-end gap-0.5 md:flex">
            <span className="max-w-[11rem] truncate text-sm font-semibold text-slate-800">
              {user.name}
            </span>
            <span className="max-w-[11rem] truncate text-[11px] text-slate-400">
              {user.email}
            </span>
          </div>

          <RoleTag role={user.role} className="hidden sm:inline-flex" />

          <Avatar name={user.name} color={user.avatarColor} size="md" />

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 sm:px-3"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}
