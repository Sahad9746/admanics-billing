import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(
  amount: number, 
  currency: 'USD' | 'INR' = 'INR',
  exchangeRate: number = 83.5
) {
  // If displaying in USD but amount is stored in INR, convert it
  let displayAmount = amount
  if (currency === 'USD') {
    displayAmount = amount / exchangeRate
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: currency === 'USD' ? 2 : 0, // Show cents for USD, no decimals for INR
  }).format(displayAmount)
}
