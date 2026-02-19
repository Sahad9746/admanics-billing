'use client'

import { useState } from "react"
import { addClient, editClient } from "@/app/actions"
import { Loader2, X } from "lucide-react"
import toast from "react-hot-toast"

interface ClientFormProps {
  initialData?: any
  onSuccess: () => void
  onCancel: () => void
}

export function ClientForm({ initialData, onSuccess, onCancel }: ClientFormProps) {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    
    let result
    if (initialData) {
      result = await editClient(initialData._id, formData)
    } else {
      result = await addClient(formData)
    }
    
    setLoading(false)

    if (result.success) {
      toast.success(initialData ? "Client updated successfully" : "Client added successfully")
      onSuccess()
    } else {
      toast.error(result.error || `Failed to ${initialData ? 'update' : 'add'} client`)
    }
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl w-full max-w-md relative">
      <button 
        onClick={onCancel}
        className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
      <h2 className="text-xl font-bold text-white mb-6">{initialData ? 'Edit Client' : 'Add New Client'}</h2>
      
      <form action={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-1.5">Company Name</label>
          <input
            name="name"
            required
            defaultValue={initialData?.name}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder:text-neutral-600"
            placeholder="e.g., Acme Corp"
          />
        </div>

        <div>
           <label className="block text-sm font-medium text-neutral-400 mb-1.5">Contact Person</label>
           <input
             name="contactPerson"
             required
             defaultValue={initialData?.contactPerson}
             className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder:text-neutral-600"
             placeholder="e.g., John Doe"
           />
        </div>

        <div>
           <label className="block text-sm font-medium text-neutral-400 mb-1.5">Email</label>
           <input
             name="email"
             type="email"
             defaultValue={initialData?.email}
             className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder:text-neutral-600"
             placeholder="john@example.com"
           />
        </div>

        <div>
           <label className="block text-sm font-medium text-neutral-400 mb-1.5">Phone</label>
           <input
             name="phone"
             type="tel"
             defaultValue={initialData?.phone}
             className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder:text-neutral-600"
             placeholder="+1 234 567 890"
           />
        </div>
        
        {initialData && (
          <div>
             <label className="block text-sm font-medium text-neutral-400 mb-1.5">Status</label>
             <select
               name="status"
               defaultValue={initialData.status || 'active'}
               className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
             >
               <option value="active">Active</option>
               <option value="inactive">Inactive</option>
             </select>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-black font-semibold py-3 px-4 rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-6"
        >
          {loading ? (
             <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
             'Save Client'
          )}
        </button>
      </form>
    </div>
  )
}
