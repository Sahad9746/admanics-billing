'use client'

import { Transaction } from "@/types"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { useCurrency } from "@/components/Providers"
import Link from "next/link"

export function Ledger({ 
  transactions,
  selectable = false,
  selectedIds = [],
  onSelect
}: { 
  transactions: Transaction[]
  selectable?: boolean
  selectedIds?: string[]
  onSelect?: (ids: string[]) => void
}) {
  const { currency } = useCurrency()

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
    <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
        <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Recent Transactions</h2>
            {selectable && selectedIds.length > 0 && (
                <span className="text-sm text-neutral-400">{selectedIds.length} selected</span>
            )}
        </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-neutral-400">
          <thead className="bg-neutral-950 text-neutral-200 uppercase font-medium">
            <tr>
              {selectable && (
                  <th className="px-6 py-4 w-10">
                      <input 
                        type="checkbox" 
                        className="rounded border-neutral-700 bg-neutral-800 text-blue-600 focus:ring-offset-neutral-900"
                        checked={transactions.length > 0 && selectedIds.length === transactions.length}
                        onChange={handleSelectAll}
                      />
                  </th>
              )}
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {transactions.length === 0 ? (
                <tr>
                    <td colSpan={selectable ? 5 : 4} className="px-6 py-8 text-center text-neutral-500">
                        No transactions found.
                    </td>
                </tr>
            ) : (
                transactions.map((t) => (
                <tr key={t._id} className={`group cursor-pointer relative transition-colors ${
                    t.status === 'deleted' ? 'bg-neutral-900/50 grayscale opacity-60' : 'hover:bg-neutral-800/50'
                } ${selectedIds.includes(t._id) ? 'bg-blue-900/10 hover:bg-blue-900/20' : ''}`}>
                    {selectable && (
                        <td className="px-6 py-4 relative z-20">
                             <input 
                                type="checkbox" 
                                className="rounded border-neutral-700 bg-neutral-800 text-blue-600 focus:ring-offset-neutral-900 cursor-pointer"
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
                    <td className="px-6 py-4 font-medium text-white relative z-10 pointer-events-none">
                        {t.title}
                        {t.status === 'deleted' && <span className="ml-2 text-xs text-red-500 font-bold uppercase">(Deleted)</span>}
                    </td>
                    <td className="px-6 py-4 relative z-10 pointer-events-none">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-800 text-neutral-300 border border-neutral-700">
                        {t.category}
                    </span>
                    </td>
                    <td className={`px-6 py-4 text-right font-medium relative z-10 pointer-events-none ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, currency)}
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

