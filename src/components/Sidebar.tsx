'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
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
  ChevronRight,
  Banknote
} from "lucide-react"

export function Sidebar({ role }: { role?: string }) {
  const pathname = usePathname()

  const isReportsActive = pathname.startsWith('/reports') || pathname.startsWith('/meta-ads-reports')
  const isPayrollActive = pathname.startsWith('/payroll')

  // Track expanded state for sections that have subItems
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'Reports': isReportsActive,
    'Payroll': isPayrollActive
  })

  // Auto-expand the active section when navigating
  useEffect(() => {
    setExpandedSections(prev => ({
      ...prev,
      ...(isReportsActive && { 'Reports': true }),
      ...(isPayrollActive && { 'Payroll': true })
    }))
  }, [isReportsActive, isPayrollActive])

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
        { name: 'Financial', href: '/reports', exact: true },
        { name: 'Meta Ads', href: '/meta-ads-reports' }
      ]
    },
    ...(role?.toLowerCase() === 'admin' ? [{
      name: 'Payroll',
      icon: Banknote,
      subItems: [
        { name: 'Dashboard', href: '/payroll', exact: true },
        { name: 'Process', href: '/payroll/process' },
        { name: 'Advances', href: '/payroll/advances' },
        { name: 'Reports', href: '/payroll/report' }
      ]
    }] : []),
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  const toggleSection = (name: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [name]: !prev[name]
    }))
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col h-screen fixed left-0 top-0">
      <div className="px-4 py-5 flex items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="Admaniacs Logo"
          style={{ width: 52, height: 52, objectFit: 'contain' }}
        />
        <span className="ml-3 text-lg font-bold text-slate-800">Admaniacs</span>
      </div>
      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon

          if (link.subItems) {
            const isExpanded = expandedSections[link.name]
            const hasActiveSub = link.subItems.some(sub => pathname === sub.href || pathname.startsWith(sub.href + '/'))
            
            return (
              <div key={link.name} className="flex flex-col gap-1">
                <button 
                  onClick={() => toggleSection(link.name)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all w-full text-left ${
                    hasActiveSub && !isExpanded
                      ? 'text-slate-800' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${hasActiveSub ? '' : ''}`} style={{ color: hasActiveSub ? '#0D5740' : '' }} />
                    <span className="font-medium text-sm">{link.name}</span>
                  </div>
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                
                {isExpanded && (
                  <div className="pl-11 pr-2 space-y-1 mt-1">
                    {link.subItems.map(subItem => {
                      const isSubActive = subItem.exact 
                        ? pathname === subItem.href 
                        : pathname === subItem.href || pathname.startsWith(subItem.href + '/')
                      
                      return (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className={`block px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                            isSubActive
                              ? 'text-white'
                              : 'text-slate-500 hover:text-slate-900 hover:bg-gray-100'
                          }`}
                          style={isSubActive ? { backgroundColor: '#0D5740' } : {}}
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
                  ? 'text-white shadow-lg'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-gray-100'
              }`}
              style={isActive ? { backgroundColor: '#0D5740' } : {}}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium text-sm">{link.name}</span>
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-gray-200 mt-auto">
        <div className="bg-gray-50 rounded-xl p-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Admaniacs</p>
          <p className="mt-1">Internal Finance System</p>
        </div>
      </div>
    </aside>
  )
}
