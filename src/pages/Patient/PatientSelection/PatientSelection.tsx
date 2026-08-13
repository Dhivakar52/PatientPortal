import React from 'react'
import { Plus, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PatientHeader } from '@/common/PatientHeader'
import { type Patient } from '@/types/patient.types'
import { initials, capitalizeName, calcAge } from '@/utils/patient.utils'

interface PatientSelectionProps {
  patients: Patient[]
  spSelectedId: string | null
  setSpSelectedId: (id: string) => void
  onAddPatient: () => void
  onContinue: () => void
}

export const PatientSelection: React.FC<PatientSelectionProps> = ({
  patients,
  spSelectedId,
  setSpSelectedId,
  onAddPatient,
  onContinue,
}) => {
  return (
    <div className="min-h-screen bg-[#f4f6f9] dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans">
      <PatientHeader />

      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-lg w-full shadow-lg overflow-hidden">
          <div className=" text-white p-6" style={{ background: "var(--blue-text-color)" }}>
            <div className="font-bold text-xl">Select Patient</div>
            <div className="text-xs text-blue-200 mt-1">Choose a profile to continue</div>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800 max-h-[320px] overflow-y-auto">
            {patients.map((p) => {
              const age = calcAge(p.dob)
              const isActive = p.id === spSelectedId
              return (
                <div
                  key={p.id}
                  onClick={() => setSpSelectedId(p.id)}
                  className={`flex items-center gap-3 px-6 py-3.5 cursor-pointer transition-colors ${isActive ? 'bg-blue-50 dark:bg-blue-950/40' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border ${isActive
                      ? 'bg-[#2952CC] text-white border-[#2952CC]'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                      }`}
                  >
                    {initials(p.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                      {capitalizeName(p.name)}
                    </div>
                    <div className="text-xs text-slate-500">
                      {age !== '' ? `${age}Y` : '—'} / {p.gender || '—'}
                    </div>
                  </div>
                  {isActive && <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />}
                </div>
              )
            })}
          </div>

          <button
            onClick={onAddPatient}
            className="w-full text-left px-6 py-3.5 border-t border-b border-slate-200 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors flex items-center gap-3 cursor-pointer"
          >
            <Plus className="w-5 h-5 text-blue-600" />
            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-slate-100">Add Patient</div>
              <div className="text-xs text-slate-500">Register new patient under this mobile</div>
            </div>
          </button>

          <div className="p-6">
            <Button
              disabled={!spSelectedId}
              onClick={onContinue}
              className="w-full text-white font-semibold cursor-pointer"
              style={{ background: 'var(--blue-btn)' }}
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
