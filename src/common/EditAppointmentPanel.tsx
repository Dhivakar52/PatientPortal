import React, { useState, useEffect, useMemo } from 'react'
import { Lock, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FieldLabel, DateField, SelectField, TextField } from '@/components/FormPrimitives'
import CustomPanel from '@/common/CustomPanel'
import { useTimeSlotHoursQuery, useTimeSlotsQuery } from '@/hooks/queries/useMasterDataQueries'
import { updateAppointment, type UpdateAppointmentRequest } from '@/services/apiService'
import { type Appointment, type Patient } from '@/types/patient.types'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'
import { useQueryClient } from '@tanstack/react-query'
import { appointmentsQueryKeys } from '@/hooks/queries/useAppointmentsQuery'
import { isAppointmentDayEnabled } from '@/pages/Patient/Appointment/AppointmentBooking'

interface EditAppointmentPanelProps {
  isOpen: boolean
  appointment: Appointment | null
  currentPatient?: Patient | null
  onClose: () => void
  onSuccess?: () => void
}

// Helper to parse date string into a Date object
const parseDateToDateObject = (dateStr?: string): Date | undefined => {
  if (!dateStr) return undefined
  // YYYY-MM-DD
  const isoMatch = dateStr.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/)
  if (isoMatch) {
    const d = new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]))
    if (!isNaN(d.getTime())) return d
  }
  // DD-MM-YYYY
  const ddMmMatch = dateStr.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/)
  if (ddMmMatch) {
    const d = new Date(Number(ddMmMatch[3]), Number(ddMmMatch[2]) - 1, Number(ddMmMatch[1]))
    if (!isNaN(d.getTime())) return d
  }
  const parsed = new Date(dateStr)
  return isNaN(parsed.getTime()) ? undefined : parsed
}

