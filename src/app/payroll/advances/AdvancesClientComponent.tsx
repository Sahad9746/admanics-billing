'use client'

import { useState } from "react"
import { issueAdvance, markAdvanceSettled } from "@/app/actions"
import { format } from "date-fns"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

export function AdvancesClientComponent({ employees, advances }: { employees: any[], advances: any[] }) {
  const router = useRouter()
  const [isIssuing, setIsIssuing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [settlingId, setSettlingId] = useState<string | null>(null)

  const handleIssueAdvance = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const res = await issueAdvance(formData)
    setIsSubmitting(false)
    if (res?.success) {
      toast.success("Advance issued successfully!")
      setIsIssuing(false)
    } else {
      toast.error(res?.error || "Failed to issue advance")
    }
  }

  const handleSettle = async (advanceId: string) => {
    if (!confirm("Are you sure you want to manually mark this advance as settled?")) return
    
    setSettlingId(advanceId)
    const res = await markAdvanceSettled(advanceId)
    if (res?.success) {
      toast.success("Advance marked as settled!")
      router.refresh()
    } else {
      toast.error(res?.error || "Failed to settle advance")
    }
    setSettlingId(null)
  }

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden flex flex-col">
      <div className="p-6 border-b border-gray-200 shadow-sm flex justify-between items-center">
         <h2 className="text-lg font-bold text-gray-900">Advance Payments Log</h2>
         <button 
           onClick={() => setIsIssuing(true)}
           className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
         >
           Issue Advance
         </button>
      </div>

      {isIssuing && (
        <div className="p-6 border-b border-gray-200 shadow-sm bg-gray-50/50">
          <form onSubmit={handleIssueAdvance} className="space-y-4 max-w-xl">
            <h3 className="text-md font-medium text-gray-900 mb-4">Issue New Advance</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Employee</label>
              <select name="employeeId" required className="w-full bg-white border border-gray-200 shadow-sm rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select Employee...</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>{emp.name} ({emp.designation})</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Amount (₹)</label>
              <input type="number" name="amount" required min="1" className="w-full bg-white border border-gray-200 shadow-sm rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Reason (Optional)</label>
              <input type="text" name="reason" className="w-full bg-white border border-gray-200 shadow-sm rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Issuing...' : 'Confirm Advance'}
              </button>
              <button 
                type="button" 
                onClick={() => setIsIssuing(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-700">
          <thead className="bg-gray-50/50 text-gray-500 uppercase font-medium">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Employee</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Reason</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {advances.map((advance) => (
              <tr key={advance._id} className="hover:bg-gray-100/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  {advance.date ? format(new Date(advance.date), 'MMM d, yyyy') : '-'}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">{advance.employee?.name}</td>
                <td className="px-6 py-4 font-bold text-gray-900">₹{advance.amount?.toLocaleString()}</td>
                <td className="px-6 py-4">{advance.reason || '-'}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-block capitalize ${
                      advance.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-green-500/10 text-green-500'
                    }`}>
                      {advance.status === 'pending' ? 'Pending' : `Deducted (${advance.deductedInMonth})`}
                    </span>
                    
                    {advance.status === 'pending' && (
                      <button
                        onClick={() => handleSettle(advance._id)}
                        disabled={settlingId === advance._id}
                        className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
                      >
                        {settlingId === advance._id ? 'Settling...' : 'Mark Settled'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {advances.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No advance payments recorded.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
