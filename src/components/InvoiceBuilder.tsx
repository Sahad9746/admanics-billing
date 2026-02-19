'use client'

import { useState, useRef, useEffect } from "react"
import { InvoiceTemplate } from "@/components/InvoiceTemplate"
import { downloadPDF } from "@/lib/invoiceUtils"
import { Download, Save, Loader2, Plus, Trash2 } from "lucide-react"
import { addInvoice } from "@/app/actions"
import toast from "react-hot-toast"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

interface InvoiceBuilderProps {
  clients: any[]
  projects: any[]
}

export function InvoiceBuilder({ clients, projects }: InvoiceBuilderProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  
  // Invoice Form State
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`)
  const [clientId, setClientId] = useState('')
  const [projectId, setProjectId] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [dueDate, setDueDate] = useState(format(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'))
  const [clientAddress, setClientAddress] = useState('')
  const [gstPercentage, setGstPercentage] = useState(0)
  
  const [items, setItems] = useState<{ description: string; amount: number }[]>([
    { description: 'Advance payment of service', amount: 30000 }
  ])

  // Get selected client details for live preview
  const selectedClient = clients.find(c => c._id === clientId)
  
  // Set default address if client is selected and has one (though schema doesn't have address yet, we can use a manual field for the PDF)
  useEffect(() => {
     if (selectedClient) {
        // You might want to update Client schema to have an address. 
        // For now, we allow manual override for the visual template.
        setClientAddress(`PLACEHOLDER ADDRESS FOR\n${selectedClient.name}`)
     } else {
        setClientAddress('')
     }
  }, [selectedClient])

  const handleAddItem = () => setItems([...items, { description: '', amount: 0 }])
  const handleRemoveItem = (index: number) => setItems(items.filter((_, i) => i !== index))

  const handleItemChange = (index: number, field: 'description' | 'amount', value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const handleDownload = async () => {
    setDownloading(true)
    await downloadPDF('invoice-preview', `Invoice-${invoiceNumber}.pdf`)
    setDownloading(false)
  }

  const handleSave = async () => {
    if (!clientId) {
      toast.error('Please select a client')
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append('invoiceNumber', invoiceNumber)
    formData.append('clientId', clientId)
    if (projectId) formData.append('projectId', projectId)
    formData.append('date', new Date(date).toISOString())
    formData.append('dueDate', new Date(dueDate).toISOString())
    
    // Transform items for the schema
    const schemaItems = items.map(item => ({
        description: item.description,
        quantity: 1, // Visual template only asks for amount directly
        rate: item.amount
    }))
    
    // Include GST mathematically
    const subTotal = items.reduce((sum, item) => sum + item.amount, 0)
    const gstAmount = Math.round(subTotal * (gstPercentage / 100))
    const totalAmount = subTotal + gstAmount

    if (gstPercentage > 0) {
        schemaItems.push({
            description: `GST (${gstPercentage}%)`,
            quantity: 1,
            rate: gstAmount
        })
    }
    
    formData.append('items', JSON.stringify(schemaItems))
    formData.append('amount', totalAmount.toString())

    const result = await addInvoice(formData)
    setLoading(false)

    if (result.success) {
      toast.success('Invoice saved successfully!')
      router.push('/invoices')
    } else {
      toast.error(result.error || 'Failed to save invoice')
    }
  }

  return (
    <div className="flex flex-col xl:flex-row gap-8 items-start">
      
      {/* Editor Panel (Left) */}
      <div className="w-full xl:w-[450px] shrink-0 space-y-6">
         <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl sticky top-24">
            <h2 className="text-xl font-bold text-white mb-6">Invoice Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1.5">Invoice Number</label>
                <input
                  value={invoiceNumber}
                  onChange={e => setInvoiceNumber(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1.5">Client</label>
                <select
                  value={clientId}
                  onChange={e => setClientId(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-600 outline-none"
                >
                  <option value="">Select a client...</option>
                  {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1.5">Billing Address (Visual Only)</label>
                <textarea
                  value={clientAddress}
                  onChange={e => setClientAddress(e.target.value)}
                  rows={3}
                  placeholder="MARKET CITY, KORMANGALA..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-600 outline-none resize-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1.5">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white outline-none [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1.5">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white outline-none [color-scheme:dark]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1.5">GST Percentage (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={gstPercentage}
                  onChange={e => setGstPercentage(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white outline-none"
                />
              </div>

              {/* Items */}
              <div className="pt-4 border-t border-neutral-800">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-white">Line Items</h3>
                    <button onClick={handleAddItem} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"><Plus className="w-3 h-3"/> Add</button>
                </div>
                
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <input
                        value={item.description}
                        onChange={e => handleItemChange(index, 'description', e.target.value)}
                        placeholder="Description"
                        className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white outline-none"
                      />
                      <input
                        type="number"
                        value={item.amount || ''}
                        onChange={e => handleItemChange(index, 'amount', Number(e.target.value))}
                        placeholder="Amt"
                        className="w-24 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white outline-none"
                      />
                      <button onClick={() => handleRemoveItem(index)} className="p-2 text-neutral-600 hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="mt-8 flex gap-3">
               <button
                 onClick={handleSave}
                 disabled={loading}
                 className="flex-1 bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition flex justify-center items-center gap-2"
               >
                 {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
               </button>
               <button
                 onClick={handleDownload}
                 disabled={downloading}
                 className="flex-1 bg-white text-black font-semibold py-2.5 rounded-lg hover:bg-neutral-200 transition flex justify-center items-center gap-2"
               >
                 {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Download PDF
               </button>
            </div>
         </div>
      </div>

      {/* Live Preview Panel (Right) */}
      <div className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl p-4 md:p-8 flex justify-center overflow-hidden shadow-2xl relative">
          
          <div className="absolute top-4 right-4 bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase border border-blue-500/30 z-10">
            Live Preview
          </div>

          <div className="scale-[0.55] sm:scale-[0.65] md:scale-75 lg:scale-90 xl:scale-[0.95] origin-top transition-transform h-auto sm:h-[800px] mb-[-200px] sm:mb-0">
            <InvoiceTemplate 
              data={{
                invoiceNumber,
                date: format(new Date(date), 'dd/MM/yyyy'),
                clientName: selectedClient?.name || 'CLIENT NAME',
                clientAddress: clientAddress,
                gstPercentage,
                items: items
              }} 
            />
          </div>
      </div>

    </div>
  )
}
