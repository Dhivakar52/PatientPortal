import React from 'react'
import { Download } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { type Appointment } from '@/types/patient.types'
import { HOSPITAL_NAME } from '@/constants/patient.constants'
import { formatDateBadge } from '@/utils/patient.utils'

interface PastVisitsProps {
  appointments: Appointment[]
  onViewReceipt: (appt: Appointment) => void
}

export const PastVisits: React.FC<PastVisitsProps> = ({ appointments, onViewReceipt }) => {
  return (
    <div>
      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">Past Visits</h3>
      {appointments.length > 0 ? (
        appointments.map((appt) => {
          const b = formatDateBadge(appt.date)
          return (
            <div
              key={appt.apptNo}
              className="border border-slate-200 dark:border-slate-800 rounded p-3.5 flex flex-col sm:flex-row items-start sm:items-center gap-3.5 bg-white dark:bg-slate-900 mb-2.5 shadow-sm"
            >
              <div className="w-16 text-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded py-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 shrink-0">
                {b.d}
                <br />
                {b.m}
                <br />
                {b.y}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-slate-900 dark:text-slate-100">{appt.doctor}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {appt.department} &middot; {HOSPITAL_NAME}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Slot: {appt.slot}</div>
                <div className="text-[11px] font-mono font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {appt.apptNo}
                </div>
                <button
                  onClick={() => onViewReceipt(appt)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mt-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" /> Download Visit Summary
                </button>
              </div>
              <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 uppercase font-bold text-[10px] tracking-wider px-2.5 py-1">
                Visited
              </Badge>
            </div>
          )
        })
      ) : (
        <div className="border border-dashed border-slate-300 dark:border-slate-800 rounded p-6 text-center text-xs text-slate-500 bg-slate-50/50 dark:bg-slate-900/50">
          No past visits yet.
        </div>
      )}
    </div>
  )
}
