import { AppLayout } from "@/components/AppLayout"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth.config"
import { redirect } from "next/navigation"
import { getEmployees, getAdvancePayments, getAllUsers } from "@/app/actions"
import Link from "next/link"
import { EmployeeManager } from "./EmployeeManager"

export default async function PayrollDashboard() {
  const session = await getServerSession(authOptions)
  const user = session?.user as any
  if (!user || user.role?.toLowerCase() !== 'admin') {
    redirect('/')
  }

  const employees = await getEmployees()
  const advances = await getAdvancePayments()

  const pendingAdvances = advances.filter((a: any) => a.status === 'pending')
  const totalPendingAdvances = pendingAdvances.reduce((sum: number, a: any) => sum + (a.amount || 0), 0)

  // Calculate monthly total base salary
  const totalBaseSalary = employees.reduce((sum: number, e: any) => sum + (e.baseSalary || 0), 0)

  return (
    <AppLayout user={user} title="Payroll Dashboard">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-xl">
            <h3 className="text-sm font-medium text-gray-500">Total Monthly Base Salary</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">₹{totalBaseSalary.toLocaleString()}</p>
          </div>
          <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-xl">
            <h3 className="text-sm font-medium text-gray-500">Active Employees</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{employees.length}</p>
          </div>
          <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-xl">
            <h3 className="text-sm font-medium text-gray-500">Total Pending Advances</h3>
            <p className="text-3xl font-bold text-red-400 mt-2">₹{totalPendingAdvances.toLocaleString()}</p>
            <Link href="/payroll/advances" className="text-sm text-blue-400 hover:underline mt-2 inline-block">Manage Advances</Link>
          </div>
        </div>

        <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
          <div className="p-6 border-b border-gray-200 shadow-sm">
            <div className="flex justify-end mb-4">
              <Link href="/payroll/process" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors">
                Process Monthly Payroll →
              </Link>
            </div>
            <EmployeeManager />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="bg-gray-50/50 text-gray-500 uppercase font-medium">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Designation</th>
                  <th className="px-6 py-4">Base Salary</th>
                  <th className="px-6 py-4">Pending Advance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {employees.map((emp: any) => {
                  const empAdvances = pendingAdvances.filter((a: any) => a.employee?._id === emp._id)
                  const pendingAmount = empAdvances.reduce((sum: number, a: any) => sum + (a.amount || 0), 0)
                  return (
                    <tr key={emp._id} className="hover:bg-gray-100/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        <Link href={`/payroll/employee/${emp._id}`} className="hover:text-blue-400 transition-colors hover:underline">
                          {emp.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4">{emp.designation}</td>
                      <td className="px-6 py-4 font-bold text-gray-900">₹{emp.baseSalary?.toLocaleString() || 0}</td>
                      <td className="px-6 py-4 text-red-400">{pendingAmount > 0 ? `₹${pendingAmount.toLocaleString()}` : '-'}</td>
                    </tr>
                  )
                })}
                {employees.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No employees found. Please add them above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
