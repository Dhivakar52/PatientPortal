import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Home,
  CalendarClock,
  FlaskConical,
  FileText,
  Calendar as CalendarIcon,
  User,
  Phone,
  Cake,
  Venus,
  Mars,
  ChevronRight,
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

interface PatientDashboardProps {
  currentPatient: Patient | null
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
  bookErrors: Record<string, string>
  onConfirmBooking: () => void
  onViewReceipt: (appt: Appointment) => void
  onCancelAppointment?: (appt: Appointment) => void
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  currentPatient,
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

  const salutation = currentPatient?.gender === 'Female' ? 'Ms.' : 'Mr.'
  const displayName = currentPatient
    ? `${salutation} ${capitalizeName((currentPatient.name || '').trim().split(/\s+/)[0] || currentPatient.name)}`
    : '—'
  const displayAge = currentPatient ? calcAge(currentPatient.dob) : ''

  const today = todayStr()
  const upcomingAppointments = patientAppointments
    .filter((a) => a.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
  const pastAppointments = patientAppointments
    .filter((a) => a.date < today)
    .sort((a, b) => b.date.localeCompare(a.date))

  const getGenderIcon = () => {
    if (currentPatient?.gender === 'Female') return <Venus className="w-3.5 h-3.5 text-pink-500" />
    if (currentPatient?.gender === 'Male') return <Mars className="w-3.5 h-3.5 text-blue-500" />
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
          <div className="w-full lg:w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 text-center shrink-0 shadow-sm">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 flex items-center justify-center text-xl font-bold mx-auto mb-3">
              {initials(currentPatient?.name || '')}
            </div>

            {/* Name */}
            <div className="font-bold text-sm text-slate-900 dark:text-slate-100">{displayName}</div>

            {/* Gender with icon */}
            <div className="flex items-center justify-center gap-1.5 mt-1">
              {getGenderIcon()}
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {currentPatient?.gender || '—'}
              </span>
            </div>

            {/* DOB with icon */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 mt-2">
              <Cake className="w-3.5 h-3.5 text-slate-400" />
              <span>DOB: {formatDateLong(currentPatient?.dob || '')}</span>
              {displayAge && (
                <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                  {displayAge}Y
                </span>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200 dark:border-slate-800 my-3" />

            {/* Mobile with icon */}
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>+91 {currentPatient?.mobile}</span>
            </div>

            {/* Patient ID */}
            {currentPatient?.id && (
              <div className="mt-3 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full inline-block">
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  UHID: {currentPatient.id.substring(0, 8)}
                </span>
              </div>
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
                    borderRadius: '12px',
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
                  {/* Upcoming Appointments */}
                  {upcomingAppointments.length > 0 && (
                    <div>
                      {/* <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                        <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          Upcoming Appointments
                        </h3>
                        <span className="ml-auto text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                          {upcomingAppointments.length} appointment{upcomingAppointments.length > 1 ? 's' : ''}
                        </span>
                      </div> */}
                      <UpcomingAppointments
                        appointments={upcomingAppointments}
                        onViewReceipt={onViewReceipt}
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
                        className="mt-4 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                      >
                        Book your first appointment
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
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