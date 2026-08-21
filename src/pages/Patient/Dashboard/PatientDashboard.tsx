import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Home,
  CalendarClock,
  FlaskConical,
  FileText,
  Calendar as CalendarIcon,
  User,
  Venus,
  Mars,
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

import { type Patient, type Appointment, type ActiveTab } from '@/types/patient.types'
import { initials, capitalizeName, formatDateLong, calcAge, todayStr } from '@/utils/patient.utils'
import { getDashboard, type DashboardResponse } from '@/services/apiService'

interface PatientDashboardProps {
  currentPatient: Patient | null
  isLoadingPatient?: boolean
  patientError?: string | null
  patients?: Patient[]
  onSelectPatient?: (patientId: string) => void
  onSelectPatientClick: () => void
  onAddPatient?: () => void
  patientAppointments: Appointment[]
  onLogout: () => void

  // Booking props
  bookDate: string
  setBookDate: (v: string) => void
  bookDoctor: string
  setBookDoctor: (v: string) => void
  bookUnit: string
  setBookUnit: (v: string) => void
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
  onCancelAppointment?: (appt: Appointment) => void
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  currentPatient,
  isLoadingPatient = false,
  patientError = null,
  patients = [],
  onSelectPatient,
  onSelectPatientClick,
  onAddPatient,
  patientAppointments,
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
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null)
  const [isLoadingDashboard, setIsLoadingDashboard] = useState<boolean>(false)

  const setActiveTab = (tab: ActiveTab) => {
    setActiveTabState(tab)
    if (tab === 'home') navigate('/patient/home')
    else if (tab === 'visits') navigate('/patient/visits')
    else if (tab === 'lab') navigate('/patient/lab')
    else if (tab === 'bills') navigate('/patient/bills')
    else if (tab === 'book') navigate('/patient/book')
  }

  useEffect(() => {
    const t = getTabFromPath(location.pathname)
    if (t !== activeTab) {
      setActiveTabState(t)
    }
  }, [location.pathname])

  // Fetch Dashboard data from GET /api/dashboard using active patient ID
  const patientNumericId = currentPatient?.PatientID || (currentPatient?.id ? Number(String(currentPatient.id).replace(/\D/g, '')) || currentPatient.id : undefined)

  useEffect(() => {
    if (!patientNumericId) return

    let isMounted = true
    setIsLoadingDashboard(true)

    getDashboard({
      patientID: patientNumericId,
      pageNo: 1,
      recordCount: 10,
    })
      .then((res) => {
        if (isMounted && res) {
          setDashboardData(res)
        }
      })
      .catch((err) => {
        console.error('Failed to fetch dashboard data:', err)
      })
      .finally(() => {
        if (isMounted) setIsLoadingDashboard(false)
      })

    return () => {
      isMounted = false
    }
  }, [patientNumericId])

  // Dynamic values directly from API response
  const rawName = currentPatient?.PatientName || currentPatient?.name || ''
  const gender = currentPatient?.Gender || currentPatient?.gender || '—'
  const salutation = gender.toLowerCase() === 'female' ? 'Ms.' : 'Mr.'
  const displayName = rawName
    ? `${salutation} ${capitalizeName(rawName.trim().split(/\s+/)[0] || rawName)}`
    : '—'
  const fullPatientName = rawName ? capitalizeName(rawName) : '—'

  const displayDob = currentPatient?.DOB || (currentPatient?.dob ? formatDateLong(currentPatient.dob) : '—')
  const displayAge = currentPatient?.Age !== undefined && currentPatient.Age !== null
    ? currentPatient.Age
    : (currentPatient?.dob ? calcAge(currentPatient.dob) : '—')

  const displayPhone = currentPatient?.PhoneNo || currentPatient?.mobile || '—'
  const displayAddress = currentPatient?.PatientAddress || currentPatient?.address || '—'
  const displayCity = currentPatient?.City || currentPatient?.city || '—'
  const displayState = currentPatient?.PatientState || currentPatient?.state || '—'
  const displayPinCode = currentPatient?.PinCode || currentPatient?.pincode || '—'
  const displayUhid = currentPatient?.UHID || '—'
  const displayRegisterNo = currentPatient?.RegisterNo || '—'
  const displayAbhaId = currentPatient?.AbhaID || '—'

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

  // Map API dashboard items or fall back to local store
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

  const upcomingAppointments = dashboardData ? apiUpcoming : localUpcomingAppointments
  const pastAppointments = dashboardData ? apiPast : localPastAppointments

  const getGenderIcon = () => {
    if (gender.toLowerCase() === 'female') return <Venus className="w-3.5 h-3.5 text-pink-500" />
    if (gender.toLowerCase() === 'male') return <Mars className="w-3.5 h-3.5 text-blue-500" />
    return <User className="w-3.5 h-3.5 text-slate-400" />
  }

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
          {/* Left Profile Side Card */}
          <div className="w-full lg:w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shrink-0 shadow-sm">
            {isLoadingPatient && !currentPatient ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                <p className="text-xs">Loading patient profile...</p>
              </div>
            ) : patientError && !currentPatient ? (
              <div className="text-center py-8">
                <p className="text-xs text-rose-500">{patientError}</p>
              </div>
            ) : (
              <>
                {/* Header info */}
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center text-xl font-bold mx-auto mb-3 shadow-md shadow-blue-500/20">
                    {initials(rawName)}
                  </div>
                  <div className="font-bold text-base text-slate-900 dark:text-slate-100 leading-snug">
                    {displayName}
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                      {getGenderIcon()}
                      {gender}
                    </span>
                    {displayAge !== '—' && (
                      <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-0.5 rounded-full">
                        {displayAge} Years
                      </span>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-200 dark:border-slate-800 my-4" />

                {/* Profile Details List */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-slate-500 dark:text-slate-400 shrink-0 font-medium">Patient Name</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">{fullPatientName}</span>
                  </div>

                  <div className="flex justify-between items-start gap-2">
                    <span className="text-slate-500 dark:text-slate-400 shrink-0 font-medium">Date of Birth</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">{displayDob}</span>
                  </div>

                  <div className="flex justify-between items-start gap-2">
                    <span className="text-slate-500 dark:text-slate-400 shrink-0 font-medium">Age</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                      {displayAge !== '—' ? `${displayAge} Years` : '—'}
                    </span>
                  </div>

                  <div className="flex justify-between items-start gap-2">
                    <span className="text-slate-500 dark:text-slate-400 shrink-0 font-medium">Gender</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">{gender}</span>
                  </div>

                  <div className="flex justify-between items-start gap-2">
                    <span className="text-slate-500 dark:text-slate-400 shrink-0 font-medium">Phone Number</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                      {displayPhone !== '—' ? `+91 ${displayPhone}` : '—'}
                    </span>
                  </div>

                  <div className="flex justify-between items-start gap-2">
                    <span className="text-slate-500 dark:text-slate-400 shrink-0 font-medium">Address</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-right break-words max-w-[150px]">
                      {displayAddress}
                    </span>
                  </div>

                  <div className="flex justify-between items-start gap-2">
                    <span className="text-slate-500 dark:text-slate-400 shrink-0 font-medium">City</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">{displayCity}</span>
                  </div>

                  <div className="flex justify-between items-start gap-2">
                    <span className="text-slate-500 dark:text-slate-400 shrink-0 font-medium">State</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">{displayState}</span>
                  </div>

                  <div className="flex justify-between items-start gap-2">
                    <span className="text-slate-500 dark:text-slate-400 shrink-0 font-medium">PIN Code</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">{displayPinCode}</span>
                  </div>

                  <div className="border-t border-dashed border-slate-200 dark:border-slate-800 my-2.5 pt-2 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-slate-500 dark:text-slate-400 shrink-0 font-medium">UHID</span>
                      <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300 text-right">
                        {displayUhid}
                      </span>
                    </div>

                    <div className="flex justify-between items-start gap-2">
                      <span className="text-slate-500 dark:text-slate-400 shrink-0 font-medium">Register No.</span>
                      <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300 text-right">
                        {displayRegisterNo}
                      </span>
                    </div>

                    <div className="flex justify-between items-start gap-2">
                      <span className="text-slate-500 dark:text-slate-400 shrink-0 font-medium">ABHA ID</span>
                      <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300 text-right">
                        {displayAbhaId}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
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
                  {isLoadingDashboard && upcomingAppointments.length === 0 && pastAppointments.length === 0 ? (
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
                            onCancelAppointment={onCancelAppointment}
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
                  appointments={patientAppointments}
                  onViewReceipt={onViewReceipt}
                  onCancelAppointment={onCancelAppointment}
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