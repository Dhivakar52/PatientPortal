import React, { useState } from 'react'
import {
  Download,
  Eye,
  Calendar,
  Clock,
  Building2,
  Stethoscope,
  CalendarX,
  MoreVertical,
  CalendarDays,
} from 'lucide-react'
import { type Appointment, type Patient } from '@/types/patient.types'
import { HOSPITAL_NAME } from '@/constants/patient.constants'
import { todayStr } from '@/utils/patient.utils'
import { DeleteConfirmationDialog } from '@/common/DeleteConfirmationDialog'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

interface VisitCardProps {
  appointment: Appointment
  currentPatient?: Patient | null
  onView?: (appt: Appointment) => void
  onDownloadReceipt?: (appt: Appointment) => void
  onCancelAppointment?: (appt: Appointment) => void
  showDownload?: boolean
  showCancel?: boolean
}

// Helper to format date string into { dayMonth: "06 JUL", year: "2026", dayName: "Monday" }
const formatVisitDate = (dateStr: string) => {
  if (!dateStr) {
    return { dayMonth: '06 JUL', year: '2026', dayName: 'Monday' }
  }

  // Handle DD-MM-YYYY (e.g. 22-08-2026 or 22/08/2026)
  const ddMmYyyyMatch = dateStr.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/)
  if (ddMmYyyyMatch) {
    const day = ddMmYyyyMatch[1].padStart(2, '0')
    const monthNum = parseInt(ddMmYyyyMatch[2], 10)
    const year = ddMmYyyyMatch[3]
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
    const month = monthNames[monthNum - 1] || 'AUG'
    const d = new Date(parseInt(year, 10), monthNum - 1, parseInt(day, 10))
    const dayName = !isNaN(d.getTime()) ? d.toLocaleDateString('en-US', { weekday: 'long' }) : 'Monday'
    return {
      dayMonth: `${day} ${month}`,
      year,
      dayName,
    }
  }

  // Handle DD-MMM-YYYY (e.g. 15-Jun-2026 or 06-Jul-2026)
  const ddMmmYyyyMatch = dateStr.match(/^(\d{1,2})[-/]([A-Za-z]{3})[-/](\d{4})$/)
  if (ddMmmYyyyMatch) {
    const day = ddMmmYyyyMatch[1].padStart(2, '0')
    const month = ddMmmYyyyMatch[2].toUpperCase()
    const year = ddMmmYyyyMatch[3]

    // Attempt day of week calculation
    const monthIndex = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].indexOf(month)
    let dayName = 'Monday'
    if (monthIndex !== -1) {
      const d = new Date(parseInt(year, 10), monthIndex, parseInt(day, 10))
      if (!isNaN(d.getTime())) {
        dayName = d.toLocaleDateString('en-US', { weekday: 'long' })
      }
    }

    return {
      dayMonth: `${day} ${month}`,
      year,
      dayName,
    }
  }

  // Handle YYYY-MM-DD
  const dateObj = new Date(dateStr)
  if (!isNaN(dateObj.getTime())) {
    const day = dateObj.getDate().toString().padStart(2, '0')
    const month = dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
    const year = dateObj.getFullYear().toString()
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' })
    return {
      dayMonth: `${day} ${month}`,
      year,
      dayName,
    }
  }

  return { dayMonth: dateStr, year: '', dayName: 'Monday' }
}

