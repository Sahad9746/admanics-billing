import { AppLayout } from "@/components/AppLayout"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth.config"
import { redirect } from "next/navigation"
import { client } from "@/lib/sanity"
import { Banknote, TrendingUp, Calendar, ArrowRight } from "lucide-react"
import Link from "next/link"

export default async function PayrollReportPage() {
  const session = await getServerSession(authOptions)
  const user = session?.user as any
  if (!user || user.role?.toLowerCase() !== 'admin') {
    redirect('/')
  }

  // Fetch all salary records
  const salaryRecords = await client.fetch(`*[_type == "salaryRecord"] | order(createdAt desc){
    _id,
    monthYear,
    baseSalary,
    bonus,
    totalDeductions,
    netSalary,
    status,
    employee->{_id, name, designation}
  }`)

  // Fetch all advances
  const advances = await client.fetch(`*[_type == "advancePayment"] | order(date desc){
    _id,
    amount,
    date,
    status,
    deductedInMonth,
    employee->{_id, name}
  }`)

  // Group salaries by monthYear
  const salaryByMonth: Record<string, any> = {}
  let totalNetPaid = 0
  let totalAdvancesIssued = 0

  salaryRecords.forEach((record: any) => {
    if (!salaryByMonth[record.monthYear]) {
      salaryByMonth[record.monthYear] = {
        monthYear: record.monthYear,
        totalBase: 0,
        totalBonus: 0,
        totalDeductions: 0,
        totalNet: 0,
        records: []
      }
    }
    salaryByMonth[record.monthYear].totalBase += (record.baseSalary || 0)
    salaryByMonth[record.monthYear].totalBonus += (record.bonus || 0)
    salaryByMonth[record.monthYear].totalDeductions += (record.totalDeductions || 0)
    salaryByMonth[record.monthYear].totalNet += (record.netSalary || 0)
    salaryByMonth[record.monthYear].records.push(record)

    totalNetPaid += (record.netSalary || 0)
  })

  advances.forEach((a: any) => {
    totalAdvancesIssued += (a.amount || 0)
  })

  const pendingAdvancesAmount = advances
    .filter((a: any) => a.status === 'pending')
    .reduce((sum: number, a: any) => sum + (a.amount || 0), 0)

  return (
    <AppLayout user={user} title="Payroll Reports" description="Overview of salaries paid and advances issued">
      <div className="space-y-6">
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2 text-gray-500">
              <Banknote className="w-5 h-5 text-emerald-500" />
              <h3 className="font-medium">Total Net Paid (All Time)</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">₹{totalNetPaid.toLocaleString()}</p>
          </div>
          <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2 text-gray-500">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <h3 className="font-medium">Total Advances Issued</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">₹{totalAdvancesIssued.toLocaleString()}</p>
          </div>
          <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2 text-gray-500">
              <TrendingUp className="w-5 h-5 text-amber-500" />
              <h3 className="font-medium">Outstanding Advances</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">₹{pendingAdvancesAmount.toLocaleString()}</p>
          </div>
        </div>

        {/* Monthly Breakdowns */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
          <div className="p-6 border-b border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">Monthly Payroll Summary</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {Object.values(salaryByMonth).map((month: any) => (
              <div key={month.monthYear} className="p-6 hover:bg-gray-100/20 transition-colors">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <h3 className="text-lg font-bold text-gray-900">{month.monthYear}</h3>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Base</p>
                      <p className="font-medium text-gray-700">₹{month.totalBase.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Bonus</p>
                      <p className="font-medium text-blue-400">₹{month.totalBonus.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Deductions</p>
                      <p className="font-medium text-red-400">₹{month.totalDeductions.toLocaleString()}</p>
                    </div>
                    <div className="text-right pl-4 border-l border-gray-200 shadow-sm">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Total Payout</p>
                      <p className="font-bold text-emerald-400 text-lg">₹{month.totalNet.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 shadow-sm">
                  <h4 className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wider">Employee Breakdown</h4>
                  <div className="space-y-2">
                    {month.records.map((record: any) => (
                      <Link href={`/payroll/employee/${record.employee?._id}`} key={record._id} className="flex justify-between items-center group">
                        <span className="text-sm text-gray-700 group-hover:text-blue-400 transition-colors flex items-center gap-2">
                          {record.employee?.name} <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </span>
                        <span className="text-sm font-medium text-gray-900">₹{record.netSalary?.toLocaleString()}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            
            {Object.keys(salaryByMonth).length === 0 && (
              <div className="p-12 text-center text-gray-500">
                No payroll data processed yet.
              </div>
            )}
          </div>
        </div>

      </div>
    </AppLayout>
  )
}
