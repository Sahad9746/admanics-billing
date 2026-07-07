'use client'

import { useState } from "react"
import { createEmployeeProfile } from "@/app/actions"
import toast from "react-hot-toast"

export function EmployeeManager() {
  const [isAdding, setIsAdding] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddEmployee = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const res = await createEmployeeProfile(formData)
    setIsSubmitting(false)
    if (res?.success) {
      toast.success("Employee profile created successfully!")
      setIsAdding(false)
    } else {
      toast.error(res?.error || "Failed to create employee profile")
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-900">Employee Roster</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {isAdding ? 'Cancel' : '+ Add Employee'}
        </button>
      </div>

      {isAdding && (
        <div className="p-6 mb-6 border border-gray-200 shadow-sm bg-white rounded-xl">
          <form onSubmit={handleAddEmployee} className="space-y-4 max-w-xl">
            <h3 className="text-md font-medium text-gray-900 mb-4">Create Employee Profile</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
              <input type="text" name="name" required placeholder="e.g. John Doe" className="w-full bg-white border border-gray-200 shadow-sm rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Email Address (Optional)</label>
              <input type="email" name="email" placeholder="e.g. john@example.com" className="w-full bg-white border border-gray-200 shadow-sm rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Designation / Role</label>
              <input type="text" name="designation" required placeholder="e.g. Developer, Founder" className="w-full bg-white border border-gray-200 shadow-sm rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Monthly Base Salary (₹)</label>
              <input type="number" name="baseSalary" required min="0" placeholder="e.g. 50000" className="w-full bg-white border border-gray-200 shadow-sm rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
