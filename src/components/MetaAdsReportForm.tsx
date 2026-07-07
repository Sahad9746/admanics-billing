'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Loader2, ArrowLeft } from 'lucide-react'
import { createMetaAdsReport, updateMetaAdsReport } from '@/app/actions'
import toast from 'react-hot-toast'
import { MetaAdsReport } from '@/types'
import { PrintableMetaAdsReport } from './PrintableMetaAdsReport'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface MetaAdsReportFormProps {
  initialData?: MetaAdsReport
}

type ReceiptInput = {
  _key?: string
  receiptDate: string
  paymentMethod: string
  amountFunded: number
  note?: string
}

export function MetaAdsReportForm({ initialData }: MetaAdsReportFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [receipts, setReceipts] = useState<ReceiptInput[]>(
    initialData?.fundingReceipts && initialData.fundingReceipts.length > 0 
      ? initialData.fundingReceipts 
      : [{ receiptDate: '', paymentMethod: '', amountFunded: 0, note: '' }]
  )
  
  const [previewData, setPreviewData] = useState<Partial<MetaAdsReport>>(
    initialData || {
      companyName: 'Adsomia India Pvt Ltd',
      periodStart: new Date().toISOString().split('T')[0],
      periodEnd: new Date().toISOString().split('T')[0],
      adAccountName: '',
      adAccountId: '',
      totalCampaigns: 0,
      totalLeadsGenerated: 0,
      totalCampaignSpend: 0,
      averageCpl: 0,
      fundingReceipts: [],
      preparedByName: '',
      preparedByTitle: 'Digital Marketing Analyst',
      receiptsNote: 'Payment receipts are attached below'
    }
  )

  useEffect(() => {
    setPreviewData(prev => ({
      ...prev,
      fundingReceipts: receipts.map((r, i) => ({
        _key: i.toString(),
        receiptDate: r.receiptDate || new Date().toISOString().split('T')[0],
        paymentMethod: r.paymentMethod || '-',
        amountFunded: r.amountFunded || 0,
        note: r.note
      }))
    }))
  }, [receipts])

  const handleFormChange = (e: React.FormEvent<HTMLFormElement>) => {
    const target = e.target as HTMLInputElement
    const { name, value } = target
    
    if (!name) return

    setPreviewData(prev => ({
      ...prev,
      [name]: target.type === 'number' ? Number(value) : value
    }))
  }

  const addReceipt = () => {
    setReceipts([...receipts, { receiptDate: '', paymentMethod: '', amountFunded: 0, note: '' }])
  }

  const removeReceipt = (index: number) => {
    setReceipts(receipts.filter((_, i) => i !== index))
  }

  const updateReceipt = (index: number, field: string, value: any) => {
    const newReceipts = [...receipts]
    newReceipts[index] = { ...newReceipts[index], [field]: value }
    setReceipts(newReceipts)
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    
    const data = {
      companyName: formData.get('companyName'),
      periodStart: formData.get('periodStart'),
      periodEnd: formData.get('periodEnd'),
      adAccountName: formData.get('adAccountName'),
      adAccountId: formData.get('adAccountId'),
      totalCampaigns: Number(formData.get('totalCampaigns')),
      totalLeadsGenerated: Number(formData.get('totalLeadsGenerated')),
      totalCampaignSpend: Number(formData.get('totalCampaignSpend')),
      averageCpl: Number(formData.get('averageCpl')),
      fundingReceipts: receipts.map(r => ({
        _key: Math.random().toString(36).substring(7),
        ...r
      })),
      preparedByName: formData.get('preparedByName'),
      preparedByTitle: formData.get('preparedByTitle'),
      receiptsNote: 'Payment receipts are attached below'
    }

    const result = initialData 
      ? await updateMetaAdsReport(initialData._id, data)
      : await createMetaAdsReport(data)
    
    if (result.success) {
      toast.success(initialData ? 'Report updated successfully' : 'Report created successfully')
      router.push('/meta-ads-reports')
    } else {
      toast.error(result.error || 'Failed to save report')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <Link 
          href="/meta-ads-reports" 
          className="p-2 bg-white border border-gray-200 shadow-sm rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-xl font-bold text-gray-900">{initialData ? 'Edit Report' : 'Report Details'}</h2>
      </div>

      {/* Form Section */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 lg:p-8">
        <form onSubmit={onSubmit} onChange={handleFormChange} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Name</label>
              <input required type="text" name="companyName" defaultValue={initialData?.companyName || "Adsomia India Pvt Ltd"} className="w-full bg-white border border-gray-200 shadow-sm rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-blue-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Period Start</label>
                <input required type="date" name="periodStart" defaultValue={initialData?.periodStart ? new Date(initialData.periodStart).toISOString().split('T')[0] : ''} className="w-full bg-white border border-gray-200 shadow-sm rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Period End</label>
                <input required type="date" name="periodEnd" defaultValue={initialData?.periodEnd ? new Date(initialData.periodEnd).toISOString().split('T')[0] : ''} className="w-full bg-white border border-gray-200 shadow-sm rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-blue-500" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Ad Account Name</label>
              <input required type="text" name="adAccountName" defaultValue={initialData?.adAccountName} placeholder="e.g. Ique Cap BLR New" className="w-full bg-white border border-gray-200 shadow-sm rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Ad Account ID</label>
              <input required type="text" name="adAccountId" defaultValue={initialData?.adAccountId} placeholder="e.g. 740299295678571" className="w-full bg-white border border-gray-200 shadow-sm rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-blue-500" />
            </div>
          </div>

          <div className="border-t border-gray-200 shadow-sm pt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-5">Campaign Summary</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Total Campaigns</label>
                <input required type="number" step="1" name="totalCampaigns" defaultValue={initialData?.totalCampaigns} className="w-full bg-white border border-gray-200 shadow-sm rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Total Leads</label>
                <input required type="number" step="1" name="totalLeadsGenerated" defaultValue={initialData?.totalLeadsGenerated} className="w-full bg-white border border-gray-200 shadow-sm rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Spend (INR)</label>
                <input required type="number" step="0.01" name="totalCampaignSpend" defaultValue={initialData?.totalCampaignSpend} className="w-full bg-white border border-gray-200 shadow-sm rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Average CPL</label>
                <input required type="number" step="0.01" name="averageCpl" defaultValue={initialData?.averageCpl} className="w-full bg-white border border-gray-200 shadow-sm rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-blue-500" />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 shadow-sm pt-8">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-medium text-gray-900">Funding Receipts</h3>
              <button type="button" onClick={addReceipt} className="text-sm text-blue-500 hover:text-blue-400 flex items-center gap-1 font-medium bg-blue-500/10 px-3 py-1.5 rounded-lg">
                <Plus className="w-4 h-4"/> Add Receipt
              </button>
            </div>
            
            <div className="space-y-4">
              {receipts.map((receipt, index) => (
                <div key={index} className="flex gap-4 items-start bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex-1 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Date</label>
                        <input required type="date" value={receipt.receiptDate ? new Date(receipt.receiptDate).toISOString().split('T')[0] : ''} onChange={(e) => updateReceipt(index, 'receiptDate', e.target.value)} className="w-full bg-white border border-gray-200 shadow-sm rounded-lg px-4 py-2 text-sm text-gray-900 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Method</label>
                        <input required type="text" placeholder="e.g. Manual Payment" value={receipt.paymentMethod} onChange={(e) => updateReceipt(index, 'paymentMethod', e.target.value)} className="w-full bg-white border border-gray-200 shadow-sm rounded-lg px-4 py-2 text-sm text-gray-900 focus:outline-none" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Amount (₹)</label>
                        <input required type="number" step="0.01" value={receipt.amountFunded ?? ''} onChange={(e) => updateReceipt(index, 'amountFunded', e.target.value ? Number(e.target.value) : '')} className="w-full bg-white border border-gray-200 shadow-sm rounded-lg px-4 py-2 text-sm text-gray-900 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Note (Optional)</label>
                        <input type="text" placeholder="e.g. Service charge" value={receipt.note || ''} onChange={(e) => updateReceipt(index, 'note', e.target.value)} className="w-full bg-white border border-gray-200 shadow-sm rounded-lg px-4 py-2 text-sm text-gray-900 focus:outline-none" />
                      </div>
                    </div>
                  </div>
                  {receipts.length > 1 && (
                    <button type="button" onClick={() => removeReceipt(index)} className="p-2.5 text-gray-500 hover:text-red-400 mt-6 bg-white rounded-lg hover:bg-gray-100 transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 shadow-sm pt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Prepared By Name</label>
              <input required type="text" name="preparedByName" defaultValue={initialData?.preparedByName} className="w-full bg-white border border-gray-200 shadow-sm rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Prepared By Title</label>
              <input required type="text" name="preparedByTitle" defaultValue={initialData?.preparedByTitle || "Digital Marketing Analyst"} className="w-full bg-white border border-gray-200 shadow-sm rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-blue-500" />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-8 mt-2 border-t border-gray-200 shadow-sm">
            <Link href="/meta-ads-reports" className="px-5 py-2.5 rounded-lg font-medium text-gray-900 hover:bg-gray-100 transition-colors">
              Cancel
            </Link>
            <button 
              type="submit" 
              disabled={loading} 
              className="bg-blue-600 text-white font-medium py-2.5 px-8 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center min-w-[140px] shadow-lg shadow-blue-500/20"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (initialData ? 'Update Report' : 'Save Report')}
            </button>
          </div>
        </form>
      </div>

      {/* Live Preview Section (Bottom) */}
      <div className="mt-12 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900/80">Live Preview</h3>
        <div className="bg-white p-4 md:p-8 rounded-xl border border-gray-200 shadow-sm lg:shadow-xl overflow-x-auto text-sm lg:text-base">
          <div className="min-w-[800px] pointer-events-none origin-top mx-auto">
            <PrintableMetaAdsReport report={previewData as MetaAdsReport} />
          </div>
        </div>
      </div>
    </div>
  )
}
