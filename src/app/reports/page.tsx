import { client } from "@/lib/sanity"
import { Transaction } from "@/types"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth.config"
import { redirect } from "next/navigation"
import { AppLayout } from "@/components/AppLayout"
import { ReportsDashboard } from "@/components/ReportsDashboard"

export const dynamic = 'force-dynamic'

async function getData(): Promise<Transaction[]> {
  const query = `*[_type == "transaction"] {
    ...,
    client->{_id, name}
  } | order(date desc)`
  try {
    const data = await client.fetch(query)
    return data
  } catch (error) {
    console.error("Sanity fetch error:", error)
    return []
  }
}

export default async function ReportsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  const transactions = await getData()

  return (
    <AppLayout 
      user={session.user} 
      title="Reports & Analytics" 
      description="Breakdown of financial performance"
    >
      <ReportsDashboard transactions={transactions} />
    </AppLayout>
  )
}
