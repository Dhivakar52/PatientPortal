import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, CheckCircle2, LayoutGrid, Sun, Moon, LogOut, User, Users, UserPlus } from 'lucide-react'
import srmLogo from '@/assets/images/srm_logo.png'
import { type Patient } from '@/types/patient.types'
import { initials, capitalizeName, calcAge } from '@/utils/patient.utils'
import { useTheme } from '@/context/ThemeContext'
import { useAuthStore } from '@/stores/authStore'
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
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const activePhone = useAuthStore((s) => s.activePhone)
  const knownAccounts = useAuthStore((s) => s.knownAccounts)
  const switchAccount = useAuthStore((s) => s.switchAccount)

  const rawName = currentPatient?.PatientName || currentPatient?.name || ''
  const gender = currentPatient?.Gender || currentPatient?.gender || ''
  const salutation = gender.toLowerCase() === 'female' ? 'Ms.' : 'Mr.'
  const displayName = rawName
    ? `${salutation} ${capitalizeName(rawName.trim().split(/\s+/)[0] || rawName)}`
    : '—'

  // Determine list of patients for dropdown menu
  const patientList = patients.length > 0 ? patients : (currentPatient ? [currentPatient] : [])
  const showMoreThanFive = patientList.length > 5
  const displayedPatients = showMoreThanFive ? patientList.slice(0, 5) : patientList
  const otherAccounts = knownAccounts.filter((a) => a.phoneNo && a.phoneNo !== activePhone)

  return (
    <header className="text-white px-4 sm:px-5 py-3 flex items-center justify-between shadow-md sticky top-0 z-50 overflow-visible" style={{ background: "var(--blue-text-color)" }}>
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="bg-white rounded p-1 w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center overflow-hidden shrink-0">
          <img src={srmLogo} alt="SRM Logo" className="w-9 sm:w-10 h-auto object-contain" />
        </div>
        <div className="min-w-0">
          <div className="font-bold text-xs sm:text-sm md:text-base leading-snug text-white">
            SRM Medical College Hospital and Research Centre
          </div>
          <div className="text-[11px] sm:text-xs text-blue-200">Doctor Appointment</div>
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
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 text-xs font-semibold cursor-pointer text-white transition-colors outline-none rounded-[4px]"
            >
              <div className="w-6 h-6 rounded-full bg-blue-200 text-[#14213D] flex items-center justify-center font-bold text-xs">
                {initials(rawName)}
              </div>
              <span className="hidden sm:inline">{displayName}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-80" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-72 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl max-h-[400px] overflow-y-auto">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs text-slate-500 dark:text-slate-400 font-semibold px-2 py-1 flex items-center justify-between">
                  <span>Select Patient Profile</span>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full font-bold">
                    {patientList.length}
                  </span>
                </DropdownMenuLabel>
              </DropdownMenuGroup>

              <DropdownMenuSeparator className="my-1.5" />

              {/* Patient List (up to 5 profiles) */}
              <DropdownMenuGroup className="space-y-0.5">
                {displayedPatients.map((p, idx) => {
                  const pId = String(p.PatientID || p.id || idx)
                  const currentId = String(currentPatient.PatientID || currentPatient.id)
                  const isActive = pId === currentId
                  const pRawName = p.PatientName || p.name || `Patient #${pId}`
                  const pGender = p.Gender || p.gender || ''
                  const pSalutation = pGender.toLowerCase() === 'female' ? 'Ms.' : 'Mr.'
                  const pName = `${pSalutation} ${capitalizeName(pRawName)}`
                  const age = p.Age !== undefined ? p.Age : (p.dob || p.DOB ? calcAge(p.dob || p.DOB || '') : '')

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
                          {p.PhoneNo || p.mobile || '—'} • {age !== '' ? `${age} Years` : '—'} • {pGender || '—'}
                        </div>
                      </div>

                      {isActive && (
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      )}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuGroup>

              {/* Profile Action for Mobile View (Hidden on Desktop) */}
              <DropdownMenuSeparator className="my-1.5 lg:hidden" />
              <DropdownMenuItem
                onClick={() => navigate('/profile')}
                className="flex lg:hidden items-center gap-2 px-2.5 py-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg"
              >
                <User className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Profile</span>
              </DropdownMenuItem>

              {/* If <= 5 patients, show + Add Patient action */}
              {patientList.length <= 5 && onAddPatient && (
                <>
                  <DropdownMenuSeparator className="my-1.5" />
                  <DropdownMenuItem
                    onClick={onAddPatient}
                    className="flex items-center gap-2 px-2.5 py-2 cursor-pointer text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg"
                  >
                    <UserPlus className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>+ Add Patient</span>
                  </DropdownMenuItem>
                </>
              )}

              {/* If > 5 patients, show View All Profiles action */}
              {patientList.length > 5 && onSelectPatientClick && (
                <>
                  <DropdownMenuSeparator className="my-1.5" />
                  <DropdownMenuItem
                    onClick={onSelectPatientClick}
                    className="flex items-center gap-2 px-2.5 py-2 cursor-pointer text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg"
                  >
                    <LayoutGrid className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>View All Profiles ({patientList.length})</span>
                  </DropdownMenuItem>
                </>
              )}

              {/* Switch Account Section (Multi-user accounts without logout) */}
              {otherAccounts.length > 0 && (
                <>
                  <DropdownMenuSeparator className="my-1.5" />
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold px-2 py-0.5 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      <span>Switch Account</span>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuGroup className="space-y-0.5">
                    {otherAccounts.map((acc) => (
                      <DropdownMenuItem
                        key={acc.phoneNo}
                        onClick={() => {
                          switchAccount(acc)
                          if (acc.activePatientId) {
                            onSelectPatient?.(String(acc.activePatientId))
                          }
                        }}
                        className="flex items-center justify-between px-2.5 py-1.5 cursor-pointer rounded-lg text-xs hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-[10px]">
                            {initials(acc.name || acc.phoneNo)}
                          </div>
                          <div className="truncate">
                            <div className="font-semibold truncate">{acc.name || `+91 ${acc.phoneNo}`}</div>
                            <div className="text-[10px] text-slate-400">{acc.phoneNo}</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">Switch</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
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
      </div>
    </header>
  )
}