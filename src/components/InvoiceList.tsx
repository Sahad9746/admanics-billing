'use client'

import { Plus, Download, Trash2, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { useCurrency } from "@/components/Providers"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { deleteInvoice } from "@/app/actions"
import { DeleteModal } from "@/components/DeleteModal"
import toast from "react-hot-toast"
import { useState } from "react"

export function InvoiceList({ initialInvoices, clients, projects }: { initialInvoices: any[], clients: any[], projects: any[] }) {
  const { currency, exchangeRate } = useCurrency()
  const [invoiceToDelete, setInvoiceToDelete] = useState<any>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

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

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Link
          href="/invoices/create"
          className="bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
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
              {initialInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">
                    No invoices generated yet.
                  </td>
                </tr>
              ) : (
                initialInvoices.map((invoice) => (
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
    </div>
  )
}
