import { client } from "@/lib/sanity"
import { MetaAdsReport } from "@/types"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth.config"
import { redirect } from "next/navigation"
import { AppLayout } from "@/components/AppLayout"
import { MetaAdsReportsDashboard } from "@/components/MetaAdsReportsDashboard"

export const dynamic = 'force-dynamic'

async function getData(): Promise<MetaAdsReport[]> {
  const query = `*[_type == "metaAdsReport"] | order(createdAt desc)`
  try {
    const data = await client.fetch(query)
    return data
  } catch (error) {
    console.error("Sanity fetch error:", error)
    return []
  }
}

export default async function MetaAdsReportsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  const reports = await getData()

  return (
    <AppLayout 
      user={session.user} 
      title="Meta Ads Reports" 
      description="Manage and generate Meta Ads performance reports"
    >
      <MetaAdsReportsDashboard reports={reports} />
    </AppLayout>
  )
}
