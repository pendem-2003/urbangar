import Link from 'next/link'
import { LoginForm } from '../login/LoginForm'

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white text-sm font-bold">
              UG
            </div>
            <span className="text-lg font-bold text-gray-900">
              Urban<span className="text-brand-600">Gar</span>
            </span>
          </Link>
        </div>
        <h1 className="mb-1 text-2xl font-bold text-gray-900">Create your account</h1>
        <p className="mb-8 text-sm text-gray-500">Enter your phone number to get started</p>
        <LoginForm />
        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">Log in</Link>
        </p>
      </div>
    </div>
  )
}
