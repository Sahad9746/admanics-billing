'use client'

import { Plus, Download, Trash2, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { useCurrency } from "@/components/Providers"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { deleteInvoice } from "@/app/actions"
import { DeleteModal } from "@/components/DeleteModal"
import toast from "react-hot-toast"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"

export function InvoiceList({ initialInvoices, clients, projects }: { initialInvoices: any[], clients: any[], projects: any[] }) {
  const { currency, exchangeRate } = useCurrency()
  const searchParams = useSearchParams()
  const urlClientFilter = searchParams.get('client')
  
  const [invoiceToDelete, setInvoiceToDelete] = useState<any>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [clientFilter, setClientFilter] = useState(urlClientFilter || 'all')
  const [statusFilter, setStatusFilter] = useState('all')

  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  useEffect(() => {
    setCurrentPage(1)
  }, [clientFilter, statusFilter])

  const handleDeleteConfirm = async () => {
    if (!invoiceToDelete) return
    setDeletingId(invoiceToDelete._id)
    const result = await deleteInvoice(invoiceToDelete._id)
    if (result.success) {
      toast.success('Invoice deleted')
    } else {
      toast.error(result.error || 'Failed to delete invoice')
    }
    setDeletingId(null)
    setInvoiceToDelete(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500/10 text-green-400'
      case 'sent': return 'bg-blue-500/10 text-blue-400'
      case 'overdue': return 'bg-red-500/10 text-red-400'
      default: return 'bg-neutral-800 text-neutral-400'
    }
  }

  const filteredInvoices = initialInvoices.filter(invoice => {
    if (clientFilter !== 'all' && invoice.client?._id !== clientFilter) return false
    if (statusFilter !== 'all' && invoice.status !== statusFilter) return false
    return true
  })

  // Pagination Logic
  const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE)
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-full sm:w-48"
          >
            <option value="all">All Clients</option>
            {clients.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-full sm:w-40"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
        <Link
          href="/invoices/create"
          className="bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shrink-0 w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          Create Invoice
        </Link>
      </div>

      {invoiceToDelete && (
        <DeleteModal
          title="Delete Invoice"
          description={`Are you sure you want to delete ${invoiceToDelete.invoiceNumber}? This action cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setInvoiceToDelete(null)}
          loading={deletingId === invoiceToDelete._id}
        />
      )}

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-300">
            <thead className="bg-neutral-950/50 text-neutral-400 uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Invoice #</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">
                    No invoices match the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedInvoices.map((invoice) => (
                  <tr key={invoice._id} className="hover:bg-neutral-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{invoice.invoiceNumber}</td>
                    <td className="px-6 py-4">
                        <div className="font-medium text-white">{invoice.client?.name || '-'}</div>
                        <div className="text-xs text-neutral-500">{invoice.project?.name || ''}</div>
                    </td>
                    <td className="px-6 py-4">
                        <div>{format(new Date(invoice.date), 'MMM d, yyyy')}</div>
                        <div className="text-xs text-red-400/80">Due: {format(new Date(invoice.dueDate), 'MMM d, yyyy')}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-white">
                        {formatCurrency(invoice.amount, currency, exchangeRate)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-block capitalize ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right items-center justify-end flex gap-2">
                        <Link 
                           href={`/invoices/${invoice._id}`}
                           className="p-2 text-neutral-400 hover:text-white transition-colors bg-neutral-800 hover:bg-neutral-700 rounded-lg" 
                           title="Download PDF"
                        >
                            <Download className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setInvoiceToDelete(invoice)}
                          disabled={deletingId === invoice._id}
                          className="p-2 text-neutral-400 hover:text-red-400 transition-colors bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center rounded-lg"
                        >
                          {deletingId === invoice._id ? <Loader2 className="w-4 h-4 animate-spin text-red-500" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
          <p className="text-sm text-neutral-400">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredInvoices.length)} of {filteredInvoices.length} results
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-neutral-800 rounded-lg text-sm font-medium bg-neutral-950 disabled:opacity-50 hover:bg-neutral-800 transition-colors text-white"
            >
              Previous
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-neutral-800 rounded-lg text-sm font-medium bg-neutral-950 disabled:opacity-50 hover:bg-neutral-800 transition-colors text-white"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
