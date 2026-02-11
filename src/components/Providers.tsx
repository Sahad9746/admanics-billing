'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Currency = 'USD' | 'INR'

interface CurrencyContextType {
  currency: Currency
  setCurrency: (currency: Currency) => void
  exchangeRate: number
  isLoading: boolean
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function Providers({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('INR') // Default to INR
  const [exchangeRate, setExchangeRate] = useState<number>(83.5) // Fallback rate
  const [isLoading, setIsLoading] = useState(false)

  // Fetch live exchange rate when currency changes to USD
  useEffect(() => {
    if (currency === 'USD') {
      setIsLoading(true)
      
      // Using exchangerate-api.com (free tier: 1500 requests/month)
      fetch('https://api.exchangerate-api.com/v4/latest/USD')
        .then(res => res.json())
        .then(data => {
          if (data.rates && data.rates.INR) {
            setExchangeRate(data.rates.INR)
          }
        })
        .catch(error => {
          console.error('Failed to fetch exchange rate:', error)
          // Keep fallback rate
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [currency])

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, exchangeRate, isLoading }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency must be used within a Providers')
  }
  return context
}
