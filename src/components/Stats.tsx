'use client'

import { Transaction } from "@/types"
import { formatCurrency } from "@/lib/utils"
import { useCurrency } from "@/components/Providers"

export function Stats({ transactions }: { transactions: Transaction[] }) {
  const { currency, exchangeRate } = useCurrency()

  const adSpend = transactions
    .filter((t) => t.category === 'Ad Spend' || t.category === 'Ads')
    .reduce((acc, t) => acc + t.amount, 0)

  const capital = transactions
    .filter((t) => t.type === 'income' && t.category === 'Capital')
    .reduce((acc, t) => acc + t.amount, 0)

  const grossRevenue = transactions
    .filter((t) => t.type === 'income' && t.category !== 'Capital')
    .reduce((acc, t) => acc + t.amount, 0)

  const operatingExpenses = transactions
    .filter((t) => t.type === 'expense' && t.category !== 'Ad Spend' && t.category !== 'Ads')
    .reduce((acc, t) => acc + t.amount, 0)

  const netProfit = grossRevenue - operatingExpenses

  return (
    <>
      <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800">
        <h3 className="text-neutral-400 text-sm font-medium uppercase tracking-wider">Gross Revenue</h3>
        <p className="text-3xl font-bold text-white mt-2">{formatCurrency(grossRevenue, currency, exchangeRate)}</p>
      </div>
      <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800">
        <h3 className="text-neutral-400 text-sm font-medium uppercase tracking-wider">Total Ad Spend</h3>
        <p className="text-3xl font-bold text-purple-400 mt-2">{formatCurrency(adSpend, currency, exchangeRate)}</p>
      </div>
      <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800">
        <h3 className="text-neutral-400 text-sm font-medium uppercase tracking-wider">Operating Expenses</h3>
        <p className="text-3xl font-bold text-red-400 mt-2">{formatCurrency(operatingExpenses, currency, exchangeRate)}</p>
      </div>
      <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800">
        <h3 className="text-neutral-400 text-sm font-medium uppercase tracking-wider">Net Profit</h3>
        <p className={`text-3xl font-bold mt-2 ${netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {formatCurrency(netProfit, currency, exchangeRate)}
        </p>
      </div>
    </>
  )
}

