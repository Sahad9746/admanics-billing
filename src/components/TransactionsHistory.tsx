'use client'

import { useState } from "react"
import { Transaction } from "@/types"
import { Ledger } from "@/components/Ledger"
import { CurrencyToggle } from "@/components/CurrencyToggle"
import { LogoutButton } from "@/components/LogoutButton"
import { FilterBar, Filters } from "@/components/FilterBar"
import { isSameDay, parseISO, format } from "date-fns"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export function TransactionsHistory({ initialTransactions }: { initialTransactions: Transaction[] }) {
  const [filters, setFilters] = useState<Filters>({
    search: '',
    type: 'all',
    category: 'all',
    month: '',
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

    // Month (YYYY-MM)
    if (filters.month) {
      const tMonth = format(tDate, 'yyyy-MM')
      if (tMonth !== filters.month) {
        return false
      }
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
            <div className="flex items-center gap-4">
                <Link href="/" className="p-2 -ml-2 text-neutral-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">All Transactions</h1>
                    <p className="text-neutral-400 mt-1">Full history of income and expenses</p>
                </div>
            </div>
            <div className="flex items-center gap-4 self-end md:self-auto">
                <CurrencyToggle />
                <LogoutButton />
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold shadow-lg shadow-blue-900/20">AF</div>
            </div>
        </header>

        {/* Filters */}
        <section>
            <FilterBar filters={filters} setFilters={setFilters} />
        </section>

        {/* Ledger */}
        <section>
            <Ledger transactions={filteredTransactions} />
        </section>
      </div>
    </main>
  )
}
