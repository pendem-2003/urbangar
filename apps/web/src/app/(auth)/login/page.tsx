import type { Metadata } from 'next'
import { LoginForm } from './LoginForm'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Log in — UrbanGar',
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-gray-950 to-brand-950 p-12 lg:flex">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white text-sm font-bold backdrop-blur">
            UG
          </div>
          <span className="text-xl font-bold text-white">
            Urban<span className="text-brand-400">Gar</span>
          </span>
        </Link>

        <div>
          <blockquote className="mb-6 text-2xl font-semibold leading-snug text-white">
            &ldquo;Found my perfect 2BHK in Gachibowli within 3 days. The broker was super helpful and the rent payment is so smooth.&rdquo;
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold">
              R
            </div>
            <div>
              <p className="text-sm font-medium text-white">Rahul Sharma</p>
              <p className="text-xs text-white/50">Software Engineer, Hyderabad</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-white/30">© 2025 UrbanGar. All rights reserved.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white text-sm font-bold">
                UG
              </div>
              <span className="text-lg font-bold text-gray-900">
                Urban<span className="text-brand-600">Gar</span>
              </span>
            </Link>
          </div>

          <h1 className="mb-1 text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="mb-8 text-sm text-gray-500">
            Enter your phone number to receive an OTP
          </p>

          <LoginForm />

          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-brand-600 hover:text-brand-700">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
