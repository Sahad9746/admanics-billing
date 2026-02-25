import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth.config"
import { redirect } from "next/navigation"
import { AppLayout } from "@/components/AppLayout"
import { getWorkLogs, getClientsWithProjects } from "@/app/actions"
import { WorkLogList } from "@/components/WorkLogList"

export const dynamic = 'force-dynamic'

export default async function ClientWorkLogsPage({ params }: { params: { clientId: string } }) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  const { clientId } = await params
  const user = session.user as any 

  // We fetch all logs and filter them here, or ideally we'd pass clientId to getWorkLogs
  // For now, we'll fetch all and filter to ensure the correct ones are displayed for this client
  const allLogs = await getWorkLogs()
  const clientLogs = allLogs.filter((log: any) => log.client?._id === clientId || log.client?._ref === clientId)

  const clientsWithProjects = await getClientsWithProjects()
  const selectedClient = clientsWithProjects.find((c: any) => c._id === clientId)

  if (!selectedClient) {
    return (
      <AppLayout user={session.user as any} title="Client Not Found">
        <div className="text-center py-20">
          <p className="text-neutral-400">The client you are looking for does not exist.</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout 
      user={session.user as any} 
      title={`Daily Update: ${selectedClient.name}`}
      description={`Manage work activities for ${selectedClient.name}`}
    >
      <WorkLogList 
        initialLogs={clientLogs} 
        clientsWithProjects={clientsWithProjects} 
        user={{ ...user, id: user.id }} 
        preselectedClientId={clientId}
      />
    </AppLayout>
  )
}
