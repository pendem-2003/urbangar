'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Bell, CheckCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

type Notification = {
  id: string
  type: string
  title: string
  body: string
  isRead: boolean
  createdAt: string
}

export default function NotificationsPage() {
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api.get('/notifications')
      return data.data as { items: Notification[]; unreadCount: number }
    },
  })

  const markAllRead = useMutation({
    mutationFn: () => api.patch('/notifications/mark-all-read'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const markRead = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
            {data?.unreadCount ? (
              <p className="text-sm text-gray-400">{data.unreadCount} unread</p>
            ) : null}
          </div>
          {data?.unreadCount ? (
            <button
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          ) : null}
        </div>

        {isLoading && (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-white" />)}
          </div>
        )}

        {!isLoading && !data?.items.length && (
          <div className="flex flex-col items-center py-20 text-center">
            <Bell className="mb-3 h-12 w-12 text-gray-200" />
            <p className="font-medium text-gray-700">No notifications yet</p>
            <p className="mt-1 text-sm text-gray-400">You'll be notified about leads, visits, and payments</p>
          </div>
        )}

        {data?.items.length ? (
          <div className="space-y-1">
            {data.items.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.isRead && markRead.mutate(n.id)}
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-xl p-4 transition-colors',
                  n.isRead ? 'bg-white' : 'bg-brand-50 hover:bg-brand-50/80'
                )}
              >
                <div className={cn('mt-0.5 h-2 w-2 shrink-0 rounded-full', n.isRead ? 'bg-transparent' : 'bg-brand-500')} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900">{n.title}</div>
                  <p className="mt-0.5 text-sm text-gray-500">{n.body}</p>
                  <div className="mt-1 text-xs text-gray-400">
                    {new Date(n.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
