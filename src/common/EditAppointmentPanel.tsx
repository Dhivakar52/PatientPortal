import React, { useState, useEffect, useMemo } from 'react'
import { Lock, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FieldLabel, DateField, SelectField, TextField } from '@/components/FormPrimitives'
import CustomPanel from '@/common/CustomPanel'
import {
  useTimeSlotHoursQuery,
  useTimeSlotsQuery,
  useAppointmentDaysQuery,
} from '@/hooks/queries/useMasterDataQueries'
import { updateAppointment, type UpdateAppointmentRequest } from '@/services/apiService'
import { type Appointment, type Patient } from '@/types/patient.types'
import { toast } from '@/components/ui/toast'
import { useAuthStore } from '@/stores/authStore'
import { useQueryClient } from '@tanstack/react-query'
import { useAppointmentsQuery, appointmentsQueryKeys } from '@/hooks/queries/useAppointmentsQuery'
import { formatToDDMMYYYY } from '@/pages/Patient/Appointment/AppointmentBooking'

interface EditAppointmentPanelProps {
  isOpen: boolean
  appointment: Appointment | null
  currentPatient?: Patient | null
  existingAppointments?: Appointment[]
  onClose: () => void
  onSuccess?: () => void
}

// Day name to JS getDay() index mapping (Sunday=0, Monday=1, ..., Saturday=6)
const DAY_NAME_TO_INDEX: Record<string, number> = {
  sunday: 0,
  sun: 0,
  monday: 1,
  mon: 1,
  tuesday: 2,
  tue: 2,
  wednesday: 3,
  wed: 3,
  thursday: 4,
  thu: 4,
  friday: 5,
  fri: 5,
  saturday: 6,
  sat: 6,
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
  // DD-MMM-YYYY (e.g. 18-Sep-2026)
  const ddMmmMatch = dateStr.match(/^(\d{1,2})[-/]([A-Za-z]{3})[-/](\d{4})/)
  if (ddMmmMatch) {
    const day = parseInt(ddMmmMatch[1], 10)
    const monthStr = ddMmmMatch[2].toUpperCase()
    const year = parseInt(ddMmmMatch[3], 10)
    const monthIndex = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].indexOf(monthStr)
    if (monthIndex !== -1) {
      return new Date(year, monthIndex, day)
    }
  }
  const parsed = new Date(dateStr)
  return isNaN(parsed.getTime()) ? undefined : parsed
}

