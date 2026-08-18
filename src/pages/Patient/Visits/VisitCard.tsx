import React from 'react'
import { Calendar, Clock, MapPin, Building2, Eye, Download, UserCheck, Stethoscope } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Status from '@/common/Status'
import { type Appointment, type Patient } from '@/types/patient.types'
import { HOSPITAL_NAME } from '@/constants/patient.constants'
import { formatDateBadge, todayStr } from '@/utils/patient.utils'

interface VisitCardProps {
  appointment: Appointment
  currentPatient?: Patient | null
  onView: (appt: Appointment) => void
  onDownloadReceipt?: (appt: Appointment) => void
}

export const VisitCard: React.FC<VisitCardProps> = ({
  appointment,
  currentPatient,
  onView,
  onDownloadReceipt,
}) => {
  const today = todayStr()
  const isPast = appointment.date < today
  const statusLabel = isPast ? 'completed' : 'scheduled'
  const dateFormatted = formatDateBadge(appointment.date)

  return (
    <Card className="flex flex-col justify-between h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 rounded-xl overflow-hidden group">
      {/* Top Header */}
      <CardHeader className="p-4 pb-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex flex-row items-start justify-between gap-3 space-y-0">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {appointment.doctor}
            </h4>
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 truncate mt-0.5">
              {appointment.department}
            </p>
          </div>
        </div>

        <Status status={statusLabel} showLabel className="shrink-0" />
      </CardHeader>

      {/* Body / Visit Metadata */}
      <CardContent className="p-4 space-y-3.5 flex-1">
        {/* Patient & Appt ID bar */}
        <div className="flex items-center justify-between text-xs gap-2 py-1.5 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Appt ID:</span>
          <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{appointment.apptNo}</span>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          {/* Visit Date */}
          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 block font-medium">Visit Date</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {dateFormatted.d} {dateFormatted.m} {dateFormatted.y}
              </span>
            </div>
          </div>

          {/* Time Slot */}
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 block font-medium">Time Slot</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                {appointment.slot}
              </span>
            </div>
          </div>

          {/* Unit / Room */}
          <div className="flex items-start gap-2">
            <Building2 className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 block font-medium">Unit / Room</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {appointment.unit} {appointment.room ? `• ${appointment.room}` : ''}
              </span>
            </div>
          </div>

          {/* Patient Name / Info if available */}
          {currentPatient && (
            <div className="flex items-start gap-2">
              <UserCheck className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="text-[11px] text-slate-400 dark:text-slate-500 block font-medium">Patient</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                  {currentPatient.name}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Hospital Name */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
          <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span className="truncate">{HOSPITAL_NAME}</span>
        </div>
      </CardContent>

      {/* Card Actions Footer */}
      <CardFooter className="p-2 flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onView(appointment)}
          className="flex-1 text-xs font-semibold h-8 cursor-pointer border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          aria-label={`View details for appointment ${appointment.apptNo}`}
        >
          <Eye className="w-3.5 h-3.5 mr-1.5" />
          View Details
        </Button>

        {onDownloadReceipt && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDownloadReceipt(appointment)}
            className="text-xs font-semibold h-8 cursor-pointer text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Download / View Receipt"
            aria-label={`Download receipt for appointment ${appointment.apptNo}`}
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            Receipt
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

export default VisitCard
