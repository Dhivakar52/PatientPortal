import React, { useState, useRef, useEffect } from 'react'
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
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const { dayMonth, year, dayName } = formatVisitDate(appointment.date)
  const today = todayStr()

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Compute status if not explicitly present
  const computedStatus =
    (appointment as any).status || (appointment.date < today ? 'Completed' : 'Scheduled')

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsMenuOpen(false)
    if (onDownloadReceipt) {
      onDownloadReceipt(appointment)
    } else {
      toast.success(`Downloading Visit Summary for ${appointment.doctor}`)
    }
  }

  const handleCardClick = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setIsMenuOpen(false)
    if (onView) {
      onView(appointment)
    }
  }

  const handleCancelClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsMenuOpen(false)
    setIsCancelDialogOpen(true)
  }

  const handleConfirmCancel = () => {
    setIsCancelDialogOpen(false)
    if (onCancelAppointment) {
      onCancelAppointment(appointment)
    } else {
      toast.success(`Appointment ${appointment.apptNo || ''} with Dr. ${appointment.doctor} cancelled successfully!`)
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

  const isCancellable = showCancel && computedStatus.toLowerCase() !== 'completed' && computedStatus.toLowerCase() !== 'visited' && computedStatus.toLowerCase() !== 'cancelled'

  return (
    <>
      <div className={`group border border-[#e5e7eb] dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 shadow-2xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 relative ${isMenuOpen ? 'z-[60]' : 'z-0'}`}>
        <div className="p-4 pr-11">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Left Date Square Box with Icon */}
            <div className="relative w-16 h-16 shrink-0">
              {/* Calendar Icon on top of date box */}
              <div className="absolute -top-2 -right-2 z-10">
                <div className="bg-blue-500 dark:bg-blue-600 rounded-full p-1 shadow-md">
                  <CalendarDays className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-800 dark:to-slate-700 border border-blue-200 dark:border-slate-600 rounded-xl flex flex-col items-center justify-center p-1 text-center shadow-sm overflow-hidden">
                <span className="text-[12px] font-bold text-blue-700 dark:text-blue-300 uppercase leading-tight">
                  {dayMonth}
                </span>
                <span className="text-[10px] font-semibold text-blue-500 dark:text-blue-400 leading-tight mt-0.5">
                  {year}
                </span>
              </div>
            </div>

            {/* Middle Details Content */}
            <div className="flex-1 min-w-0 space-y-1.5">
              {/* Doctor Name & Department on a single line */}
              <div className="flex items-center gap-2 flex-nowrap min-w-0">
                <Stethoscope className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug whitespace-nowrap truncate">
                  {appointment.doctor}
                </span>
                {appointment.department && (
                  <span className="text-[10px] sm:text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap">
                    {appointment.department}
                  </span>
                )}
              </div>

              {/* Hospital / Clinic Name with icon */}
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                  {HOSPITAL_NAME}
                </span>
              </div>

              {/* Day, Date, Time & Appointment Number with icons */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                  <span className="text-[11px] text-slate-600 dark:text-slate-300">
                    {dayName}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                  <span className="text-[11px] text-slate-600 dark:text-slate-300">
                    {appointment.slot || '12:42:15 PM'}
                  </span>
                </div>
                {appointment.apptNo && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                    <span className="text-slate-400 font-normal">Appt No:</span>
                    <span className="text-blue-600 dark:text-blue-400">{appointment.apptNo}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side: Status Badge - Centered vertically */}
            <div className="shrink-0 self-start sm:self-center flex items-center">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${getStatusColor(
                  computedStatus
                )}`}
              >
                {computedStatus}
              </span>
            </div>
          </div>

          {/* Three dots menu - positioned at top-right side of the card */}
          <div className="absolute top-[36px] right-3 z-30" ref={menuRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setIsMenuOpen(!isMenuOpen)
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="More actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Dropdown Menu - positioned downwards over card */}
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xl z-[100] py-1.5 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                <div className="py-0.5">
                  {showDownload && (
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="w-full text-left px-3.5 py-2 flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>Download Visit Summary</span>
                    </button>
                  )}

                  {onView && (
                    <button
                      type="button"
                      onClick={handleCardClick}
                      className="w-full text-left px-3.5 py-2 flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      <span>View Details</span>
                    </button>
                  )}

                  {isCancellable && (
                    <button
                      type="button"
                      onClick={handleCancelClick}
                      className="w-full text-left px-3.5 py-2 flex items-center gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-medium transition-colors cursor-pointer"
                    >
                      <CalendarX className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                      <span>Cancel Appointment</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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