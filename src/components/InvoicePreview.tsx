'use client'

import { useRef, useState } from "react"
import { InvoiceTemplate } from "@/components/InvoiceTemplate"
import { format } from "date-fns"
import { ArrowLeft, Printer, Download } from "lucide-react"
import Link from "next/link"
import { useReactToPrint } from "react-to-print"
import { downloadPDF } from "@/lib/invoiceUtils"

export function InvoicePreview({ invoice }: { invoice: any }) {
  const printRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)

  // Format data for the template
  const templateData = {
    invoiceNumber: invoice.invoiceNumber,
    date: format(new Date(invoice.date), 'dd/MM/yyyy'),
    clientName: invoice.client?.name || 'CLIENT NAME',
    clientAddress: `BILL TO:\n${invoice.client?.contactPerson || ''}\n${invoice.client?.email || ''}\n${invoice.client?.phone || ''}`,
    items: (invoice.items || []).map((item: any) => ({
      ...item,
      amount: (item.quantity || 1) * (item.rate || 0)
    })),
    gstPercentage: invoice.items?.find((i: any) => i.description?.includes('GST'))?.description?.match(/\d+/)?.[0] 
        ? Number(invoice.items.find((i: any) => i.description?.includes('GST'))?.description?.match(/\d+/)?.[0]) 
        : 0
  }

  // Filter out the GST item from the items array because the template re-calculates it mathematically
  const filteredItems = templateData.items.filter((i: any) => !i.description.includes('GST'))
  templateData.items = filteredItems

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
      <div className="flex items-center justify-between mb-8 bg-neutral-900 border border-neutral-800 p-4 rounded-xl shadow-lg">
        <Link 
          href="/invoices" 
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Invoices
        </Link>
        <div className="flex items-center gap-3">
          {/* React To Print ensures perfect Vector PDF Export via native Print dialog */}
          <button 
            onClick={() => handlePrint()}
            className="bg-neutral-800 text-white font-medium py-2 px-4 rounded-lg hover:bg-neutral-700 transition flex items-center gap-2 text-sm shadow-sm border border-neutral-700"
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
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 md:p-8 flex justify-center shadow-2xl relative overflow-hidden print:bg-white print:p-0 print:shadow-none print:border-none min-h-[500px]">
        
        <div className="scale-[0.55] sm:scale-[0.65] md:scale-75 lg:scale-90 xl:scale-[0.95] origin-top transition-transform h-auto sm:h-[800px] mb-[-200px] sm:mb-0">
          {/* We wrap it in a div that react-to-print targets, ensuring no transform interference */}
          <div ref={printRef} className="print:w-[210mm] print:h-[297mm]">
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
  )
}
