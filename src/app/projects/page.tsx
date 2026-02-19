import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth.config"
import { redirect } from "next/navigation"
import { AppLayout } from "@/components/AppLayout"
import { getProjects, getClients } from "@/app/actions"
import { ProjectsList } from "@/components/ProjectsList"

export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  const [projects, clients] = await Promise.all([
    getProjects(),
    getClients()
  ])

  return (
    <AppLayout 
      user={session.user} 
      title="Projects" 
      description="Track and manage client projects and budgets"
    >
      <ProjectsList initialProjects={projects} clients={clients} />
    </AppLayout>
  )
}
