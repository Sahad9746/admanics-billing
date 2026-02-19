'use client'

import { useState } from "react"
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react"
import { ProjectForm } from "@/components/ProjectForm"
import { DeleteModal } from "@/components/DeleteModal"
import { format } from "date-fns"
import { useCurrency } from "@/components/Providers"
import { formatCurrency } from "@/lib/utils"
import { deleteProject } from "@/app/actions"
import toast from "react-hot-toast"

export function ProjectsList({ initialProjects, clients }: { initialProjects: any[], clients: any[] }) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingProject, setEditingProject] = useState<any>(null)
  const [projectToDelete, setProjectToDelete] = useState<any>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  const { currency, exchangeRate } = useCurrency()

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return
    setDeletingId(projectToDelete._id)
    const result = await deleteProject(projectToDelete._id)
    if (result.success) {
      toast.success('Project deleted')
    } else {
      toast.error(result.error || 'Failed to delete project')
    }
    setDeletingId(null)
    setProjectToDelete(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Project
        </button>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <ProjectForm 
            clients={clients}
            onSuccess={() => setIsAdding(false)} 
            onCancel={() => setIsAdding(false)} 
          />
        </div>
      )}

      {editingProject && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <ProjectForm 
            initialData={editingProject}
            clients={clients}
            onSuccess={() => setEditingProject(null)} 
            onCancel={() => setEditingProject(null)} 
          />
        </div>
      )}

      {projectToDelete && (
        <DeleteModal
          title="Delete Project"
          description={`Are you sure you want to delete the project '${projectToDelete.name}'? This action cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setProjectToDelete(null)}
          loading={deletingId === projectToDelete._id}
        />
      )}

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-300">
            <thead className="bg-neutral-950/50 text-neutral-400 uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Project Name</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Budget</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created At</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {initialProjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">
                    No projects found. Create your first project to get started.
                  </td>
                </tr>
              ) : (
                initialProjects.map((project) => (
                  <tr key={project._id} className="hover:bg-neutral-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{project.name}</td>
                    <td className="px-6 py-4">{project.client?.name || '-'}</td>
                    <td className="px-6 py-4 font-medium">
                        {project.budget ? formatCurrency(project.budget, currency, exchangeRate) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-block ${
                        project.status === 'active' ? 'bg-blue-500/10 text-blue-400' : 'bg-neutral-800 text-neutral-400'
                      }`}>
                        {project.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-neutral-400">
                      {format(new Date(project.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button
                        onClick={() => setEditingProject(project)}
                        className="p-2 text-neutral-400 hover:text-white transition-colors bg-neutral-800 hover:bg-neutral-700 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setProjectToDelete(project)}
                        disabled={deletingId === project._id}
                        className="p-2 text-neutral-400 hover:text-red-400 transition-colors bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center rounded-lg"
                      >
                        {deletingId === project._id ? <Loader2 className="w-4 h-4 animate-spin text-red-500" /> : <Trash2 className="w-4 h-4" />}
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
