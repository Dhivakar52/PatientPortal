import React from 'react'
import { ChevronDown, UserPlus, CheckCircle2, LayoutGrid } from 'lucide-react'
import srmLogo from '@/assets/images/srm_logo.png'
import { type Patient } from '@/types/patient.types'
import { initials, capitalizeName, calcAge } from '@/utils/patient.utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface PatientHeaderProps {
  currentPatient?: Patient | null
  patients?: Patient[]
  onSelectPatient?: (patientId: string) => void
  onSelectPatientClick?: () => void
  onAddPatient?: () => void
}

export const PatientHeader: React.FC<PatientHeaderProps> = ({
  currentPatient,
  patients = [],
  onSelectPatient,
  onSelectPatientClick,
  onAddPatient,
}) => {
  const salutation = currentPatient?.gender === 'Female' ? 'Ms.' : 'Mr.'
  const displayName = currentPatient
    ? `${salutation} ${capitalizeName((currentPatient.name || '').trim().split(/\s+/)[0] || currentPatient.name)}`
    : '—'

  // Determine list of patients for dropdown menu
  // If patients list is passed and has items, use it; otherwise fallback to [currentPatient] if present
  const patientList = patients.length > 0 ? patients : (currentPatient ? [currentPatient] : [])
  const showMoreCardView = patientList.length > 5
  const displayedPatients = showMoreCardView ? patientList.slice(0, 5) : patientList

  return (
    <header className="text-white px-5 py-3 flex items-center justify-between shadow-md relative z-40" style={{ background: "var(--blue-text-color)" }}>
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

        {/* {currentPatient && (
          <div className="hidden md:block pl-4 border-l border-white/20 text-xs font-semibold text-blue-100 truncate">
            Welcome, <b className="text-white font-bold">{capitalizeName(currentPatient.name || '')}</b>
          </div>
        )} */}
      </div>

      {currentPatient && (
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer text-white transition-colors outline-none"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-200 text-[#14213D] flex items-center justify-center font-bold text-xs">
                    {initials(currentPatient.name || '')}
                  </div>
                  <span className="hidden sm:inline">{displayName}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                </button>
              }
            />

            <DropdownMenuContent align="end" className="w-72 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs text-slate-500 dark:text-slate-400 font-semibold px-2 py-1 flex items-center justify-between">
                  <span>Select Patient Profile</span>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full font-bold">
                    {patientList.length} {patientList.length === 1 ? '' : ''}
                  </span>
                </DropdownMenuLabel>
              </DropdownMenuGroup>

              <DropdownMenuSeparator className="my-1.5" />

              {/* Patient List (up to 5 inline) */}
              <DropdownMenuGroup className="space-y-0.5">
                {displayedPatients.map((p) => {
                  const isActive = p.id === currentPatient.id
                  const pSalutation = p.gender === 'Female' ? 'Ms.' : 'Mr.'
                  const pName = `${pSalutation} ${capitalizeName(p.name)}`
                  const age = calcAge(p.dob)

                  return (
                    <DropdownMenuItem
                      key={p.id}
                      onClick={() => onSelectPatient?.(p.id)}
                      className={`flex items-center gap-2.5 px-2.5 py-2 cursor-pointer rounded-lg text-xs transition-colors ${isActive
                        ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-200 font-semibold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                        }`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                        }`}>
                        {initials(p.name)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100">
                          {pName}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {age !== '' ? `${age}Y` : '—'} • {p.gender || '—'}
                        </div>
                      </div>

                      {isActive && (
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      )}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuGroup>

              {/* If > 5 patients, show option to open existing Patient Selection CARD view */}
              {showMoreCardView && (
                <>
                  <DropdownMenuSeparator className="my-1.5" />
                  <DropdownMenuItem
                    onClick={onSelectPatientClick}
                    className="flex items-center gap-2 px-2.5 py-2 cursor-pointer text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg"
                  >
                    <LayoutGrid className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>View All Patients ({patientList.length}) — Card View</span>
                  </DropdownMenuItem>
                </>
              )}

              {/* Add New Patient Action */}
              {onAddPatient && (
                <>
                  <DropdownMenuSeparator className="my-1.5" />
                  <DropdownMenuItem
                    onClick={onAddPatient}
                    className="flex items-center gap-2 px-2.5 py-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                  >
                    <UserPlus className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>+ Add New Patient</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </header>
  )
}
