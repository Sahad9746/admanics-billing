'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { 
  Home, 
  Users, 
  Briefcase, 
  Wallet, 
  FileText, 
  Settings,
  PieChart,
  ClipboardList,
  Megaphone,
  ChevronDown,
  ChevronRight
} from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()

  // Track expanded state for sections that have subItems
  const [expandedSection, setExpandedSection] = useState<string | null>('Reports')

  const links = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Clients', href: '/clients', icon: Users },
    { name: 'Projects', href: '/projects', icon: Briefcase },
    { name: 'Finance', href: '/finance', icon: Wallet },
    { name: 'Invoices', href: '/invoices', icon: FileText },
    { 
      name: 'Reports', 
      icon: PieChart, 
      subItems: [
        { name: 'Financial', href: '/reports' },
        { name: 'Meta Ads', href: '/meta-ads-reports' }
      ]
    },
    { name: 'Daily Update', href: '/dashboard/daily-update', icon: ClipboardList },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  const toggleSection = (name: string) => {
    setExpandedSection(prev => prev === name ? null : name)
  }

  return (
    <aside className="w-64 bg-neutral-950 border-r border-neutral-900 hidden md:flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Finance<span className="text-blue-500">Pro</span></h1>
      </div>
      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon

          if (link.subItems) {
            const isExpanded = expandedSection === link.name
            const hasActiveSub = link.subItems.some(sub => pathname === sub.href || pathname.startsWith(sub.href + '/'))
            
            return (
              <div key={link.name} className="flex flex-col gap-1">
                <button 
                  onClick={() => toggleSection(link.name)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all w-full text-left ${
                    hasActiveSub && !isExpanded
                      ? 'text-white' 
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${hasActiveSub ? 'text-blue-500' : ''}`} />
                    <span className="font-medium text-sm">{link.name}</span>
                  </div>
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                
                {isExpanded && (
                  <div className="pl-11 pr-2 space-y-1 mt-1">
                    {link.subItems.map(subItem => {
                      const isSubActive = pathname === subItem.href || pathname.startsWith(subItem.href + '/')
                      return (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className={`block px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                            isSubActive
                              ? 'bg-blue-600/10 text-blue-500'
                              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                          }`}
                        >
                          {subItem.name}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }

          const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
          return (
            <Link 
              key={link.name} 
              href={link.href!}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium text-sm">{link.name}</span>
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-neutral-900 mt-auto">
        <div className="bg-neutral-900 rounded-xl p-4 text-xs text-neutral-400">
          <p>© {new Date().getFullYear()} Admanics</p>
          <p className="mt-1">Internal Finance System</p>
        </div>
      </div>
    </aside>
  )
}
