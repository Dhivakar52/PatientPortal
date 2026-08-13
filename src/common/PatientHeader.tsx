import React from 'react'
import { ChevronRight } from 'lucide-react'
import srmLogo from '@/assets/images/srm_logo.png'
import { type Patient } from '@/types/patient.types'
import { initials, capitalizeName } from '@/utils/patient.utils'

interface PatientHeaderProps {
  currentPatient?: Patient | null
  onSelectPatientClick?: () => void
}

export const PatientHeader: React.FC<PatientHeaderProps> = ({
  currentPatient,
  onSelectPatientClick,
}) => {
  const salutation = currentPatient?.gender === 'Female' ? 'Ms.' : 'Mr.'
  const displayName = currentPatient
    ? `${salutation} ${capitalizeName((currentPatient.name || '').trim().split(/\s+/)[0] || currentPatient.name)}`
    : '—'

  return (
    <header className="text-white px-5 py-3 flex items-center justify-between shadow-md" style={{ background: "var( --blue-text-color)" }}>
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-white rounded p-1 w-12 h-12 flex items-center justify-center overflow-hidden shrink-0">
            <img src={srmLogo} alt="SRM Logo" className="w-10 h-auto object-contain" />
          </div>
          <div>
            <div className="font-bold md:text-sm sm:text-[10px] leading-snug">
              SRM Medical College Hospital and Research Centre
            </div>
            <div className="text-xs text-blue-200">Doctor Appointment</div>
          </div>
        </div>

        {currentPatient && (
          <div className="hidden md:block pl-4 border-l border-white/20 text-xs font-semibold text-blue-100 truncate">
            Welcome, <b className="text-white font-bold">{capitalizeName(currentPatient.name || '')}</b>
          </div>
        )}
      </div>

      {currentPatient && onSelectPatientClick && (
        <div className="flex items-center gap-3">
          <button
            onClick={onSelectPatientClick}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full bg-blue-200 text-[#14213D] flex items-center justify-center font-bold text-xs">
              {initials(currentPatient.name || '')}
            </div>
            <span className="hidden sm:inline">{displayName}</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-80" />
          </button>
        </div>
      )}
    </header>
  )
}
