'use client'

import { useState } from "react"
import { addWallet, editWallet } from "@/app/actions"
import { Loader2, X } from "lucide-react"
import toast from "react-hot-toast"

interface WalletFormProps {
  initialData?: any
  onSuccess: () => void
  onCancel: () => void
}

export function WalletForm({ initialData, onSuccess, onCancel }: WalletFormProps) {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    let result
    if (initialData) {
      result = await editWallet(initialData._id, formData)
    } else {
      result = await addWallet(formData)
    }
    setLoading(false)

    if (result.success) {
      toast.success(initialData ? "Wallet updated successfully" : "Wallet added successfully")
      onSuccess()
    } else {
      toast.error(result.error || `Failed to ${initialData ? 'update' : 'add'} wallet`)
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
      <h2 className="text-xl font-bold text-white mb-6">{initialData ? 'Edit Wallet' : 'Create New Wallet'}</h2>
      
      <form action={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-1.5">Wallet Name</label>
          <input
            name="name"
            required
            defaultValue={initialData?.name}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder:text-neutral-600"
            placeholder="e.g., HDFC Current Account"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-1.5">Type</label>
          <select
            name="type"
            required
            defaultValue={initialData?.type || 'bank'}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
          >
            <option value="bank">Bank Account</option>
            <option value="cash">Cash</option>
            <option value="digital_payment">Digital Wallet (Paytm/Stripe)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-1.5">Currency</label>
          <select
            name="currency"
            required
            defaultValue={initialData?.currency || 'INR'}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="AED">AED (د.إ)</option>
            <option value="EUR">EUR (€)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-black font-semibold py-3 px-4 rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-6"
        >
          {loading ? (
             <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
             'Create Wallet'
          )}
        </button>
      </form>
    </div>
  )
}
