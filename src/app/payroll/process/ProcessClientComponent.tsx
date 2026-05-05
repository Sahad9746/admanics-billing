'use client'

import { useState, useMemo } from "react"
import { processPayroll } from "@/app/actions"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { Check } from "lucide-react"
import { ConfirmationModal } from "@/components/ConfirmationModal"

export function ProcessClientComponent({ employees, pendingAdvances, existingRecords = [] }: { employees: any[], pendingAdvances: any[], existingRecords?: any[] }) {
  const router = useRouter()
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
  const [monthYear, setMonthYear] = useState(currentMonth)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [bonuses, setBonuses] = useState<Record<string, number>>({})
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [rowToProcess, setRowToProcess] = useState<any>(null)

  // Compute payroll dynamically based on monthYear
  const payrollData = useMemo(() => {
    const parsedPayrollMonth = new Date(monthYear + ' 1')
    const pMonth = parsedPayrollMonth.getMonth()
    const pYear = parsedPayrollMonth.getFullYear()

    return employees.map(emp => {
      const empAdvances = pendingAdvances.filter((a: any) => a.employee?._id === emp._id)
      
      let advancesToPay = 0
      let totalDeductions = 0
      const advanceIdsToDeduct: string[] = []

      empAdvances.forEach((a: any) => {
        const aDate = new Date(a.date)
        if (aDate.getMonth() === pMonth && aDate.getFullYear() === pYear) {
          // Advance issued in current payroll month -> PAY it out with this salary
          advancesToPay += (a.amount || 0)
        } else if (aDate < parsedPayrollMonth) {
          // Advance issued before current payroll month -> DEDUCT it from this salary
          totalDeductions += (a.amount || 0)
          advanceIdsToDeduct.push(a._id)
        }
      })
      
      const bonus = bonuses[emp._id] || 0
      const isPaid = existingRecords.some(r => r.employee?._ref === emp._id && r.monthYear === monthYear)
      
      return {
        employeeId: emp._id,
        name: emp.name,
        designation: emp.designation,
        baseSalary: emp.baseSalary || 0,
        bonus,
        advancesToPay,
        deductions: totalDeductions,
        advanceIds: advanceIdsToDeduct,
        netSalary: (emp.baseSalary || 0) + advancesToPay + bonus - totalDeductions,
        isPaid
      }
    })
  }, [monthYear, employees, pendingAdvances, existingRecords, bonuses])

  const handleBonusChange = (empId: string, val: string) => {
    const bonus = parseFloat(val) || 0
    setBonuses(prev => ({ ...prev, [empId]: bonus }))
  }

  const initiateProcessSingle = (row: any) => {
    setRowToProcess(row)
    setShowConfirmModal(true)
  }

  const handleProcessSingle = async () => {
    if (!rowToProcess) return
    const row = rowToProcess
    
    setProcessingId(row.employeeId)
    setShowConfirmModal(false)
    const res = await processPayroll(monthYear, [row])
    if (res?.success) {
      toast.success(`Payroll processed for ${row.name}!`)
      router.refresh()
    } else {
      toast.error(res?.error || "Failed to process payroll")
    }
    setProcessingId(null)
    setRowToProcess(null)
  }

  if (employees.length === 0) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-xl text-center">
        <p className="text-neutral-400">No active employees found to process payroll.</p>
      </div>
    )
  }

  return (
    <>
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false)
          setRowToProcess(null)
        }}
        onConfirm={handleProcessSingle}
        title={`Finalize Payroll for ${rowToProcess?.name}`}
        description={`Are you sure you want to process and finalize payroll for ${rowToProcess?.name} for ${monthYear}? This action will permanently record the salary and update their pending advances.`}
        confirmText="Approve & Pay"
      />
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden flex flex-col">
      <div className="p-6 border-b border-neutral-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
         <div>
           <h2 className="text-lg font-bold text-white">Payroll Worksheet</h2>
           <p className="text-sm text-neutral-400">Review amounts and process each employee separately.</p>
         </div>
         <div className="flex items-center gap-3">
           <label className="text-sm text-neutral-400">Month:</label>
           <input 
             type="text" 
             value={monthYear}
             onChange={(e) => setMonthYear(e.target.value)}
             className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
           />
         </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-neutral-300">
          <thead className="bg-neutral-950/50 text-neutral-400 uppercase font-medium">
            <tr>
              <th className="px-6 py-4">Employee</th>
              <th className="px-6 py-4">Base Salary</th>
              <th className="px-6 py-4">Advances to Pay</th>
              <th className="px-6 py-4">Advance Deductions</th>
              <th className="px-6 py-4">Bonus / Extras</th>
              <th className="px-6 py-4 text-right">Net Payable</th>
              <th className="px-6 py-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {payrollData.map((row) => (
              <tr key={row.employeeId} className="hover:bg-neutral-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-white">{row.name}</div>
                  <div className="text-xs text-neutral-500">{row.designation}</div>
                </td>
                <td className="px-6 py-4">₹{row.baseSalary.toLocaleString()}</td>
                <td className="px-6 py-4 text-emerald-400">
                  {row.advancesToPay > 0 ? `+₹${row.advancesToPay.toLocaleString()}` : '-'}
                </td>
                <td className="px-6 py-4 text-red-400">
                  {row.deductions > 0 ? `-₹${row.deductions.toLocaleString()}` : '-'}
                  {row.advanceIds.length > 0 && <span className="text-xs text-neutral-500 ml-2">({row.advanceIds.length} pending)</span>}
                </td>
                <td className="px-6 py-4">
                  <input 
                    type="number" 
                    min="0"
                    value={row.bonus || ''}
                    onChange={(e) => handleBonusChange(row.employeeId, e.target.value)}
                    placeholder="0"
                    disabled={row.isPaid}
                    className="w-24 bg-neutral-950 border border-neutral-700 rounded-md px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                  />
                </td>
                <td className="px-6 py-4 text-right font-bold text-white text-base">
                  ₹{row.netSalary.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-center">
                  {row.isPaid ? (
                    <div className="inline-flex items-center text-green-500 text-sm font-medium gap-1 px-3 py-1 bg-green-500/10 rounded-full">
                      <Check className="w-4 h-4" /> Paid
                    </div>
                  ) : (
                    <button 
                      onClick={() => initiateProcessSingle(row)}
                      disabled={processingId === row.employeeId}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                      {processingId === row.employeeId ? 'Processing...' : 'Approve & Pay'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            <tr className="bg-neutral-950/30">
              <td colSpan={5} className="px-6 py-4 text-right font-medium text-neutral-400">Total Payout for {monthYear}:</td>
              <td className="px-6 py-4 text-right font-bold text-green-400 text-lg">
                ₹{payrollData.reduce((sum, row) => sum + row.netSalary, 0).toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    </>
  )
}
