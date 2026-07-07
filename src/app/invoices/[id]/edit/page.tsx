import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth.config"
import { redirect } from "next/navigation"
import { AppLayout } from "@/components/AppLayout"
import { getClients, getProjects, getInvoiceById } from "@/app/actions"
import { InvoiceBuilder } from "@/components/InvoiceBuilder"

export const dynamic = 'force-dynamic'

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  const { id } = await params

  const [clients, projects, invoice] = await Promise.all([
    getClients(),
    getProjects(),
    getInvoiceById(id)
  ])

  if (!invoice) {
    return (
      <AppLayout user={session.user} title="Invoice Not Found">
        <div className="text-center py-20 text-gray-500">
           The invoice you are looking for does not exist or has been deleted.
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout 
      user={session.user} 
      title={`Edit Invoice: ${invoice.invoiceNumber}`}
      description="Edit invoice details and preview"
    >
      <div className="-mt-4">
        <InvoiceBuilder clients={clients} projects={projects} initialInvoice={invoice} />
      </div>
    </AppLayout>
  )
}
