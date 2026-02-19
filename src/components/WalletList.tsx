'use client'

import { useState } from "react"
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react"
import { WalletForm } from "@/components/WalletForm"
import { DeleteModal } from "@/components/DeleteModal"
import { deleteWallet } from "@/app/actions"
import toast from "react-hot-toast"

export function WalletList({ initialWallets }: { initialWallets: any[] }) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingWallet, setEditingWallet] = useState<any>(null)
  const [walletToDelete, setWalletToDelete] = useState<any>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDeleteConfirm = async () => {
    if (!walletToDelete) return
    setDeletingId(walletToDelete._id)
    const result = await deleteWallet(walletToDelete._id)
    if (result.success) {
      toast.success('Wallet deleted')
    } else {
      toast.error(result.error || 'Failed to delete wallet')
    }
    setDeletingId(null)
    setWalletToDelete(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-4">
        <button
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Wallet
        </button>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <WalletForm 
            onSuccess={() => setIsAdding(false)} 
            onCancel={() => setIsAdding(false)} 
          />
        </div>
      )}

      {editingWallet && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <WalletForm 
            initialData={editingWallet}
            onSuccess={() => setEditingWallet(null)} 
            onCancel={() => setEditingWallet(null)} 
          />
        </div>
      )}

      {walletToDelete && (
        <DeleteModal
          title="Delete Wallet"
          description={`Are you sure you want to delete the wallet '${walletToDelete.name}'? This action cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setWalletToDelete(null)}
          loading={deletingId === walletToDelete._id}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {initialWallets.map((wallet: any) => (
          <div key={wallet._id} className="bg-gradient-to-br from-neutral-900 to-neutral-950 p-6 rounded-xl border border-neutral-800 flex flex-col justify-between h-40">
            <div>
              <div className="flex items-center justify-between mb-2">
                 <h3 className="text-neutral-300 font-medium">{wallet.name}</h3>
                 <div className="flex items-center gap-2">
                   <button
                     onClick={() => setEditingWallet(wallet)}
                     className="p-1.5 text-neutral-500 hover:text-white transition-colors bg-neutral-900 rounded-md"
                   >
                     <Edit2 className="w-3.5 h-3.5" />
                   </button>
                   <button
                     onClick={() => setWalletToDelete(wallet)}
                     disabled={deletingId === wallet._id}
                     className="p-1.5 text-neutral-500 hover:text-red-400 transition-colors bg-neutral-900 rounded-md"
                   >
                     {deletingId === wallet._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                   </button>
                 </div>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded bg-neutral-800 text-neutral-400 capitalize inline-block mb-4">
                  {wallet.type.replace('_', ' ')}
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: wallet.currency }).format(wallet.balance)}
              </p>
            </div>
          </div>
        ))}
        {initialWallets.length === 0 && (
            <div className="col-span-full text-center py-12 text-neutral-500">
                No wallets found. Create one to start tracking balances.
            </div>
        )}
      </div>
    </div>
  )
}