const isSameDay = (d1?: Date, d2?: Date): boolean => {
  if (!d1 || !d2) return false
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

export const EditAppointmentPanel: React.FC<EditAppointmentPanelProps> = ({
  isOpen,
  appointment,
  currentPatient,
  existingAppointments,
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

  // Resolve numeric PatientID safely
  const numericPatientId = useMemo(() => {
    const parseId = (val: unknown): number | undefined => {
      if (!val) return undefined
      if (typeof val === 'number' && !isNaN(val) && val > 0) return val
      const cleaned = String(val).replace(/\D/g, '')
      const num = Number(cleaned)
      return !isNaN(num) && num > 0 ? num : undefined
    }
    return (
      parseId(currentPatient?.PatientID) ||
      parseId(currentPatient?.id) ||
      parseId(appointment?.PatientID) ||
      parseId((appointment as any)?.patientId) ||
      parseId(localStorage.getItem('srm_patient_active_id')) ||
      parseId(localStorage.getItem('userID'))
    )
  }, [currentPatient, appointment])

  // Resolve DeptID
  const deptId = useMemo(() => {
    return Number(
      appointment?.DeptID ??
      (appointment as any)?.deptID ??
      (appointment as any)?.DepartmentID ??
      18
    )
  }, [appointment])

  // Original appointment details for reference
  const originalDateDDMMYYYY = useMemo(() => {
    if (!appointment) return ''
    return formatToDDMMYYYY(appointment.AppointmentDate || appointment.date || '')
  }, [appointment])

  const originalSlotId = useMemo(() => {
    if (!appointment) return 0
    return Number(
      appointment.TimeSlotID ??
      (appointment as any).timeSlotID ??
      (appointment as any).TimeSlotId ??
      0
    )
  }, [appointment])

  const originalSlotLabel = useMemo(() => {
    if (!appointment) return ''
    return String(appointment.slot || appointment.TimeSlot || appointment.Timeslot || '')
  }, [appointment])

  // Current appointment date parsed for safe day comparison
  const parsedApptDate = useMemo(() => {
    if (!appointment) return undefined
    return parseDateToDateObject(appointment.AppointmentDate || appointment.date || '')
  }, [appointment])

  // Query: Get allowed weekdays and booked time slots for this department
  const {
    data: appointmentDaysData = { AvailableDays: [], AppointmentDates: [] },
    isLoading: isLoadingAppointmentDays,
  } = useAppointmentDaysQuery(numericPatientId, deptId, {
    enabled: !!numericPatientId && !!deptId && isOpen,
  })

  const availableDays = appointmentDaysData.AvailableDays || []

  // Compute allowed weekday indices from AvailableDays
  const enabledDayIndices = useMemo(() => {
    if (!availableDays || availableDays.length === 0) return new Set<number>()
    const set = new Set<number>()
    availableDays.forEach((item) => {
      if (item.DayName) {
        const idx = DAY_NAME_TO_INDEX[item.DayName.trim().toLowerCase()]
        if (idx !== undefined) set.add(idx)
      } else if (item.DayID !== undefined && item.DayID !== null) {
        const id = Number(item.DayID)
        if (id >= 1 && id <= 6) set.add(id)
        else if (id === 7 || id === 0) set.add(0)
      }
    })
    return set
  }, [availableDays])

  // Helper to check if date falls on an allowed weekday
  const isAppointmentDayAvailable = (date: Date): boolean => {
    // Current appointment date is always valid to view
    if (parsedApptDate && isSameDay(date, parsedApptDate)) return true
    if (date < tomorrow || date > maxDate) return false
    if (enabledDayIndices.size > 0) return enabledDayIndices.has(date.getDay())
    if (isLoadingAppointmentDays) return false
    return date.getDay() !== 0
  }

  // Form State
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedDateStr, setSelectedDateStr] = useState<string>('')
  const [selectedTimeSlotHoursId, setSelectedTimeSlotHoursId] = useState<string>('')
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState<string>('')
  const [selectedSlotText, setSelectedSlotText] = useState<string>('')
  const [isUpdating, setIsUpdating] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string>('')

  // Active/Current appointment TimeSlotID and date tracking (dynamically updated upon reschedule or appointment changes)
  const [currentSlotId, setCurrentSlotId] = useState<number>(0)
  const [currentSlotLabel, setCurrentSlotLabel] = useState<string>('')
  const [currentApptDateStr, setCurrentApptDateStr] = useState<string>('')

  // Sync with appointment prop
  useEffect(() => {
    if (appointment) {
      const slotId = Number(
        appointment.TimeSlotID ??
        (appointment as any).timeSlotID ??
        (appointment as any).TimeSlotId ??
        0
      )
      const slotTxt = String(appointment.slot || appointment.TimeSlot || appointment.Timeslot || '')
      const dateStr = String(appointment.AppointmentDate || appointment.date || '')
      setCurrentSlotId(slotId)
      setCurrentSlotLabel(slotTxt)
      setCurrentApptDateStr(dateStr)
    }
  }, [appointment, isOpen])

  // Query: All patient appointments to enforce "1 Patient + 1 Date = 1 Appointment" rule
  const { data: queryAppointments = [] } = useAppointmentsQuery(
    authUserId,
    numericPatientId || null,
    undefined,
    { enabled: !!numericPatientId && isOpen }
  )

  const appointmentsList = useMemo(() => {
    if (existingAppointments && existingAppointments.length > 0) {
      return existingAppointments
    }
    return queryAppointments
  }, [existingAppointments, queryAppointments])

  // Current appointment identifiers for strict exclusion from conflicting checks
  const currentReschedulingApptId = useMemo(() => {
    if (!appointment) return 0
    return Number(
      appointment.AppointmentID ??
      appointment.AppointmentId ??
      (appointment as any).appointmentId ??
      (appointment as any).id ??
      (typeof appointment.apptNo === 'string' && appointment.apptNo.startsWith('APT-')
        ? Number(appointment.apptNo.replace(/\D/g, '')) || 0
        : Number(appointment.apptNo) || 0)
    )
  }, [appointment])

  const currentReschedulingApptNo = useMemo(() => {
    if (!appointment) return ''
    return String(appointment.AppointmentNo || appointment.apptNo || '').trim().toLowerCase()
  }, [appointment])

  // Helper to normalize any date into DD-MM-YYYY format matching API response format
  const normalizeToDDMMYYYY = (date: Date | string | undefined): string => {
    if (!date) return ''
    if (date instanceof Date) {
      return formatToDDMMYYYY(date)
    }
    const parsed = parseDateToDateObject(date)
    if (parsed) {
      return formatToDDMMYYYY(parsed)
    }
    return formatToDDMMYYYY(date)
  }

  // Identify dates on which the same patient already has another valid, active appointment
  const conflictingAppointmentDatesMap = useMemo(() => {
    const map = new Map<string, Appointment>()
    if (!appointmentsList || appointmentsList.length === 0) return map

    appointmentsList.forEach((a) => {
      // 1. Exclude the appointment currently being rescheduled (by ID or AppointmentNo)
      const aId = Number(
        a.AppointmentID ??
        a.AppointmentId ??
        (a as any).appointmentId ??
        (a as any).id ??
        (typeof a.apptNo === 'string' && a.apptNo.startsWith('APT-')
          ? Number(a.apptNo.replace(/\D/g, '')) || 0
          : Number(a.apptNo) || 0)
      )
      const aNo = String(a.AppointmentNo || a.apptNo || '').trim().toLowerCase()
      const isCurrentAppt =
        (currentReschedulingApptId > 0 && aId > 0 && aId === currentReschedulingApptId) ||
        (currentReschedulingApptNo && aNo && aNo === currentReschedulingApptNo)
      if (isCurrentAppt) return

      // 2. Exclude cancelled appointments
      const status = String(a.AppointmentStatus || a.status || (a as any).Status || '').trim().toLowerCase()
      const statusId = Number(a.StatusID ?? (a as any).statusID ?? 0)
      const isCancelled =
        status === 'cancelled' ||
        status === 'canceled' ||
        status.includes('cancel') ||
        statusId === 2
      if (isCancelled) return

      // 3. Ensure appointment belongs to the same patient
      const aPatientId = Number(a.PatientID ?? (a as any).patientId ?? 0)
      if (numericPatientId && aPatientId > 0 && aPatientId !== numericPatientId) return

      // 4. Map the conflicting date in normalized DD-MM-YYYY format
      const rawDate = a.AppointmentDate || a.date || (a as any).Date || ''
      const dateDDMMYYYY = normalizeToDDMMYYYY(rawDate)
      if (dateDDMMYYYY) {
        map.set(dateDDMMYYYY, a)
      }
    })

    return map
  }, [appointmentsList, currentReschedulingApptId, currentReschedulingApptNo, numericPatientId])

  const conflictingDatesSet = useMemo(() => {
    return new Set<string>(conflictingAppointmentDatesMap.keys())
  }, [conflictingAppointmentDatesMap])

  // Sync with refetched patient appointments if updated
  useEffect(() => {
    if (appointment && appointmentsList.length > 0) {
      const apptId = currentReschedulingApptId
      const apptNo = currentReschedulingApptNo

      const latest = appointmentsList.find((a) => {
        const aId = Number(
          a.AppointmentID ??
          a.AppointmentId ??
          (a as any).appointmentId ??
          (a as any).id ??
          (typeof a.apptNo === 'string' ? a.apptNo.replace(/\D/g, '') : a.apptNo) ??
          0
        )
        const aNo = String(a.AppointmentNo || a.apptNo || '').trim().toLowerCase()
        return (apptId > 0 && aId > 0 && apptId === aId) || (apptNo && aNo && apptNo === aNo)
      })

      if (latest) {
        const latestSlotId = Number(
          latest.TimeSlotID ??
          (latest as any).timeSlotID ??
          (latest as any).TimeSlotId ??
          0
        )
        const latestSlotTxt = String(latest.slot || latest.TimeSlot || latest.Timeslot || '')
        const latestDateStr = String(latest.AppointmentDate || latest.date || '')
        if (latestSlotId > 0) setCurrentSlotId(latestSlotId)
        if (latestSlotTxt) setCurrentSlotLabel(latestSlotTxt)
        if (latestDateStr) setCurrentApptDateStr(latestDateStr)
      }
    }
  }, [appointment, appointmentsList, currentReschedulingApptId, currentReschedulingApptNo])

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

  // Find matching hour range for the current appointment's slot
  const matchingHourRangeId = useMemo(() => {
    if (!appointment || !timeSlotHoursList.length) return ''

    // 1. Direct TimeSlotHoursID on appointment
    const directHoursId = (appointment as any).TimeSlotHoursID ?? (appointment as any).timeSlotHoursID
    if (directHoursId) {
      const found = timeSlotHoursList.find(
        (h) => String(h.TimeSlotHoursID || h.timeSlotHoursID || h.id) === String(directHoursId)
      )
      if (found) return String(found.TimeSlotHoursID || found.timeSlotHoursID || found.id)
    }

    // 2. By matching slot string (e.g. "08:01 - 08:10" -> starts with hour 8)
    const slotStr = String(appointment.slot || appointment.TimeSlot || appointment.Timeslot || '')
    const timeMatch = slotStr.match(/(\d{1,2}):(\d{2})/)
    if (timeMatch) {
      const hour = parseInt(timeMatch[1], 10)
      for (const h of timeSlotHoursList) {
        const hLabel = String(h.TimeSlotHours || h.timeSlotHours || h.SlotHours || h.slotHours || '')
        const hm = hLabel.match(/(\d{1,2}):(\d{2})/)
        if (hm && parseInt(hm[1], 10) === hour) {
          return String(h.TimeSlotHoursID || h.timeSlotHoursID || h.id)
        }
      }
    }

    return ''
  }, [appointment, timeSlotHoursList])

  // Initialize and pre-fill date on open; reset slot selection so user picks a new slot
  useEffect(() => {
    if (isOpen && appointment) {
      const rawDate = appointment.AppointmentDate || appointment.date || ''
      const parsed = parseDateToDateObject(rawDate)

      if (parsed) {
        setSelectedDate(parsed)
        const year = parsed.getFullYear()
        const month = String(parsed.getMonth() + 1).padStart(2, '0')
        const day = String(parsed.getDate()).padStart(2, '0')
        setSelectedDateStr(`${year}-${month}-${day}`)
      } else {
        setSelectedDate(undefined)
        setSelectedDateStr('')
      }

      // Do NOT pre-select old slot: user must choose another available slot
      setSelectedTimeSlotId('')
      setSelectedSlotText('')
      setErrorMsg('')
    }
  }, [isOpen, appointment])

  // Auto-select hour range matching appointment, or first option if none selected
  useEffect(() => {
    if (isOpen && hourRangeOptions.length > 0) {
      if (matchingHourRangeId) {
        setSelectedTimeSlotHoursId(matchingHourRangeId)
      } else if (!selectedTimeSlotHoursId) {
        setSelectedTimeSlotHoursId(String(hourRangeOptions[0].value))
      }
    }
  }, [isOpen, hourRangeOptions, matchingHourRangeId])

  const handleDateChange = (date: Date | undefined) => {
    setSelectedTimeSlotId('')
    setSelectedSlotText('')
    if (date) {
      const dateDDMMYYYY = normalizeToDDMMYYYY(date)
      if (conflictingDatesSet.has(dateDDMMYYYY)) {
        const conflictingAppt = conflictingAppointmentDatesMap.get(dateDDMMYYYY)
        const apptRef = conflictingAppt?.apptNo || conflictingAppt?.AppointmentNo
          ? ` (${conflictingAppt.apptNo || conflictingAppt.AppointmentNo})`
          : ''
        setErrorMsg(`You already have an appointment scheduled on ${dateDDMMYYYY}${apptRef}. A patient can have only one appointment per day. Please select another date.`)
        setSelectedDate(undefined)
        setSelectedDateStr('')
        return
      }

      if (!isAppointmentDayAvailable(date)) {
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
    const slotIdNum = Number(slotId)
    // Check if clicked slot is the current booked slot
    const selectedDDMMYYYY = formatToDDMMYYYY(selectedDateStr)
    const currentApptDDMMYYYY = formatToDDMMYYYY(currentApptDateStr || originalDateDDMMYYYY)
    const isSameDate = Boolean(
      !currentApptDDMMYYYY ||
      !selectedDDMMYYYY ||
      currentApptDDMMYYYY === selectedDDMMYYYY
    )
    if (
      isSameDate &&
      ((currentSlotId > 0 && slotIdNum === currentSlotId) ||
        (currentSlotLabel && slotText && currentSlotLabel.trim().toLowerCase() === slotText.trim().toLowerCase()))
    ) {
      return // Cannot select current booked slot
    }
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

    const selectedDDMMYYYY = normalizeToDDMMYYYY(selectedDateStr)
    if (selectedDDMMYYYY && conflictingDatesSet.has(selectedDDMMYYYY)) {
      const conflictingAppt = conflictingAppointmentDatesMap.get(selectedDDMMYYYY)
      const apptRef = conflictingAppt?.apptNo || conflictingAppt?.AppointmentNo
        ? ` (${conflictingAppt.apptNo || conflictingAppt.AppointmentNo})`
        : ''
      setErrorMsg(`You already have an active appointment scheduled on ${selectedDDMMYYYY}${apptRef}. Please choose another date.`)
      return
    }

    if (!selectedTimeSlotId) {
      setErrorMsg('Please select an available time slot.')
      return
    }

    const currentApptDDMMYYYY = formatToDDMMYYYY(currentApptDateStr || originalDateDDMMYYYY)
    const isSameDateAsCurrentAppt = Boolean(
      !currentApptDDMMYYYY ||
      !selectedDDMMYYYY ||
      currentApptDDMMYYYY === selectedDDMMYYYY
    )
    const isSelectedSlotCurrentBooked = Boolean(
      isSameDateAsCurrentAppt && (
        (currentSlotId > 0 && Number(selectedTimeSlotId) === currentSlotId) ||
        (currentSlotLabel && selectedSlotText && currentSlotLabel.trim().toLowerCase() === selectedSlotText.trim().toLowerCase())
      )
    )

    if (isSelectedSlotCurrentBooked) {
      setErrorMsg('This is already your current appointment time slot. Please select a different available slot to reschedule.')
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
      console.log(`📝 Rescheduling Appointment ID ${appointmentId} (PUT /api/updateappointment/${appointmentId}) with payload:`, payload)
      await updateAppointment(appointmentId, payload)
      toast.success('Appointment updated successfully.')

      // Immediately update current booked slot state with the new selection so UI reflects it instantly without page refresh
      const newSlotIdNum = Number(selectedTimeSlotId)
      setCurrentSlotId(newSlotIdNum)
      if (selectedSlotText) setCurrentSlotLabel(selectedSlotText)
      if (selectedDateStr) setCurrentApptDateStr(selectedDateStr)

      // Clear the user selection since this slot is now the patient's booked slot
      setSelectedTimeSlotId('')
      setSelectedSlotText('')

      // Invalidate queries to trigger instant re-fetch of fresh appointment days & appointments
      queryClient.invalidateQueries({ queryKey: ['appointmentDays'] })
      queryClient.invalidateQueries({ queryKey: ['timeSlots'] })
      queryClient.invalidateQueries({ queryKey: appointmentsQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: appointmentsQueryKeys.user(authUserId) })
      if (patientId) {
        queryClient.invalidateQueries({ queryKey: ['appointments', authUserId, patientId] })
        queryClient.invalidateQueries({ queryKey: ['dashboard', authUserId, patientId] })
      }
      await queryClient.refetchQueries({ queryKey: ['appointmentDays'] })
      await queryClient.refetchQueries({ queryKey: appointmentsQueryKeys.all })

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
  const deptName = appointment.department || appointment.DeptName || appointment.Department || 'Gynecology'

  const selectedDDMMYYYY = formatToDDMMYYYY(selectedDateStr)
  const currentApptDDMMYYYY = formatToDDMMYYYY(currentApptDateStr || originalDateDDMMYYYY)
  const isSameDateAsCurrentAppt = Boolean(
    !currentApptDDMMYYYY ||
    !selectedDDMMYYYY ||
    currentApptDDMMYYYY === selectedDDMMYYYY
  )
  const isSelectedSlotCurrentBooked = Boolean(
    isSameDateAsCurrentAppt && (
      (currentSlotId > 0 && Number(selectedTimeSlotId) === currentSlotId) ||
      (currentSlotLabel && selectedSlotText && currentSlotLabel.trim().toLowerCase() === selectedSlotText.trim().toLowerCase())
    )
  )

  const isSelectedDateConflicting = Boolean(
    selectedDateStr && conflictingDatesSet.has(normalizeToDDMMYYYY(selectedDateStr))
  )

  const isUpdateDisabled =
    !selectedDateStr ||
    !selectedTimeSlotId ||
    isUpdating ||
    isLoadingTimeSlots ||
    isSelectedSlotCurrentBooked ||
    isSelectedDateConflicting

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
            onClick={onClose}
            disabled={isUpdating}
            className="text-xs font-medium px-4 py-2 cursor-pointer border-slate-300 dark:border-slate-700"
            style={{ borderRadius: '4px' }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleUpdate}
            disabled={isUpdateDisabled}
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
      <div className="space-y-5">
        {/* Error Alert */}
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs font-medium animate-in fade-in-50">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Existing appointment info card */}
        <div className="p-3.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
          <div>
            <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-0.5">
              Current Appointment
            </div>
            <div className="font-semibold text-slate-800 dark:text-slate-200">
              {formatToDDMMYYYY(currentApptDateStr || originalDateDDMMYYYY || selectedDateStr)}
              {currentSlotLabel ? ` • ${currentSlotLabel}` : (originalSlotLabel ? ` • ${originalSlotLabel}` : '')}
            </div>
          </div>
          {selectedSlotText && (
            <div className="sm:text-right">
              <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-0.5">
                New Time Selected
              </div>
              <div className="font-semibold text-emerald-700 dark:text-emerald-300">
                {formatToDDMMYYYY(selectedDateStr)} • {selectedSlotText}
              </div>
            </div>
          )}
        </div>

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

        {/* 3. Appointment Date (Editable) */}
        <div>
          <FieldLabel required>Appointment Date</FieldLabel>
          <DateField
            value={selectedDate}
            onChange={handleDateChange}
            placeholder="Select appointment date"
            defaultLabel="Select appointment date"
            fromMonth={parsedApptDate && parsedApptDate < tomorrow ? parsedApptDate : tomorrow}
            toMonth={maxDate}
            disabled={(date) => {
              const dateDDMMYYYY = normalizeToDDMMYYYY(date)
              // Rule: If patient already has another active appointment on this date, disable it!
              if (conflictingDatesSet.has(dateDDMMYYYY)) return true

              // Rule: Exclude the current appointment's original date from blocking itself
              if (parsedApptDate && isSameDay(date, parsedApptDate)) return false

              // Outside allowable booking window
              if (date < tomorrow || date > maxDate) return true

              // Weekday must be available for department
              return !isAppointmentDayAvailable(date)
            }}
          />
        </div>

        {/* 4. Time Slot Hours (Editable) */}
        <div>
          <FieldLabel required>Time Slot</FieldLabel>
          <div className="relative mb-3">
            <SelectField
              options={hourRangeOptions}
              placeholder="Select Time Slot Hours"
              value={selectedTimeSlotHoursId}
              onChange={handleHourRangeChange}
              disabled={isLoadingHours}
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
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {timeSlotsList.map((slot) => {
                      const slotIdNum = Number(slot.TimeSlotID || (slot as any).timeSlotID || (slot as any).id || 0)
                      const slotId = String(slotIdNum || slot.TimeSlotID || '')
                      const slotLabel = String(slot.Timeslot || slot.TimeSlot || (slot as any).Slot || (slot as any).slot || '')
                      
                      // Data Matching:
                      // Compare timeSlot.TimeSlotID with currentAppointment.TimeSlotID
                      const selectedDDMMYYYY = formatToDDMMYYYY(selectedDateStr)
                      const currentApptDDMMYYYY = formatToDDMMYYYY(currentApptDateStr || originalDateDDMMYYYY)
                      const isSameDateAsCurrentAppt = Boolean(
                        !currentApptDDMMYYYY ||
                        !selectedDDMMYYYY ||
                        currentApptDDMMYYYY === selectedDDMMYYYY
                      )

                      const isCurrentBookedSlot = Boolean(
                        isSameDateAsCurrentAppt && (
                          (currentSlotId > 0 ? slotIdNum === currentSlotId : (originalSlotId > 0 && slotIdNum === originalSlotId)) ||
                          (currentSlotLabel && slotLabel && currentSlotLabel.trim().toLowerCase() === slotLabel.trim().toLowerCase()) ||
                          (originalSlotLabel && slotLabel && originalSlotLabel.trim().toLowerCase() === slotLabel.trim().toLowerCase())
                        )
                      )

                      const isSelected = !isCurrentBookedSlot && (selectedTimeSlotId === slotId || selectedSlotText === slotLabel)

                      // Only the currently booked slot should show "Already Booked!" and be disabled
                      if (isCurrentBookedSlot) {
                        return (
                          <button
                            key={slotId || `booked-${slotLabel}`}
                            type="button"
                            disabled={true}
                            className="px-2.5 py-2.5 text-center text-xs font-semibold rounded-md border-2 bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800 cursor-not-allowed select-none opacity-80 flex items-center justify-center"
                            title="Already Booked!"
                          >
                            Already Booked!
                          </button>
                        )
                      }

                      // All other time slots display normally and remain selectable
                      return (
                        <button
                          key={slotId}
                          type="button"
                          onClick={() => handleSlotSelect(slotId, slotLabel)}
                          className={`
                            px-2.5 py-2.5 text-center text-xs font-semibold rounded-md border-2 
                            transition-all duration-200 cursor-pointer
                            ${isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm scale-[1.02]'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700'
                            }
                          `}
                        >
                          {slotLabel}
                        </button>
                      )
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap items-center gap-4 pt-2.5 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 inline-block" />
                      Available
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-blue-600 border border-blue-600 inline-block" />
                      Selected
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                      <span className="w-3 h-3 rounded border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 inline-block" />
                      Already Booked!
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-xs text-slate-500 py-3 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded">
                  No slots available for this hour range.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </CustomPanel>
  )
}

export default EditAppointmentPanel
