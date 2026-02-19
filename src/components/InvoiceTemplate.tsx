'use client'

import { forwardRef } from 'react'
import { numberToWords } from "@/lib/invoiceUtils"

interface InvoiceTemplateProps {
  data: {
    invoiceNumber: string
    date: string
    clientName: string
    clientAddress: string
    gstPercentage: number
    items: { description: string; amount: number }[]
  }
}

export const InvoiceTemplate = forwardRef<HTMLDivElement, InvoiceTemplateProps>(
  ({ data }, ref) => {
    
    const subTotal = data.items.reduce((sum, item) => sum + item.amount, 0)
    const gstAmount = Math.round(subTotal * (data.gstPercentage / 100))
    const totalAmount = subTotal + gstAmount

    return (
      <div 
        ref={ref} 
        id="invoice-preview"
        className="bg-white text-black p-10 font-sans mx-auto relative overflow-hidden"
        style={{ width: '210mm', minHeight: '297mm' }}
      >
        {/* Header Section */}
        <div className="flex justify-between items-start mb-16">
          <div className="pt-4 mt-8">
             <h1 className="text-[3.5rem] font-light tracking-wide text-[#009ca6]">
                INVOICE
             </h1>
          </div>
          <div className="text-right flex flex-col items-end">
            {/* Logo placeholder - using text to mimic the Admanics logo visually */}
            <div className="flex items-center gap-2 mb-6">
               <div className="text-4xl text-blue-500 font-bold italic tracking-tighter">A</div>
               <div className="text-2xl text-neutral-400 font-medium">Admanics</div>
            </div>
            
            <div className="text-left text-sm space-y-1">
              <p>A/C Number: 4649540675</p>
              <p>IFSC : KKBK0008077</p>
              <p>NAME: Subah</p>
              <p>KOTAK MAHINDRA, BTM,</p>
              <p>BENGLURU</p>
            </div>
          </div>
        </div>

        {/* Addresses Section */}
        <div className="grid grid-cols-2 gap-12 mb-12">
           <div>
              <div className="bg-[#eaf5f6] px-4 py-2 mb-4 font-bold tracking-wide w-4/5">
                 FROM
              </div>
              <p className="font-bold text-sm px-4">ADMANICS SOLUTION</p>
           </div>
           <div>
              <div className="bg-[#eaf5f6] px-4 py-2 mb-4 font-bold tracking-wide">
                 BILL TO
              </div>
              <div className="px-4 text-sm">
                  <p className="font-bold uppercase">{data.clientName || 'CLIENT NAME'}</p>
                  <p className="whitespace-pre-wrap uppercase text-xs mt-1 text-neutral-700">
                    {data.clientAddress || 'Client Address'}
                  </p>
              </div>
           </div>
        </div>

        {/* Table Section */}
        <div className="mb-20">
            <table className="w-full border-collapse border border-black">
                <thead>
                   <tr className="border-b border-black">
                       <th className="border-r border-black font-bold p-2 text-center w-16">SL</th>
                       <th className="border-r border-black font-bold p-2 text-center">Description</th>
                       <th className="font-bold p-2 text-center w-40">Amount</th>
                   </tr>
                </thead>
                <tbody>
                   {/* We pad the items to ensure the table reaches down mimicking the exact design space */}
                   {[...data.items, ...Array(Math.max(0, 5 - data.items.length)).fill(null)].map((item, index) => (
                      <tr key={index} className="h-10">
                          <td className="border-r border-black border-b border-transparent p-2 text-center align-top relative">
                              {item ? index + 1 : ''}
                          </td>
                          <td className="border-r border-black border-b border-transparent p-2 text-center align-top relative z-20">
                              {item ? item.description : ''}
                          </td>
                          <td className="border-b border-transparent p-2 text-center align-top relative z-20">
                              {item ? item.amount.toLocaleString('en-IN') : ''}
                          </td>
                      </tr>
                   ))}
                   {/* Bottom Spacer Row to match the tall table in the reference */}
                   <tr className={`h-[${data.gstPercentage > 0 ? '170px' : '250px'}] border-b border-black`}>
                       <td className="border-r border-black"></td>
                       <td className="border-r border-black"></td>
                       <td></td>
                   </tr>
                   {/* Subtotal & GST Rows (if applicable) */}
                   {data.gstPercentage > 0 && (
                     <>
                       <tr className="bg-[#eaf5f6]/20 border-b border-black">
                           <td colSpan={2} className="border-r border-black font-bold p-2 text-right">Subtotal</td>
                           <td className="p-2 text-center text-lg font-medium relative z-20">
                               {subTotal.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                           </td>
                       </tr>
                       <tr className="bg-[#eaf5f6]/20 border-b border-black">
                           <td colSpan={2} className="border-r border-black font-bold p-2 text-right">Add: GST ({data.gstPercentage}%)</td>
                           <td className="p-2 text-center text-lg font-medium relative z-20">
                               {gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                           </td>
                       </tr>
                     </>
                   )}
                   {/* Total Row */}
                   <tr className="bg-[#eaf5f6]/30">
                       <td className="border-r border-black font-bold p-2">Total</td>
                       <td className="border-r border-black p-2 text-center text-lg z-20 relative">
                           {totalAmount > 0 ? numberToWords(totalAmount) : ''}
                       </td>
                       <td className="p-2 text-center text-lg font-medium z-20 relative">
                           {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                       </td>
                   </tr>
                </tbody>
            </table>
        </div>

        {/* Footer Section */}
        <div className="mt-8 font-bold text-sm">
           Date : {data.date || 'DD/MM/YYYY'}
        </div>
      </div>
    )
  }
)

InvoiceTemplate.displayName = 'InvoiceTemplate'
