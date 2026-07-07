'use client'

import { X } from "lucide-react"

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  isDestructive?: boolean
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
}: ConfirmationModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-gray-200 shadow-sm rounded-2xl w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200 relative overflow-hidden">
        
        {/* Close Button */}
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
        >
            <X className="w-5 h-5" />
        </button>

        <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-500 mb-6 leading-relaxed">
                {description}
            </p>

            <div className="flex items-center gap-3 justify-end">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    {cancelText}
                </button>
                <button
                    onClick={onConfirm}
                    className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors ${
                        isDestructive 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                    {confirmText}
                </button>
            </div>
        </div>
      </div>
    </div>
  )
}
