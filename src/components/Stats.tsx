'use client'

import { Transaction } from "@/types"
import { formatCurrency } from "@/lib/utils"
import { useCurrency } from "@/components/Providers"

export function Stats({ transactions }: { transactions: Transaction[] }) {
  const { currency } = useCurrency()

  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0)

  const expense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0)

  const net = income - expense

  return (
    <>
      <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800">
        <h3 className="text-neutral-400 text-sm font-medium uppercase tracking-wider">Total Revenue</h3>
        <p className="text-3xl font-bold text-white mt-2">{formatCurrency(income, currency)}</p>
      </div>
      <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800">
        <h3 className="text-neutral-400 text-sm font-medium uppercase tracking-wider">Total Expenses</h3>
        <p className="text-3xl font-bold text-white mt-2">{formatCurrency(expense, currency)}</p>
      </div>
      <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800">
        <h3 className="text-neutral-400 text-sm font-medium uppercase tracking-wider">Net Cash</h3>
        <p className={`text-3xl font-bold mt-2 ${net >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {formatCurrency(net, currency)}
        </p>
      </div>
    </>
  )
}

