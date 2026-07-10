'use client'

import { useRef, useState, useEffect } from "react"
import { InvoiceTemplate } from "@/components/InvoiceTemplate"
import { format } from "date-fns"
import { ArrowLeft, Printer, Download, ZoomIn, ZoomOut } from "lucide-react"
import Link from "next/link"
import { useReactToPrint } from "react-to-print"
import { downloadPDF } from "@/lib/invoiceUtils"

export function InvoicePreview({ invoice }: { invoice: any }) {
  const printRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)
  const [scale, setScale] = useState(0.8)
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
  }, [invoice])

  const hasSeparateGst = invoice.hasSeparateGst || false

  // Format data for the template
  const templateData = {
    invoiceNumber: invoice.invoiceNumber,
    date: format(new Date(invoice.date), 'dd/MM/yyyy'),
    clientName: invoice.client?.name || 'CLIENT NAME',
    clientAddress: invoice.clientAddress || invoice.client?.address || '',
    hasSeparateGst,
    gstPercentage: 0,
    items: [] as any[]
  }

  if (hasSeparateGst) {
    templateData.items = (invoice.items || []).map((item: any) => ({
      description: item.description,
      amount: (item.quantity || 1) * (item.rate || 0),
      gstPercentage: item.gstPercentage || 0,
      gstAmount: item.gstAmount || 0
    }))
  } else {
    // Legacy / Global GST mode
    const rawItems = (invoice.items || []).map((item: any) => ({
      description: item.description,
      amount: (item.quantity || 1) * (item.rate || 0),
      gstPercentage: 0
    }))

    const globalGstPct = invoice.gstPercentage || (invoice.items?.find((i: any) => i.description?.includes('GST'))?.description?.match(/\d+/)?.[0] 
        ? Number(invoice.items.find((i: any) => i.description?.includes('GST'))?.description?.match(/\d+/)?.[0]) 
        : 0)

    // Filter out the GST item from the items array because the template re-calculates it mathematically
    const filteredItems = rawItems.filter((i: any) => !i.description.includes('GST'))
    
    templateData.gstPercentage = globalGstPct
    templateData.items = filteredItems
  }

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Invoice-${invoice.invoiceNumber}`,
    pageStyle: "@page { size: A4; margin: 0; } @media print { body { -webkit-print-color-adjust: exact; } }"
  })

  const handleDownloadImagePDF = async () => {
    setDownloading(true)
    await downloadPDF('invoice-preview', `Invoice-${invoice.invoiceNumber}.pdf`)
    setDownloading(false)
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      {/* Action Bar */}
      <div className="flex items-center justify-between mb-8 bg-white border border-gray-200 shadow-sm p-4 rounded-xl shadow-lg">
        <Link 
          href="/invoices" 
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Invoices
        </Link>
        <div className="flex items-center gap-3">
          {/* React To Print ensures perfect Vector PDF Export via native Print dialog */}
          <button 
            onClick={() => handlePrint()}
            className="bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-lg hover:bg-gray-200 border border-gray-200 transition flex items-center gap-2 text-sm shadow-sm border border-gray-300"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF (Vector)
          </button>
          
          <button 
             onClick={handleDownloadImagePDF}
             disabled={downloading}
             className="bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm shadow-sm disabled:opacity-50"
          >
             <Download className="w-4 h-4" />
             {downloading ? 'Generating...' : 'Download PDF (Image)'}
          </button>
        </div>
      </div>

      {/* Preview Container */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-4 md:p-8 flex flex-col items-center shadow-2xl relative overflow-hidden print:bg-white print:p-0 print:shadow-none print:border-none min-h-[500px]">
        
        {/* Controls Bar at the Top */}
        <div className="w-full flex items-center justify-between mb-6 z-10 print:hidden">
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
              onClick={() => setScale(0.8)}
              className="text-gray-500 hover:text-gray-700 text-xs font-semibold px-2 py-0.5 rounded transition-colors hover:bg-gray-100"
              title="Reset Zoom"
            >
              Reset
            </button>
          </div>

          <div className="bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider uppercase border border-blue-500/30">
            Document Preview
          </div>
        </div>

        <div 
          style={{ 
            width: `${793.7 * scale}px`, 
            height: `${previewHeight * scale}px`,
            transition: 'width 0.15s ease-out, height 0.15s ease-out' 
          }}
          className="flex justify-start items-start overflow-hidden origin-top print:w-auto print:h-auto"
        >
          <div 
            ref={previewRef}
            style={{ 
              transform: `scale(${scale})`, 
              transformOrigin: 'top left',
              width: '793.7px',
            }}
            className="print:transform-none print:w-auto print:h-auto"
          >
            {/* We wrap it in a div that react-to-print targets, ensuring no transform interference */}
            <div ref={printRef} className="print:w-[210mm] print:h-[297mm] w-full h-full">
               <InvoiceTemplate data={templateData} />
               
               {/* Global hide styles for react-to-print to ignore the rest of the app */}
               <style type="text/css" media="print">
                 {`
                   body * { visibility: hidden; }
                   #invoice-preview, #invoice-preview * { visibility: visible; }
                   #invoice-preview { position: absolute; left: 0; top: 0; }
                 `}
               </style>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  )
}
