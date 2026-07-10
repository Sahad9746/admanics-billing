'use client'

import { useState } from "react"
import Link from "next/link"
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react"
import { ClientForm } from "@/components/ClientForm"
import { DeleteModal } from "@/components/DeleteModal"
import { format } from "date-fns"
import { deleteClient } from "@/app/actions"
import toast from "react-hot-toast"

export function ClientsList({ initialClients, userRole = 'viewer' }: { initialClients: any[], userRole?: string }) {
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
        {userRole !== 'viewer' && (
          <button
            onClick={() => setIsAdding(true)}
            className="bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Client
          </button>
        )}
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

      <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-50 text-gray-500 uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Client Name</th>
                <th className="px-6 py-4">Contact Person</th>
                <th className="px-6 py-4">Email / Phone</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {initialClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No clients found. Add your first client to get started.
                  </td>
                </tr>
              ) : (
                initialClients.map((client) => (
                  <tr key={client._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium">
                      <Link href={`/clients/${client._id}`} className="text-gray-900 hover:text-blue-600 transition-colors block">
                        {client.name}
                      </Link>
                      {client.address && (
                        <p className="text-xs text-gray-400 font-normal mt-0.5 line-clamp-1" title={client.address}>
                          {client.address}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">{client.contactPerson || '-'}</td>
                    <td className="px-6 py-4">
                        <div className="flex flex-col">
                            <span>{client.email || '-'}</span>
                            <span className="text-xs text-gray-500">{client.phone || ''}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-block ${
                        client.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {format(new Date(client.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <Link
                        href={`/clients/${client._id}`}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200"
                        title="View Dashboard"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layout-dashboard"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
                      </Link>
                      {userRole !== 'viewer' && (
                        <button
                          onClick={() => setEditingClient(client)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200"
                          title="Edit Client"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {userRole === 'admin' && (
                        <button
                          onClick={() => setClientToDelete(client)}
                          disabled={deletingId === client._id}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors bg-gray-50 hover:bg-gray-100 flex items-center justify-center rounded-lg border border-gray-200"
                          title="Delete Client"
                        >
                          {deletingId === client._id ? <Loader2 className="w-4 h-4 animate-spin text-red-600" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      )}
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
