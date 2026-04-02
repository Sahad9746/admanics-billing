'use client'

import { MetaAdsReport } from "@/types"
import { format } from "date-fns"
import { useState, useEffect } from "react"
import { Printer, Loader2, Download } from "lucide-react"

export function PrintableMetaAdsReport({ report }: { report: MetaAdsReport }) {
  const [downloading, setDownloading] = useState(false)

  const handleDownloadPDF = async () => {
    setDownloading(true)
    try {
      const html2canvas = (await import("html2canvas-pro")).default
      const { jsPDF } = await import("jspdf")

      const element = document.getElementById('report-content')
      if (!element) return

      // Temporarily hide the button during snapshot
      const btn = document.getElementById('print-button')
      if (btn) btn.style.display = 'none'

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        scrollY: -window.scrollY // Fixes issues if the page is scrolled down
      })
      
      if (btn) btn.style.display = 'flex'
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`Meta_Ads_Report_${report.companyName.replace(/[^a-zA-Z0-9]/g, '_')}_${format(new Date(report.periodStart), 'MMM_yyyy')}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
    } finally {
      setDownloading(false)
    }
  }

  const totalFunded = report.fundingReceipts?.reduce((sum, r) => sum + Number(r.amountFunded || 0), 0) || 0

  return (
    <div id="report-content" className="max-w-[800px] mx-auto p-8 bg-white text-black min-h-[297mm] relative font-sans border-0 sm:border border-gray-200 lg:shadow-md">
      <button 
        id="print-button"
        onClick={handleDownloadPDF}
        disabled={downloading}
        className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2.5 rounded-lg shadow-lg hover:bg-blue-700 disabled:opacity-50 z-[100] flex items-center justify-center gap-2 font-medium transition-colors"
      >
        {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} 
        <span>{downloading ? 'Generating PDF...' : 'Download PDF'}</span>
      </button>

      <div className="mb-8 pt-4">
        <h1 className="text-xl inline-block border-b border-black pb-0.5 font-normal tracking-wide">
          {report.companyName} Meta Ads Performance & Funding Report
        </h1>
      </div>

      <div className="mb-6 space-y-1">
        <p className="text-base text-gray-900">
          Reporting Period: {format(new Date(report.periodStart), 'dd-MM-yyyy')} - {format(new Date(report.periodEnd), 'dd-MM-yyyy')}
        </p>
        <p className="text-base text-gray-900">
          Ad Account: {report.adAccountName} (Account ID: {report.adAccountId})
        </p>
      </div>

      <div className="mb-10">
        <p className="mb-4 text-base text-gray-900">Campaign Performance Summary (Amounts in INR)</p>
        <table className="w-full border-collapse border border-black mb-4">
          <tbody>
            <tr>
              <td className="border border-black p-2 bg-white w-1/2">Metric</td>
              <td className="border border-black p-2 bg-white w-1/2">Value</td>
            </tr>
            <tr>
              <td className="border border-black p-2 bg-white">Total Campaigns</td>
              <td className="border border-black p-2 bg-white">{report.totalCampaigns}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 bg-white">Total Leads Generated</td>
              <td className="border border-black p-2 bg-white">{report.totalLeadsGenerated}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 bg-white">Total Campaign Spend</td>
              <td className="border border-black p-2 bg-white text-red-600">
                ₹{Number(report.totalCampaignSpend).toFixed(2)}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2 bg-white">Average Cost Per Lead (CPL)</td>
              <td className="border border-black p-2 bg-white">
                ₹{Number(report.averageCpl).toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mb-10">
        <p className="mb-4 text-base text-gray-900">Meta Ads Funding Receipts Summary</p>
        <table className="w-full border-collapse border border-black mb-6">
          <tbody>
            <tr>
              <td className="border border-black p-2 bg-white w-1/3">Receipt Date</td>
              <td className="border border-black p-2 bg-white w-1/3">Payment Method</td>
              <td className="border border-black p-2 bg-white w-1/3">Amount Funded (₹)</td>
            </tr>
            {report.fundingReceipts?.map((receipt, i) => (
              <tr key={receipt._key || i}>
                <td className="border border-black p-2 bg-white">
                  {format(new Date(receipt.receiptDate), 'dd-MM-yy')}
                </td>
                <td className="border border-black p-2 bg-white">
                  {receipt.paymentMethod}
                </td>
                <td className="border border-black p-2 bg-white">
                  {Number(receipt.amountFunded).toFixed(2)}{receipt.note ? ` (${receipt.note})` : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="space-y-4">
          <p className="text-base text-gray-900">
            Total Funded Amount: <span className="text-red-600">₹{totalFunded.toFixed(2)}</span>
          </p>
          <p className="text-base text-gray-900">
            Platform: Meta Ads (Facebook India Online Services Pvt. Ltd.)
          </p>
        </div>
      </div>

      <div className="mt-20 space-y-8" style={{ pageBreakInside: 'avoid' }}>
        <p className="text-base text-gray-900">
          Note: This report includes campaign performance and official Meta funding receipts.
        </p>

        <div className="text-base text-gray-900">
          <p>Prepared by:</p>
          <p>{report.preparedByName}</p>
          <p>{report.preparedByTitle}</p>
        </div>

        <div className="pt-20">
          <p className="text-base text-gray-900">{report.receiptsNote}</p>
        </div>
      </div>
    </div>
  )
}
