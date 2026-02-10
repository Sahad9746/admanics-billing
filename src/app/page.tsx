import { client } from "@/lib/sanity"
import { Transaction } from "@/types"
import { Dashboard } from "@/components/Dashboard"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth.config"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

async function getData(): Promise<Transaction[]> {
  const query = `*[_type == "transaction"] {
    ...,
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
  
  return (
    <Dashboard 
      initialTransactions={transactions} 
      user={session.user}
    />
  )
}
