import React, { useEffect } from 'react'
import { Info, Calendar, Clock, User, Building2, Stethoscope, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDateFull, capitalizeName } from '@/utils/patient.utils'

export interface BookingConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading?: boolean
  patientName?: string
  departmentName?: string
  doctorName?: string
  appointmentDate?: string
  timeSlot?: string
}

export const BookingConfirmModal: React.FC<BookingConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  patientName,
  departmentName,
  doctorName,
  appointmentDate,
  timeSlot,
}) => {
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, isLoading])

  if (!isOpen) return null

  const displayPatientName = patientName ? capitalizeName(patientName) : ''
  const displayDepartment = departmentName || 'Gynecology'
  const displayDoctor = doctorName && doctorName.trim() !== '' && doctorName !== '--Select--' ? doctorName : ''
  const formattedDate = appointmentDate ? formatDateFull(appointmentDate) || appointmentDate : ''

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose()
        }
      }}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button (X) */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          aria-label="Close"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Info className="w-7 h-7" />
          </div>
          {/* <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Confirm Appointment
          </h3> */}
          <h2 className="text-lg text-slate-600 dark:text-slate-300 mt-1">
            Are you sure you want to book this appointment?
          </h2>
        </div>

        {/* Selected Appointment Details */}
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-3 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Patient Name */}
            {displayPatientName && (
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-slate-500 dark:text-slate-400">Patient Name</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{displayPatientName}</div>
                </div>
              </div>
            )}

            {/* Department */}
            {displayDepartment && (
              <div className="flex items-start gap-2">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-slate-500 dark:text-slate-400">Department</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{displayDepartment}</div>
                </div>
              </div>
            )}

            {/* Doctor Name (if available) */}
            {displayDoctor && (
              <div className="flex items-start gap-2">
                <Stethoscope className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-slate-500 dark:text-slate-400">Doctor Name</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{displayDoctor}</div>
                </div>
              </div>
            )}

            {/* Appointment Date */}
            {formattedDate && (
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-slate-500 dark:text-slate-400">Appointment Date</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{formattedDate}</div>
                </div>
              </div>
            )}

            {/* Time Slot */}
            {timeSlot && (
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-slate-500 dark:text-slate-400">Time Slot</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{timeSlot}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto px-5 py-2 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-2 text-white font-semibold cursor-pointer rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: 'var(--blue-btn)' }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Booking...</span>
              </>
            ) : (
              'OK'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default BookingConfirmModal

