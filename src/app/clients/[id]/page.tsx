import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth.config"
import { redirect } from "next/navigation"
import { AppLayout } from "@/components/AppLayout"
import { getClientDashboardData } from "@/app/actions"
import { ClientDashboard } from "@/components/ClientDashboard"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  const { id } = await params
  const data = await getClientDashboardData(id)

  if (!data || !data.client) {
    return (
      <AppLayout user={session.user} title="Client Not Found">
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4">The client you are looking for does not exist or you don't have permission to view it.</p>
          <Link href="/clients" className="text-blue-500 hover:text-blue-400 inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Clients
          </Link>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout 
      user={session.user} 
      title={`Dashboard: ${data.client.name}`}
      description="Overview of client billing, payments, and work reports"
    >
      <div className="mb-6">
        <Link href="/clients" className="text-gray-500 hover:text-gray-700 inline-flex items-center gap-2 text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Clients List
        </Link>
      </div>
      <ClientDashboard data={data} user={session.user} />
    </AppLayout>
  )
}
