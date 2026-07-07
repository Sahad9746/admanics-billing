'use client'

import { AlertTriangle, Loader2, X } from "lucide-react"

interface DeleteModalProps {
  title: string
  description: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export function DeleteModal({ title, description, onConfirm, onCancel, loading = false }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 shadow-xl w-full max-w-sm relative animate-in fade-in zoom-in duration-200">
        
        <button 
          onClick={onCancel}
          disabled={loading}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mt-2">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
            <p className="text-sm text-gray-500 mb-6 px-2">
               {description}
            </p>
        </div>

        <div className="flex gap-3 w-full">
            <button
               onClick={onCancel}
               disabled={loading}
               className="flex-1 bg-gray-100 text-gray-700 font-medium py-2.5 rounded-xl hover:bg-gray-100 transition disabled:opacity-50"
            >
               Cancel
            </button>
            <button
               onClick={onConfirm}
               disabled={loading}
               className="flex-1 bg-red-600 text-white font-medium py-2.5 rounded-xl hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
               {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
            </button>
        </div>
      </div>
    </div>
  )
}
