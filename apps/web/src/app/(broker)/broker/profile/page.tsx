'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'
import toast from 'react-hot-toast'

export default function BrokerProfilePage() {
  const { user } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ reraNumber: '', agencyName: '', bio: '' })

  const { data: profile, isLoading } = useQuery({
    queryKey: ['broker-profile'],
    queryFn: async () => {
      const { data } = await api.get('/broker/profile')
      return data.data
    },
  })

  useEffect(() => {
    if (profile) {
      setForm({ reraNumber: profile.reraNumber ?? '', agencyName: profile.agencyName ?? '', bio: profile.bio ?? '' })
    }
  }, [profile])

  const save = useMutation({
    mutationFn: () => api.patch('/broker/profile', form),
    onSuccess: () => { toast.success('Profile updated'); setEditing(false) },
    onError: () => toast.error('Failed to update profile'),
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Profile & RERA</h1>
        <p className="text-sm text-gray-400">Your broker profile and verification details</p>
      </div>

      {isLoading ? (
        <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
      ) : (
        <div className="rounded-xl border border-gray-100 bg-white p-6">
          {/* User info (read-only) */}
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-700">
              {user?.name?.charAt(0) ?? 'B'}
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">{user?.name}</div>
              <div className="text-sm text-gray-400">{user?.phone}</div>
              {profile?.isVerified && (
                <span className="mt-1 inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                  ✓ RERA Verified
                </span>
              )}
            </div>
          </div>

          {!editing ? (
            <div className="space-y-4">
              {[
                { label: 'RERA number', value: profile?.reraNumber || 'Not set' },
                { label: 'Agency', value: profile?.agencyName || 'Not set' },
                { label: 'Bio', value: profile?.bio || 'Not set' },
                { label: 'Rating', value: profile?.rating ? `${profile.rating}/5` : 'No rating yet' },
                { label: 'Total deals', value: profile?.totalDeals ?? 0 },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-4">
                  <span className="w-32 shrink-0 text-sm font-medium text-gray-500">{label}</span>
                  <span className="text-sm text-gray-900">{String(value)}</span>
                </div>
              ))}
              <button
                onClick={() => setEditing(true)}
                className="mt-4 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Edit profile
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {[
                { label: 'RERA number', key: 'reraNumber', placeholder: 'e.g. A01600014831' },
                { label: 'Agency name', key: 'agencyName', placeholder: 'Your agency or company name' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
                  <input
                    type="text"
                    value={(form as Record<string, string>)[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                  />
                </div>
              ))}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                  rows={3}
                  placeholder="Tell seekers about yourself…"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => save.mutate()}
                  disabled={save.isPending}
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
                >
                  {save.isPending ? 'Saving…' : 'Save'}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
