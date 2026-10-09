'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Eye, Bell, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface NudgeItem {
  id: string
  status: string
  viewCount: number
  lastViewedAt: string
  sentAt: string | null
  user: { id: string; name: string; phone: string }
  property: { id: string; title: string; locality: string; photos: string[] }
}

export default function BrokerNudgesPage() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['broker-nudges'],
    queryFn: async () => {
      const { data } = await api.get('/broker/nudges')
      return data.data
    },
  })

  const sendNudge = useMutation({
    mutationFn: ({ propertyId, seekerId }: { propertyId: string; seekerId: string }) =>
      api.post('/broker/nudges/send', { propertyId, seekerId }),
    onSuccess: () => {
      toast.success('Nudge sent! User will receive a notification.')
      queryClient.invalidateQueries({ queryKey: ['broker-nudges'] })
    },
    onError: () => toast.error('Failed to send nudge'),
  })

  const nudges: NudgeItem[] = data?.items ?? []
  const pending = nudges.filter((n) => n.status === 'PENDING')
  const sent = nudges.filter((n) => n.status !== 'PENDING')

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Interested Leads</h1>
        <p className="text-sm text-gray-400">
          Users who viewed your listings but did not contact you. Send a nudge to re-engage them.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-200" />)}
        </div>
      ) : nudges.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-gray-100 bg-white py-20 text-center">
          <Eye className="mb-3 h-12 w-12 text-gray-200" />
          <h2 className="text-base font-semibold text-gray-600">No interested leads yet</h2>
          <p className="mt-1 text-sm text-gray-400 max-w-xs">
            When someone views your listing without contacting, they appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-700">
                <Bell className="h-4 w-4" />
                Waiting to nudge ({pending.length})
              </h2>
              <div className="space-y-3">
                {pending.map((nudge) => (
                  <NudgeCard
                    key={nudge.id}
                    nudge={nudge}
                    onSend={() => sendNudge.mutate({ propertyId: nudge.property.id, seekerId: nudge.user.id })}
                    sending={sendNudge.isPending}
                  />
                ))}
              </div>
            </div>
          )}

          {sent.length > 0 && (
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-green-700">
                <CheckCircle2 className="h-4 w-4" />
                Nudge sent ({sent.length})
              </h2>
              <div className="space-y-3">
                {sent.map((nudge) => (
                  <NudgeCard key={nudge.id} nudge={nudge} sent />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface NudgeCardProps {
  nudge: NudgeItem
  onSend?: () => void
  sending?: boolean
  sent?: boolean
}

function NudgeCard({ nudge, onSend, sending, sent }: NudgeCardProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-white p-4">
      <div className="flex items-center gap-4">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${sent ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
          {nudge.user.name?.charAt(0) ?? '?'}
        </div>
        <div>
          <div className="font-medium text-gray-900">{nudge.user.name}</div>
          <div className="mt-0.5 text-xs text-gray-400">
            Viewed <span className="font-medium text-gray-600">"{nudge.property.title}"</span>
            {' '}{nudge.viewCount}× · {nudge.property.locality}
          </div>
          <div className="mt-0.5 text-xs text-gray-300">
            Last seen: {new Date(nudge.lastViewedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            {nudge.sentAt && ` · Nudged: ${new Date(nudge.sentAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
          </div>
        </div>
      </div>

      {sent ? (
        <div className="shrink-0 flex items-center gap-1.5 text-xs text-green-600">
          <CheckCircle2 className="h-4 w-4" />
          Nudge sent
        </div>
      ) : (
        <button
          onClick={onSend}
          disabled={sending}
          className="shrink-0 rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-60 transition-colors"
        >
          {sending ? 'Sending...' : 'Send nudge'}
        </button>
      )}
    </div>
  )
}
