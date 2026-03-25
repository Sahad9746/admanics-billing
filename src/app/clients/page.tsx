import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth.config"
import { redirect } from "next/navigation"
import { AppLayout } from "@/components/AppLayout"
import { getClients } from "@/app/actions"
import { ClientsList } from "@/components/ClientsList"

export const dynamic = 'force-dynamic'

export default async function ClientsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  const clients = await getClients()

  return (
    <AppLayout 
      user={session.user} 
      title="Clients" 
      description="Manage your clients and their contact information"
    >
      <ClientsList initialClients={clients} userRole={session.user.permissions?.clients || session.user.role} />
    </AppLayout>
  )
}
