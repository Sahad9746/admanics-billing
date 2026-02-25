import { client } from "@/lib/sanity"
import { Transaction } from "@/types"
import { TransactionsHistory } from "@/components/TransactionsHistory"

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

export default async function TransactionsPage() {
  const transactions = await getData()
  
  return (
    <TransactionsHistory initialTransactions={transactions} />
  )
}