export const VisitCard: React.FC<VisitCardProps> = ({
  appointment,
  currentPatient: _currentPatient,
  onView,
  onDownloadReceipt,
  onCancelAppointment,
  showDownload = true,
  showCancel = true,
}) => {
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)

  const { dayMonth, year, dayName } = formatVisitDate(appointment.date)
  const today = todayStr()

  // Compute status directly from API response or fallback
  const rawStatus =
    appointment.AppointmentStatus ||
    appointment.status ||
    appointment.Status ||
    (appointment as unknown as Record<string, unknown>).AppointmentStatus ||
    (appointment as unknown as Record<string, unknown>).status
  const computedStatus = rawStatus ? String(rawStatus) : (appointment.date < today ? 'Completed' : 'Scheduled')

  const departmentName = appointment.department || appointment.DeptName || appointment.Department || ''
  const displayDoctor = appointment.doctor && appointment.doctor !== '--Select--' ? appointment.doctor : ('Specialist Consultation')

  const handleDownload = () => {
    if (onDownloadReceipt) {
      onDownloadReceipt(appointment)
    } else {
      toast.success(`Downloading Visit Summary for ${displayDoctor}`)
    }
  }

  const handleCardClick = () => {
    if (onView) {
      onView(appointment)
    }
  }

  const handleCancelClick = () => {
    setIsCancelDialogOpen(true)
  }

  const [isCancelling, setIsCancelling] = useState(false)

  const handleConfirmCancel = async () => {
    if (isCancelling) return
    setIsCancelling(true)
    try {
      if (onCancelAppointment) {
        await onCancelAppointment(appointment)
      } else {
        toast.success(`Appointment ${appointment.apptNo || ''} cancelled successfully!`)
      }
      setIsCancelDialogOpen(false)
    } catch (e) {
      console.error(e)
    } finally {
      setIsCancelling(false)
    }
  }

  // Status badge color styling
  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'visited':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
      case 'confirmed':
      case 'scheduled':
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
      case 'cancelled':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
      case 'pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
    }
  }

  const isCancelled = computedStatus.toLowerCase() === 'cancelled'
  const isCancellable = showCancel && computedStatus.toLowerCase() !== 'completed' && computedStatus.toLowerCase() !== 'visited' && !isCancelled
  const hasMenuItems = !isCancelled && ((showDownload && !!onDownloadReceipt) || !!onView || isCancellable)

  return (
    <>
      <div className="group border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 relative w-full max-w-full overflow-visible">
        <div className="p-3.5 sm:p-4 w-full">
          {/* Mobile Top Header: Date Box + Status Badge + 3-dots menu */}
          <div className="flex sm:hidden items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-100 dark:border-slate-800/80">
            {/* Left Date Box on Mobile */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-12 h-12 shrink-0">
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-800 dark:to-slate-700 border border-blue-200 dark:border-slate-600 rounded-lg flex flex-col items-center justify-center p-0.5 text-center shadow-xs">
                  <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 uppercase leading-tight">
                    {dayMonth}
                  </span>
                  <span className="text-[9px] font-semibold text-blue-500 dark:text-blue-400 leading-tight">
                    {year}
                  </span>
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-tight truncate">
                  <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{HOSPITAL_NAME}</span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  {dayName} • {appointment.slot || '12:42:15 PM'}
                </div>
              </div>
            </div>

            {/* Right: Status Badge & 3-dots Menu on Mobile */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${getStatusColor(
                  computedStatus
                )}`}
              >
                {computedStatus}
              </span>

              {hasMenuItems && (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <button
                        type="button"
                        className="p-1 rounded-md text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer outline-none"
                        title="More actions"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    }
                  />
                  <DropdownMenuContent align="end" className="w-48 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-lg z-[100] text-xs">
                    {showDownload && !!onDownloadReceipt && (
                      <DropdownMenuItem
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-3 py-2 cursor-pointer text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium rounded-md text-xs"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span>Download Summary</span>
                      </DropdownMenuItem>
                    )}

                    {onView && (
                      <DropdownMenuItem
                        onClick={handleCardClick}
                        className="flex items-center gap-2 px-3 py-2 cursor-pointer text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium rounded-md text-xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                        <span>View Details</span>
                      </DropdownMenuItem>
                    )}

                    {isCancellable && (
                      <DropdownMenuItem
                        onClick={handleCancelClick}
                        className="flex items-center gap-2 px-3 py-2 cursor-pointer text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-medium rounded-md text-xs"
                      >
                        <CalendarX className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                        <span>Cancel Appointment</span>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Desktop & Mobile Main Body Layout */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full min-w-0">
            {/* Desktop Left Date Square Box with Icon */}
            <div className="hidden sm:block relative w-16 h-16 shrink-0">
              <div className="absolute -top-2 -right-2 z-10">
                <div className="bg-blue-500 dark:bg-blue-600 rounded-full p-1 shadow-md">
                  <CalendarDays className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-800 dark:to-slate-700 border border-blue-200 dark:border-slate-600 rounded-xl flex flex-col items-center justify-center p-1 text-center shadow-xs overflow-hidden">
                <span className="text-[12px] font-bold text-blue-700 dark:text-blue-300 uppercase leading-tight">
                  {dayMonth}
                </span>
                <span className="text-[10px] font-semibold text-blue-500 dark:text-blue-400 leading-tight mt-0.5">
                  {year}
                </span>
              </div>
            </div>

            {/* Middle Details Content */}
            <div className="flex-1 min-w-0 w-full space-y-1.5 [overflow-wrap:anywhere]">
              {/* Doctor Name & Department */}
              <div className="flex flex-wrap items-center gap-1.5 min-w-0 w-full">
                <Stethoscope className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug break-words">
                  {displayDoctor}
                </span>
                {departmentName && displayDoctor !== departmentName && (
                  <span className="text-[10px] sm:text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full inline-flex items-center break-words max-w-full">
                    {departmentName}
                  </span>
                )}
              </div>

              {/* Hospital / Clinic Name on Desktop */}
              <div className="hidden sm:flex items-center gap-1.5 min-w-0">
                <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-tight truncate">
                  {HOSPITAL_NAME}
                </span>
              </div>

              {/* Day, Date, Time & Appointment Number with icons */}
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-xs pt-0.5">
                <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                  <span className="text-[11px] text-slate-600 dark:text-slate-300">
                    {dayName}
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                  <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                  <span className="text-[11px] text-slate-600 dark:text-slate-300">
                    {appointment.slot || '12:42:15 PM'}
                  </span>
                </div>
                {appointment.apptNo && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px] sm:text-[11px] break-words">
                    <span className="text-slate-400 font-normal">Appt No:</span>
                    <span className="text-blue-600 dark:text-blue-400 font-mono">{appointment.apptNo}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Right Side: Status Badge & 3-dots Menu */}
            <div className="hidden sm:flex items-center gap-2 shrink-0 self-center">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${getStatusColor(
                  computedStatus
                )}`}
              >
                {computedStatus}
              </span>

              {hasMenuItems && (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <button
                        type="button"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer outline-none"
                        title="More actions"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    }
                  />
                  <DropdownMenuContent align="end" className="w-52 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-lg z-[100] text-xs">
                    {showDownload && !!onDownloadReceipt && (
                      <DropdownMenuItem
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-3 py-2 cursor-pointer text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium rounded-md text-xs"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span>Download Visit Summary</span>
                      </DropdownMenuItem>
                    )}

                    {onView && (
                      <DropdownMenuItem
                        onClick={handleCardClick}
                        className="flex items-center gap-2 px-3 py-2 cursor-pointer text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium rounded-md text-xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                        <span>View Details</span>
                      </DropdownMenuItem>
                    )}

                    {isCancellable && (
                      <DropdownMenuItem
                        onClick={handleCancelClick}
                        className="flex items-center gap-2 px-3 py-2 cursor-pointer text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-medium rounded-md text-xs"
                      >
                        <CalendarX className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                        <span>Cancel Appointment</span>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete / Cancel Confirmation Modal */}
      {/* Delete / Cancel Confirmation Modal */}
      <DeleteConfirmationDialog
        isOpen={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        onConfirm={handleConfirmCancel}
        title="Cancel Appointment"
        description="Are you sure you want to cancel your appointment with"
        itemName={`Dr. ${appointment.doctor} on ${appointment.date}`}
        confirmLabel="Cancel Appointment"
        cancelLabel="Keep Appointment"
      />
    </>
  )
}

export default VisitCard