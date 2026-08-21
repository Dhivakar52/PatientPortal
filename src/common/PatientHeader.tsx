import React from 'react'
import { ChevronDown, UserPlus, CheckCircle2, LayoutGrid, Sun, Moon, LogOut } from 'lucide-react'
import srmLogo from '@/assets/images/srm_logo.png'
import { type Patient } from '@/types/patient.types'
import { initials, capitalizeName, calcAge } from '@/utils/patient.utils'
import { useTheme } from '@/context/ThemeContext'
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
  onLogout?: () => void
}

export const PatientHeader: React.FC<PatientHeaderProps> = ({
  currentPatient,
  patients = [],
  onSelectPatient,
  onSelectPatientClick,
  onAddPatient,
  onLogout,
}) => {
  const { theme, toggleTheme } = useTheme()
  const rawName = currentPatient?.PatientName || currentPatient?.name || ''
  const gender = currentPatient?.Gender || currentPatient?.gender || ''
  const salutation = gender.toLowerCase() === 'female' ? 'Ms.' : 'Mr.'
  const displayName = rawName
    ? `${salutation} ${capitalizeName(rawName.trim().split(/\s+/)[0] || rawName)}`
    : '—'

  // Determine list of patients for dropdown menu
  // If patients list is passed and has items, use it; otherwise fallback to [currentPatient] if present
  const patientList = patients.length > 0 ? patients : (currentPatient ? [currentPatient] : [])
  const showMoreCardView = patientList.length > 5
  const displayedPatients = showMoreCardView ? patientList.slice(0, 5) : patientList

  return (
    <header className="text-white px-5 py-3 flex items-center justify-between shadow-md relative z-40 sticky top-0" style={{ background: "var(--blue-text-color)" }}>
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-white rounded p-1 w-12 h-12 flex items-center justify-center overflow-hidden shrink-0">
            <img src={srmLogo} alt="SRM Logo" className="w-10 h-auto object-contain" />
          </div>
          <div>
            <div className="font-bold md:text-sm sm:text-[10px] leading-snug  ">
              Patient Portal
            </div>
            <div className="text-xs text-blue-200 ">Doctor Appointment</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors cursor-pointer outline-none"
          aria-label="Toggle theme"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === "light" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4 text-amber-300" />
          )}
        </button>

        {currentPatient && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5  text-xs font-semibold cursor-pointer text-white transition-colors outline-none"
                  style={{ borderRadius: '4px' }}
                >
                  <div className="w-6 h-6 rounded-full bg-blue-200 text-[#14213D] flex items-center justify-center font-bold text-xs">
                    {initials(rawName)}
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
                    {patientList.length}
                  </span>
                </DropdownMenuLabel>
              </DropdownMenuGroup>

              <DropdownMenuSeparator className="my-1.5" />

              {/* Patient List (up to 5 inline) */}
              <DropdownMenuGroup className="space-y-0.5">
                {displayedPatients.map((p, idx) => {
                  const pId = String(p.PatientID || p.id || idx)
                  const currentId = String(currentPatient.PatientID || currentPatient.id)
                  const isActive = pId === currentId
                  const pRawName = p.PatientName || p.name || `Patient #${pId}`
                  const pGender = p.Gender || p.gender || ''
                  const pSalutation = pGender.toLowerCase() === 'female' ? 'Ms.' : 'Mr.'
                  const pName = `${pSalutation} ${capitalizeName(pRawName)}`
                  const age = p.Age !== undefined ? p.Age : (p.dob || p.DOB ? calcAge(p.dob || p.DOB) : '')

                  return (
                    <DropdownMenuItem
                      key={pId}
                      onClick={() => onSelectPatient?.(pId)}
                      className={`flex items-center gap-2.5 px-2.5 py-2 cursor-pointer rounded-lg text-xs transition-colors ${isActive
                        ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-200 font-semibold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                        }`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                        }`}>
                        {initials(pRawName)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100">
                          {pName}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {age !== '' ? `${age} Years` : '—'} • {pGender || '—'}
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

              {/* Logout Action in Dropdown */}
              {onLogout && (
                <>
                  <DropdownMenuSeparator className="my-1.5" />
                  <DropdownMenuItem
                    onClick={onLogout}
                    className="flex items-center gap-2 px-2.5 py-2 cursor-pointer text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                  >
                    <LogOut className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Header Logout Button */}
        {/* {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex h-8 items-center gap-1.5 px-3 rounded-full bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 text-white text-xs font-semibold transition-colors cursor-pointer outline-none ml-1"
            title="Logout"
          >
            <LogOut className="h-3.5 w-3.5 text-rose-100" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        )} */}
      </div>
    </header>
  )
}
