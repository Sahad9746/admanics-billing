'use client'

import { useCurrency } from "@/components/Providers"
import { Loader2 } from "lucide-react"

export function CurrencyToggle() {
  const { currency, setCurrency, exchangeRate, isLoading } = useCurrency()

  return (
    <div className="flex flex-col gap-2">
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
      
      {currency === 'USD' && (
        <div className="flex items-center gap-2 text-xs text-neutral-400 px-2">
          {isLoading ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Fetching rate...</span>
            </>
          ) : (
            <span>1 USD = ₹{exchangeRate.toFixed(2)}</span>
          )}
        </div>
      )}
    </div>
  )
}
