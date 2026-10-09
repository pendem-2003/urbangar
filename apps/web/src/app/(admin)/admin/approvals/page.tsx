'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { CheckCircle2, XCircle, MapPin, User, Calendar, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPricePerMonth, formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface PendingProperty {
  id: string
  title: string
  type: string
  listingFor: string
  locality: string
  monthlyRent: number | null
  salePrice: number | null
  bhk: number | null
  photos: string[]
  createdAt: string
  updatedAt: string
  pendingUpdate: Record<string, unknown> | null
  owner: { name: string; phone: string }
}

type Tab = 'new' | 'edits'

export default function AdminApprovalsPage() {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<Tab>('new')
  const [rejectModal, setRejectModal] = useState<{ id: string; title: string; mode: Tab } | null>(null)

  const { data: newData, isLoading: newLoading } = useQuery({
    queryKey: ['admin-approvals'],
    queryFn: async () => { const { data } = await api.get('/admin/approvals'); return data.data },
  })

  const { data: editData, isLoading: editLoading } = useQuery({
    queryKey: ['admin-pending-edits'],
    queryFn: async () => { const { data } = await api.get('/admin/pending-edits'); return data.data },
  })

  const approve = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/approvals/${id}/approve`),
    onSuccess: () => { toast.success('Listing approved!'); queryClient.invalidateQueries({ queryKey: ['admin-approvals'] }); queryClient.invalidateQueries({ queryKey: ['admin-stats'] }) },
    onError: () => toast.error('Failed to approve'),
  })

  const approveEdit = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/pending-edits/${id}/approve`),
    onSuccess: () => { toast.success('Edit applied!'); queryClient.invalidateQueries({ queryKey: ['admin-pending-edits'] }) },
    onError: () => toast.error('Failed to approve edit'),
  })

  const reject = useMutation({
    mutationFn: ({ id, reason, mode }: { id: string; reason: string; mode: Tab }) =>
      mode === 'new' ? api.patch(`/admin/approvals/${id}/reject`, { reason }) : api.patch(`/admin/pending-edits/${id}/reject`, { reason }),
    onSuccess: (_, vars) => {
      toast.success(vars.mode === 'new' ? 'Listing rejected.' : 'Edit rejected.')
      queryClient.invalidateQueries({ queryKey: vars.mode === 'new' ? ['admin-approvals'] : ['admin-pending-edits'] })
      setRejectModal(null)
    },
    onError: () => toast.error('Failed to reject'),
  })

  const newProps: PendingProperty[] = newData?.items ?? []
  const editProps: PendingProperty[] = editData?.items ?? []

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Approvals</h1>
        <p className="text-sm text-gray-400">Review new listings and owner edit requests</p>
      </div>

      <div className="mb-6 flex gap-1 rounded-xl border border-gray-100 bg-white p-1 w-fit">
        <TabBtn active={tab === 'new'} onClick={() => setTab('new')} count={newData?.total ?? 0}>New listings</TabBtn>
        <TabBtn active={tab === 'edits'} onClick={() => setTab('edits')} count={editData?.total ?? 0}>Pending edits</TabBtn>
      </div>

      {tab === 'new' && (
        newLoading ? <Skeleton /> : newProps.length === 0 ? <Empty msg="No new listings waiting for review" /> : (
          <div className="space-y-4">
            {newProps.map((p) => (
              <PropertyCard key={p.id} property={p}
                onApprove={() => approve.mutate(p.id)}
                onReject={() => setRejectModal({ id: p.id, title: p.title, mode: 'new' })}
                approving={approve.isPending} />
            ))}
          </div>
        )
      )}

      {tab === 'edits' && (
        editLoading ? <Skeleton /> : editProps.length === 0 ? <Empty msg="No pending edits to review" /> : (
          <div className="space-y-4">
            {editProps.map((p) => (
              <EditCard key={p.id} property={p}
                onApprove={() => approveEdit.mutate(p.id)}
                onReject={() => setRejectModal({ id: p.id, title: p.title, mode: 'edits' })}
                approving={approveEdit.isPending} />
            ))}
          </div>
        )
      )}

      {rejectModal && (
        <RejectModal title={rejectModal.title} onClose={() => setRejectModal(null)}
          onReject={(reason) => reject.mutate({ id: rejectModal.id, reason, mode: rejectModal.mode })}
          rejecting={reject.isPending} />
      )}
    </div>
  )
}

