import { Check, GraduationCap, ShieldCheck, Users } from 'lucide-react'
import type { User } from '../types/dashboard'
import { cn } from '../utils/helpers'
import { Avatar } from './ui/Avatar'
import { RoleTag } from './ui/RoleTag'

interface NavbarProps {
  users: User[]
  activeUser: User
  onSwitchUser: (userId: string) => void
}

interface UserChipProps {
  user: User
  active: boolean
  onSelect: (userId: string) => void
}

function UserChip({ user, active, onSelect }: UserChipProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(user.id)}
      aria-pressed={active}
      title={`${user.name} · ${user.role === 'admin' ? 'Professor' : 'Student'}`}
      className={cn(
        'group flex shrink-0 items-center gap-2 rounded-full border py-1 pr-3 pl-1 text-xs font-medium transition-all duration-200',
        active
          ? 'border-violet-300 bg-violet-50 text-violet-900 shadow-sm shadow-violet-600/10'
          : 'border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:bg-violet-50/60 hover:text-slate-900',
      )}
    >
      <Avatar
        name={user.name}
        color={user.avatarColor}
        size="xs"
        ring={false}
        className={cn('h-6 w-6', active && 'ring-2 ring-violet-200')}
      />
      <span className="max-w-[7.5rem] truncate whitespace-nowrap">{user.name}</span>
      {active && <Check className="h-3.5 w-3.5 text-violet-600" />}
    </button>
  )
}

/**
 * Sticky header with a live role switcher. All seven users are always one click
 * away, grouped by role so the demo is easy to explore on any screen size.
 */
export function Navbar({ users, activeUser, onSwitchUser }: NavbarProps) {
  const admins = users.filter((user) => user.role === 'admin')
  const students = users.filter((user) => user.role === 'student')

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/25">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-bold tracking-tight text-slate-900">
                Joineazy
              </p>
              <p className="hidden truncate text-xs text-slate-500 sm:block">
                Assignment &amp; Review Dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end gap-1">
              <p className="hidden text-[10px] font-semibold tracking-[0.18em] text-slate-400 uppercase sm:block">
                Viewing as
              </p>
              <div className="flex flex-col items-end gap-0.5 sm:flex-row sm:items-center sm:gap-2">
                <span className="max-w-[6rem] truncate text-xs font-semibold text-slate-800 sm:max-w-[11rem] sm:text-sm">
                  {activeUser.name}
                </span>
                <RoleTag role={activeUser.role} />
              </div>
            </div>
            <Avatar name={activeUser.name} color={activeUser.avatarColor} size="md" />
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-slate-100 py-2.5">
          <div className="hidden shrink-0 items-center gap-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase sm:flex">
            <Users className="h-3.5 w-3.5" />
            Switch role
          </div>

          <div className="scrollbar-none flex flex-1 items-center gap-2 overflow-x-auto py-0.5">
            <div className="flex items-center gap-2" aria-label="Professor accounts">
              <ShieldCheck
                className="hidden h-3.5 w-3.5 shrink-0 text-violet-400 md:block"
                aria-hidden="true"
              />
              {admins.map((user) => (
                <UserChip
                  key={user.id}
                  user={user}
                  active={user.id === activeUser.id}
                  onSelect={onSwitchUser}
                />
              ))}
            </div>

            <span className="h-6 w-px shrink-0 bg-slate-200" aria-hidden="true" />

            <div className="flex items-center gap-2" aria-label="Student accounts">
              <GraduationCap
                className="hidden h-3.5 w-3.5 shrink-0 text-sky-400 md:block"
                aria-hidden="true"
              />
              {students.map((user) => (
                <UserChip
                  key={user.id}
                  user={user}
                  active={user.id === activeUser.id}
                  onSelect={onSwitchUser}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
