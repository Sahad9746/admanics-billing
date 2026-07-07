'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      toast.error('Invalid email or password')
    } else {
      toast.success('Welcome back!')
      router.push('/')
      router.refresh()
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Admaniacs Logo"
              style={{ width: 72, height: 72, objectFit: 'contain' }}
            />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Admaniacs Finance</h1>
          <p className="text-slate-400 mt-1 text-sm">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-600 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
              style={{ '--tw-ring-color': '#0D5740' } as React.CSSProperties}
              placeholder="your@email.com"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-600">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-sm transition-colors"
                style={{ color: '#0D5740' }}
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                required
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 pr-12 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 group disabled:opacity-50"
            style={{ backgroundColor: '#0D5740' }}
            onMouseOver={e => (e.currentTarget.style.backgroundColor = '#0a4532')}
            onMouseOut={e => (e.currentTarget.style.backgroundColor = '#0D5740')}
          >
            {loading ? 'Signing in...' : 'Sign In'}
            {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <p className="mt-6 text-center text-slate-400 text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium transition-colors" style={{ color: '#0D5740' }}>
            Create one
          </Link>
        </p>
      </div>
    </main>
  )
}
