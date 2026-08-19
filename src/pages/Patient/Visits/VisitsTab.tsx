import React from 'react'
import { VisitsTable } from './VisitsTable'
import { type Appointment, type Patient } from '@/types/patient.types'

interface VisitsTabProps {
  appointments: Appointment[]
  onViewReceipt: (appt: Appointment) => void
  onCancelAppointment?: (appt: Appointment) => void
  currentPatient?: Patient | null
}

export const VisitsTab: React.FC<VisitsTabProps> = ({
  appointments,
  onViewReceipt,
  onCancelAppointment,
  currentPatient,
}) => {
  return (
    <VisitsTable
      appointments={appointments}
      onViewReceipt={onViewReceipt}
      onCancelAppointment={onCancelAppointment}
      currentPatient={currentPatient}
    />
  )
}
