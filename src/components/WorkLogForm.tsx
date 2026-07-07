'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { addWorkLog, editWorkLog } from '@/app/actions'
import toast from 'react-hot-toast'

interface WorkLogFormProps {
  initialData?: any
  clientsWithProjects: any[]
  onSuccess?: () => void
  user: { name: string; email: string; role: string }
  preselectedClientId?: string
}

export function WorkLogForm({ initialData, clientsWithProjects, onSuccess, user, preselectedClientId }: WorkLogFormProps) {
  const [loading, setLoading] = useState(false)
  
  // If editing, use the saved client. If new, use the preselected client from the route.
  const [selectedClientId, setSelectedClientId] = useState<string>(
    initialData?.client?._id || initialData?.client?._ref || preselectedClientId || ''
  )

  const selectedClient = clientsWithProjects.find(c => c._id === selectedClientId)
  const availableProjects = selectedClient?.projects || []

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    // Make sure date is formatted correctly if it was missing or modified 
    if (!formData.get('date')) {
        formData.set('date', new Date().toISOString())
    }

    let result
    if (initialData?._id) {
      result = await editWorkLog(initialData._id, formData)
    } else {
      result = await addWorkLog(formData)
    }

    if (result.success) {
      toast.success(initialData ? 'Work log updated' : 'Work log submitted')
      onSuccess?.()
    } else {
      toast.error(result.error || 'Something went wrong')
    }
    
    setLoading(false)
  }

  // Format date correctly for the input
  const defaultDate = initialData?.date 
    ? new Date(initialData.date).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
          <input
            type="date"
            name="date"
            required
            defaultValue={defaultDate}
            className="w-full bg-white border border-gray-200 shadow-sm rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
          <select
            name="clientId"
            required
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            disabled={!!preselectedClientId && !initialData} // Lock it if creating new under a specific client view
            className="w-full bg-white border border-gray-200 shadow-sm rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="" disabled>Select a client...</option>
            {clientsWithProjects.map(client => (
              <option key={client._id} value={client._id}>{client.name}</option>
            ))}
          </select>
          {!!preselectedClientId && !initialData && (
             <input type="hidden" name="clientId" value={selectedClientId} />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
          <select
            name="project"
            required
            defaultValue={initialData?.project || ''}
            disabled={!selectedClientId || availableProjects.length === 0}
            className="w-full bg-white border border-gray-200 shadow-sm rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
          >
            <option value="" disabled>Select a project...</option>
            {availableProjects.map((project: any) => (
              <option key={project._id} value={project.name}>{project.name}</option>
            ))}
          </select>
          {selectedClientId && availableProjects.length === 0 && (
             <p className="text-xs text-red-400 mt-1">This client has no active projects.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Employee Name</label>
          <input
            type="text"
            name="employeeName"
            required
            defaultValue={initialData?.employeeName || user.name}
            className="w-full bg-white border border-gray-200 shadow-sm rounded-lg px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hours Worked</label>
          <input
            type="number"
            name="hoursWorked"
            min="0"
            max="24"
            step="0.5"
            placeholder="8"
            defaultValue={initialData?.hoursWorked || ''}
            className="w-full bg-white border border-gray-200 shadow-sm rounded-lg px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Task Summary</label>
        <textarea
          name="taskSummary"
          required
          rows={3}
          placeholder="Briefly describe what you worked on..."
          defaultValue={initialData?.taskSummary || ''}
          className="w-full bg-white border border-gray-200 shadow-sm rounded-lg px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors resize-y"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            name="status"
            required
            defaultValue={initialData?.status || 'Completed'}
            className="w-full bg-white border border-gray-200 shadow-sm rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="Completed">Completed</option>
            <option value="In Progress">In Progress</option>
            <option value="Blocked">Blocked</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes (Optional)</label>
        <textarea
          name="notes"
          rows={2}
          placeholder="Any blockers or insights?"
          defaultValue={initialData?.notes || ''}
          className="w-full bg-white border border-gray-200 shadow-sm rounded-lg px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors resize-y"
        />
      </div>

      <div className="pt-4 border-t border-gray-200 shadow-sm flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white font-medium py-2.5 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[140px]"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (initialData ? 'Update Log' : 'Submit Log')}
        </button>
      </div>
    </form>
  )
}
