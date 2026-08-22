import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Home,
  CalendarClock,
  FlaskConical,
  FileText,
  Calendar as CalendarIcon,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import { PatientHeader } from '@/common/PatientHeader'
import { UpcomingAppointments } from './UpcomingAppointments'
import { PastVisits } from './PastVisits'
import { VisitsTab } from '../Visits/VisitsTab'
import { LaboratoryTab } from '../Laboratory/LaboratoryTab'
import { BillsTab } from '../Bills/BillsTab'
import { AppointmentBooking } from '../Appointment/AppointmentBooking'
import { PatientProfileCard } from '../Profile/PatientProfileCard'

import { type Patient, type Appointment, type ActiveTab } from '@/types/patient.types'
import { todayStr } from '@/utils/patient.utils'
import { useAuthStore } from '@/stores/authStore'
import { useAppointmentsQuery } from '@/hooks/queries/useAppointmentsQuery'
import { useDashboardQuery } from '@/hooks/queries/useDashboardQuery'
import { useCancelAppointmentMutation } from '@/hooks/mutations/useAppointmentMutations'

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
  onConfirmBooking: (data?: { deptID: string; doctorID: string; timeSlotID: string }) => void
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

  const cancelMutation = useCancelAppointmentMutation()

  const setActiveTab = (tab: ActiveTab) => {
    setActiveTabState(tab)
    if (tab === 'home' && location.pathname !== '/patient/dashboard') navigate('/patient/dashboard')
    else if (tab === 'visits' && location.pathname !== '/patient/visits') navigate('/patient/visits')
    else if (tab === 'lab' && location.pathname !== '/patient/lab') navigate('/patient/lab')
    else if (tab === 'bills' && location.pathname !== '/patient/bills') navigate('/patient/bills')
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
    const apptId = (appt as any).AppointmentID || Number(String(appt.apptNo).replace(/\D/g, ''))
    const pId = (appt as any).PatientID || Number(patientNumericId)
    if (apptId && pId) {
      await cancelMutation.mutateAsync({ appointmentId: apptId, patientId: pId })
    }
  }

  const today = todayStr()
  const localUpcomingAppointments = patientAppointments
    .filter((a) => a.date >= today)
    .sort((a, b) => {
      if (a.bookedOn && b.bookedOn) {
        return b.bookedOn.localeCompare(a.bookedOn)
      }
      return b.date.localeCompare(a.date)
    })
  const localPastAppointments = patientAppointments
    .filter((a) => a.date < today)
    .sort((a, b) => b.date.localeCompare(a.date))

  const mapAppt = (item: Record<string, unknown>, idx: number, defaultPrefix: string): Appointment => ({
    apptNo: String(item.apptNo || item.ApptNo || `${defaultPrefix}-${idx + 1}`),
    date: String(item.date || item.AppointmentDate || item.Date || today),
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

  const fetchedUpcoming = fetchedAppointments.filter(
    (a) => a.date >= today || a.status?.toLowerCase() === 'scheduled' || a.status?.toLowerCase() === 'confirmed'
  )
  const fetchedPast = fetchedAppointments.filter(
    (a) => a.date < today && a.status?.toLowerCase() !== 'scheduled' && a.status?.toLowerCase() !== 'confirmed'
  )

  const upcomingAppointments = fetchedAppointments.length > 0
    ? (fetchedUpcoming.length > 0 ? fetchedUpcoming : fetchedAppointments)
    : (dashboardData?.UpcomingAppointments?.length ? apiUpcoming : localUpcomingAppointments)

  const pastAppointments = fetchedPast.length > 0
    ? fetchedPast
    : (dashboardData?.PastVisits?.length ? apiPast : localPastAppointments)

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'visits', label: 'Visits', icon: CalendarClock },
    { id: 'lab', label: 'Lab', icon: FlaskConical },
    { id: 'bills', label: 'OP/IP Bill', icon: FileText },
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
              className="w-full"
            />
          </div>


          {/* Main Panel */}
          <div className="flex-1 min-w-0 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
            {/* Modern Tab Bar with Pill Design */}
            <div className="px-4 pt-4 pb-3 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50/80 to-white/80 dark:from-slate-900/80 dark:to-slate-900/50">
              <div className="flex flex-wrap items-center gap-1.5">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as ActiveTab)}
                      className={`
                        relative px-4 py-2.5 text-xs font-semibold flex items-center gap-2 
                        rounded-xl transition-all duration-300 cursor-pointer
                        ${isActive
                          ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-md shadow-blue-100/50 dark:shadow-slate-800/50 scale-100'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/50 hover:scale-105'
                        }
                      `}
                    >
                      <Icon className={`w-4 h-4 transition-colors duration-300 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
                        }`} />
                      <span>{tab.label}</span>
                      {isActive && (
                        <span className="absolute -bottom-px left-1/2 -translate-x-1/2 w-6 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
                      )}
                    </button>
                  )
                })}

                {/* Book Appointment Button */}
                <button
                  onClick={() => setActiveTab('book')}
                  className="ml-auto px-4 py-2.5 text-xs font-bold flex items-center gap-2 rounded-xl text-white transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer"
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
            <div className="p-5">
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
                            onViewReceipt={onViewReceipt}
                            onCancelAppointment={handleCancelAppointmentAndRefresh}
                          />
                        </div>
                      )}

                      {/* Past Visits */}
                      {pastAppointments.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-1 h-5 bg-gradient-to-b from-slate-400 to-slate-500 rounded-full"></div>
                            <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                              Past Visits
                            </h3>
                            <span className="ml-auto text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                              {pastAppointments.length} visit{pastAppointments.length > 1 ? 's' : ''}
                            </span>
                          </div>
                          <PastVisits
                            appointments={pastAppointments}
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

              {activeTab === 'lab' && <LaboratoryTab />}

              {activeTab === 'bills' && <BillsTab />}

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
    </div>
  )
}