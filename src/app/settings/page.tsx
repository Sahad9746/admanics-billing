import { AppLayout } from "@/components/AppLayout"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth.config"
import { redirect } from "next/navigation"
import { SettingsDashboard } from "@/components/SettingsDashboard"

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  return (
    <AppLayout user={session.user} title="Settings" description="Manage your account and application preferences">
      <SettingsDashboard user={session.user} />
    </AppLayout>
  )
}
