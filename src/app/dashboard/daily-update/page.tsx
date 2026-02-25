import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth.config"
import { redirect } from "next/navigation"
import { AppLayout } from "@/components/AppLayout"
import { getClientsWithProjects } from "@/app/actions"
import Link from "next/link"
import { Building2, ArrowRight } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function DailyUpdateSelectionPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  const clientsWithProjects = await getClientsWithProjects()

  return (
    <AppLayout 
      user={session.user as any} 
      title="Daily Update" 
      description="Select a client to view or add daily work logs."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {clientsWithProjects.map((client: any) => (
          <Link 
            key={client._id} 
            href={`/dashboard/daily-update/${client._id}`}
            className="group block bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-blue-500/50 hover:bg-neutral-800/50 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-300">
               <ArrowRight className="w-5 h-5 text-blue-400" />
            </div>
            
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
              <Building2 className="w-6 h-6" />
            </div>
            
            <h2 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
              {client.name}
            </h2>
            
            <p className="text-sm text-neutral-400">
              {client.projects?.length || 0} Active Project{(client.projects?.length !== 1) ? 's' : ''}
            </p>
          </Link>
        ))}

        {clientsWithProjects.length === 0 && (
          <div className="col-span-full bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center">
            <Building2 className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Active Clients</h3>
            <p className="text-neutral-400 max-w-md mx-auto mb-6">
              You need to add an active client with projects before you can log daily updates.
            </p>
            <Link 
              href="/clients" 
              className="inline-flex items-center justify-center bg-blue-600 text-white font-medium py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Manage Clients
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
