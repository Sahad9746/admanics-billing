'use client'

import { Search, X } from "lucide-react"

export interface Filters {
  search: string
  type: string
  category: string
  month: string
  date: string
}

interface FilterBarProps {
  filters: Filters
  setFilters: (filters: Filters) => void
}

export function FilterBar({ filters, setFilters }: FilterBarProps) {
  const handleChange = (key: keyof Filters, value: string) => {
    setFilters({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      category: 'all',
      month: '',
      date: '',
    })
  }

  const hasActiveFilters = 
    filters.search || 
    filters.type !== 'all' || 
    filters.category !== 'all' || 
    filters.month || 
    filters.date

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
      </select>

      {/* Category Filter */}
      <select
        value={filters.category}
        onChange={(e) => handleChange('category', e.target.value)}
        className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="all">All Categories</option>
        <option value="Client">Client</option>
        <option value="Payroll">Payroll</option>
        <option value="Software">Software</option>
        <option value="Ads">Ads</option>
      </select>

      {/* Month Filter */}
      <input
        type="month"
        value={filters.month}
        onChange={(e) => handleChange('month', e.target.value)}
        className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        aria-label="Filter by Month"
      />

       {/* Date Filter */}
       <input
        type="date"
        value={filters.date}
        onChange={(e) => handleChange('date', e.target.value)}
        className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        aria-label="Filter by Date"
      />

      {/* Clear Button */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300 transition-colors"
        >
          <X className="w-4 h-4" />
          Clear
        </button>
      )}
    </div>
  )
}
