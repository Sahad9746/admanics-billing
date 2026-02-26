'use client'

import { Search, X } from "lucide-react"

export interface Filters {
  search: string
  type: string
  category: string
  date: string
}

interface FilterBarProps {
  filters: Filters
  setFilters: (filters: Filters) => void
  transactions?: any[]
}

export function FilterBar({ filters, setFilters, transactions = [] }: FilterBarProps) {
  const handleChange = (key: keyof Filters, value: string) => {
    setFilters({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      category: 'all',
      date: '',
    })
  }

  const hasActiveFilters = 
    filters.search || 
    filters.type !== 'all' || 
    filters.category !== 'all' || 
    filters.date

  const defaultCategories = ['Ad Spend', 'Service Fee', 'Salary', 'Tools', 'Capital', 'Misc']
  const uniqueCategories = Array.from(new Set([
    ...defaultCategories,
    ...transactions.map(t => t.category).filter(Boolean)
  ])).sort()

  return (
    <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
      
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
        <input
          type="text"
          placeholder="Search transactions..."
          value={filters.search}
          onChange={(e) => handleChange('search', e.target.value)}
          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Type Filter */}
      <select
        value={filters.type}
        onChange={(e) => handleChange('type', e.target.value)}
        className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="all">All Types</option>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
        <option value="credit">Credit</option>
      </select>

      {/* Category Filter */}
      <select
        value={filters.category}
        onChange={(e) => handleChange('category', e.target.value)}
        className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="all">All Categories</option>
        {uniqueCategories.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>



       {/* Date Filter */}
       <input
        type="date"
        value={filters.date}
        onChange={(e) => handleChange('date', e.target.value)}
        className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        aria-label="Filter by Date"
      />

      {/* Clear Button - always visible */}
      <button
        onClick={clearFilters}
        className={`flex items-center gap-1 text-sm px-3 py-2 rounded-lg border transition-colors shrink-0 ${
          hasActiveFilters
            ? 'text-red-400 border-red-500/30 bg-red-500/10 hover:bg-red-500/20'
            : 'text-neutral-600 border-neutral-800 bg-neutral-950 cursor-default'
        }`}
        disabled={!hasActiveFilters}
      >
        <X className="w-4 h-4" />
        Clear
      </button>
    </div>
  )
}
