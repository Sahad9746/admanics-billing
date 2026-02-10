'use client'

import { Transaction } from "@/types"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { useCurrency } from "@/components/Providers"
import Link from "next/link"

export function Ledger({ transactions }: { transactions: Transaction[] }) {
  const { currency } = useCurrency()

  return (
    <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
        <div className="p-6 border-b border-neutral-800">
            <h2 className="text-xl font-semibold text-white">Recent Transactions</h2>
        </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-neutral-400">
          <thead className="bg-neutral-950 text-neutral-200 uppercase font-medium">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {transactions.length === 0 ? (
                <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-neutral-500">
                        No transactions found.
                    </td>
                </tr>
            ) : (
                transactions.map((t) => (
                <tr key={t._id} className="hover:bg-neutral-800/50 transition-colors group cursor-pointer relative">
                    <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={`/transaction/${t._id}`} className="absolute inset-0 z-10" />
                    {t.date ? format(new Date(t.date), 'MMM d, yyyy') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 font-medium text-white">{t.title}</td>
                    <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-800 text-neutral-300 border border-neutral-700">
                        {t.category}
                    </span>
                    </td>
                    <td className={`px-6 py-4 text-right font-medium ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
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

