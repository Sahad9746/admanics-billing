'use client'

import { useState, useEffect } from "react"
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

interface TransactionsHistoryProps {
  initialTransactions: Transaction[]
  title?: string
  subtitle?: string
  backLink?: string
  hideGlobalActions?: boolean
  initialFilters?: Partial<Filters>
}

export function TransactionsHistory({ 
  initialTransactions,
  title = "All Transactions",
  subtitle = "Full history of income and expenses",
  backLink = "/",
  hideGlobalActions = false,
  initialFilters
}: TransactionsHistoryProps) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  const handleEdit = (t: Transaction) => {
    setEditingTransaction(t)
    setIsCreating(true)
  }
  
  const [filters, setFilters] = useState<Filters>({
    search: initialFilters?.search || '',
    type: initialFilters?.type || 'all',
    category: initialFilters?.category || 'all',
    date: initialFilters?.date || '',
  })

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

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

  // Pagination Logic
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE)
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

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
      {/* Create / Edit Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-xl w-full relative">
            <button 
                onClick={() => {
                    setIsCreating(false)
                    setEditingTransaction(null)
                }}
                className="absolute -top-12 right-0 text-white/50 hover:text-white transition-colors"
            >
                <X className="w-8 h-8" />
            </button>
            <EntryForm 
                key={editingTransaction?._id || 'new'}
                initialData={editingTransaction || undefined}
                onSuccess={() => {
                    setIsCreating(false)
                    setEditingTransaction(null)
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
                <Link href={backLink} className="p-2 -ml-2 text-neutral-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1>
                    <p className="text-neutral-400 mt-1">{subtitle}</p>
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
                {!hideGlobalActions && (
                  <>
                    <div className="h-8 w-px bg-neutral-800 mx-2 hidden md:block"></div>
                    <CurrencyToggle />
                    <LogoutButton />
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold shadow-lg shadow-blue-900/20">AF</div>
                  </>
                )}
            </div>
        </header>

        {/* Filters */}
        <section>
            <FilterBar filters={filters} setFilters={setFilters} transactions={initialTransactions} />
        </section>

        {/* Ledger */}
        <section>
            <Ledger 
                transactions={paginatedTransactions} 
                selectable
                selectedIds={selectedIds}
                onSelect={setSelectedIds}
                onEdit={handleEdit}
            />
            {totalPages > 1 && (
                <div className="flex justify-between items-center bg-neutral-900 border border-neutral-800 p-4 rounded-xl mt-4">
                    <p className="text-sm text-neutral-400">
                        Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length)} of {filteredTransactions.length} results
                    </p>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 border border-neutral-800 rounded-lg text-sm font-medium bg-neutral-950 disabled:opacity-50 hover:bg-neutral-800 transition-colors"
                        >
                            Previous
                        </button>
                        <button 
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 border border-neutral-800 rounded-lg text-sm font-medium bg-neutral-950 disabled:opacity-50 hover:bg-neutral-800 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </section>
      </div>
    </main>
  )
}
