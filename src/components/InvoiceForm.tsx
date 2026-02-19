'use client'

import { useState } from "react"
import { addInvoice } from "@/app/actions"
import { Loader2, Plus, Trash2, X } from "lucide-react"
import toast from "react-hot-toast"

interface InvoiceFormProps {
  clients: any[]
  projects: any[]
  onSuccess: () => void
  onCancel: () => void
}

export function InvoiceForm({ clients, projects, onSuccess, onCancel }: InvoiceFormProps) {
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<{ description: string; quantity: number; rate: number }[]>([
    { description: '', quantity: 1, rate: 0 }
  ])

  const handleAddItem = () => setItems([...items, { description: '', quantity: 1, rate: 0 }])
  const handleRemoveItem = (index: number) => setItems(items.filter((_, i) => i !== index))

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    formData.set('amount', totalAmount.toString())
    formData.set('items', JSON.stringify(items))
    
    const result = await addInvoice(formData)
    setLoading(false)

    if (result.success) {
      toast.success("Invoice created successfully")
      onSuccess()
    } else {
      toast.error(result.error || "Failed to create invoice")
    }
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl w-full max-w-3xl relative max-h-[90vh] overflow-y-auto">
      <button onClick={onCancel} className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors">
        <X className="w-5 h-5" />
      </button>
      <h2 className="text-xl font-bold text-white mb-6">Create New Invoice</h2>
      
      <form action={handleSubmit} className="space-y-6">
        {/* Header Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1.5">Invoice Number</label>
            <input
              name="invoiceNumber"
              required
              defaultValue={`INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-600 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1.5">Client</label>
            <select
              name="clientId"
              required
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-600 outline-none"
            >
              <option value="">Select Client...</option>
              {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1.5">Project (Optional)</label>
            <select
              name="projectId"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-600 outline-none"
            >
              <option value="">Select Project...</option>
              {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
             <div>
               <label className="block text-sm font-medium text-neutral-400 mb-1.5">Date</label>
               <input name="date" type="date" required className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-600 outline-none [color-scheme:dark]" />
             </div>
             <div>
               <label className="block text-sm font-medium text-neutral-400 mb-1.5">Due Date</label>
               <input name="dueDate" type="date" required className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-600 outline-none [color-scheme:dark]" />
             </div>
          </div>
        </div>

        {/* Invoice Items */}
        <div className="space-y-4 pt-4 border-t border-neutral-800">
           <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">Line Items</h3>
              <button type="button" onClick={handleAddItem} className="text-sm bg-blue-600/20 text-blue-400 hover:text-blue-300 hover:bg-blue-600/30 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                 <Plus className="w-4 h-4" /> Add Item
              </button>
           </div>
           
           <div className="space-y-3">
             {items.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                    <input 
                      placeholder="Description" 
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      required
                      className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                    <input 
                      type="number"
                      placeholder="Qty" 
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                      required
                      className="w-20 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                    <input 
                      type="number"
                      placeholder="Rate" 
                      step="0.01"
                      value={item.rate}
                      onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                      required
                      className="w-28 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                    <div className="w-28 font-semibold text-right py-2 text-white">
                       {(item.quantity * item.rate).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <button type="button" onClick={() => handleRemoveItem(index)} className="p-2 text-neutral-500 hover:text-red-400 mt-0.5">
                       <Trash2 className="w-4 h-4" />
                    </button>
                </div>
             ))}
           </div>
           
           <div className="flex justify-end pt-4 border-t border-neutral-800">
              <div className="text-right">
                 <p className="text-neutral-400 text-sm">Total Amount</p>
                 <p className="text-3xl font-bold text-white mt-1">
                    {totalAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                 </p>
              </div>
           </div>
        </div>

        <div>
           <label className="block text-sm font-medium text-neutral-400 mb-1.5">Notes / Terms</label>
           <textarea
             name="notes"
             rows={2}
             className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-600 outline-none resize-none"
             placeholder="Payment is due within 30 days..."
           />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-black font-semibold py-3 px-4 rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50 flex justify-center"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Invoice'}
        </button>
      </form>
    </div>
  )
}
