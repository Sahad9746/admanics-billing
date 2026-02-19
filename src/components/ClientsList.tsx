'use client'

import { useState } from "react"
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react"
import { ClientForm } from "@/components/ClientForm"
import { DeleteModal } from "@/components/DeleteModal"
import { format } from "date-fns"
import { deleteClient } from "@/app/actions"
import toast from "react-hot-toast"

export function ClientsList({ initialClients }: { initialClients: any[] }) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingClient, setEditingClient] = useState<any>(null)
  const [clientToDelete, setClientToDelete] = useState<any>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return
    setDeletingId(clientToDelete._id)
    const result = await deleteClient(clientToDelete._id)
    if (result.success) {
      toast.success('Client deleted')
    } else {
      toast.error(result.error || 'Failed to delete client')
    }
    setDeletingId(null)
    setClientToDelete(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <ClientForm 
            onSuccess={() => setIsAdding(false)} 
            onCancel={() => setIsAdding(false)} 
          />
        </div>
      )}

      {editingClient && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <ClientForm 
            initialData={editingClient}
            onSuccess={() => setEditingClient(null)} 
            onCancel={() => setEditingClient(null)} 
          />
        </div>
      )}

      {clientToDelete && (
        <DeleteModal
          title="Delete Client"
          description={`Are you sure you want to delete ${clientToDelete.name}? All references must be clear. This action cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setClientToDelete(null)}
          loading={deletingId === clientToDelete._id}
        />
      )}

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-300">
            <thead className="bg-neutral-950/50 text-neutral-400 uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Client Name</th>
                <th className="px-6 py-4">Contact Person</th>
                <th className="px-6 py-4">Email / Phone</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {initialClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">
                    No clients found. Add your first client to get started.
                  </td>
                </tr>
              ) : (
                initialClients.map((client) => (
                  <tr key={client._id} className="hover:bg-neutral-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{client.name}</td>
                    <td className="px-6 py-4">{client.contactPerson || '-'}</td>
                    <td className="px-6 py-4">
                        <div className="flex flex-col">
                            <span>{client.email || '-'}</span>
                            <span className="text-xs text-neutral-500">{client.phone || ''}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-block ${
                        client.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-neutral-800 text-neutral-400'
                      }`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-neutral-400">
                      {format(new Date(client.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button
                        onClick={() => setEditingClient(client)}
                        className="p-2 text-neutral-400 hover:text-white transition-colors bg-neutral-800 hover:bg-neutral-700 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setClientToDelete(client)}
                        disabled={deletingId === client._id}
                        className="p-2 text-neutral-400 hover:text-red-400 transition-colors bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center rounded-lg"
                      >
                        {deletingId === client._id ? <Loader2 className="w-4 h-4 animate-spin text-red-500" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
