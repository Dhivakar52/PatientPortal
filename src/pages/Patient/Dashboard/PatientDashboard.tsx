import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LogOut,
  Home,
  CalendarClock,
  FlaskConical,
  FileText,
  Calendar as CalendarIcon,
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

  return (
    <div className="min-h-screen bg-[#f4f6f9] dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans">
      <PatientHeader
        currentPatient={currentPatient}
        patients={patients}
        onSelectPatient={onSelectPatient}
        onSelectPatientClick={onSelectPatientClick}
        onAddPatient={onAddPatient}
      />

      <div className="px-4 py-6">
        <div className="flex flex-col md:flex-row gap-5 items-start">
          {/* Left Profile Side Card */}
          <div className="w-full md:w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-5 text-center shrink-0 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 flex items-center justify-center text-xl font-bold mx-auto mb-3">
              {initials(currentPatient?.name || '')}
            </div>
            <div className="font-bold text-sm text-slate-900 dark:text-slate-100">{displayName}</div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-1">
              {currentPatient?.gender || '—'}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              DOB: {formatDateLong(currentPatient?.dob || '')} {displayAge !== '' ? `• ${displayAge}Y` : ''}
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 my-3" />

            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">+91 {currentPatient?.mobile}</div>

            <button
              onClick={onLogout}
              className="mt-4 w-full py-2 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>

          {/* Main Panel */}
          <div className="flex-1 min-w-0 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden shadow-sm">
            {/* Tab Bar */}
            <div className="flex flex-wrap items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <button
                onClick={() => setActiveTab('home')}
                className={`px-4 py-3 text-xs font-bold flex items-center gap-1.5 border-b-2 cursor-pointer transition-colors ${activeTab === 'home'
                  ? 'text-blue-600 border-blue-600 bg-white dark:bg-slate-900'
                  : 'text-slate-500 border-transparent hover:text-blue-600'
                  }`}
              >
                <Home className="w-4 h-4" /> Home
              </button>
              <button
                onClick={() => setActiveTab('visits')}
                className={`px-4 py-3 text-xs font-bold flex items-center gap-1.5 border-b-2 cursor-pointer transition-colors ${activeTab === 'visits'
                  ? 'text-blue-600 border-blue-600 bg-white dark:bg-slate-900'
                  : 'text-slate-500 border-transparent hover:text-blue-600'
                  }`}
              >
                <CalendarClock className="w-4 h-4" /> Visits
              </button>
              <button
                onClick={() => setActiveTab('lab')}
                className={`px-4 py-3 text-xs font-bold flex items-center gap-1.5 border-b-2 cursor-pointer transition-colors ${activeTab === 'lab'
                  ? 'text-blue-600 border-blue-600 bg-white dark:bg-slate-900'
                  : 'text-slate-500 border-transparent hover:text-blue-600'
                  }`}
              >
                <FlaskConical className="w-4 h-4" /> Lab
              </button>
              <button
                onClick={() => setActiveTab('bills')}
                className={`px-4 py-3 text-xs font-bold flex items-center gap-1.5 border-b-2 cursor-pointer transition-colors ${activeTab === 'bills'
                  ? 'text-blue-600 border-blue-600 bg-white dark:bg-slate-900'
                  : 'text-slate-500 border-transparent hover:text-blue-600'
                  }`}
              >
                <FileText className="w-4 h-4" /> OP/IP Bill
              </button>

              <button
                onClick={() => setActiveTab('book')}
                className="ml-auto my-1.5 mr-3 px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5 rounded text-white cursor-pointer"
                style={{ background: activeTab === 'book' ? '#14213D' : 'var(--blue-btn)' }}
              >
                <CalendarIcon className="w-4 h-4" /> Book Appointment
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-5">
              {activeTab === 'home' && (
                <div className="space-y-6">
                  <UpcomingAppointments appointments={upcomingAppointments} />
                  <PastVisits appointments={pastAppointments} onViewReceipt={onViewReceipt} />
                </div>
              )}

              {activeTab === 'visits' && (
                <VisitsTab appointments={patientAppointments} onViewReceipt={onViewReceipt} currentPatient={currentPatient} />
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
