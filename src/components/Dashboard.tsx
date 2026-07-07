'use client'

import { useState, useRef, useEffect } from "react"
import { Transaction } from "@/types"

import { Chart } from "@/components/Chart"
import { Stats } from "@/components/Stats"
import { Ledger } from "@/components/Ledger"
import { EntryForm } from "@/components/EntryForm"
import { CurrencyToggle } from "@/components/CurrencyToggle"
import { LogoutButton } from "@/components/LogoutButton"
import { FilterBar, Filters } from "@/components/FilterBar"
import { isSameDay, parseISO, format } from "date-fns"
import Link from "next/link"

interface DashboardProps {
  initialTransactions: Transaction[]
  wallets: any[]
  user: { name: string; email: string; role: string; permissions?: Record<string, string> }
}

export function Dashboard({ initialTransactions, wallets, user }: DashboardProps) {
  const txRole = user.permissions?.transactions || user.role || 'viewer'
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

  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 10
  const totalPages = Math.ceil(filteredTransactions.length / PAGE_SIZE)
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  // Reset to page 1 when filters change
  useEffect(() => { setCurrentPage(1) }, [filters])

  return (
    <div className="space-y-8">
      {/* Wallet Balances */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {wallets.map((wallet: any) => (
          <div key={wallet._id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">{wallet.name}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: wallet.currency }).format(wallet.balance)}
            </p>
          </div>
        ))}
      </section>

      {/* Filters */}
      <section>
          <FilterBar filters={filters} setFilters={setFilters} transactions={initialTransactions} />
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Stats transactions={filteredTransactions} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Chart transactions={filteredTransactions} />
          <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
              <Link href="/transactions" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                  View All
              </Link>
          </div>
          <Ledger 
            transactions={paginatedTransactions} 
            onEdit={txRole !== 'viewer' ? handleEdit : undefined}
          />
          {totalPages > 1 && (
            <div className="flex justify-between items-center bg-white border border-gray-200 shadow-sm p-4 rounded-xl">
              <p className="text-sm text-gray-500">
                Showing {((currentPage - 1) * PAGE_SIZE) + 1}–{Math.min(currentPage * PAGE_SIZE, filteredTransactions.length)} of {filteredTransactions.length}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-200 shadow-sm rounded-lg text-sm font-medium bg-gray-50 disabled:opacity-40 hover:bg-gray-100 transition-colors text-gray-700"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-200 shadow-sm rounded-lg text-sm font-medium bg-gray-50 disabled:opacity-40 hover:bg-gray-100 transition-colors text-gray-700"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
        <div ref={formRef}>
          <div className="sticky top-8">
               {txRole !== 'viewer' && (
                 <>
                   <EntryForm 
                      key={editingTransaction?._id || 'new'}
                      initialData={editingTransaction || undefined} 
                      onSuccess={() => setEditingTransaction(null)}
                   />
                   {editingTransaction && (
                      <button 
                        onClick={() => setEditingTransaction(null)}
                        className="w-full mt-4 bg-gray-100 text-gray-700 font-medium py-2 rounded-xl hover:bg-gray-100 transition"
                      >
                        Cancel Edit
                      </button>
                   )}
                 </>
               )}
          </div>
        </div>
      </section>
    </div>
  )
}
