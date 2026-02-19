import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth.config"
import { redirect } from "next/navigation"
import { AppLayout } from "@/components/AppLayout"
import { getClients, getProjects } from "@/app/actions"
import { InvoiceBuilder } from "@/components/InvoiceBuilder"

export const dynamic = 'force-dynamic'

export default async function CreateInvoicePage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  const [clients, projects] = await Promise.all([
    getClients(),
    getProjects()
  ])

  return (
    <AppLayout 
      user={session.user} 
      title="Create Invoice" 
      description="Live preview and PDF generation"
    >
      <div className="-mt-4">
        <InvoiceBuilder clients={clients} projects={projects} />
      </div>
    </AppLayout>
  )
}
