'use client'

import { useState } from "react"
import { Transaction } from "@/types"
import { Ledger } from "@/components/Ledger"
import { CurrencyToggle } from "@/components/CurrencyToggle"
import { LogoutButton } from "@/components/LogoutButton"
import { FilterBar, Filters } from "@/components/FilterBar"
import { isSameDay, parseISO, format } from "date-fns"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2, X } from "lucide-react"
import { deleteTransactions } from "@/app/actions"
import { useRouter } from "next/navigation"
import { EntryForm } from "@/components/EntryForm"

import { ConfirmationModal } from "@/components/ConfirmationModal"
import toast from "react-hot-toast"

export function TransactionsHistory({ initialTransactions }: { initialTransactions: Transaction[] }) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  
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

  const handleBulkDelete = async () => {
    setIsDeleting(true)
    const result = await deleteTransactions(selectedIds)
    setIsDeleting(false)
    setShowDeleteModal(false)
    
    if (result.success) {
      toast.success(`${selectedIds.length} transactions deleted`)
      setSelectedIds([])
      router.refresh()
    } else {
      toast.error(result.error || "Failed to delete transactions")
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6 md:p-12 font-sans relative">
      {/* Create Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-xl w-full relative">
            <button 
                onClick={() => setIsCreating(false)}
                className="absolute -top-12 right-0 text-white/50 hover:text-white transition-colors"
            >
                <X className="w-8 h-8" />
            </button>
            <EntryForm 
                onSuccess={() => {
                    setIsCreating(false)
                    router.refresh()
                }} 
            />
          </div>
        </div>
      )}

      {/* Bulk Delete Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleBulkDelete}
        title="Delete Transactions"
        description={`Are you sure you want to permanently delete ${selectedIds.length} transactions? This action cannot be undone and the data will be removed from the database.`}
        confirmText={isDeleting ? "Deleting..." : `Delete ${selectedIds.length} Permanently`}
        isDestructive
      />

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
                {selectedIds.length > 0 && (
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        disabled={isDeleting}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete ({selectedIds.length})
                    </button>
                )}
                <button
                    onClick={() => setIsCreating(true)}
                    className="bg-white text-black hover:bg-neutral-200 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    New Transaction
                </button>
                <div className="h-8 w-px bg-neutral-800 mx-2 hidden md:block"></div>
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
            <Ledger 
                transactions={filteredTransactions} 
                selectable
                selectedIds={selectedIds}
                onSelect={setSelectedIds}
            />
        </section>
      </div>
    </main>
  )
}