function TabBtn({ active, onClick, count, children }: { active: boolean; onClick: () => void; count: number; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={cn('flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors', active ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-50')}>
      {children}
      {count > 0 && <span className={cn('rounded-full px-1.5 py-0.5 text-xs font-semibold', active ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700')}>{count}</span>}
    </button>
  )
}

function PropertyCard({ property: p, onApprove, onReject, approving }: { property: PendingProperty; onApprove: () => void; onReject: () => void; approving: boolean }) {
  const price = p.listingFor === 'SALE' ? p.salePrice : p.monthlyRent
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5">
      <div className="flex flex-col gap-4 sm:flex-row">
        {p.photos[0] && <div className="h-32 w-full overflow-hidden rounded-lg bg-gray-100 sm:h-auto sm:w-40 sm:shrink-0"><img src={p.photos[0]} alt={p.title} className="h-full w-full object-cover" /></div>}
        <div className="flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-gray-900">{p.title}</h3>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-400"><MapPin className="h-3.5 w-3.5" />{p.locality}, Hyderabad</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-gray-900">{price ? (p.listingFor === 'SALE' ? formatPrice(price) : formatPricePerMonth(price)) : 'POR'}</div>
              <div className="text-xs text-gray-400">{p.type} · {p.bhk ? `${p.bhk} BHK` : 'N/A'}</div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" />{p.owner.name} ({p.owner.phone})</span>
            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Submitted {new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
          <div className="mt-4 flex gap-2">
            <Button size="sm" className="gap-1.5" onClick={onApprove} disabled={approving}><CheckCircle2 className="h-4 w-4" />Approve</Button>
            <Button size="sm" variant="destructive" className="gap-1.5" onClick={onReject}><XCircle className="h-4 w-4" />Reject</Button>
            <a href={`/properties/${p.id}`} target="_blank" rel="noopener noreferrer"><Button size="sm" variant="outline">Preview</Button></a>
          </div>
        </div>
      </div>
    </div>
  )
}

function EditCard({ property: p, onApprove, onReject, approving }: { property: PendingProperty; onApprove: () => void; onReject: () => void; approving: boolean }) {
  const [expanded, setExpanded] = useState(false)
  const changes = p.pendingUpdate ?? {}
  const changeKeys = Object.keys(changes)
  return (
    <div className="rounded-xl border border-blue-100 bg-white p-5">
      <div className="flex flex-col gap-4 sm:flex-row">
        {p.photos[0] && <div className="h-32 w-full overflow-hidden rounded-lg bg-gray-100 sm:h-auto sm:w-40 sm:shrink-0"><img src={p.photos[0]} alt={p.title} className="h-full w-full object-cover" /></div>}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{p.title}</h3>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">Edit pending</span>
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-400"><MapPin className="h-3.5 w-3.5" />{p.locality}, Hyderabad</div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" />{p.owner.name} ({p.owner.phone})</span>
            <span className="flex items-center gap-1"><Edit2 className="h-3.5 w-3.5" />{changeKeys.length} field{changeKeys.length !== 1 ? 's' : ''} changed · {new Date(p.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
          {changeKeys.length > 0 && (
            <div className="mt-3">
              <button onClick={() => setExpanded(!expanded)} className="text-xs text-brand-600 hover:underline">{expanded ? 'Hide' : 'View'} proposed changes</button>
              {expanded && (
                <div className="mt-2 overflow-hidden rounded-lg border border-gray-100">
                  {changeKeys.map((k) => (
                    <div key={k} className="flex gap-3 border-b border-gray-50 px-3 py-2 last:border-0 text-xs">
                      <span className="w-36 shrink-0 font-medium text-gray-500">{k}</span>
                      <span className="text-gray-700 break-all">{Array.isArray(changes[k]) ? (changes[k] as string[]).join(', ') : String(changes[k])}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="mt-4 flex gap-2">
            <Button size="sm" className="gap-1.5" onClick={onApprove} disabled={approving}><CheckCircle2 className="h-4 w-4" />Apply edit</Button>
            <Button size="sm" variant="destructive" className="gap-1.5" onClick={onReject}><XCircle className="h-4 w-4" />Reject edit</Button>
            <a href={`/properties/${p.id}`} target="_blank" rel="noopener noreferrer"><Button size="sm" variant="outline">View live</Button></a>
          </div>
        </div>
      </div>
    </div>
  )
}

function Empty({ msg }: { msg: string }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-gray-100 bg-white py-20 text-center">
      <CheckCircle2 className="mb-3 h-12 w-12 text-green-200" />
      <h2 className="text-base font-semibold text-gray-600">All caught up!</h2>
      <p className="mt-1 text-sm text-gray-400">{msg}</p>
    </div>
  )
}

function Skeleton() {
  return <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-100" />)}</div>
}

function RejectModal({ title, onClose, onReject, rejecting }: { title: string; onClose: () => void; onReject: (r: string) => void; rejecting: boolean }) {
  const [reason, setReason] = useState('')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="mb-1 text-lg font-semibold text-gray-900">Reject</h3>
        <p className="mb-4 text-sm text-gray-400">"{title}"</p>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (sent to owner)..." rows={4}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:border-red-400 focus:outline-none resize-none" />
        <div className="mt-4 flex gap-3">
          <Button variant="outline" size="md" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" size="md" className="flex-1" onClick={() => onReject(reason)} disabled={!reason.trim() || rejecting}>{rejecting ? 'Rejecting…' : 'Reject'}</Button>
        </div>
      </div>
    </div>
  )
}
