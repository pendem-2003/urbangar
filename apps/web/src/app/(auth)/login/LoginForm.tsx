'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'
import { Role } from '@urbangar/types'
import { Phone, ArrowRight, RefreshCw, Building2, Search, Briefcase, Wrench } from 'lucide-react'
import { cn } from '@/lib/utils'

const phoneSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
})
const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must be numeric'),
})

type PhoneForm = z.infer<typeof phoneSchema>
type OtpForm = z.infer<typeof otpSchema>

const ROLE_ROUTES: Record<Role, string> = {
  [Role.SEEKER]: '/seeker/dashboard',
  [Role.OWNER]: '/owner/dashboard',
  [Role.BROKER]: '/broker/dashboard',
  [Role.PROVIDER]: '/provider/dashboard',
  [Role.ADMIN]: '/admin/dashboard',
}

const ROLE_OPTIONS: { role: Role; label: string; description: string; icon: React.ReactNode }[] = [
  {
    role: Role.SEEKER,
    label: 'Looking for a home',
    description: 'Browse flats, PGs & houses for rent or sale',
    icon: <Search className="h-6 w-6" />,
  },
  {
    role: Role.OWNER,
    label: 'I own a property',
    description: 'List and manage your properties',
    icon: <Building2 className="h-6 w-6" />,
  },
  {
    role: Role.BROKER,
    label: 'I\'m a broker / agent',
    description: 'Manage listings and close deals for owners',
    icon: <Briefcase className="h-6 w-6" />,
  },
  {
    role: Role.PROVIDER,
    label: 'I provide services',
    description: 'Offer home services like cleaning, plumbing, moving',
    icon: <Wrench className="h-6 w-6" />,
  },
]

export function LoginForm() {
  const router = useRouter()
  const { setAuth, isAuthenticated, user, _hasHydrated } = useAuthStore()
  const [step, setStep] = useState<'phone' | 'otp' | 'role'>('phone')

  // Redirect already-logged-in users to their dashboard
  useEffect(() => {
    if (!_hasHydrated) return
    if (isAuthenticated && user) {
      router.replace(ROLE_ROUTES[user.role as Role] ?? '/')
    }
  }, [_hasHydrated, isAuthenticated, user, router])
  const [phone, setPhone] = useState('')
  const [otpError, setOtpError] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  // Held after OTP verify, before role is set
  const [tempTokens, setTempTokens] = useState<{ accessToken: string; refreshToken: string } | null>(null)
  const [roleLoading, setRoleLoading] = useState<Role | null>(null)

  const phoneForm = useForm<PhoneForm>({ resolver: zodResolver(phoneSchema) })
  const otpForm = useForm<OtpForm>({ resolver: zodResolver(otpSchema) })

  const handleSendOtp = async (data: PhoneForm) => {
    try {
      await api.post('/auth/send-otp', { phone: data.phone })
      setPhone(data.phone)
      setStep('otp')
      startResendTimer()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to send OTP'
      phoneForm.setError('phone', { message: msg })
    }
  }

  const handleVerifyOtp = async (data: OtpForm) => {
    setOtpError('')
    try {
      const res = await api.post('/auth/verify-otp', { phone, otp: data.otp })
      const { accessToken, refreshToken, isNewUser } = res.data.data

      if (isNewUser) {
        // Hold tokens temporarily — role not set yet
        setTempTokens({ accessToken, refreshToken })
        setStep('role')
      } else {
        await finalizeLogin(accessToken, refreshToken)
      }
    } catch {
      setOtpError('Invalid OTP. Please try again.')
    }
  }

  const handleRoleSelect = async (role: Role) => {
    if (!tempTokens) return
    setRoleLoading(role)
    try {
      // Set role → get new tokens with correct role claim in JWT
      const res = await api.patch(
        '/auth/setup-role',
        { role },
        { headers: { Authorization: `Bearer ${tempTokens.accessToken}` } }
      )
      const { accessToken, refreshToken } = res.data.data
      await finalizeLogin(accessToken, refreshToken, true)
    } catch {
      setRoleLoading(null)
    }
  }

  const finalizeLogin = async (accessToken: string, refreshToken: string, isNew = false) => {
    const profileRes = await api.get('/users/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const profile = profileRes.data.data
    setAuth(
      { id: profile.id, phone, name: profile.name, role: profile.role, avatarUrl: profile.avatarUrl },
      accessToken,
      refreshToken,
    )
    router.push(isNew ? '/onboarding' : (ROLE_ROUTES[profile.role as Role] ?? '/'))
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return
    try {
      await api.post('/auth/send-otp', { phone })
      startResendTimer()
      setOtpError('')
    } catch {
      setOtpError('Failed to resend OTP')
    }
  }

  const startResendTimer = () => {
    setResendCooldown(60)
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  if (step === 'phone') {
    return (
      <form onSubmit={phoneForm.handleSubmit(handleSendOtp)} className="flex flex-col gap-4">
        <Input
          label="Mobile number"
          type="tel"
          placeholder="9876543210"
          maxLength={10}
          prefix={<Phone className="h-4 w-4" />}
          {...phoneForm.register('phone')}
          error={phoneForm.formState.errors.phone?.message}
        />
        <Button type="submit" size="lg" className="w-full" loading={phoneForm.formState.isSubmitting}>
          Get OTP
          <ArrowRight className="h-4 w-4" />
        </Button>
        <p className="text-center text-xs text-gray-400">
          By continuing, you agree to our{' '}
          <a href="/terms" className="text-brand-600 hover:underline">Terms</a>{' '}
          and{' '}
          <a href="/privacy" className="text-brand-600 hover:underline">Privacy Policy</a>
        </p>
      </form>
    )
  }

  if (step === 'otp') {
    return (
      <form onSubmit={otpForm.handleSubmit(handleVerifyOtp)} className="flex flex-col gap-4">
        <div className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-700">
          OTP sent to <strong>+91 {phone}</strong>.{' '}
          <button type="button" onClick={() => setStep('phone')} className="underline hover:no-underline">
            Change
          </button>
        </div>
        <Input
          label="Enter 6-digit OTP"
          type="tel"
          placeholder="000000"
          maxLength={6}
          inputMode="numeric"
          autoComplete="one-time-code"
          {...otpForm.register('otp')}
          error={otpForm.formState.errors.otp?.message ?? otpError}
        />
        <Button type="submit" size="lg" className="w-full" loading={otpForm.formState.isSubmitting}>
          Verify & continue
        </Button>
        <button
          type="button"
          onClick={handleResend}
          disabled={resendCooldown > 0}
          className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
        </button>
      </form>
    )
  }

  // Role selection step
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-gray-500">Choose how you want to use UrbanGar</p>
      {ROLE_OPTIONS.map(({ role, label, description, icon }) => (
        <button
          key={role}
          onClick={() => handleRoleSelect(role)}
          disabled={roleLoading !== null}
          className={cn(
            'flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all hover:border-brand-400 hover:bg-brand-50 disabled:opacity-60',
            roleLoading === role ? 'border-brand-500 bg-brand-50' : 'border-gray-200',
          )}
        >
          <div className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
            roleLoading === role ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-500'
          )}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{label}</p>
            <p className="text-xs text-gray-400">{description}</p>
          </div>
          {roleLoading === role && (
            <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
          )}
        </button>
      ))}
    </div>
  )
}
