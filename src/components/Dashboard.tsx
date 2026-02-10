'use client'

import { useState } from "react"
import { Transaction } from "@/types"
import { Stats } from "@/components/Stats"
import { Chart } from "@/components/Chart"
import { Ledger } from "@/components/Ledger"
import { EntryForm } from "@/components/EntryForm"
import { CurrencyToggle } from "@/components/CurrencyToggle"
import { LogoutButton } from "@/components/LogoutButton"
import { FilterBar, Filters } from "@/components/FilterBar"
import { isSameDay, parseISO, format } from "date-fns"
import Link from "next/link"

export function Dashboard({ 
  initialTransactions,
  user 
}: { 
  initialTransactions: Transaction[]
  user: { name: string; email: string; role: string }
}) {
  const [filters, setFilters] = useState<Filters>({
    search: '',
    type: 'all',
    category: 'all',
    date: '',
  })

  // Filtering Logic
  const filteredTransactions = initialTransactions.filter((t) => {
    const tDate = parseISO(t.date)
    
    // Search
    if (filters.search && !t.title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }

    // Type
    if (filters.type !== 'all' && t.type !== filters.type) {
      return false
    }

    // Category
    if (filters.category !== 'all' && t.category !== filters.category) {
      return false
    }



    // Date (YYYY-MM-DD)
    if (filters.date) {
      if (!isSameDay(tDate, parseISO(filters.date))) {
        return false
      }
    }

    return true
  })

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                 <h1 className="text-3xl font-bold tracking-tight text-white">Admanics Finance</h1>
                 <p className="text-neutral-400 mt-1">Internal billing & fund flow dashboard</p>
            </div>
            <div className="flex items-center gap-4 self-end md:self-auto">
                <CurrencyToggle />
                <LogoutButton />
                <div className="flex items-center gap-3">
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-neutral-400 capitalize">{user.role}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold shadow-lg shadow-blue-900/20">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                </div>
            </div>
        </header>

        {/* Filters */}
        <section>
            <FilterBar filters={filters} setFilters={setFilters} />
        </section>

        {/* Stats - Shows totals based on filtered data */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <Stats transactions={filteredTransactions} />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Chart transactions={filteredTransactions} />
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Recent Transactions</h2>
                <Link href="/transactions" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                    View All
                </Link>
            </div>
            <Ledger transactions={filteredTransactions} />
          </div>
          <div>
            <div className="sticky top-8">
                 <EntryForm />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
