'use client'

import { addTransaction } from "@/app/actions"
import { useFormStatus } from "react-dom"
import { useRef } from "react"
import { PlusCircle } from "lucide-react"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? (
        'Adding...'
      ) : (
        <>
            <PlusCircle className="w-5 h-5" />
            Add Transaction
        </>
      )}
    </button>
  )
}

export function EntryForm() {
  const ref = useRef<HTMLFormElement>(null)

  return (
    <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800">
      <h2 className="text-xl font-semibold text-white mb-6">New Entry</h2>
      <form
        ref={ref}
        action={async (formData) => {
          await addTransaction(formData)
          ref.current?.reset()
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-1">Title</label>
          <input
            type="text"
            name="title"
            required
            placeholder="e.g. Website Design"
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-1">Amount</label>
          <input
            type="number"
            name="amount"
            required
            step="0.01"
            placeholder="0.00"
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Type</label>
                <div className="flex bg-neutral-950 rounded-lg p-1 border border-neutral-800">
                    <label className="flex-1 text-center cursor-pointer">
                        <input type="radio" name="type" value="income" defaultChecked className="peer sr-only" />
                        <span className="block py-1.5 px-3 rounded text-sm text-neutral-500 peer-checked:bg-green-500/10 peer-checked:text-green-500 transition-all">Income</span>
                    </label>
                    <label className="flex-1 text-center cursor-pointer">
                        <input type="radio" name="type" value="expense" className="peer sr-only" />
                        <span className="block py-1.5 px-3 rounded text-sm text-neutral-500 peer-checked:bg-red-500/10 peer-checked:text-red-500 transition-all">Expense</span>
                    </label>
                </div>
            </div>
             <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Date</label>
                 <input
                    type="date"
                    name="date"
                    required
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
            </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-1">Category</label>
          <select
            name="category"
            required
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all appearance-none"
          >
            <option value="Client">Client</option>
            <option value="Payroll">Payroll</option>
            <option value="Software">Software</option>
            <option value="Ads">Ads</option>
          </select>
        </div>

        <div className="pt-2">
            <SubmitButton />
        </div>
      </form>
    </div>
  )
}
