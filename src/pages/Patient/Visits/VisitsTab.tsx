import React from 'react'
import { Badge } from '@/components/ui/badge'
import { VisitsTable } from './VisitsTable'
import { type Appointment } from '@/types/patient.types'

interface VisitsTabProps {
  appointments: Appointment[]
  onViewReceipt: (appt: Appointment) => void
}

export const VisitsTab: React.FC<VisitsTabProps> = ({ appointments, onViewReceipt }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Visits History</h3>
        <Badge variant="secondary" className="text-xs">
          {appointments.length} Total Visits
        </Badge>
      </div>

      <VisitsTable appointments={appointments} onViewReceipt={onViewReceipt} />
    </div>
  )
}
