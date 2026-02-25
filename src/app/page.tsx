import { client } from "@/lib/sanity"
import { Transaction } from "@/types"
import { Dashboard } from "@/components/Dashboard"
import { AppLayout } from "@/components/AppLayout"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth.config"
import { redirect } from "next/navigation"
import { getWallets } from "@/app/actions"

export const dynamic = 'force-dynamic'

async function getData(): Promise<Transaction[]> {
  const query = `*[_type == "transaction"] {
    ...,
    client->{_id, name},
    createdBy->,
    lastEditedBy->,
    deletedBy->
  } | order(date desc)`
  
  try {
    const data = await client.fetch(query)
    return data
  } catch (error) {
    console.error("Sanity fetch error:", error)
    return []
  }
}

export default async function Home() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  const transactions = await getData()
  const wallets = await getWallets()
  
  return (
    <AppLayout user={session.user} title="Dashboard" description="Internal billing & fund flow dashboard">
      <Dashboard 
        initialTransactions={transactions} 
        wallets={wallets}
        user={session.user}
      />
    </AppLayout>
  )
}
