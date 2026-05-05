import { AppLayout } from "@/components/AppLayout"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth.config"
import { redirect } from "next/navigation"
import { getEmployees, getAdvancePayments } from "@/app/actions"
import { format } from "date-fns"
import { AdvancesClientComponent } from "./AdvancesClientComponent"

export default async function AdvancesPage() {
  const session = await getServerSession(authOptions)
  const user = session?.user as any
  if (!user || user.role?.toLowerCase() !== 'admin') {
    redirect('/')
  }

  const advances = await getAdvancePayments()
  const employees = await getEmployees()

  return (
    <AppLayout user={user} title="Advance Payments" description="Manage and track salary advances">
      <div className="space-y-6">
        <AdvancesClientComponent employees={employees} advances={advances} />
      </div>
    </AppLayout>
  )
}
