import React from 'react'
import { VisitCard } from '../Visits/VisitCard'
import { type Appointment } from '@/types/patient.types'

interface UpcomingAppointmentsProps {
  appointments: Appointment[]
  onView?: (appt: Appointment) => void
  onViewReceipt?: (appt: Appointment) => void
  onCancelAppointment?: (appt: Appointment) => void
}

export const UpcomingAppointments: React.FC<UpcomingAppointmentsProps> = ({
  appointments,
  onView,
  onViewReceipt,
  onCancelAppointment,
}) => {
  return (
    <div>
      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
        Upcoming Appointment
      </h3>
      {appointments.length > 0 ? (
        <div className="space-y-3">
          {appointments.map((appt) => (
            <VisitCard
              key={appt.apptNo}
              appointment={appt}
              onView={onView}
              onDownloadReceipt={onViewReceipt}
              onCancelAppointment={onCancelAppointment}
              showDownload={false}
              showCancel={true}
            />
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-slate-300 dark:border-slate-800 rounded p-6 text-center text-xs text-slate-500 bg-slate-50/50 dark:bg-slate-900/50">
          No Upcoming Appointment Found!
        </div>
      )}
    </div>
  )
}
