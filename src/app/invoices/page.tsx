import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth.config"
import { redirect } from "next/navigation"
import { AppLayout } from "@/components/AppLayout"
import { getInvoices, getClients, getProjects } from "@/app/actions"
import { InvoiceList } from "@/components/InvoiceList"

export const dynamic = 'force-dynamic'

export default async function InvoicesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  const [invoices, clients, projects] = await Promise.all([
    getInvoices(),
    getClients(),
    getProjects()
  ])

  return (
    <AppLayout 
      user={session.user} 
      title="Invoices" 
      description="Create, manage, and track client invoices"
    >
      <InvoiceList initialInvoices={invoices} clients={clients} projects={projects} />
    </AppLayout>
  )
}
