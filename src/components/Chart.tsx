'use client'

import { Transaction } from "@/types"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useCurrency } from "@/components/Providers"
import { formatCurrency } from "@/lib/utils"

export function Chart({ transactions }: { transactions: Transaction[] }) {
  const { currency, exchangeRate } = useCurrency()

  // Aggregate data by month
  const data = transactions.reduce((acc, t) => {
    const date = new Date(t.date)
    const month = date.toLocaleString('default', { month: 'short', year: 'numeric' })
    const existing = acc.find((item) => item.month === month)

    if (existing) {
      if (['income', 'credit'].includes(t.type)) {
        existing.income += t.amount
      } else if (t.type === 'expense') {
        existing.expense += t.amount
      }
    } else {
      acc.push({
        month,
        income: ['income', 'credit'].includes(t.type) ? t.amount : 0,
        expense: t.type === 'expense' ? t.amount : 0,
      })
    }
    return acc
  }, [] as { month: string; income: number; expense: number }[])

  // Sort by date (naive approach, assumes transaction order helps or month string sort)
  // Better to sort transactions by date first, which we do in the query.
  // Actually the reduce might scramble order if not careful, but if transactions are sorted by date desc, then month order will be desc.
  // We want asc for chart.
  const chartData = [...data].reverse()

  return (
    <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 h-[400px]">

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
          <XAxis dataKey="month" stroke="#888" tick={{ fill: '#888' }} axisLine={false} tickLine={false} />
          <YAxis 
            stroke="#888" 
            tick={{ fill: '#888' }} 
            axisLine={false} 
            tickLine={false} 
            tickFormatter={(value) => formatCurrency(value, currency, exchangeRate)} 
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#171717', border: '1px solid #333', borderRadius: '8px' }}
            itemStyle={{ color: '#fff' }}
            formatter={(value: any) => [formatCurrency(value || 0, currency, exchangeRate), '']}
          />
          <Legend />
          <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

