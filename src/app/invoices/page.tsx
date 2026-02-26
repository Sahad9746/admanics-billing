import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth.config"
import { redirect } from "next/navigation"
import { AppLayout } from "@/components/AppLayout"
import { getInvoices, getClients, getProjects } from "@/app/actions"
import { InvoiceList } from "@/components/InvoiceList"
import { Suspense } from "react"

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
      <Suspense fallback={<div className="text-neutral-400 py-10 text-center">Loading invoices...</div>}>
        <InvoiceList initialInvoices={invoices} clients={clients} projects={projects} />
      </Suspense>
    </AppLayout>
  )
}
