import React from 'react'
import CustomPanel from '@/common/CustomPanel'
import Status from '@/common/Status'
import { type Appointment, type Patient } from '@/types/patient.types'
import { HOSPITAL_NAME } from '@/constants/patient.constants'
import { todayStr } from '@/utils/patient.utils'

interface AppointmentDetailsPanelProps {
  isOpen: boolean
  appointment: Appointment | null
  currentPatient?: Patient | null
  onClose: () => void
  onViewReceipt?: (appt: Appointment) => void
}

export const AppointmentDetailsPanel: React.FC<AppointmentDetailsPanelProps> = ({
  isOpen,
  appointment,
  currentPatient,
  onClose,
}) => {
  if (!appointment) return null

  const apptNo = appointment.apptNo || appointment.AppointmentNo || `APT-${appointment.AppointmentID}`
  const rawStatus = appointment.AppointmentStatus || appointment.status || appointment.Status || ''
  const computedStatus = rawStatus ? String(rawStatus).toLowerCase() : (appointment.date < todayStr() ? 'completed' : '')
  const patientName = currentPatient?.name || currentPatient?.PatientName || appointment.PatientName || 'Patient'
  const patientMobile = currentPatient?.mobile || currentPatient?.PhoneNo || (appointment as any).PhoneNo || ''

  return (
    <CustomPanel
      isOpen={isOpen}
      title="Appointment Details"
      onClose={onClose}
      onSave={onClose}
      saveLabel="Close"
      hideCancel={true}
      width="500px"
    >
      <div className="space-y-4">
        {/* Appointment Info Header */}
        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-100 dark:border-blue-900/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Appointment No</span>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
              #{apptNo}
            </span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Status</span>
            <Status status={computedStatus} showLabel />
          </div>
        </div>

        {/* Patient Details if available */}
        {(patientName || patientMobile) && (
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Patient Profile
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500">Name</p>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {patientName}
                </p>
              </div>
              {patientMobile && (
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Mobile</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 font-mono">
                    +91 {patientMobile}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Appointment Details Grid */}
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Visit Breakdown
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500">Date</p>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {appointment.date || appointment.AppointmentDate}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500">Time Slot</p>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {appointment.slot || appointment.TimeSlot || appointment.Timeslot}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500">Doctor</p>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {appointment.doctor || appointment.DoctorName}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500">Department</p>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {appointment.department || appointment.DeptName}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500">Unit / Room</p>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {appointment.unit || appointment.Unit || 'Unit 1'} {appointment.room ? `(${appointment.room})` : ''}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500">Hospital</p>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {HOSPITAL_NAME}
              </p>
            </div>
          </div>
        </div>
      </div>
    </CustomPanel>
  )
}

export default AppointmentDetailsPanel
