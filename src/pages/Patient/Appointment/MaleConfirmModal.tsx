import React from 'react'
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
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-6 sm:p-8 shadow-2xl text-center transform transition-all">
        {/* Warning Caution Symbol ⚠️ */}
        <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-center mx-auto mb-4 text-3xl shadow-xs">
          <span role="img" aria-label="warning">⚠️</span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Confirm Appointment
        </h3>

        {/* Message */}
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
          Please confirm that you want to book this appointment for the selected male patient.
        </p>

        {/* Actions */}
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
