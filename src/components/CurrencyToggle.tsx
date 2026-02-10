'use client'

import { useCurrency } from "@/components/Providers"

export function CurrencyToggle() {
  const { currency, setCurrency } = useCurrency()

  return (
    <div className="flex bg-neutral-900 rounded-lg p-1 border border-neutral-800">
      <button
        onClick={() => setCurrency('USD')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
          currency === 'USD'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-neutral-400 hover:text-white'
        }`}
      >
        USD
      </button>
      <button
        onClick={() => setCurrency('INR')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
          currency === 'INR'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-neutral-400 hover:text-white'
        }`}
      >
        INR
      </button>
    </div>
  )
}
