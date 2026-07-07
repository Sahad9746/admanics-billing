'use client'

import { useCurrency } from "@/components/Providers"
import { Loader2 } from "lucide-react"

export function CurrencyToggle() {
  const { currency, setCurrency, exchangeRate, isLoading } = useCurrency()

  return (
    <div className="flex flex-col gap-2">
      <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
        <button
          onClick={() => setCurrency('USD')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
            currency === 'USD'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          USD
        </button>
        <button
          onClick={() => setCurrency('INR')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
            currency === 'INR'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          INR
        </button>
      </div>
      
      {currency === 'USD' && (
        <div className="flex items-center gap-2 text-xs text-gray-500 px-2">
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
