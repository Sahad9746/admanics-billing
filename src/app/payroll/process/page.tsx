import { AppLayout } from "@/components/AppLayout"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth.config"
import { redirect } from "next/navigation"
import { getEmployees, getAdvancePayments } from "@/app/actions"
import { client } from "@/lib/sanity"
import { ProcessClientComponent } from "./ProcessClientComponent"

export default async function ProcessPayrollPage() {
  const session = await getServerSession(authOptions)
  const user = session?.user as any
  if (!user || user.role?.toLowerCase() !== 'admin') {
    redirect('/')
  }

  const employees = await getEmployees()
  const advances = await getAdvancePayments()

  const pendingAdvances = advances.filter((a: any) => a.status === 'pending')
  const salaryRecords = await client.fetch(`*[_type == "salaryRecord"]{ employee, monthYear }`)

  return (
    <AppLayout user={user} title="Process Payroll" description="Calculate and finalize monthly salaries">
      <div className="space-y-6">
        <ProcessClientComponent employees={employees} pendingAdvances={pendingAdvances} existingRecords={salaryRecords} />
      </div>
    </AppLayout>
  )
}
