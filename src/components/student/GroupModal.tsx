import { useId, useState, type FormEvent } from 'react'
import {
  Check,
  CircleAlert,
  Crown,
  DoorOpen,
  UserPlus,
  UsersRound,
} from 'lucide-react'
import type { Course, Group, User } from '../../types/dashboard'
import {
  cn,
  getCourseGroups,
  getFirstName,
  getGroupMembers,
  getUserGroup,
} from '../../utils/helpers'
import { Avatar } from '../ui/Avatar'
import { Modal } from '../ui/Modal'

interface GroupModalProps {
  open: boolean
  course: Course
  student: User
  groups: Group[]
  users: User[]
  onClose: () => void
  onCreate: (name: string) => string | null
  onJoin: (groupId: string) => string | null
  onLeave: (groupId: string) => string | null
}

const inputClasses =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 focus:outline-none'

const primaryButtonClasses =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:from-violet-700 hover:to-indigo-700'

/**
 * Create or join a group for a course. Students already in a group see the
 * roster, leader, and can leave (unless they are the leader).
 */
export function GroupModal({
  open,
  course,
  student,
  groups,
  users,
  onClose,
  onCreate,
  onJoin,
  onLeave,
}: GroupModalProps) {
  const formId = useId()
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const currentGroup = getUserGroup(groups, course.id, student.id)
  const courseGroups = getCourseGroups(groups, course.id)
  const isLeader = currentGroup?.leaderId === student.id

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmed = name.trim()
    if (trimmed.length < 2) {
      setError('Please enter a group name with at least 2 characters.')
      return
    }

    const result = onCreate(trimmed)
    if (result) {
      setError(result)
      return
    }

    setError(null)
    onClose()
  }

  const handleJoin = (groupId: string) => {
    const result = onJoin(groupId)
    if (result) {
      setError(result)
      return
    }

    setError(null)
    onClose()
  }

  const handleLeave = (groupId: string) => {
    const result = onLeave(groupId)
    if (result) {
      setError(result)
      return
    }

    setError(null)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      icon={<UsersRound className="h-5 w-5" />}
      title={currentGroup ? 'Your group' : 'Create or join a group'}
      description={
        currentGroup
          ? `${currentGroup.name} · ${course.name}`
          : `Group assignments in ${course.name} require a team. Create a new group or join an existing one.`
      }
    >
      <div className="space-y-5">
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
          >
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="leading-relaxed">{error}</p>
          </div>
        )}

        {currentGroup ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-violet-100 bg-violet-50/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-violet-600 ring-1 ring-violet-200">
                    <UsersRound className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-base font-semibold text-slate-900">
                      {currentGroup.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {currentGroup.memberIds.length} member
                      {currentGroup.memberIds.length === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>

                {isLeader ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-800 ring-1 ring-amber-200 ring-inset">
                    <Crown className="h-3.5 w-3.5" />
                    You are the leader
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200 ring-inset">
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    You are a member
                  </span>
                )}
              </div>

              <ul className="mt-4 space-y-2">
                {getGroupMembers(currentGroup, users).map((member) => {
                  const memberIsLeader = member.id === currentGroup.leaderId
                  const isYou = member.id === student.id

                  return (
                    <li
                      key={member.id}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2"
                    >
                      <Avatar
                        name={member.name}
                        color={member.avatarColor}
                        size="sm"
                        ring={false}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-800">
                          {member.name}
                          {isYou && (
                            <span className="ml-1.5 text-xs font-normal text-slate-400">
                              (you)
                            </span>
                          )}
                        </p>
                        <p className="truncate text-[11px] text-slate-400">
                          {member.email}
                        </p>
                      </div>
                      {memberIsLeader && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-200 ring-inset">
                          <Crown className="h-3 w-3" />
                          Leader
                        </span>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>

            {isLeader ? (
              <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                As the group leader, you are the only member who can acknowledge group
                assignments. You cannot leave the group while you are its leader.
              </p>
            ) : (
              <button
                type="button"
                onClick={() => handleLeave(currentGroup.id)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-600 shadow-sm transition hover:bg-rose-50"
              >
                <DoorOpen className="h-4 w-4" />
                Leave group
              </button>
            )}
          </div>
        ) : (
          <>
            <form onSubmit={handleCreate} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <label htmlFor={`${formId}-name`} className="mb-1.5 block text-sm font-semibold text-slate-700">
                Create a new group
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  id={`${formId}-name`}
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value)
                    setError(null)
                  }}
                  placeholder="e.g. Team Phoenix"
                  className={inputClasses}
                />
                <button type="submit" className={cn(primaryButtonClasses, 'shrink-0')}>
                  <UserPlus className="h-4 w-4" />
                  Create group
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                You will become the group leader and can invite classmates to join.
              </p>
            </form>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-700">
                  Join an existing group
                </p>
                <span className="text-xs text-slate-400">
                  {courseGroups.length} group{courseGroups.length === 1 ? '' : 's'}
                </span>
              </div>

              {courseGroups.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500">
                  No groups have been created for this course yet. Be the first to start
                  one.
                </p>
              ) : (
                <ul className="max-h-72 space-y-2 overflow-y-auto pr-1">
                  {courseGroups.map((group) => {
                    const members = getGroupMembers(group, users)
                    const leader = users.find((user) => user.id === group.leaderId)

                    return (
                      <li
                        key={group.id}
                        className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {group.name}
                          </p>
                          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                            <Crown className="h-3 w-3 text-amber-500" />
                            Leader: {leader ? getFirstName(leader.name) : 'Unknown'} ·{' '}
                            {members.length} member{members.length === 1 ? '' : 's'}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {members.map((member) => (
                              <span
                                key={member.id}
                                className="inline-flex items-center gap-1 rounded-full bg-slate-50 py-0.5 pr-2 pl-0.5 text-[10px] font-medium text-slate-600 ring-1 ring-slate-200 ring-inset"
                              >
                                <Avatar
                                  name={member.name}
                                  color={member.avatarColor}
                                  size="xs"
                                  ring={false}
                                  className="h-4 w-4 text-[8px]"
                                />
                                {getFirstName(member.name)}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleJoin(group.id)}
                          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700 transition hover:bg-violet-100"
                        >
                          <UserPlus className="h-3.5 w-3.5" />
                          Join
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
