'use client'

import { Transaction } from "@/types"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { useCurrency } from "@/components/Providers"
import Link from "next/link"
import { Edit2 } from "lucide-react"

export function Ledger({ 
  transactions,
  selectable = false,
  selectedIds = [],
  onSelect,
  onEdit
}: { 
  transactions: Transaction[]
  selectable?: boolean
  selectedIds?: string[]
  onSelect?: (ids: string[]) => void
  onEdit?: (t: Transaction) => void
}) {
  const { currency, exchangeRate } = useCurrency()

  const handleSelectAll = () => {
    if (!onSelect) return
    if (selectedIds.length === transactions.length) {
      onSelect([])
    } else {
      onSelect(transactions.map(t => t._id))
    }
  }

  const handleSelectOne = (id: string) => {
    if (!onSelect) return
    if (selectedIds.includes(id)) {
      onSelect(selectedIds.filter(selectedId => selectedId !== id))
    } else {
      onSelect([...selectedIds, id])
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 shadow-sm flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
            {selectable && selectedIds.length > 0 && (
                <span className="text-sm text-gray-500">{selectedIds.length} selected</span>
            )}
        </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-500">
          <thead className="bg-gray-50 text-gray-900 uppercase font-medium">
            <tr>
              {selectable && (
                  <th className="px-6 py-4 w-10">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-offset-neutral-900"
                        checked={transactions.length > 0 && selectedIds.length === transactions.length}
                        onChange={handleSelectAll}
                      />
                  </th>
              )}
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4 text-right">Amount</th>
              {onEdit && <th className="px-6 py-4 text-right w-16">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transactions.length === 0 ? (
                <tr>
                    <td colSpan={selectable ? (onEdit ? 6 : 5) : (onEdit ? 5 : 4)} className="px-6 py-8 text-center text-gray-500">
                        No transactions found.
                    </td>
                </tr>
            ) : (
                transactions.map((t) => (
                <tr key={t._id} className={`group cursor-pointer relative transition-colors hover:bg-gray-100/50 ${selectedIds.includes(t._id) ? 'bg-blue-900/10 hover:bg-blue-900/20' : ''}`}>
                    {selectable && (
                        <td className="px-6 py-4 relative z-20">
                             <input 
                                type="checkbox" 
                                className="rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-offset-neutral-900 cursor-pointer"
                                checked={selectedIds.includes(t._id)}
                                onChange={() => handleSelectOne(t._id)}
                                onClick={(e) => e.stopPropagation()}
                              />
                        </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={`/transaction/${t._id}`} className="absolute inset-0 z-10" />
                    {t.date ? format(new Date(t.date), 'MMM d, yyyy') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 relative z-10 pointer-events-none">
                        <div>{t.title}</div>
                        {t.client?.name && (
                            <div className="text-xs text-gray-500 font-normal mt-0.5 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                {t.client.name}
                            </div>
                        )}
                    </td>
                    <td className="px-6 py-4 relative z-10 pointer-events-none">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300">
                        {t.category}
                    </span>
                    </td>
                    <td className={`px-6 py-4 text-right font-medium relative z-10 pointer-events-none ${['income', 'credit'].includes(t.type) ? 'text-green-500' : 'text-red-500'}`}>
                    {['income', 'credit'].includes(t.type) ? '+' : '-'}{formatCurrency(t.amount, currency, exchangeRate)}
                    </td>
                    {onEdit && (
                        <td className="px-6 py-4 text-right relative z-20">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    e.preventDefault()
                                    onEdit(t)
                                }}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-colors bg-gray-50 border border-gray-200 rounded-lg inline-flex"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                        </td>
                    )}
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

