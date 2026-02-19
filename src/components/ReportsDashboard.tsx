'use client'

import { Transaction } from "@/types"
import { useCurrency } from "@/components/Providers"
import { formatCurrency } from "@/lib/utils"
import { Download } from "lucide-react"

export function ReportsDashboard({ transactions }: { transactions: Transaction[] }) {
  const { currency, exchangeRate } = useCurrency()

  const incomeByCategory = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)

  const expenseByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)

  const downloadCSV = () => {
    const headers = ['Date', 'Title', 'Type', 'Category', 'Amount', 'Currency']
    const csvContent = [
      headers.join(','),
      ...transactions.map(t => [
        t.date,
        `"${t.title.replace(/"/g, '""')}"`,
        t.type,
        t.category,
        t.amount,
        currency
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `admanics-finance-report-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <button
          onClick={downloadCSV}
          className="bg-neutral-800 text-white font-medium py-2 px-4 rounded-lg hover:bg-neutral-700 transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Income by Category</h3>
          <div className="space-y-4">
            {Object.entries(incomeByCategory).sort((a,b) => b[1] - a[1]).map(([category, amount]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-neutral-400">{category}</span>
                <span className="font-semibold text-white">{formatCurrency(amount, currency, exchangeRate)}</span>
              </div>
            ))}
            {Object.keys(incomeByCategory).length === 0 && <p className="text-neutral-500 text-sm">No income recorded.</p>}
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Expenses by Category</h3>
          <div className="space-y-4">
            {Object.entries(expenseByCategory).sort((a,b) => b[1] - a[1]).map(([category, amount]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-neutral-400">{category}</span>
                <span className="font-semibold text-white">{formatCurrency(amount, currency, exchangeRate)}</span>
              </div>
            ))}
            {Object.keys(expenseByCategory).length === 0 && <p className="text-neutral-500 text-sm">No expenses recorded.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
