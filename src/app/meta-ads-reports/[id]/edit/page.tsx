import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth.config"
import { redirect, notFound } from "next/navigation"
import { AppLayout } from "@/components/AppLayout"
import { MetaAdsReportForm } from "@/components/MetaAdsReportForm"
import { client } from "@/lib/sanity"
import { MetaAdsReport } from "@/types"

export const dynamic = 'force-dynamic'

async function getReport(id: string): Promise<MetaAdsReport | null> {
  const query = `*[_type == "metaAdsReport" && _id == $id][0]`
  try {
    const data = await client.fetch(query, { id })
    return data
  } catch (error) {
    console.error("Sanity fetch error:", error)
    return null
  }
}

export default async function EditMetaAdsReportPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  const { id } = await params
  const report = await getReport(id)

  if (!report) {
    notFound()
  }

  return (
    <AppLayout 
      user={session.user} 
      title="Edit Report" 
      description={`Editing ${report.companyName} Meta Ads Performance & Funding Report`}
    >
      <MetaAdsReportForm initialData={report} />
    </AppLayout>
  )
}
