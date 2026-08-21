import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PatientHeader } from '@/common/PatientHeader'
import { PatientProfileCard } from './PatientProfileCard'
import { type Patient } from '@/types/patient.types'

interface MobileProfilePageProps {
  currentPatient: Patient | null
  isLoadingPatient?: boolean
  patientError?: string | null
  patients?: Patient[]
  onSelectPatient?: (patientId: string) => void
  onSelectPatientClick?: () => void
  onAddPatient?: () => void
  onLogout?: () => void
}

export const MobileProfilePage: React.FC<MobileProfilePageProps> = ({
  currentPatient,
  isLoadingPatient = false,
  patientError = null,
  patients = [],
  onSelectPatient,
  onSelectPatientClick,
  onAddPatient,
  onLogout,
}) => {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate('/patient/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9] dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans">
      {/* Top Header */}
      <PatientHeader
        currentPatient={currentPatient}
        patients={patients}
        onSelectPatient={onSelectPatient}
        onSelectPatientClick={onSelectPatientClick}
        onAddPatient={onAddPatient}
        onLogout={onLogout}
      />

      {/* Main Container */}
      <div className="px-4 py-5 max-w-lg mx-auto">
        {/* Back Button Bar */}
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={handleBack}
            className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Back</span>
          </button>

          <h1 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Patient Profile
          </h1>
        </div>

        {/* Profile Card Only */}
        <PatientProfileCard
          currentPatient={currentPatient}
          isLoadingPatient={isLoadingPatient}
          patientError={patientError}
          className="w-full"
        />
      </div>
    </div>
  )
}

export default MobileProfilePage
