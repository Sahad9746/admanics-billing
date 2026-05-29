'use client'

import { useState, useRef, useEffect } from "react"
import { InvoiceTemplate } from "@/components/InvoiceTemplate"
import { downloadPDF } from "@/lib/invoiceUtils"
import { Download, Save, Loader2, Plus, Trash2, ZoomIn, ZoomOut } from "lucide-react"
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
  const [scale, setScale] = useState(0.65)
  
  // Invoice Form State
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`)
  const [clientId, setClientId] = useState('')
  const [projectId, setProjectId] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [dueDate, setDueDate] = useState(format(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'))
  const [clientAddress, setClientAddress] = useState('')
  const [gstPercentage, setGstPercentage] = useState(0)
  const [hasSeparateGst, setHasSeparateGst] = useState(false)
  
  const [items, setItems] = useState<{ description: string; amount: number; gstPercentage?: number }[]>([
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

  // Automatically sync items with separate GST rates if toggle is turned ON
  useEffect(() => {
    if (hasSeparateGst) {
      setItems(items.map(item => ({
        ...item,
        gstPercentage: item.gstPercentage ?? gstPercentage ?? 18
      })))
    }
  }, [hasSeparateGst])

  const previewRef = useRef<HTMLDivElement>(null)
  const [previewHeight, setPreviewHeight] = useState(1122.5)

  useEffect(() => {
    if (previewRef.current) {
      const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
          setPreviewHeight(entry.target.scrollHeight)
        }
      })
      resizeObserver.observe(previewRef.current)
      return () => resizeObserver.disconnect()
    }
  }, [items, hasSeparateGst, gstPercentage])

  const handleAddItem = () => setItems([...items, { description: '', amount: 0, gstPercentage: hasSeparateGst ? (gstPercentage || 18) : undefined }])
  const handleRemoveItem = (index: number) => setItems(items.filter((_, i) => i !== index))

  const handleItemChange = (index: number, field: 'description' | 'amount' | 'gstPercentage', value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value } as any
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
    formData.append('hasSeparateGst', String(hasSeparateGst))
    formData.append('gstPercentage', String(hasSeparateGst ? 0 : gstPercentage))
    
    let schemaItems = []
    let totalAmount = 0

    if (hasSeparateGst) {
      schemaItems = items.map(item => {
        const itemGstPct = item.gstPercentage || 0
        const itemGstAmt = Math.round(item.amount * (itemGstPct / 100))
        return {
          description: item.description,
          quantity: 1,
          rate: item.amount,
          gstPercentage: itemGstPct,
          gstAmount: itemGstAmt
        }
      })
      const subTotal = items.reduce((sum, item) => sum + item.amount, 0)
      const totalGst = items.reduce((sum, item) => sum + Math.round(item.amount * ((item.gstPercentage || 0) / 100)), 0)
      totalAmount = subTotal + totalGst
    } else {
      schemaItems = items.map(item => ({
        description: item.description,
        quantity: 1,
        rate: item.amount
      }))
      
      // Include GST mathematically
      const subTotal = items.reduce((sum, item) => sum + item.amount, 0)
      const gstAmount = Math.round(subTotal * (gstPercentage / 100))
      totalAmount = subTotal + gstAmount

      if (gstPercentage > 0) {
          schemaItems.push({
              description: `GST (${gstPercentage}%)`,
              quantity: 1,
              rate: gstAmount
          })
      }
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

              {/* Separate GST Toggle Switch */}
              <div className="flex items-center justify-between py-2.5 border-y border-neutral-800 my-4">
                <span className="text-sm font-medium text-neutral-300">Separate GST per Item</span>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hasSeparateGst}
                    onChange={(e) => setHasSeparateGst(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-800 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-600/35 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {!hasSeparateGst ? (
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1.5">GST Percentage (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={gstPercentage}
                    onChange={e => setGstPercentage(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              ) : null}

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
                        className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      <input
                        type="number"
                        value={item.amount || ''}
                        onChange={e => handleItemChange(index, 'amount', Number(e.target.value))}
                        placeholder="Amt"
                        className="w-24 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      {hasSeparateGst && (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.gstPercentage ?? 18}
                          onChange={e => handleItemChange(index, 'gstPercentage', Number(e.target.value))}
                          placeholder="GST %"
                          title="GST percentage for this item"
                          className="w-20 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      )}
                      <button onClick={() => handleRemoveItem(index)} className="p-2 text-neutral-600 hover:text-red-400 mt-1">
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
      <div className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl p-4 md:p-8 flex flex-col items-center overflow-hidden shadow-2xl relative min-h-[500px]">
          
          {/* Controls Bar at the Top */}
          <div className="w-full flex items-center justify-between mb-6 z-10">
            <div className="flex items-center gap-1.5 bg-neutral-950/80 backdrop-blur-md border border-neutral-800 px-2.5 py-1.5 rounded-lg shadow-lg">
              <button 
                onClick={() => setScale(prev => Math.max(0.3, prev - 0.05))}
                className="text-neutral-400 hover:text-white p-1 transition-colors rounded hover:bg-neutral-800"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-neutral-300 w-12 text-center select-none">
                {Math.round(scale * 100)}%
              </span>
              <button 
                onClick={() => setScale(prev => Math.min(1.5, prev + 0.05))}
                className="text-neutral-400 hover:text-white p-1 transition-colors rounded hover:bg-neutral-800"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-neutral-800 mx-1"></div>
              <button 
                onClick={() => setScale(0.65)}
                className="text-neutral-400 hover:text-white text-xs font-semibold px-2 py-0.5 rounded transition-colors hover:bg-neutral-800"
                title="Reset Zoom"
              >
                Reset
              </button>
            </div>

            <div className="bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider uppercase border border-blue-500/30">
              Live Preview
            </div>
          </div>

          <div 
            style={{ 
              width: `${793.7 * scale}px`, 
              height: `${previewHeight * scale}px`,
              transition: 'width 0.15s ease-out, height 0.15s ease-out' 
            }}
            className="flex justify-center items-start overflow-hidden origin-top"
          >
            <div 
              ref={previewRef}
              style={{ 
                transform: `scale(${scale})`, 
                transformOrigin: 'top left',
                width: '793.7px',
              }}
            >
              <InvoiceTemplate 
                data={{
                  invoiceNumber,
                  date: format(new Date(date), 'dd/MM/yyyy'),
                  clientName: selectedClient?.name || 'CLIENT NAME',
                  clientAddress: clientAddress,
                  hasSeparateGst,
                  gstPercentage: hasSeparateGst ? 0 : gstPercentage,
                  items: items.map(item => ({
                    description: item.description,
                    amount: item.amount,
                    gstPercentage: hasSeparateGst ? (item.gstPercentage ?? 18) : 0
                  }))
                }} 
              />
            </div>
          </div>
      </div>

    </div>
  )
}
