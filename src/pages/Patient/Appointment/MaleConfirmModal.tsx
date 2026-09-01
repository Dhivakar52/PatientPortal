import React from 'react'
import { AlertCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MaleConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm?: () => void
}

export const MaleConfirmModal: React.FC<MaleConfirmModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-6 sm:p-8 shadow-2xl text-center relative transform transition-all">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 rounded-md transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon */}
        <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4 shadow-xs">
          <AlertCircle className="w-7 h-7 stroke-[2.2]" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
          Booking Not Allowed
        </h3>

        {/* Message */}
        <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6 space-y-2">
          <p>
            Appointment booking is not available for <span className="font-bold text-slate-900 dark:text-slate-100">Male</span> patients.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            This department provides specialized consultation exclusively for Female patients.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-center">
          <Button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-8 py-2 text-white font-semibold cursor-pointer rounded-md shadow-sm"
            style={{ background: 'var(--blue-btn)' }}
          >
            Okay, Understood
          </Button>
        </div>
      </div>
    </div>
  )
}

export default MaleConfirmModal
