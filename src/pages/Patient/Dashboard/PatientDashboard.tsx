import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Home,
  CalendarClock,
  Calendar as CalendarIcon,
  ChevronRight,
  Loader2,
  Plus,
  X,
} from 'lucide-react'
import { PatientHeader } from '@/common/PatientHeader'
import { UpcomingAppointments } from './UpcomingAppointments'
import { PastVisits } from './PastVisits'
import { VisitsTab } from '../Visits/VisitsTab'
// import { LaboratoryTab } from '../Laboratory/LaboratoryTab'
// import { BillsTab } from '../Bills/BillsTab'
import { AppointmentBooking } from '../Appointment/AppointmentBooking'
import { PatientProfileCard } from '../Profile/PatientProfileCard'
import { AppointmentDetailsPanel } from '@/common/AppointmentDetailsPanel'

import { type Patient, type Appointment, type ActiveTab } from '@/types/patient.types'
import { todayStr } from '@/utils/patient.utils'
import { useAuthStore } from '@/stores/authStore'
import { useAppointmentsQuery } from '@/hooks/queries/useAppointmentsQuery'
import { useDashboardQuery } from '@/hooks/queries/useDashboardQuery'

interface PatientDashboardProps {
  currentPatient: Patient | null
  isLoadingPatient?: boolean
  patientError?: string | null
  patients?: Patient[]
  onSelectPatient?: (patientId: string) => void
  onSelectPatientClick?: () => void
  onAddPatient?: () => void
  patientAppointments?: Appointment[]
  onLogout?: () => void

