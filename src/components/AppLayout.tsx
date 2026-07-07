'use client'

import { Sidebar } from "@/components/Sidebar"
import { CurrencyToggle } from "@/components/CurrencyToggle"
import { LogoutButton } from "@/components/LogoutButton"

interface AppLayoutProps {
  children: React.ReactNode
  user: { name: string; email: string; role: string }
  title?: string
  description?: string
}

export function AppLayout({ children, user, title, description }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 flex overflow-x-hidden">
      {/* Sidebar (Desktop) */}
      <Sidebar role={user.role} />

      <div className="flex-1 md:ml-64 flex flex-col min-h-screen w-full max-w-[100vw] overflow-x-hidden">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title || "Dashboard"}</h2>
            {description && <p className="text-slate-400 text-sm mt-1">{description}</p>}
          </div>
          <div className="flex items-center gap-4 hidden md:flex">
            <CurrencyToggle />
            <LogoutButton />
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-400 capitalize">{user.role}</p>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg uppercase text-white" style={{ backgroundColor: '#0D5740' }}>
                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
