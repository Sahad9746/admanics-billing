'use client'

import { useState } from "react"
import { updateEmployeeProfile, deleteEmployeeProfile } from "@/app/actions"
import toast from "react-hot-toast"
import { Pencil, X, Check, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

export function EmployeeEditClient({ employee }: { employee: any }) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const res = await updateEmployeeProfile(employee._id, formData)
    if (res?.success) {
      toast.success("Profile updated successfully")
      setIsEditing(false)
      router.refresh()
    } else {
      toast.error(res?.error || "Failed to update profile")
    }
    setIsSubmitting(false)
  }

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${employee.name}? This cannot be undone.`)) return
    
    setIsSubmitting(true)
    const res = await deleteEmployeeProfile(employee._id)
    if (res?.success) {
      toast.success("Employee deleted successfully")
      router.push('/payroll')
    } else {
      toast.error(res?.error || "Failed to delete employee")
      setIsSubmitting(false)
    }
  }

  if (!isEditing) {
    return (
      <button 
        onClick={() => setIsEditing(true)}
        className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
      >
        <Pencil className="w-3.5 h-3.5" /> Edit Settings
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white">Edit Employee</h3>
          <button onClick={() => setIsEditing(false)} className="text-neutral-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Full Name</label>
            <input 
              type="text" 
              name="name" 
              defaultValue={employee.name} 
              required 
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Email Address</label>
            <input 
              type="email" 
              name="email" 
              defaultValue={employee.email} 
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Designation</label>
            <input 
              type="text" 
              name="designation" 
              defaultValue={employee.designation} 
              required 
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Base Salary (₹)</label>
            <input 
              type="number" 
              name="baseSalary" 
              defaultValue={employee.baseSalary} 
              required 
              min="0"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
            <p className="text-xs text-neutral-500 mt-1">Updates will affect all future payroll runs.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Status</label>
            <select 
              name="status" 
              defaultValue={employee.status || 'active'} 
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Saving...' : <><Check className="w-4 h-4" /> Save</>}
            </button>
            <button 
              type="button" 
              onClick={handleDelete}
              disabled={isSubmitting}
              className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-500 border border-red-500/30 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