  // Booking props
  bookDate: string
  setBookDate: (v: string) => void
  bookDoctor?: string
  setBookDoctor?: (v: string) => void
  bookUnit?: string
  setBookUnit?: (v: string) => void
  selectedSlot: string
  setSelectedSlot: (v: string) => void
  selectedDepartmentId?: string
  setSelectedDepartmentId?: (v: string) => void
  selectedDoctorId?: string
  setSelectedDoctorId?: (v: string) => void
  selectedTimeSlotId?: string
  setSelectedTimeSlotId?: (v: string) => void
  isConfirming?: boolean
  bookErrors: Record<string, string>
  onConfirmBooking: (data?: { deptID: string; doctorID: string; timeSlotID: string; deptName?: string }) => void
  onViewReceipt: (appt: Appointment) => void
  onCancelAppointment: (appt: Appointment) => void
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  currentPatient,
  isLoadingPatient = false,
  patientError = null,
  patients = [],
  onSelectPatient,
  onSelectPatientClick,
  onAddPatient,
  patientAppointments = [],
  onLogout,
  bookDate,
  setBookDate,
  bookDoctor,
  setBookDoctor,
  bookUnit,
  setBookUnit,
  selectedSlot,
  setSelectedSlot,
  selectedDepartmentId,
  setSelectedDepartmentId,
  selectedDoctorId,
  setSelectedDoctorId,
  selectedTimeSlotId,
  setSelectedTimeSlotId,
  isConfirming = false,
  bookErrors,
  onConfirmBooking,
  onViewReceipt,
  onCancelAppointment,
}) => {
  const navigate = useNavigate()
  const location = useLocation()

  const getTabFromPath = (path: string): ActiveTab => {
    if (path.includes('visit')) return 'visits'
    if (path.includes('lab')) return 'lab'
    if (path.includes('bill')) return 'bills'
    if (path.includes('book')) return 'book'
    return 'home'
  }

  const [activeTab, setActiveTabState] = useState<ActiveTab>(() => getTabFromPath(location.pathname))
  const authUserId = useAuthStore((s) => s.userId)
  const patientNumericId = currentPatient?.PatientID || (currentPatient?.id ? Number(String(currentPatient.id).replace(/\D/g, '')) || currentPatient.id : undefined)

  // TanStack Queries with user-specific query keys
  const {
    data: fetchedAppointments = [],
    isLoading: isLoadingAppointments,
    refetch: refetchAppointments,
  } = useAppointmentsQuery(authUserId, patientNumericId || null)

  const {
    data: dashboardData,
    isLoading: isLoadingDashboard,
    refetch: refetchDashboard,
  } = useDashboardQuery(authUserId, patientNumericId || null)

  const [isFabExpanded, setIsFabExpanded] = useState<boolean>(false)
  const [selectedHomeAppointment, setSelectedHomeAppointment] = useState<Appointment | null>(null)
  const [isHomeViewPanelOpen, setIsHomeViewPanelOpen] = useState<boolean>(false)

  const handleViewHomeAppointment = (appt: Appointment) => {
    setSelectedHomeAppointment(appt)
    setIsHomeViewPanelOpen(true)
  }

  const setActiveTab = (tab: ActiveTab) => {
    setActiveTabState(tab)
    setIsFabExpanded(false)
    if (tab === 'home' && location.pathname !== '/patient/dashboard') navigate('/patient/dashboard')
    else if (tab === 'visits' && location.pathname !== '/patient/visits') navigate('/patient/visits')
    // else if (tab === 'lab' && location.pathname !== '/patient/lab') navigate('/patient/lab')
    // else if (tab === 'bills' && location.pathname !== '/patient/bills') navigate('/patient/bills')
    else if (tab === 'book' && location.pathname !== '/patient/book') navigate('/patient/book')
  }

  useEffect(() => {
    const t = getTabFromPath(location.pathname)
    if (t !== activeTab) {
      setActiveTabState(t)
    }
  }, [location.pathname])

  // Re-fetch on Home tab or navigation changes
  useEffect(() => {
    if (!patientNumericId) return
    if (activeTab === 'home' || activeTab === 'visits') {
      refetchAppointments()
      refetchDashboard()
    }
  }, [patientNumericId, activeTab, location.pathname, refetchAppointments, refetchDashboard])

  const handleCancelAppointmentAndRefresh = async (appt: Appointment) => {
    if (onCancelAppointment) {
      await onCancelAppointment(appt)
    }
  }

  const parseAppointmentDate = (dateString: string): Date => {
    if (!dateString) return new Date(0)
    const ddMmMatch = dateString.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/)
    if (ddMmMatch) {
      const day = parseInt(ddMmMatch[1], 10)
      const month = parseInt(ddMmMatch[2], 10)
      const year = parseInt(ddMmMatch[3], 10)
      return new Date(year, month - 1, day)
    }
    const ddMmmMatch = dateString.match(/^(\d{1,2})[-/]([A-Za-z]{3})[-/](\d{4})/)
    if (ddMmmMatch) {
      const day = parseInt(ddMmmMatch[1], 10)
      const monthStr = ddMmmMatch[2].toUpperCase()
      const year = parseInt(ddMmmMatch[3], 10)
      const monthIndex = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].indexOf(monthStr)
      if (monthIndex !== -1) {
        return new Date(year, monthIndex, day)
      }
    }
    const isoMatch = dateString.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/)
    if (isoMatch) {
      const year = parseInt(isoMatch[1], 10)
      const month = parseInt(isoMatch[2], 10)
      const day = parseInt(isoMatch[3], 10)
      return new Date(year, month - 1, day)
    }
    const parsed = new Date(dateString)
    return isNaN(parsed.getTime()) ? new Date(0) : parsed
  }

  const isUpcomingDate = (dateString: string): boolean => {
    if (!dateString) return false
    const d = parseAppointmentDate(dateString)
    if (isNaN(d.getTime()) || d.getTime() === 0) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const apptDateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    return apptDateOnly.getTime() >= today.getTime()
  }

  const isPastDate = (dateString: string): boolean => {
    if (!dateString) return false
    const d = parseAppointmentDate(dateString)
    if (isNaN(d.getTime()) || d.getTime() === 0) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const apptDateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    return apptDateOnly.getTime() < today.getTime()
  }

  const isCancelledAppt = (a: Appointment) => {
    const s = (a.AppointmentStatus || a.status || a.Status || (a as any).appointmentStatus || '').toLowerCase()
    return s === 'cancelled' || s === 'canceled'
  }

  const isUpcomingAppt = (a: Appointment) => {
    if (isCancelledAppt(a)) return false
    const s = (a.AppointmentStatus || a.status || a.Status || (a as any).appointmentStatus || '').toLowerCase()
    if (s === 'visited' || s === 'completed') return false
    if (s === 'upcoming' || s === 'scheduled' || s === 'confirmed' || s === 'pending') return true
    return isUpcomingDate(a.date || a.AppointmentDate || '')
  }

  const isPastAppt = (a: Appointment) => {
    const s = (a.AppointmentStatus || a.status || a.Status || (a as any).appointmentStatus || '').toLowerCase()
    if (s === 'visited' || s === 'completed') return true
    if (isUpcomingAppt(a)) return false
    return isPastDate(a.date || a.AppointmentDate || '')
  }

  const mapAppt = (item: Record<string, unknown>, idx: number, defaultPrefix: string): Appointment => ({
    apptNo: String(item.apptNo || item.ApptNo || `${defaultPrefix}-${idx + 1}`),
    date: String(item.date || item.AppointmentDate || item.Date || todayStr()),
    doctor: String(item.doctor || item.Doctor_Name || item.DoctorName || 'Doctor'),
    department: String(item.department || item.DepartmentName || item.Department || 'General'),
    slot: String(item.slot || item.Timeslot || item.TimeSlot || '08:00 AM-08:10 AM'),
    unit: String(item.unit || item.Unit || 'Unit 1'),
    bookedOn: String(item.bookedOn || item.BookedOn || new Date().toISOString()),
    room: String(item.room || item.Room || 'OPD-101'),
    status: String(item.status || item.Status || 'Scheduled'),
  })

  const apiUpcoming: Appointment[] = (dashboardData?.UpcomingAppointments as Record<string, unknown>[] | undefined)?.map((item, idx) =>
    mapAppt(item, idx, 'APT')
  ) || []

  const apiPast: Appointment[] = (dashboardData?.PastVisits as Record<string, unknown>[] | undefined)?.map((item, idx) =>
    mapAppt(item, idx, 'VIS')
  ) || []

  // Combine and deduplicate across API appointments, dashboard data, and local booking DB
  const allAppointmentsList = React.useMemo(() => {
    const list: Appointment[] = []
    const seenKeys = new Set<string>()

    const addAppt = (appt: Appointment) => {
      const key = String(appt.AppointmentID || appt.AppointmentNo || appt.apptNo || `${appt.date}-${appt.slot}-${appt.doctor}`)
      if (!seenKeys.has(key)) {
        seenKeys.add(key)
        list.push(appt)
      }
    }

    if (Array.isArray(fetchedAppointments) && fetchedAppointments.length > 0) {
      fetchedAppointments.forEach(addAppt)
    }
    if (Array.isArray(apiUpcoming) && apiUpcoming.length > 0) {
      apiUpcoming.forEach(addAppt)
    }
    if (Array.isArray(apiPast) && apiPast.length > 0) {
      apiPast.forEach(addAppt)
    }
    if (Array.isArray(patientAppointments) && patientAppointments.length > 0) {
      patientAppointments.forEach(addAppt)
    }

    return list
  }, [fetchedAppointments, apiUpcoming, apiPast, patientAppointments])

  // Sort Upcoming Appointments: Date ASC -> TimeSlot ASC (excluding Cancelled)
  const upcomingAppointments = React.useMemo(() => {
    return allAppointmentsList
      .filter(isUpcomingAppt)
      .sort((a, b) => {
        const dateA = parseAppointmentDate(a.date || a.AppointmentDate || '')
        const dateB = parseAppointmentDate(b.date || b.AppointmentDate || '')
        const timeDiff = dateA.getTime() - dateB.getTime()
        if (timeDiff !== 0) return timeDiff

        const slotA = a.slot || a.TimeSlot || a.Timeslot || ''
        const slotB = b.slot || b.TimeSlot || b.Timeslot || ''
        return slotA.localeCompare(slotB)
      })
  }, [allAppointmentsList])

  // Sort Past Visits: Date DESC
  const pastAppointments = React.useMemo(() => {
    return allAppointmentsList
      .filter(isPastAppt)
      .sort((a, b) => {
        const dateA = parseAppointmentDate(a.date || a.AppointmentDate || '')
        const dateB = parseAppointmentDate(b.date || b.AppointmentDate || '')
        return dateB.getTime() - dateA.getTime()
      })
  }, [allAppointmentsList])

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'visits', label: 'Visits', icon: CalendarClock },
    // { id: 'lab', label: 'Lab', icon: FlaskConical },
    // { id: 'bills', label: 'OP/IP Bill', icon: FileText },
  ]

  return (
    <div className="min-h-screen bg-[#f4f6f9] dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans">
      <PatientHeader
        currentPatient={currentPatient}
        patients={patients}
        onSelectPatient={onSelectPatient}
        onSelectPatientClick={onSelectPatientClick}
        onAddPatient={onAddPatient}
        onLogout={onLogout}
      />

      <div className="px-4 py-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          {/* Left Profile Side Card (Desktop View: visible on lg+; Mobile View: accessed via Header Dropdown -> Profile -> /profile) */}
          <div className="hidden lg:block w-72 shrink-0">
            <PatientProfileCard
              currentPatient={currentPatient}
              isLoadingPatient={isLoadingPatient}
              patientError={patientError}
              lastVisitedDate={pastAppointments[0]?.date || apiPast[0]?.date}
              className="w-full"
            />
          </div>


          {/* Main Panel */}
          <div className="flex-1 min-w-0 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
            {/* Modern Tab Bar with Responsive Layout */}
            <div className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2.5 sm:pb-3 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50/80 to-white/80 dark:from-slate-900/80 dark:to-slate-900/50">
              <div className="flex items-center justify-between gap-1.5 w-full">
                {/* 4 Tabs: Mobile grid (100% width) / Desktop flex */}
                <div className="grid grid-cols-4 sm:flex sm:flex-wrap items-center gap-1 sm:gap-1.5 flex-1 sm:flex-initial">
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab.id
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as ActiveTab)}
                        className={`
                          relative px-2 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-xs font-semibold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 
                          rounded-lg sm:rounded-xl transition-all duration-300 cursor-pointer text-center
                          ${isActive
                            ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-md shadow-blue-100/50 dark:shadow-slate-800/50 scale-100'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/50'
                          }
                        `}
                      >
                        <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors duration-300 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
                          }`} />
                        <span className="truncate">{tab.label}</span>
                        {isActive && (
                          <span className="absolute -bottom-px left-1/2 -translate-x-1/2 w-6 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Book Appointment Tab Button: HIDDEN on Mobile, VISIBLE on Desktop/Tablet */}
                <button
                  onClick={() => setActiveTab('book')}
                  className="hidden md:flex ml-auto px-4 py-2.5 text-xs font-bold items-center gap-2 rounded-xl text-white transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer shrink-0"
                  style={{
                    background: activeTab === 'book' ? '#586fb2' : 'var(--blue-btn)',
                    borderRadius: '4px',
                    boxShadow: activeTab === 'book'
                      ? '0 4px 12px rgba(88, 111, 178, 0.4)'
                      : '0 4px 12px rgba(88, 111, 178, 0.3)'
                  }}
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span>Book Appointment</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Tab Contents */}
            <div className="p-3.5 sm:p-5 w-full min-w-0">
              {activeTab === 'home' && (
                <div className="space-y-6">
                  {(isLoadingDashboard || isLoadingAppointments) && upcomingAppointments.length === 0 && pastAppointments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
                      <p className="text-sm font-medium">Loading dashboard...</p>
                    </div>
                  ) : (
                    <>
                      {/* Upcoming Appointments */}
                      {upcomingAppointments.length > 0 && (
                        <div>
                          <UpcomingAppointments
                            appointments={upcomingAppointments}
                            onView={handleViewHomeAppointment}
                            onViewReceipt={onViewReceipt}
                            onCancelAppointment={handleCancelAppointmentAndRefresh}
                          />
                        </div>
                      )}

                      {/* Past Visits */}
                      {pastAppointments.length > 0 && (
                        <div>
                          <PastVisits
                            appointments={pastAppointments}
                            onView={handleViewHomeAppointment}
                            onViewReceipt={onViewReceipt}
                          />
                        </div>
                      )}

                      {/* Empty State */}
                      {upcomingAppointments.length === 0 && pastAppointments.length === 0 && (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-full flex items-center justify-center mb-4">
                            <CalendarClock className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">No appointments found</p>
                          <button
                            onClick={() => setActiveTab('book')}
                            className="mt-4 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            Book your first appointment
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {activeTab === 'visits' && (
                <VisitsTab
                  appointments={fetchedAppointments.length > 0 ? fetchedAppointments : patientAppointments}
                  onViewReceipt={onViewReceipt}
                  onCancelAppointment={handleCancelAppointmentAndRefresh}
                  currentPatient={currentPatient}
                />
              )}

              {/* {activeTab === 'lab' && <LaboratoryTab />}

              {activeTab === 'bills' && <BillsTab />} */}

              {activeTab === 'book' && (
                <AppointmentBooking
                  bookDate={bookDate}
                  setBookDate={setBookDate}
                  bookDoctor={bookDoctor}
                  setBookDoctor={setBookDoctor}
                  bookUnit={bookUnit}
                  setBookUnit={setBookUnit}
                  selectedSlot={selectedSlot}
                  setSelectedSlot={setSelectedSlot}
                  selectedDepartmentId={selectedDepartmentId}
                  setSelectedDepartmentId={setSelectedDepartmentId}
                  selectedDoctorId={selectedDoctorId}
                  setSelectedDoctorId={setSelectedDoctorId}
                  selectedTimeSlotId={selectedTimeSlotId}
                  setSelectedTimeSlotId={setSelectedTimeSlotId}
                  isConfirming={isConfirming}
                  bookErrors={bookErrors}
                  onConfirm={onConfirmBooking}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Only: Floating Book Appointment Action Button (FAB) */}
      {activeTab !== 'book' && (
        <div className="fixed bottom-6 right-6 z-50 md:hidden flex flex-col items-end gap-2.5">
          {/* Expanded Book Action Pill */}
          {isFabExpanded && (
            <button
              onClick={() => {
                setIsFabExpanded(false)
                setActiveTab('book')
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-white text-xs font-bold shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 hover:scale-105 active:scale-95 cursor-pointer"
              style={{
                background: 'var(--blue-btn)',
                boxShadow: '0 8px 24px rgba(88, 111, 178, 0.45)',
                borderRadius: '4px'
              }}
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Book Appointment</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Floating Circle Toggle (+ / ×) */}
          <button
            type="button"
            onClick={() => setIsFabExpanded(!isFabExpanded)}
            className="w-13 h-13 rounded-full text-white shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            style={{
              background: isFabExpanded ? '#dc2626' : 'var(--blue-btn)',
              boxShadow: isFabExpanded
                ? '0 6px 20px rgba(220, 38, 38, 0.4)'
                : '0 6px 20px rgba(88, 111, 178, 0.45)',

            }}
            aria-label={isFabExpanded ? 'Close booking options' : 'Book Appointment'}
            title={isFabExpanded ? 'Close' : 'Book Appointment'}
          >
            {isFabExpanded ? (
              <X className="w-6 h-6 animate-in zoom-in-50 duration-200" />
            ) : (
              <Plus className="w-6 h-6 animate-in zoom-in-50 duration-200" />
            )}
          </button>
        </div>
      )}

      {/* Appointment Details Side Panel */}
      <AppointmentDetailsPanel
        isOpen={isHomeViewPanelOpen}
        appointment={selectedHomeAppointment}
        currentPatient={currentPatient}
        onClose={() => {
          setIsHomeViewPanelOpen(false)
          setSelectedHomeAppointment(null)
        }}
        onViewReceipt={onViewReceipt}
      />
    </div>
  )
}