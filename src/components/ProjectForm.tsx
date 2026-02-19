'use client'

import { useState } from "react"
import { addProject, editProject } from "@/app/actions"
import { Loader2, X } from "lucide-react"
import toast from "react-hot-toast"

interface ProjectFormProps {
  initialData?: any
  clients: any[]
  onSuccess: () => void
  onCancel: () => void
}

export function ProjectForm({ initialData, clients, onSuccess, onCancel }: ProjectFormProps) {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    
    let result
    if (initialData) {
      result = await editProject(initialData._id, formData)
    } else {
      result = await addProject(formData)
    }
    
    setLoading(false)

    if (result.success) {
      toast.success(initialData ? "Project updated successfully" : "Project added successfully")
      onSuccess()
    } else {
      toast.error(result.error || `Failed to ${initialData ? 'update' : 'add'} project`)
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
      <h2 className="text-xl font-bold text-white mb-6">{initialData ? 'Edit Project' : 'Create New Project'}</h2>
      
      <form action={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-1.5">Project Name</label>
          <input
            name="name"
            required
            defaultValue={initialData?.name}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder:text-neutral-600"
            placeholder="e.g., Q3 Marketing Campaign"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-1.5">Client</label>
          <select
            name="clientId"
            required
            defaultValue={initialData?.client?._id || ''}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
          >
            <option value="">Select a client...</option>
            {clients.map(client => (
              <option key={client._id} value={client._id}>{client.name}</option>
            ))}
          </select>
        </div>

        <div>
           <label className="block text-sm font-medium text-neutral-400 mb-1.5">Budget</label>
           <input
             name="budget"
             type="number"
             step="0.01"
             defaultValue={initialData?.budget}
             className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder:text-neutral-600"
             placeholder="5000.00"
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
               <option value="completed">Completed</option>
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
             'Create Project'
          )}
        </button>
      </form>
    </div>
  )
}
