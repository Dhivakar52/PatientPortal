import React from 'react'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MaleConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export const MaleConfirmModal: React.FC<MaleConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
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

        {/* Confirmation Icon */}
        <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4 shadow-xs">
          <Check className="w-7 h-7 stroke-[2.5]" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
          Confirm Appointment
        </h3>

        {/* Exact Message */}
        <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6 space-y-2">
          <p>
            This appointment is for a Gynecology department, but the patient is registered as Male.
          </p>
          <p className="font-medium text-slate-800 dark:text-slate-200">
            Do you want to proceed with the booking?
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer rounded-md"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className="w-full sm:w-auto px-6 py-2 text-white font-semibold cursor-pointer rounded-md shadow-sm"
            style={{ background: 'var(--blue-btn)' }}
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  )
}

export default MaleConfirmModal
