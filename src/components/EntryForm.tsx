'use client'

import { addTransaction, editTransaction } from "@/app/actions"
import { useCurrency } from "@/components/Providers"
import { Transaction } from "@/types"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { format } from "date-fns"

import toast from "react-hot-toast"

import { Trash2, Plus } from "lucide-react"

interface EntryFormProps {
  initialData?: Transaction
  onSuccess?: () => void
}

export function EntryForm({ initialData, onSuccess }: EntryFormProps) {
  const [loading, setLoading] = useState(false)
  const { currency } = useCurrency()
  const [customFields, setCustomFields] = useState<{ label: string; value: string }[]>(
    initialData?.customFields || []
  )

  const handleAddField = () => {
    setCustomFields([...customFields, { label: '', value: '' }])
  }

  const handleRemoveField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index))
  }

  const handleFieldChange = (index: number, key: 'label' | 'value', value: string) => {
    const newFields = [...customFields]
    newFields[index][key] = value
    setCustomFields(newFields)
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    
    // Add time to date if missing (for correct date storing)
    const dateInput = formData.get('date') as string
    if (dateInput && !dateInput.includes('T')) {
       formData.set('date', new Date(dateInput).toISOString())
    }

    // Add custom fields to form data
    formData.set('customFields', JSON.stringify(customFields))

    const action = formData.get('_action') as string

    let result
    if (initialData) {
      result = await editTransaction(initialData._id, formData)
    } else {
      result = await addTransaction(formData)
    }
    
    setLoading(false)
    
    if (result.success) {
        toast.success(initialData ? 'Transaction updated' : 'Transaction created')
        
        if (action === 'save_create_another') {
            // Reset form
            const form = document.getElementById('entry-form') as HTMLFormElement
            form?.reset()
            setCustomFields([])
            // Don't close modal, just refresh list in background if needed (though router.refresh handles specific paths)
        } else {
            if (onSuccess) {
                onSuccess()
            } else if (!initialData) {
                const form = document.getElementById('entry-form') as HTMLFormElement
                form?.reset()
                setCustomFields([])
            }
        }
    } else {
        toast.error(result.error || 'Operation failed')
    }
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
      <h2 className="text-xl font-bold text-white mb-6">
        {initialData ? 'Edit Transaction' : 'New Entry'}
      </h2>
      <form id="entry-form" action={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-1.5">Title</label>
          <input
            name="title"
            required
            defaultValue={initialData?.title}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder:text-neutral-600"
            placeholder="e.g., Website Redesign"
          />
        </div>

        <div>
           <label className="block text-sm font-medium text-neutral-400 mb-1.5">Description (Optional)</label>
           <textarea
             name="description"
             rows={3}
             defaultValue={initialData?.description}
             className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder:text-neutral-600 resize-none"
             placeholder="Add details about this transaction..."
           />
        </div>

        {/* Custom Fields */}
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-neutral-400">Custom Fields</label>
                <button
                    type="button"
                    onClick={handleAddField}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                >
                    <Plus className="w-3 h-3" />
                    Add Field
                </button>
            </div>
            {customFields.map((field, index) => (
                <div key={index} className="flex items-center gap-2">
                    <input
                        placeholder="Label"
                        value={field.label}
                        onChange={(e) => handleFieldChange(index, 'label', e.target.value)}
                        className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                    <input
                        placeholder="Value"
                        value={field.value}
                        onChange={(e) => handleFieldChange(index, 'value', e.target.value)}
                        className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                    <button
                        type="button"
                        onClick={() => handleRemoveField(index)}
                        className="p-2 text-neutral-500 hover:text-red-400 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1.5">Amount ({currency})</label>
            <input
              name="amount"
              type="number"
              required
              step="0.01"
              defaultValue={initialData?.amount}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder:text-neutral-600"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1.5">Date</label>
            <input
              name="date"
              type="date"
              required
              defaultValue={initialData?.date ? format(new Date(initialData.date), 'yyyy-MM-dd') : ''}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all [color-scheme:dark]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1.5">Type</label>
            <select
              name="type"
              required
              defaultValue={initialData?.type || 'income'}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all appearance-none"
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1.5">Category</label>
            <select
              name="category"
              required
              defaultValue={initialData?.category || 'Client'}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all appearance-none"
            >
              <option value="Client">Client</option>
              <option value="Payroll">Payroll</option>
              <option value="Software">Software</option>
              <option value="Ads">Ads</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2">
            <button
            type="submit"
            name="_action"
            value="save"
            disabled={loading}
            className="w-full bg-white text-black font-semibold py-3 px-4 rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
            {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
                initialData ? 'Update Transaction' : 'Save Transaction'
            )}
            </button>
            
            {!initialData && (
                <button
                    type="submit"
                    name="_action"
                    value="save_create_another"
                    disabled={loading}
                    className="w-full bg-neutral-800 text-white font-semibold py-3 px-4 rounded-xl hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center border border-neutral-700"
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        'Save & Create Another'
                    )}
                </button>
            )}
        </div>
      </form>
    </div>
  )
}
