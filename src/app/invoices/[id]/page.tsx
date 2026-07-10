import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth.config"
import { redirect } from "next/navigation"
import { AppLayout } from "@/components/AppLayout"
import { client } from "@/lib/sanity"
import { InvoicePreview } from "@/components/InvoicePreview"

export const dynamic = 'force-dynamic'

export default async function InvoicePreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  const { id } = await params

  // Fetch the specific invoice and populate references
  const invoice = await client.fetch(`
    *[_type == "invoice" && _id == $id][0] {
      ...,
      client->{_id, name, contactPerson, email, phone, address},
      project->{_id, name}
    }
  `, { id })

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
      title={`Preview: ${invoice.invoiceNumber}`}
      description="View and download invoice as PDF"
    >
      <div className="-mt-6">
        <InvoicePreview invoice={invoice} />
      </div>
    </AppLayout>
  )
}
