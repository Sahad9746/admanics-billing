'use client'

import { useState, useRef, useEffect } from "react"
import { InvoiceTemplate } from "@/components/InvoiceTemplate"
import { downloadPDF } from "@/lib/invoiceUtils"
import { Download, Save, Loader2, Plus, Trash2, ZoomIn, ZoomOut, ChevronDown } from "lucide-react"
import { addInvoice, editInvoice } from "@/app/actions"
import toast from "react-hot-toast"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

interface InvoiceBuilderProps {
  clients: any[]
  projects: any[]
  initialInvoice?: any
}

export function InvoiceBuilder({ clients, projects, initialInvoice }: InvoiceBuilderProps) {
  const isEditMode = !!initialInvoice
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [scale, setScale] = useState(0.65)
  
  // Invoice Form State
  const [invoiceNumber, setInvoiceNumber] = useState(
    initialInvoice?.invoiceNumber || `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  )
  const [clientId, setClientId] = useState(initialInvoice?.client?._id || '')
  const [projectId, setProjectId] = useState(initialInvoice?.project?._id || '')
  const [date, setDate] = useState(
    initialInvoice?.date ? format(new Date(initialInvoice.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
  )
  const [dueDate, setDueDate] = useState(
    initialInvoice?.dueDate ? format(new Date(initialInvoice.dueDate), 'yyyy-MM-dd') : format(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
  )
  const [clientAddress, setClientAddress] = useState('')
  const [gstPercentage, setGstPercentage] = useState(initialInvoice?.gstPercentage || 0)
  const [hasSeparateGst, setHasSeparateGst] = useState(initialInvoice?.hasSeparateGst || false)
  const [status, setStatus] = useState(initialInvoice?.status || 'draft')
  const [focusedItemIndex, setFocusedItemIndex] = useState<number | null>(null)
  
  const [items, setItems] = useState<{ description: string; amount: number; gstPercentage?: number }[]>(() => {
    if (initialInvoice?.items && initialInvoice.items.length > 0) {
      // Filter out GST line items that were auto-added during save
      const invoiceItems = initialInvoice.items.filter((item: any) => !item.description?.startsWith('GST ('))
      return invoiceItems.map((item: any) => ({
        description: item.description || '',
        amount: item.rate || item.amount || 0,
        gstPercentage: item.gstPercentage ?? undefined
      }))
    }
    return [{ description: 'Advance payment of service', amount: 30000 }]
  })

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
    if (isEditMode) formData.append('status', status)
    
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

    const result = isEditMode
      ? await editInvoice(initialInvoice._id, formData)
      : await addInvoice(formData)
    setLoading(false)

    if (result.success) {
      toast.success(isEditMode ? 'Invoice updated successfully!' : 'Invoice saved successfully!')
      router.push('/invoices')
    } else {
      toast.error(result.error || (isEditMode ? 'Failed to update invoice' : 'Failed to save invoice'))
    }
  }

  return (
    <div className="flex flex-col xl:flex-row gap-8 items-start">
      
      {/* Editor Panel (Left) */}
      <div className="w-full xl:w-[450px] shrink-0 space-y-6">
         <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 shadow-xl sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6">{isEditMode ? 'Edit Invoice' : 'Invoice Details'}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1.5">Invoice Number</label>
                <input
                  value={invoiceNumber}
                  onChange={e => setInvoiceNumber(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 shadow-sm rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1.5">Client</label>
                <select
                  value={clientId}
                  onChange={e => setClientId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 shadow-sm rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-600 outline-none"
                >
                  <option value="">Select a client...</option>
                  {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1.5">Billing Address (Visual Only)</label>
                <textarea
                  value={clientAddress}
                  onChange={e => setClientAddress(e.target.value)}
                  rows={3}
                  placeholder="MARKET CITY, KORMANGALA..."
                  className="w-full bg-gray-50 border border-gray-200 shadow-sm rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-600 outline-none resize-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1.5">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 shadow-sm rounded-lg px-3 py-2 text-gray-900 outline-none [color-scheme:light]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1.5">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 shadow-sm rounded-lg px-3 py-2 text-gray-900 outline-none [color-scheme:light]"
                  />
                </div>
              </div>

              {/* Separate GST Toggle Switch */}
              <div className="flex items-center justify-between py-2.5 border-y border-gray-200 shadow-sm my-4">
                <span className="text-sm font-medium text-gray-700">Separate GST per Item</span>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hasSeparateGst}
                    onChange={(e) => setHasSeparateGst(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-100 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-600/35 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {!hasSeparateGst ? (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1.5">GST Percentage (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={gstPercentage}
                    onChange={e => setGstPercentage(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 shadow-sm rounded-lg px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              ) : null}

              {/* Status (only in edit mode) */}
              {isEditMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1.5">Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="w-full bg-white border border-gray-200 shadow-sm rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-600 outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              )}

              {/* Items */}
              <div className="pt-4 border-t border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-900">Line Items</h3>
                </div>
                
                <div className="space-y-3">
                  {items.map((item, index) => {
                    const suggestionOptions = ['Service Fee', 'Ad Funds', 'Consulting', 'Website Maintenance', 'Hosting', 'Domain Registration']
                    const filteredOptions = suggestionOptions.filter(opt => opt.toLowerCase().includes(item.description.toLowerCase()))
                    const optionsToRender = filteredOptions.length > 0 ? filteredOptions : suggestionOptions

                    return (
                      <div key={index} className="flex gap-2 items-start">
                        <div className="flex-1 relative flex items-center">
                          <input
                            type="text"
                            value={item.description}
                            onChange={e => handleItemChange(index, 'description', e.target.value)}
                            onFocus={() => setFocusedItemIndex(index)}
                            onBlur={() => {
                              setTimeout(() => setFocusedItemIndex(null), 200)
                            }}
                            placeholder="Description (e.g. Service, Ad Fund)"
                            className="w-full bg-gray-50 border border-gray-200 shadow-sm rounded-lg pl-3 pr-8 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-600"
                          />
                          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 pointer-events-none" />
                          
                          {focusedItemIndex === index && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 shadow-xl rounded-lg z-50 p-1 max-h-72 overflow-y-auto scrollbar-visible">
                              {optionsToRender.map(opt => (
                                <div
                                  key={opt}
                                  onMouseDown={() => {
                                    handleItemChange(index, 'description', opt)
                                    setFocusedItemIndex(null)
                                  }}
                                  className="cursor-pointer px-3 py-2 hover:bg-gray-100 rounded-md text-gray-900 text-sm transition-colors"
                                >
                                  {opt}
                                </div>
                              ))}
                              <div className="border-t border-gray-100 mt-1.5 pt-1.5 px-3 py-1 text-xs text-gray-500 italic text-center select-none bg-gray-50 rounded-b-md">
                                Type directly to enter a custom description
                              </div>
                            </div>
                          )}
                        </div>
                        <input
                          type="number"
                          value={item.amount || ''}
                          onChange={e => handleItemChange(index, 'amount', Number(e.target.value))}
                          placeholder="Amt"
                          className="w-24 bg-gray-50 border border-gray-200 shadow-sm rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-600"
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
                            className="w-20 bg-gray-50 border border-gray-200 shadow-sm rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-600"
                          />
                        )}
                        <button onClick={() => handleRemoveItem(index)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-0.5">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )
                  })}
                </div>
                
                <button 
                  onClick={handleAddItem} 
                  className="mt-4 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4"/> Add New Item
                </button>
              </div>

            </div>

            <div className="mt-8 flex gap-3">
               <button
                 onClick={handleSave}
                 disabled={loading}
                 className="flex-1 bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition flex justify-center items-center gap-2"
               >
                 {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {isEditMode ? 'Update' : 'Save'}
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
      <div className="flex-1 bg-white border border-gray-200 shadow-sm rounded-xl p-4 md:p-8 flex flex-col items-center overflow-hidden shadow-2xl relative min-h-[500px]">
          
          {/* Controls Bar at the Top */}
          <div className="w-full flex items-center justify-between mb-6 z-10">
            <div className="flex items-center gap-1.5 bg-gray-50/80 backdrop-blur-md border border-gray-200 shadow-sm px-2.5 py-1.5 rounded-lg shadow-lg">
              <button 
                onClick={() => setScale(prev => Math.max(0.3, prev - 0.05))}
                className="text-gray-500 hover:text-gray-700 p-1 transition-colors rounded hover:bg-gray-100"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-gray-700 w-12 text-center select-none">
                {Math.round(scale * 100)}%
              </span>
              <button 
                onClick={() => setScale(prev => Math.min(1.5, prev + 0.05))}
                className="text-gray-500 hover:text-gray-700 p-1 transition-colors rounded hover:bg-gray-100"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-gray-100 mx-1"></div>
              <button 
                onClick={() => setScale(0.65)}
                className="text-gray-500 hover:text-gray-700 text-xs font-semibold px-2 py-0.5 rounded transition-colors hover:bg-gray-100"
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
            className="flex justify-start items-start overflow-hidden origin-top"
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
