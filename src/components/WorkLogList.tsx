'use client'

import { useState } from "react"
import { Plus, Edit, Trash2, Loader2, CheckCircle2 } from "lucide-react"
import { format } from "date-fns"
import { deleteWorkLog } from "@/app/actions"
import { DeleteModal } from "@/components/DeleteModal"
import { WorkLogModal } from "@/components/WorkLogModal"
import toast from "react-hot-toast"

interface WorkLogListProps {
  initialLogs: any[]
  clientsWithProjects: any[]
  user: { name: string; email: string; role: string; id?: string }
  preselectedClientId?: string
}

export function WorkLogList({ initialLogs, clientsWithProjects, user, preselectedClientId }: WorkLogListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedLog, setSelectedLog] = useState<any>(null)
  const [logToDelete, setLogToDelete] = useState<any>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  const handleEdit = (log: any) => {
    setSelectedLog(log)
    setIsModalOpen(true)
  }

  const handleCreate = () => {
    setSelectedLog(null)
    setIsModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!logToDelete) return
    setDeletingId(logToDelete._id)
    const result = await deleteWorkLog(logToDelete._id)
    if (result.success) {
      toast.success('Work log deleted')
    } else {
      toast.error(result.error || 'Failed to delete work log')
    }
    setDeletingId(null)
    setLogToDelete(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-500/10 text-green-400'
      case 'In Progress': return 'bg-blue-500/10 text-blue-400'
      case 'Blocked': return 'bg-red-500/10 text-red-400'
      default: return 'bg-neutral-800 text-neutral-400'
    }
  }

  const isAdminOrEditor = user.role === 'admin' || user.role === 'editor'

  // Pagination Logic
  const totalPages = Math.ceil(initialLogs.length / ITEMS_PER_PAGE)
  const paginatedLogs = initialLogs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-white mb-2">Daily Update Dashboard</h1>
           <p className="text-neutral-400">Manage and oversee team updates.</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Work Log
        </button>
      </div>

      <WorkLogModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={selectedLog}
        clientsWithProjects={clientsWithProjects}
        user={user}
        preselectedClientId={preselectedClientId}
      />

      {logToDelete && (
        <DeleteModal
          title="Delete Work Log"
          description={`Are you sure you want to delete the work log for ${logToDelete.project}? This action cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setLogToDelete(null)}
          loading={deletingId === logToDelete._id}
        />
      )}

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-300">
            <thead className="bg-neutral-950/50 text-neutral-400 uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Date</th>
                {isAdminOrEditor && <th className="px-6 py-4">Employee</th>}
                <th className="px-6 py-4">Project</th>
                <th className="px-6 py-4">Task Summary</th>
                <th className="px-6 py-4">Hours</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Synced</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {initialLogs.length === 0 ? (
                <tr>
                  <td colSpan={isAdminOrEditor ? 8 : 7} className="px-6 py-8 text-center text-neutral-500">
                    No work logs found.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => {
                  const canEdit = isAdminOrEditor || log.user?._ref === user.id || log.user?._id === user.id
                  return (
                    <tr key={log._id} className="hover:bg-neutral-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                          {log.date ? format(new Date(log.date), 'MMM d, yyyy') : '-'}
                      </td>
                      {isAdminOrEditor && (
                         <td className="px-6 py-4 font-medium text-white">{log.employeeName}</td>
                      )}
                      <td className="px-6 py-4">
                          <div className="font-medium text-white">{log.project}</div>
                      </td>
                      <td className="px-6 py-4 max-w-[250px] truncate" title={log.taskSummary}>
                          {log.taskSummary}
                      </td>
                      <td className="px-6 py-4 font-bold text-white">
                          {log.hoursWorked}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-block capitalize ${getStatusColor(log.status)}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {log.synced ? (
                          <span title="Synced"><CheckCircle2 className="w-5 h-5 text-green-500" /></span>
                        ) : (
                          <span className="w-5 h-5 rounded-full border-2 border-neutral-600 block" title="Pending Sync" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                           {canEdit && (
                             <>
                               <button
                                 onClick={() => handleEdit(log)}
                                 className="p-2 text-neutral-400 hover:text-white transition-colors bg-neutral-800 hover:bg-neutral-700 rounded-lg"
                                 title="Edit Log"
                               >
                                 <Edit className="w-4 h-4" />
                               </button>
                               <button
                                 onClick={() => setLogToDelete(log)}
                                 disabled={deletingId === log._id}
                                 className="p-2 text-neutral-400 hover:text-red-400 transition-colors bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center rounded-lg"
                                 title="Delete Log"
                               >
                                 {deletingId === log._id ? <Loader2 className="w-4 h-4 animate-spin text-red-500" /> : <Trash2 className="w-4 h-4" />}
                               </button>
                             </>
                           )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-neutral-900 border border-neutral-800 p-4 rounded-xl mt-4">
          <p className="text-sm text-neutral-400">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, initialLogs.length)} of {initialLogs.length} results
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-neutral-800 rounded-lg text-sm font-medium bg-neutral-950 disabled:opacity-50 hover:bg-neutral-800 transition-colors text-white"
            >
              Previous
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-neutral-800 rounded-lg text-sm font-medium bg-neutral-950 disabled:opacity-50 hover:bg-neutral-800 transition-colors text-white"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
