import { getClientDashboardData } from "@/app/actions"
import { TransactionsHistory } from "@/components/TransactionsHistory"
import { notFound } from "next/navigation"
import { Transaction } from "@/types"

export const dynamic = 'force-dynamic'

export default async function ClientTransactionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ filter?: string }>
}) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  
  const data = await getClientDashboardData(resolvedParams.id)

  if (!data) {
    notFound()
  }

  const { client, allTransactions } = data
  const safeTransactions = allTransactions || []

  // Handle server-side pre-filtering based on the ?filter query parameter
  let displayTransactions = safeTransactions
  let subtitle = "Full history of income and expenses"
  let initialFilters: any = undefined

  if (resolvedSearchParams.filter === 'credited') {
    displayTransactions = safeTransactions.filter((t: Transaction) => 
      (t.type === 'income' || t.type === 'credit') && t.category !== 'Service Fee'
    )
    subtitle = "Transactions forming the credited working budget"
  } else if (resolvedSearchParams.filter === 'expenses') {
    displayTransactions = safeTransactions.filter((t: Transaction) => t.type === 'expense')
    subtitle = "All expenses associated with this client"
    initialFilters = { type: 'expense' }
  } else if (resolvedSearchParams.filter === 'adspend') {
    displayTransactions = safeTransactions.filter((t: Transaction) => t.type === 'expense' && t.category === 'Ad Spend')
    subtitle = "Advertising spend associated with this client"
    initialFilters = { type: 'expense', category: 'Ad Spend' }
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <TransactionsHistory 
        initialTransactions={displayTransactions} 
        title={`${client.name} Transactions`}
        subtitle={subtitle}
        backLink={`/clients/${client._id}`}
        hideGlobalActions={true}
        initialFilters={initialFilters}
      />
    </div>
  )
}
