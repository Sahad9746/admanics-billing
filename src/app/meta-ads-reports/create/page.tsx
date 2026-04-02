import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth.config"
import { redirect } from "next/navigation"
import { AppLayout } from "@/components/AppLayout"
import { MetaAdsReportForm } from "@/components/MetaAdsReportForm"

export const dynamic = 'force-dynamic'

export default async function CreateMetaAdsReportPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  return (
    <AppLayout 
      user={session.user} 
      title="Create Report" 
      description="Generate a new Meta Ads Performance & Funding Report"
    >
      <MetaAdsReportForm />
    </AppLayout>
  )
}
