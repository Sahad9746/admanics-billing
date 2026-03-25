import { client } from "@/lib/sanity"
import { Transaction } from "@/types"
import TransactionDetail from "@/components/TransactionDetail"
import { notFound } from "next/navigation"

export const dynamic = 'force-dynamic'

async function getTransaction(id: string): Promise<Transaction | null> {
  const query = `*[_type == "transaction" && _id == $id][0] {
    ...,
    client->{_id, name},
    createdBy->,
    lastEditedBy->
  }`
  try {
    const data = await client.fetch(query, { id })
    return data
  } catch (error) {
    console.error("Sanity fetch error:", error)
    return null
  }
}

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth.config"

export default async function TransactionPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  const { id } = await params
  const transaction = await getTransaction(id)

  if (!transaction) {
    notFound()
  }

  return <TransactionDetail transaction={transaction} userRole={session?.user?.permissions?.transactions || session?.user?.role} />
}
