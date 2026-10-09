'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { TrendingUp, Users, UtensilsCrossed, Wifi, Shirt, Bus, ShoppingBag, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

const SERVICES = [
  {
    id: 'food',
    name: 'Food Subscription',
    subscribers: 156,
    monthlyRevenue: 234000,
    Icon: UtensilsCrossed,
    iconBg: 'bg-orange-500',
    img: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&auto=format&fit=crop&q=80',
    plans: [
      { name: 'Breakfast Only', price: 2000 },
      { name: 'All Meals', price: 6000 },
      { name: 'Dinner Only', price: 2500 },
    ],
  },
  {
    id: 'wifi',
    name: 'WiFi Packages',
    subscribers: 243,
    monthlyRevenue: 121500,
    Icon: Wifi,
    iconBg: 'bg-blue-500',
    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop&q=80',
    plans: [
      { name: 'Basic 50 Mbps', price: 500 },
      { name: 'Premium 100 Mbps', price: 800 },
      { name: 'Business 200 Mbps', price: 1500 },
    ],
  },
  {
    id: 'laundry',
    name: 'Laundry Service',
    subscribers: 178,
    monthlyRevenue: 89000,
    Icon: Shirt,
    iconBg: 'bg-purple-500',
    img: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=600&auto=format&fit=crop&q=80',
    plans: [
      { name: 'Basic Plan', price: 400 },
      { name: 'Premium Plan', price: 700 },
      { name: 'Pay Per Use', price: 50, unit: '/kg' },
    ],
  },
  {
    id: 'shuttle',
    name: 'Shuttle Service',
    subscribers: 92,
    monthlyRevenue: 138000,
    Icon: Bus,
    iconBg: 'bg-green-500',
    img: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&auto=format&fit=crop&q=80',
    plans: [
      { name: 'Office Route', price: 1500 },
      { name: 'College Route', price: 1200 },
      { name: 'Weekend Only', price: 600 },
    ],
  },
]

const RECENT_SUBSCRIPTIONS = [
  { name: 'Rahul Sharma', service: 'Food Subscription', plan: 'All Meals', amount: 6000, date: '20 Nov 2024', status: 'Active' },
  { name: 'Priya Patel', service: 'WiFi Package', plan: 'Premium 100 Mbps', amount: 800, date: '20 Nov 2024', status: 'Active' },
  { name: 'Amit Kumar', service: 'Laundry Service', plan: 'Basic Plan', amount: 400, date: '19 Nov 2024', status: 'Active' },
  { name: 'Sneha Reddy', service: 'Shuttle Service', plan: 'Office Route', amount: 1500, date: '19 Nov 2024', status: 'Active' },
]

export default function OwnerServicesPage() {
  const [viewingSubscribers, setViewingSubscribers] = useState<string | null>(null)

  const { data } = useQuery({
    queryKey: ['owner-services'],
    queryFn: async () => {
      const { data } = await api.get('/services/owner')
      return data.data
    },
  })

  const totalSubscribers = SERVICES.reduce((s, sv) => s + sv.subscribers, 0)
  const totalRevenue = SERVICES.reduce((s, sv) => s + sv.monthlyRevenue, 0)

  const stats = [
    { label: 'Total Subscribers', value: totalSubscribers.toLocaleString('en-IN'), sub: '+23 this month' },
    { label: 'Monthly Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, sub: '+18% vs last month' },
    { label: 'Active Services', value: SERVICES.length.toString(), sub: '100% availability' },
    { label: 'Avg Revenue/Tenant', value: '₹2,030', sub: '+12%' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Value-Added Services</h1>
          <p className="text-sm text-gray-500 mt-0.5">Premium services for gated community residents</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors">
          <ShoppingBag className="h-4 w-4" />
          Add New Service
        </button>
      </div>

      {/* Aggregate stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
            <div className="text-sm text-gray-500">{s.label}</div>
            <div className="mt-1 text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="mt-0.5 text-xs font-medium flex items-center gap-1 text-green-600">
              <TrendingUp className="h-3 w-3" />
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Service cards — 2 per row */}
      <div className="grid gap-6 md:grid-cols-2">
        {SERVICES.map((sv) => {
          const Icon = sv.Icon
          return (
            <div key={sv.id} className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
              {/* Photo header */}
              <div className="relative h-44">
                <img src={sv.img} alt={sv.name} className="w-full h-full object-cover" />
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', sv.iconBg)}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-semibold text-white text-sm drop-shadow">{sv.name}</span>
                </div>
              </div>

              <div className="p-4">
                {/* Subscriber count */}
                <div className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1 text-sm">
                  <span className="font-medium text-gray-700">{sv.subscribers} subscribers</span>
                </div>

                {/* Monthly Revenue */}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    Monthly Revenue
                  </div>
                  <div className="font-bold text-gray-900">₹{sv.monthlyRevenue.toLocaleString('en-IN')}</div>
                </div>

                {/* Plans */}
                <div className="mt-3">
                  <div className="text-sm text-gray-500 mb-2">Available Plans:</div>
                  <div className="space-y-1">
                    {sv.plans.map((p) => (
                      <div key={p.name} className="text-sm text-gray-700">
                        {p.name} - ₹{p.price.toLocaleString('en-IN')}{('unit' in p && p.unit) ? p.unit : '/month'}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => setViewingSubscribers(viewingSubscribers === sv.id ? null : sv.id)}
                    className="flex-1 rounded-xl border border-gray-200 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    View Subscribers
                  </button>
                  <button className="flex-1 rounded-xl border border-gray-200 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    Edit Plans
                  </button>
                </div>

                {/* Subscriber list (expanded) */}
                {viewingSubscribers === sv.id && (
                  <div className="mt-3 rounded-xl bg-gray-50 p-3 space-y-2">
                    {RECENT_SUBSCRIPTIONS.filter((r) => r.service.toLowerCase().includes(sv.id)).slice(0, 3).map((r, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div>
                          <span className="font-medium text-gray-900">{r.name}</span>
                          <span className="text-gray-400 ml-2">{r.plan}</span>
                        </div>
                        <span className="font-medium text-gray-900">₹{r.amount.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                    {RECENT_SUBSCRIPTIONS.filter((r) => r.service.toLowerCase().includes(sv.id)).length === 0 && (
                      <div className="text-xs text-gray-400 text-center py-2">No subscribers yet</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Subscriptions */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 mb-4">Recent Subscriptions</h2>
        <div className="space-y-0">
          {RECENT_SUBSCRIPTIONS.map((r, i) => (
            <div
              key={i}
              className={cn('flex items-center justify-between py-4', i < RECENT_SUBSCRIPTIONS.length - 1 && 'border-b border-gray-100')}
            >
              <div>
                <p className="font-semibold text-gray-900">{r.name}</p>
                <p className="text-sm text-gray-400 mt-0.5">
                  {r.service} <span className="mx-1.5">·</span> {r.plan}
                </p>
              </div>
              <div className="text-right flex items-center gap-4">
                <div>
                  <div className="font-bold text-gray-900">₹{r.amount.toLocaleString('en-IN')}</div>
                  <div className="text-xs text-gray-400">{r.date}</div>
                </div>
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">{r.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
