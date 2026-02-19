'use client'

import { useState, useRef, useEffect } from "react"
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
  wallets,
  user 
}: { 
  initialTransactions: Transaction[]
  wallets: any[]
  user: { name: string; email: string; role: string }
}) {
  const [filters, setFilters] = useState<Filters>({
    search: '',
    type: 'all',
    category: 'all',
    date: '',
  })
  
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const formRef = useRef<HTMLDivElement>(null)

  const handleEdit = (t: Transaction) => {
    setEditingTransaction(t)
    // Smooth scroll to form on mobile
    if (window.innerWidth < 1024) {
       formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

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
    <div className="space-y-8">
      {/* Wallet Balances */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {wallets.map((wallet: any) => (
          <div key={wallet._id} className="bg-gradient-to-br from-blue-900/40 to-neutral-900 p-6 rounded-xl border border-blue-900/30">
            <h3 className="text-blue-200 text-sm font-medium uppercase tracking-wider">{wallet.name}</h3>
            <p className="text-2xl font-bold text-white mt-2">
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: wallet.currency }).format(wallet.balance)}
            </p>
          </div>
        ))}
      </section>

      {/* Filters */}
      <section>
          <FilterBar filters={filters} setFilters={setFilters} transactions={initialTransactions} />
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
          <Ledger 
            transactions={filteredTransactions} 
            onEdit={handleEdit}
          />
        </div>
        <div ref={formRef}>
          <div className="sticky top-8">
               <EntryForm 
                  key={editingTransaction?._id || 'new'}
                  initialData={editingTransaction || undefined} 
                  onSuccess={() => setEditingTransaction(null)}
               />
               {editingTransaction && (
                  <button 
                    onClick={() => setEditingTransaction(null)}
                    className="w-full mt-4 bg-neutral-800 text-white font-medium py-2 rounded-xl hover:bg-neutral-700 transition"
                  >
                    Cancel Edit
                  </button>
               )}
          </div>
        </div>
      </section>
    </div>
  )
}
