import { AppLayout } from "@/components/AppLayout"
import { redirect } from "next/navigation"
import { client } from "@/lib/sanity"
import { format } from "date-fns"
import Link from "next/link"
import { ArrowLeft, User, DollarSign, Calendar, TrendingUp } from "lucide-react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth.config"
import { EmployeeEditClient } from "./EmployeeEditClient"

export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const session = await getServerSession(authOptions)
  const user = session?.user as any
  if (!user || user.role?.toLowerCase() !== 'admin') {
    redirect('/')
  }

  const employeeId = resolvedParams.id

  const employee = await client.fetch(`*[_type == "employeeProfile" && _id == $id][0]`, { id: employeeId })
  if (!employee) {
    redirect('/payroll')
  }

  const advances = await client.fetch(`*[_type == "advancePayment" && references($id)] | order(date desc)`, { id: employeeId })
  const salaryRecords = await client.fetch(`*[_type == "salaryRecord" && references($id)] | order(_createdAt desc)`, { id: employeeId })

  const totalPaidAdvances = advances.filter((a: any) => a.status === 'deducted').reduce((sum: number, a: any) => sum + (a.amount || 0), 0)
  const pendingAdvancesAmount = advances.filter((a: any) => a.status === 'pending').reduce((sum: number, a: any) => sum + (a.amount || 0), 0)
  
  return (
    <AppLayout user={user} title="Employee Details" description="View salary and advance history">
      <div className="w-full space-y-6">
        <Link href="/payroll" className="flex items-center text-sm text-neutral-400 hover:text-white transition-colors w-max">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Payroll Dashboard
        </Link>

        {/* Profile Header */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-600/20 text-blue-500 flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{employee.name}</h1>
              <p className="text-neutral-400">{employee.designation}</p>
              {employee.email && <p className="text-sm text-neutral-500">{employee.email}</p>}
            </div>
          </div>
          <div className="flex flex-col gap-4 items-end">
            <div className="flex gap-4">
              <div className="text-right">
                <p className="text-sm text-neutral-400">Base Salary</p>
                <p className="text-xl font-bold text-white flex items-center justify-end gap-1">
                  ₹{employee.baseSalary?.toLocaleString()}
                </p>
              </div>
              <div className="w-px h-12 bg-neutral-800 mx-2"></div>
              <div className="text-right">
                <p className="text-sm text-neutral-400">Status</p>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-block capitalize mt-1 ${
                  employee.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                }`}>
                  {employee.status || 'Active'}
                </span>
              </div>
            </div>
            <EmployeeEditClient employee={employee} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Salary History */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-neutral-800 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              <h2 className="text-lg font-bold text-white">Salary History</h2>
            </div>
            <div className="p-0 overflow-y-auto max-h-[400px]">
              {salaryRecords.length > 0 ? (
                <ul className="divide-y divide-neutral-800">
                  {salaryRecords.map((record: any) => (
                    <li key={record._id} className="p-5 hover:bg-neutral-800/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-white text-base">{record.monthYear}</p>
                          <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full capitalize">{record.status}</span>
                        </div>
                        <p className="font-bold text-emerald-400 text-lg">₹{record.netSalary?.toLocaleString()}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                        <div className="bg-neutral-950 p-2 rounded-lg border border-neutral-800">
                          <p className="text-neutral-500 mb-0.5">Base</p>
                          <p className="font-medium text-neutral-300">₹{record.baseSalary?.toLocaleString()}</p>
                        </div>
                        <div className="bg-neutral-950 p-2 rounded-lg border border-neutral-800">
                          <p className="text-neutral-500 mb-0.5">Bonus</p>
                          <p className="font-medium text-blue-400">₹{record.bonus?.toLocaleString() || 0}</p>
                        </div>
                        <div className="bg-neutral-950 p-2 rounded-lg border border-neutral-800">
                          <p className="text-neutral-500 mb-0.5">Deducted</p>
                          <p className="font-medium text-red-400">₹{record.totalDeductions?.toLocaleString() || 0}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-8 text-center text-neutral-500">
                  No salary records found for this employee.
                </div>
              )}
            </div>
          </div>

          {/* Advances History */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-neutral-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-bold text-white">Advances History</h2>
              </div>
              <div className="text-right">
                <p className="text-xs text-neutral-500">Pending</p>
                <p className="text-sm font-bold text-red-400">₹{pendingAdvancesAmount.toLocaleString()}</p>
              </div>
            </div>
            <div className="p-0 overflow-y-auto max-h-[400px]">
              {advances.length > 0 ? (
                <ul className="divide-y divide-neutral-800">
                  {advances.map((advance: any) => (
                    <li key={advance._id} className="p-5 hover:bg-neutral-800/50 transition-colors flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                          <p className="text-sm font-medium text-white">
                            {advance.date ? format(new Date(advance.date), 'MMM d, yyyy') : '-'}
                          </p>
                        </div>
                        {advance.reason && <p className="text-xs text-neutral-400">{advance.reason}</p>}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white mb-1">₹{advance.amount?.toLocaleString()}</p>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium inline-block capitalize ${
                          advance.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'
                        }`}>
                          {advance.status === 'pending' ? 'Pending' : `Deducted ${advance.deductedInMonth ? `(${advance.deductedInMonth})` : ''}`}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-8 text-center text-neutral-500">
                  No advance payments recorded.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
