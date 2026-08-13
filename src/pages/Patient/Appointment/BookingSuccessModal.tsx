import React from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { type Appointment } from '@/types/patient.types'

interface BookingSuccessModalProps {
  isOpen: boolean
  lastBookedAppt: Appointment | null
  onClose: () => void
}

export const BookingSuccessModal: React.FC<BookingSuccessModalProps> = ({
  isOpen,
  lastBookedAppt,
  onClose,
}) => {
  if (!isOpen || !lastBookedAppt) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-md w-full p-8 shadow-2xl">
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-center text-slate-900 dark:text-slate-100 mb-3">
          Appointment booked successfully
        </h3>

        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded p-3.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
          Please arrive at least <b className="text-slate-900 dark:text-white">15 minutes</b> before your scheduled time.
          Arrive within your selected slot — if you miss it, you'll need to book a new appointment.
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded p-3 flex items-center justify-between text-xs mb-4">
          <span className="text-slate-600 dark:text-slate-400">Appointment Number</span>
          <b className="font-mono text-slate-900 dark:text-slate-100 text-sm">{lastBookedAppt.apptNo}</b>
        </div>

        <p className="text-[11px] text-slate-500 text-center mb-6">
          A confirmation message has been sent to your registered mobile number via SMS.
        </p>

        <Button
          onClick={onClose}
          className="w-full text-white font-semibold cursor-pointer"
          style={{ background: 'var(--blue-btn)' }}
        >
          Go to Home
        </Button>
      </div>
    </div>
  )
}
