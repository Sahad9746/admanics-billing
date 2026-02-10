'use client'

import { useFormStatus } from "react-dom"
import { login } from "@/app/actions"
import { ArrowRight } from "lucide-react"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 group disabled:opacity-50"
    >
      {pending ? 'Verifying...' : 'Access Dashboard'}
      {!pending && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
    </button>
  )
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 rounded-2xl border border-neutral-800 p-8 shadow-2xl">
        <div className="text-center mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold shadow-lg shadow-blue-900/20">AF</div>
            <h1 className="text-2xl font-bold text-white">Admanics Finance</h1>
            <p className="text-neutral-400 mt-2 text-sm">Restricted Access. Internal Use Only.</p>
        </div>
        
        <form action={login} className="space-y-4">
          <div>
            <label className="sr-only">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter Access Password"
              required
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-center tracking-widest"
            />
          </div>
          <SubmitButton />
        </form>
      </div>
    </main>
  )
}
