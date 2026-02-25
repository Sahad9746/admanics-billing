'use client'

import { X } from "lucide-react"
import { WorkLogForm } from "./WorkLogForm"

interface WorkLogModalProps {
  isOpen: boolean
  onClose: () => void
  initialData?: any
  clientsWithProjects: any[]
  user: { name: string; email: string; role: string }
  preselectedClientId?: string
}

export function WorkLogModal({ isOpen, onClose, initialData, clientsWithProjects, user, preselectedClientId }: WorkLogModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/60 backdrop-blur-sm p-4 md:p-6">
      <div 
        className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-neutral-800 bg-neutral-900/50">
          <h3 className="text-xl font-bold text-white">
            {initialData ? 'Edit Work Log' : 'New Work Log'}
          </h3>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors p-2 hover:bg-neutral-800 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 max-h-[calc(100vh-16rem)] overflow-y-auto custom-scrollbar">
          <WorkLogForm 
            initialData={initialData} 
            clientsWithProjects={clientsWithProjects}
            onSuccess={onClose}
            user={user}
            preselectedClientId={preselectedClientId}
          />
        </div>
      </div>
    </div>
  )
}
