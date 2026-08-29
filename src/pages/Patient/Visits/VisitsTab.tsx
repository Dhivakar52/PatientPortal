import React from 'react'
import { VisitsTable } from './VisitsTable'
import { type Appointment, type Patient } from '@/types/patient.types'

interface VisitsTabProps {
  appointments: Appointment[]
  onViewReceipt: (appt: Appointment) => void
  onCancelAppointment?: (appt: Appointment) => void
  onEditAppointment?: (appt: Appointment) => void
  currentPatient?: Patient | null
  isLoading?: boolean
}

export const VisitsTab: React.FC<VisitsTabProps> = ({
  appointments,
  onViewReceipt,
  onCancelAppointment,
  onEditAppointment,
  currentPatient,
  isLoading = false,
}) => {
  return (
    <VisitsTable
      appointments={appointments}
      onViewReceipt={onViewReceipt}
      onCancelAppointment={onCancelAppointment}
      onEditAppointment={onEditAppointment}
      currentPatient={currentPatient}
      isLoading={isLoading}
    />
  )
}