export const EditAppointmentPanel: React.FC<EditAppointmentPanelProps> = ({
  isOpen,
  appointment,
  currentPatient,
  onClose,
  onSuccess,
}) => {
  const queryClient = useQueryClient()
  const authUserId = useAuthStore((s) => s.userId)

  // Date constraints: Only allow tomorrow onwards up to 90 days
  const tomorrow = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const maxDate = useMemo(() => {
    const d = new Date(tomorrow)
    d.setDate(d.getDate() + 90)
    d.setHours(23, 59, 59, 999)
    return d
  }, [tomorrow])

  // Form State
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedDateStr, setSelectedDateStr] = useState<string>('')
  const [selectedTimeSlotHoursId, setSelectedTimeSlotHoursId] = useState<string>('')
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState<string>('')
  const [selectedSlotText, setSelectedSlotText] = useState<string>('')
  const [isUpdating, setIsUpdating] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string>('')

  // API Data: Time Slot Hours
  const { data: timeSlotHoursList = [], isLoading: isLoadingHours } = useTimeSlotHoursQuery()

  // Options for Time Slot Hours Dropdown
  const hourRangeOptions = useMemo(() => {
    return timeSlotHoursList.map((item) => {
      const id = String(item.TimeSlotHoursID || item.timeSlotHoursID || item.id || '')
      const label = String(item.TimeSlotHours || item.timeSlotHours || item.SlotHours || item.slotHours || item.name || id)
      return {
        value: id,
        label,
      }
    })
  }, [timeSlotHoursList])

  // Find the selected hour item label
  const selectedHourItem = useMemo(() => {
    return timeSlotHoursList.find(
      (h) => String(h.TimeSlotHoursID || h.timeSlotHoursID || h.id) === String(selectedTimeSlotHoursId)
    )
  }, [timeSlotHoursList, selectedTimeSlotHoursId])

  const selectedHourRangeLabel = selectedHourItem
    ? String(selectedHourItem.TimeSlotHours || selectedHourItem.timeSlotHours || selectedHourItem.SlotHours || selectedHourItem.slotHours || selectedHourItem.name || '')
    : ''

  // API Data: Available Time Slots for selected hour range
  const numericHoursId = selectedTimeSlotHoursId ? Number(selectedTimeSlotHoursId) : undefined
  const {
    data: timeSlotsList = [],
    isLoading: isLoadingTimeSlots,
  } = useTimeSlotsQuery(
    numericHoursId ? { timeSlotHoursID: numericHoursId } : undefined,
    { enabled: !!numericHoursId && !!selectedDateStr }
  )

  // Initialize and pre-fill existing appointment values
  useEffect(() => {
    if (isOpen && appointment) {
      const rawDate = appointment.AppointmentDate || appointment.date || ''
      const parsed = parseDateToDateObject(rawDate)

      if (parsed && parsed >= tomorrow && parsed <= maxDate && isAppointmentDayEnabled(parsed)) {
        setSelectedDate(parsed)
        const year = parsed.getFullYear()
        const month = String(parsed.getMonth() + 1).padStart(2, '0')
        const day = String(parsed.getDate()).padStart(2, '0')
        setSelectedDateStr(`${year}-${month}-${day}`)
      } else {
        setSelectedDate(undefined)
        setSelectedDateStr('')
      }

      // Pre-fill existing slot ID / text
      const existingSlotId = String(
        appointment.TimeSlotID ??
        (appointment as any).timeSlotID ??
        (appointment as any).TimeSlotId ??
        (appointment as any).timeslotId ??
        ''
      )
      const existingSlotText = appointment.slot || appointment.TimeSlot || appointment.Timeslot || ''
      setSelectedTimeSlotId(existingSlotId)
      setSelectedSlotText(existingSlotText)
      setErrorMsg('')
    }
  }, [isOpen, appointment, tomorrow, maxDate])

  // Try auto-selecting the matching hour range from master list if not already selected
  useEffect(() => {
    if (hourRangeOptions.length > 0 && !selectedTimeSlotHoursId) {
      // Default to first hour range if none selected
      setSelectedTimeSlotHoursId(String(hourRangeOptions[0].value))
    }
  }, [hourRangeOptions, selectedTimeSlotHoursId])

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      if (!isAppointmentDayEnabled(date)) {
        setErrorMsg('Appointments are not available on this day')
        return
      }
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      setSelectedDate(date)
      setSelectedDateStr(`${year}-${month}-${day}`)
      setErrorMsg('')
    } else {
      setSelectedDate(undefined)
      setSelectedDateStr('')
      setErrorMsg('Please select an appointment date')
    }
  }

  const handleHourRangeChange = (hoursId: string) => {
    setSelectedTimeSlotHoursId(hoursId)
    setSelectedTimeSlotId('')
    setSelectedSlotText('')
    setErrorMsg('')
  }

  const handleSlotSelect = (slotId: string, slotText: string) => {
    setSelectedTimeSlotId(slotId)
    setSelectedSlotText(slotText)
    setErrorMsg('')
  }

  const handleUpdate = async () => {
    if (!appointment) return

    if (!selectedDateStr) {
      setErrorMsg('Please select an appointment date.')
      return
    }

    if (!selectedTimeSlotId) {
      setErrorMsg('Please select an available time slot.')
      return
    }

    const appointmentId = Number(
      appointment.AppointmentID ??
      (appointment as any).appointmentId ??
      (appointment as any).id ??
      (typeof appointment.apptNo === 'string' && appointment.apptNo.startsWith('APT-')
        ? Number(appointment.apptNo.replace(/\D/g, '')) || 0
        : Number(appointment.apptNo) || 0)
    )

    if (!appointmentId) {
      setErrorMsg('Invalid Appointment ID.')
      return
    }

    const patientId = Number(
      appointment.PatientID ??
      (appointment as any).patientId ??
      currentPatient?.PatientID ??
      (currentPatient?.id ? Number(String(currentPatient.id).replace(/\D/g, '')) || 0 : 1)
    )

    const deptId = Number(
      appointment.DeptID ??
      (appointment as any).deptID ??
      (appointment as any).DepartmentID ??
      1
    )

    const doctorId = Number(
      appointment.DoctorID ??
      (appointment as any).doctorID ??
      0
    )

    const unitId = Number(
      appointment.UnitID ??
      (appointment as any).unitID ??
      1
    )

    const typeId = Number(
      (appointment as any).TypeID ??
      (appointment as any).typeID ??
      4
    )

    const statusId = Number(
      appointment.StatusID ??
      (appointment as any).statusID ??
      1
    )

    const createdBy = Number(
      (appointment as any).CreatedBy ??
      (appointment as any).createdBy ??
      1
    )

    const updatedBy = Number(
      authUserId ??
      (appointment as any).UpdatedBy ??
      (appointment as any).updatedBy ??
      patientId
    )

    const cancelledReason = String(
      (appointment as any).CancelledReason ??
      (appointment as any).cancelledReason ??
      ''
    )

    const payload: UpdateAppointmentRequest = {
      patientID: patientId,
      appointmentDate: selectedDateStr,
      deptID: deptId,
      doctorID: doctorId,
      timeSlotID: Number(selectedTimeSlotId),
      unitID: unitId,
      typeID: typeId || 4,
      statusID: statusId,
      createdBy,
      updatedBy,
      cancelledReason,
    }

    setIsUpdating(true)
    setErrorMsg('')

    try {
      console.log(`📝 Updating Appointment ID ${appointmentId} with payload:`, payload)
      await updateAppointment(appointmentId, payload)
      toast.success('Appointment updated successfully.')

      // Invalidate queries to trigger instant re-fetch of fresh deduplicated API appointments
      queryClient.invalidateQueries({ queryKey: appointmentsQueryKeys.user(authUserId) })
      if (patientId) {
        queryClient.invalidateQueries({ queryKey: ['appointments', authUserId, patientId] })
      }

      onSuccess?.()
      onClose()
    } catch (err: unknown) {
      console.error('Update appointment error:', err)
      const error = err as { response?: { data?: { message?: string } | string }; message?: string }
      const resData = error.response?.data
      let message = 'Failed to update appointment. Please try again.'
      if (typeof resData === 'string' && resData.trim()) {
        message = resData
      } else if (resData && typeof resData === 'object' && resData.message) {
        message = resData.message
      } else if (error.message) {
        message = error.message
      }
      setErrorMsg(message)
    } finally {
      setIsUpdating(false)
    }
  }

  if (!isOpen || !appointment) return null

  const patientName = currentPatient?.name || currentPatient?.PatientName || appointment.PatientName || 'Patient'
  const deptName = appointment.department || appointment.DeptName || appointment.Department || 'Department'
  const doctorName = appointment.doctor && appointment.doctor !== '--Select--' ? appointment.doctor : (appointment.DoctorName || 'Specialist Consultation')
  const appointmentType = (appointment as any).BookingMode || (appointment as any).BookingModeName || appointment.AppointmentType || 'Online'

  return (
    <CustomPanel
      isOpen={isOpen}
      title="Reschedule Appointment"
      onClose={onClose}
      width="560px"
      customFooter={
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <Button
            type="button"
            variant="outline"
            data-cy="edit-appointment-cancel-btn"
            onClick={onClose}
            disabled={isUpdating}
            className="text-xs font-medium px-4 py-2 cursor-pointer border-slate-300 dark:border-slate-700"
            style={{ borderRadius: '4px' }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            data-cy="edit-appointment-submit-btn"
            onClick={handleUpdate}
            disabled={!selectedDateStr || !selectedTimeSlotId || isUpdating || isLoadingTimeSlots}
            className="text-white font-semibold text-xs px-5 py-2 cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'var(--blue-btn)', borderRadius: '4px' }}
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                Updating...
              </>
            ) : (
              'Update Appointment'
            )}
          </Button>
        </div>
      }
    >
      <div data-cy="edit-appointment-panel" className="space-y-5">
        {/* Error Alert */}
        {errorMsg && (
          <div data-cy="edit-appointment-error" className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs font-medium animate-in fade-in-50">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. Patient Name (Read-only) */}
        <div>
          <FieldLabel>Patient</FieldLabel>
          <div className="relative">
            <TextField value={patientName} disabled={true} />
            <span className="absolute right-3 top-2.5 text-slate-400 dark:text-slate-500" title="Read only">
              <Lock className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* 2. Department (Read-only) */}
        <div>
          <FieldLabel>Department</FieldLabel>
          <div className="relative">
            <TextField value={deptName} disabled={true} />
            <span className="absolute right-3 top-2.5 text-slate-400 dark:text-slate-500" title="Read only">
              <Lock className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* 3. Doctor (Read-only) */}
        <div className='hidden'>
          <FieldLabel>Doctor</FieldLabel>
          <div className="relative">
            <TextField value={doctorName} disabled={true} />
            <span className="absolute right-3 top-2.5 text-slate-400 dark:text-slate-500" title="Read only">
              <Lock className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* 4. Appointment Date (Editable) */}
        <div>
          <FieldLabel required>Appointment Date</FieldLabel>
          <DateField
            value={selectedDate}
            onChange={handleDateChange}
            placeholder="Select appointment date"
            defaultLabel="Select appointment date"
            dataCy="edit-appointment-date"
            fromMonth={tomorrow}
            toMonth={maxDate}
            disabled={(date) => {
              if (date < tomorrow || date > maxDate) return true
              return !isAppointmentDayEnabled(date)
            }}
          />
        </div>

        {/* 5. Time Slot Hours (Editable) */}
        <div>
          <FieldLabel required>Time Slot</FieldLabel>
          <div className="relative mb-3">
            <SelectField
              options={hourRangeOptions}
              placeholder="Select Time Slot Hours"
              value={selectedTimeSlotHoursId}
              onChange={handleHourRangeChange}
              disabled={isLoadingHours}
              dataCy="edit-appointment-slot-hours"
            />
            {isLoadingHours && (
              <span className="absolute right-8 top-2.5 text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" />
              </span>
            )}
          </div>

          {/* Time Slot Selection Grid */}
          {selectedTimeSlotHoursId && (
            <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Available Slots
                </span>
                {selectedHourRangeLabel && (
                  <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                    {selectedHourRangeLabel}
                  </span>
                )}
              </div>

              {isLoadingTimeSlots ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Array(3).fill(null).map((_, i) => (
                    <div key={i} className="h-9 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse" />
                  ))}
                </div>
              ) : timeSlotsList.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {timeSlotsList.map((slot) => {
                    const slotId = String(slot.TimeSlotID || slot.timeSlotID || '')
                    const slotLabel = String(slot.Timeslot || slot.TimeSlot || slot.Slot || slot.slot || '')
                    const isSelected = selectedTimeSlotId === slotId || selectedSlotText === slotLabel

                    return (
                      <button
                        key={slotId}
                        type="button"
                        data-cy="edit-slot-pill"
                        onClick={() => handleSlotSelect(slotId, slotLabel)}
                        className={`
                          px-2.5 py-2 text-center text-xs font-semibold rounded-md border 
                          transition-all duration-200 cursor-pointer
                          ${isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700'
                          }
                        `}
                      >
                        {slotLabel}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="text-xs text-slate-500 py-3 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded">
                  No slots available for this hour range.
                </div>
              )}
            </div>
          )}
        </div>

        {/* 6. Appointment Type (Read-only) */}
        <div className='hidden'>
          <FieldLabel>Appointment Type</FieldLabel>
          <div className="relative">
            <TextField value={appointmentType} disabled={true} />
            <span className="absolute right-3 top-2.5 text-slate-400 dark:text-slate-500" title="Read only">
              <Lock className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </CustomPanel>
  )
}

export default EditAppointmentPanel
