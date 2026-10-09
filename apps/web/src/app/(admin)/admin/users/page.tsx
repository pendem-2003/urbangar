'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Users, Search, ToggleLeft, ToggleRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

type User = {
  id: string
  name: string
  email: string
  phone: string
  role: string
  isActive: boolean
  createdAt: string
}

const ROLE_COLOR: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-700',
  BROKER: 'bg-brand-100 text-brand-700',
  OWNER: 'bg-blue-100 text-blue-700',
  SEEKER: 'bg-green-100 text-green-700',
  PROVIDER: 'bg-purple-100 text-purple-700',
}

export default function AdminUsersPage() {
  const qc = useQueryClient()
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', q, page],
    queryFn: async () => {
      const { data } = await api.get('/admin/users', { params: { q, page, limit: 20 } })
      return data.data as { items: User[]; total: number; totalPages: number }
    },
  })

  const toggleUser = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/users/${id}/toggle`),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('User status updated')
    },
    onError: () => toast.error('Failed to update user'),
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-400">All registered platform users</p>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1) }}
            placeholder="Search by name, email, or phone…"
            className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-brand-400 focus:outline-none"
          />
        </div>
        {data && <span className="text-sm text-gray-400">{data.total} users</span>}
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100" />)}
        </div>
      )}

      {!isLoading && !data?.items?.length && (
        <div className="flex flex-col items-center py-20 text-center">
          <Users className="mb-3 h-12 w-12 text-gray-200" />
          <p className="text-gray-500">No users found</p>
        </div>
      )}

      {data?.items?.length ? (
        <>
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/50 text-xs font-medium uppercase tracking-wide text-gray-400">
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Contact</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Joined</th>
                  <th className="px-4 py-3 text-center">Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data?.items?.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                          {user.name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      <div>{user.email}</div>
                      <div className="text-xs">{user.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', ROLE_COLOR[user.role] ?? 'bg-gray-100 text-gray-600')}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleUser.mutate(user.id)}
                        disabled={toggleUser.isPending}
                        className="text-gray-400 hover:text-brand-600 disabled:opacity-50"
                      >
                        {user.isActive
                          ? <ToggleRight className="h-5 w-5 text-green-500" />
                          : <ToggleLeft className="h-5 w-5 text-gray-300" />
                        }
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">Page {page} of {data.totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
