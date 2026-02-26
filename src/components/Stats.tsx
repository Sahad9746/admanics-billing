'use client'

import { Transaction } from "@/types"
import { formatCurrency } from "@/lib/utils"
import { useCurrency } from "@/components/Providers"
import { TrendingUp, TrendingDown, Wallet, ArrowRightLeft, RotateCcw } from "lucide-react"
import { useState } from "react"

function FlipCard({
  front,
  back,
}: {
  front: React.ReactNode
  back: React.ReactNode
}) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div
      className="relative h-[110px] cursor-pointer"
      style={{ perspective: '1000px' }}
      onClick={() => setFlipped(f => !f)}
    >
      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {front}
        </div>

        {/* Back */}
        <div
          className="absolute inset-0"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {back}
        </div>
      </div>
    </div>
  )
}

export function Stats({ transactions }: { transactions: Transaction[] }) {
  const { currency, exchangeRate } = useCurrency()

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + Math.abs(t.amount), 0)

  const totalCredits = transactions
    .filter((t) => t.type === 'credit')
    .reduce((acc, t) => acc + Math.abs(t.amount), 0)

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + Math.abs(t.amount), 0)

  const adSpend = transactions
    .filter((t) => t.type === 'expense' && (t.category === 'Ad Spend' || t.category === 'Ads'))
    .reduce((acc, t) => acc + Math.abs(t.amount), 0)

  const netBalance = totalIncome + totalCredits - totalExpenses
  // Company fund = income fees - non-adspend expenses (operational costs)
  const companyFund = totalIncome - (totalExpenses - adSpend)
  // Credit balance = credits received - ad spend used
  const creditBalance = totalCredits - adSpend
  const creditCount = transactions.filter((t) => t.type === 'credit').length
  // Total revenue = everything that came in
  const totalRevenue = totalIncome + totalCredits

  const cardBase = 'w-full h-full p-5 rounded-xl border flex flex-col justify-between'
  const hint = <span className="text-[10px] text-neutral-600 absolute bottom-2 right-3 flex items-center gap-1"><RotateCcw className="w-2.5 h-2.5" /> tap to flip</span>

  return (
    <>
      {/* Net Balance */}
      <FlipCard
        front={
          <div className={`${cardBase} bg-neutral-900 border-green-500/20 relative`}>
            {hint}
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-green-500/10 shrink-0">
                <ArrowRightLeft className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-neutral-400 text-xs font-medium uppercase tracking-wider">Net Balance</p>
                <p className={`text-2xl font-bold mt-1 ${netBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(netBalance, currency, exchangeRate)}
                </p>
              </div>
            </div>
          </div>
        }
        back={
          <div className={`${cardBase} bg-green-950/40 border-green-500/30 relative`}>
            {hint}
            <p className="text-green-300 text-xs font-semibold uppercase tracking-wider">Total Revenue In</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(totalRevenue, currency, exchangeRate)}</p>
            <p className="text-xs text-neutral-400">All income + client credits combined</p>
          </div>
        }
      />

      {/* Service Fee Income */}
      <FlipCard
        front={
          <div className={`${cardBase} bg-neutral-900 border-emerald-500/20 relative`}>
            {hint}
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 shrink-0">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-neutral-400 text-xs font-medium uppercase tracking-wider">Service Fee Income</p>
                <p className="text-2xl font-bold mt-1 text-emerald-400">
                  {formatCurrency(totalIncome, currency, exchangeRate)}
                </p>
              </div>
            </div>
          </div>
        }
        back={
          <div className={`${cardBase} bg-emerald-950/40 border-emerald-500/30 relative`}>
            {hint}
            <p className="text-emerald-300 text-xs font-semibold uppercase tracking-wider">Company Fund</p>
            <p className={`text-2xl font-bold ${companyFund >= 0 ? 'text-white' : 'text-red-400'}`}>
              {formatCurrency(companyFund, currency, exchangeRate)}
            </p>
            <p className="text-xs text-neutral-400">Fees collected minus operating costs</p>
          </div>
        }
      />

      {/* Client Credits */}
      <FlipCard
        front={
          <div className={`${cardBase} bg-neutral-900 border-blue-500/20 relative`}>
            {hint}
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-blue-500/10 shrink-0">
                <Wallet className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-neutral-400 text-xs font-medium uppercase tracking-wider">Client Credits</p>
                <p className="text-2xl font-bold mt-1 text-blue-400">
                  {formatCurrency(totalCredits, currency, exchangeRate)}
                </p>
              </div>
            </div>
          </div>
        }
        back={
          <div className={`${cardBase} bg-blue-950/40 border-blue-500/30 relative`}>
            {hint}
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-300 text-xs font-semibold uppercase tracking-wider">Credit Balance</p>
                <p className={`text-xl font-bold mt-0.5 ${creditBalance >= 0 ? 'text-white' : 'text-red-400'}`}>
                  {formatCurrency(creditBalance, currency, exchangeRate)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-neutral-500 text-xs">Transactions</p>
                <p className="text-2xl font-bold text-blue-300">{creditCount}</p>
              </div>
            </div>
            <p className="text-xs text-neutral-400">Credits received minus ad spend used</p>
          </div>
        }
      />

      {/* Total Expenses */}
      <FlipCard
        front={
          <div className={`${cardBase} bg-neutral-900 border-red-500/20 relative`}>
            {hint}
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-red-500/10 shrink-0">
                <TrendingDown className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-neutral-400 text-xs font-medium uppercase tracking-wider">Total Expenses</p>
                <p className="text-2xl font-bold mt-1 text-red-400">
                  {formatCurrency(totalExpenses, currency, exchangeRate)}
                </p>
              </div>
            </div>
          </div>
        }
        back={
          <div className={`${cardBase} bg-red-950/40 border-red-500/30 relative`}>
            {hint}
            <p className="text-red-300 text-xs font-semibold uppercase tracking-wider">Ad Spend</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(adSpend, currency, exchangeRate)}</p>
            <p className="text-xs text-neutral-400">
              Operating: {formatCurrency(totalExpenses - adSpend, currency, exchangeRate)}
            </p>
          </div>
        }
      />
    </>
  )
}
