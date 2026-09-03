import React from 'react'
import { CheckCircle2, Calendar, Clock, User, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { type Appointment } from '@/types/patient.types'
import { formatDateFull, capitalizeName } from '@/utils/patient.utils'

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

  const apptNo = String(
    lastBookedAppt.apptNo ||
    lastBookedAppt.AppointmentNo ||
    (lastBookedAppt as unknown as Record<string, unknown>).ApptNo ||
    (lastBookedAppt.AppointmentID ? `APT-${lastBookedAppt.AppointmentID}` : '') ||
    ''
  )
  const patientName = lastBookedAppt.PatientName ? capitalizeName(lastBookedAppt.PatientName) : 'Patient'
  const departmentName = lastBookedAppt.department || lastBookedAppt.DeptName || 'Gynecology'
  const dateStr = lastBookedAppt.date || lastBookedAppt.AppointmentDate || ''
  const formattedDate = formatDateFull(dateStr) || dateStr
  const slotStr = lastBookedAppt.slot || lastBookedAppt.TimeSlot || lastBookedAppt.Timeslot || '08:00 AM - 08:10 AM'

  return (
    <div data-cy="booking-success-modal" className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg w-full p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">

        {/* Success Header */}
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Appointment Booked Successfully!
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Your appointment has been confirmed.
          </p>
        </div>

        {/* Appointment Details Card */}
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-3 mb-4">
          {/* Appointment Number Banner */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Appointment No</span>
            <span data-cy="booking-success-appt-no" className="font-mono text-sm font-bold text-blue-600 dark:blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
              {apptNo}
            </span>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Patient Name */}
            <div className="flex items-start gap-2">
              <User className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-slate-500 dark:text-slate-400">Patient</div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">{patientName}</div>
              </div>
            </div>

            {/* Department */}
            <div className="flex items-start gap-2">
              <Building2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-slate-500 dark:text-slate-400">Department</div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">{departmentName}</div>
              </div>
            </div>

            {/* Doctor */}
            {/* <div className="flex items-start gap-2">
              <Stethoscope className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-slate-500 dark:text-slate-400">Doctor</div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">{doctorName}</div>
              </div>
            </div> */}

            {/* Unit */}
            {/* <div className="flex items-start gap-2">
              <Layers className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-slate-500 dark:text-slate-400">Unit</div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">{unitStr}</div>
              </div>
            </div> */}

            {/* Date */}
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-slate-500 dark:text-slate-400">Date</div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">{formattedDate}</div>
              </div>
            </div>

            {/* Time Slot */}
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-slate-500 dark:text-slate-400">Time Slot</div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">{slotStr}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions Box */}
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-lg p-3 text-xs text-amber-900 dark:text-amber-300 leading-relaxed mb-5">
          Please arrive at least <b className="font-semibold text-amber-950 dark:text-amber-100">15 minutes</b> before your scheduled time slot. If you miss your slot, you will need to book a new appointment.
        </div>

        {/* Footer Button */}
        <Button
          onClick={onClose}
          data-cy="booking-success-dashboard-btn"
          className="w-full text-white font-semibold cursor-pointer py-2.5 shadow-md hover:shadow-lg transition-all"
          style={{ background: 'var(--blue-btn)', borderRadius: '6px' }}
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  )
}

export default BookingSuccessModal
