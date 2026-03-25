import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth.config"
import { redirect } from "next/navigation"
import { AppLayout } from "@/components/AppLayout"
import { getWallets } from "@/app/actions"
import { WalletList } from "@/components/WalletList"

export const dynamic = 'force-dynamic'

export default async function FinancePage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  const wallets = await getWallets()

  return (
    <AppLayout 
      user={session.user} 
      title="Finance & Wallets" 
      description="Manage accounts, cash balances, and fund transfers"
    >
      <WalletList initialWallets={wallets} userRole={session.user.permissions?.finance || session.user.role} />
    </AppLayout>
  )
}
