import React, { useState, useEffect, useMemo } from 'react'
import { CalendarPlus, CalendarCheck, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FieldLabel, DateField, SelectField, TextField } from '@/components/FormPrimitives'
import {
  useDepartmentsQuery,
  useTimeSlotHoursQuery,
  useTimeSlotsQuery,
  useAppointmentDaysQuery,
  type BookedAppointmentDate,
} from '@/hooks/queries/useMasterDataQueries'
import { type Patient } from '@/types/patient.types'

interface AppointmentBookingProps {
  currentPatient?: Patient | null
  patientId?: number | string
  bookDate: string
  setBookDate: (v: string) => void
  bookDoctor?: string
  setBookDoctor?: (v: string) => void
  bookUnit?: string
  setBookUnit?: (v: string) => void
  selectedSlot: string
  setSelectedSlot: (v: string) => void
  selectedDepartmentId?: string
  setSelectedDepartmentId?: (v: string) => void
  selectedDoctorId?: string
  setSelectedDoctorId?: (v: string) => void
  selectedTimeSlotId?: string
  setSelectedTimeSlotId?: (v: string) => void
  isConfirming?: boolean
  bookErrors: Record<string, string>
  onConfirm: (data?: { deptID: string; doctorID: string; timeSlotID: string; deptName?: string }) => void
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

// Exported for compatibility with components like EditAppointmentPanel
export const isAppointmentDayEnabled = (date: Date): boolean => {
  return date.getDay() !== 0
}

// Convert Date or date string to DD-MM-YYYY format matching API response format
export const formatToDDMMYYYY = (date: Date | string): string => {
  if (!date) return ''
  if (typeof date === 'string') {
    const trimmed = date.trim()
    // Match DD-MM-YYYY or DD/MM/YYYY (with optional time portion)
    const ddmmyyyyMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/)
    if (ddmmyyyyMatch) {
      const day = ddmmyyyyMatch[1].padStart(2, '0')
      const month = ddmmyyyyMatch[2].padStart(2, '0')
      const year = ddmmyyyyMatch[3]
      return `${day}-${month}-${year}`
    }
    // Match YYYY-MM-DD or YYYY/MM/DD (with optional time portion)
    const ymdMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/)
    if (ymdMatch) {
      const year = ymdMatch[1]
      const month = ymdMatch[2].padStart(2, '0')
      const day = ymdMatch[3].padStart(2, '0')
      return `${day}-${month}-${year}`
    }
    const parsed = new Date(trimmed)
    if (!isNaN(parsed.getTime())) {
      const day = String(parsed.getDate()).padStart(2, '0')
      const month = String(parsed.getMonth() + 1).padStart(2, '0')
      const year = parsed.getFullYear()
      return `${day}-${month}-${year}`
    }
    return trimmed
  }
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}

// Skeleton Loader Component for Dropdowns
const DropdownSkeleton: React.FC = () => {
  return (
    <div className="w-full">
      <div className="w-full h-9 rounded-[4px] border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 animate-pulse px-3 flex items-center">
        <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
      </div>
    </div>
  )
}

export const AppointmentBooking: React.FC<AppointmentBookingProps> = ({
  currentPatient,
  patientId: patientIdProp,
  bookDate,
  setBookDate,
  selectedSlot,
  setSelectedSlot,
  selectedDepartmentId: parentDeptId,
  setSelectedDepartmentId: setParentDeptId,
  selectedTimeSlotId: parentSlotId,
  setSelectedTimeSlotId: setParentSlotId,
  isConfirming = false,
  bookErrors,
  onConfirm,
}) => {
  // Only allow TOMORROW onwards (Today and past dates are disabled)
  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    return tomorrow
  }

  const tomorrow = getTomorrowDate()

  // Calculate date 90 days from tomorrow
  const maxDate = new Date(tomorrow)
  maxDate.setDate(maxDate.getDate() + 90)
  maxDate.setHours(23, 59, 59, 999)

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
      parseId(patientIdProp) ||
      parseId(currentPatient?.PatientID) ||
      parseId(currentPatient?.id) ||
      parseId(localStorage.getItem('srm_patient_active_id')) ||
      parseId(localStorage.getItem('userID')) ||
      parseId(localStorage.getItem('srm_patient_user_id'))
    )
  }, [patientIdProp, currentPatient])

  const [internalDeptId, setInternalDeptId] = useState<string>('')
  const [internalTimeSlotId, setInternalTimeSlotId] = useState<string>('')
  const [selectedTimeSlotHoursId, setSelectedTimeSlotHoursId] = useState<string>('')
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({})

  const selectedDepartmentId = parentDeptId !== undefined ? parentDeptId : internalDeptId
  const setSelectedDepartmentId = setParentDeptId || setInternalDeptId

  const selectedTimeSlotId = parentSlotId !== undefined ? parentSlotId : internalTimeSlotId
  const setSelectedTimeSlotId = setParentSlotId || setInternalTimeSlotId

  // API Data: Departments
  const { data: departmentsList = [], isLoading: isLoadingDepartments } = useDepartmentsQuery()

  // Auto-select department ID 18 (or first available)
  const dept18 = departmentsList.find((d) => Number(d.DepartmentID || d.DeptID || (d as any).id) === 18)
  const targetDept = dept18 || (departmentsList.length > 0 ? departmentsList[0] : null)
  const defaultDeptId = targetDept
    ? String(targetDept.DepartmentID || targetDept.DeptID || (targetDept as any).id || '18')
    : '18'
  const defaultDeptName = targetDept
    ? (targetDept.DepartmentName || targetDept.DeptName || (targetDept as any).name || 'Gynecology')
    : 'Gynecology'

  const effectiveDeptId = selectedDepartmentId || defaultDeptId || '18'

  useEffect(() => {
    if (departmentsList.length > 0) {
      if (!selectedDepartmentId) {
        setSelectedDepartmentId(defaultDeptId)
      }
    } else if (!selectedDepartmentId) {
      setSelectedDepartmentId('18')
    }
  }, [departmentsList, selectedDepartmentId, setSelectedDepartmentId, defaultDeptId])

  // API Data: Call GET /api/appointmentdays?PatientID={PatientID}&DepartmentID={DepartmentID}
  const {
    data: appointmentDaysData = { AvailableDays: [], AppointmentDates: [] },
    isLoading: isLoadingAppointmentDays,
  } = useAppointmentDaysQuery(numericPatientId, effectiveDeptId, {
    enabled: !!numericPatientId && !!effectiveDeptId,
  })

  const availableDays = appointmentDaysData.AvailableDays || []
  const appointmentDatesList = appointmentDaysData.AppointmentDates || []

  // Compute allowed weekday indices from AvailableDays
  const enabledDayIndices = useMemo(() => {
    if (!availableDays || availableDays.length === 0) {
      return new Set<number>()
    }
    const set = new Set<number>()
    availableDays.forEach((item) => {
      if (item.DayName) {
        const idx = DAY_NAME_TO_INDEX[item.DayName.trim().toLowerCase()]
        if (idx !== undefined) {
          set.add(idx)
        }
      } else if (item.DayID !== undefined && item.DayID !== null) {
        const id = Number(item.DayID)
        if (id >= 1 && id <= 6) set.add(id)
        else if (id === 7 || id === 0) set.add(0)
      }
    })
    return set
  }, [availableDays])

  // Helper to verify if an appointment date is available
  const isAppointmentDayAvailable = (date: Date): boolean => {
    if (date < tomorrow || date > maxDate) {
      return false
    }
    // If AvailableDays returned from API, strictly enforce them
    if (enabledDayIndices.size > 0) {
      return enabledDayIndices.has(date.getDay())
    }
    // While loading available days, disable
    if (isLoadingAppointmentDays) {
      return false
    }
    // Default fallback (exclude Sunday)
    return date.getDay() !== 0
  }

  // Initialize date as undefined (no auto-selection on page load)
  const [dateValue, setDateValue] = useState<Date | undefined>(() => {
    if (bookDate) {
      const date = new Date(bookDate)
      if (!isNaN(date.getTime()) && date >= tomorrow && date <= maxDate && isAppointmentDayAvailable(date)) {
        return date
      }
    }
    return undefined
  })

  // Synchronize internal dateValue with bookDate prop
  useEffect(() => {
    if (bookDate) {
      const parsed = new Date(bookDate)
      if (!isNaN(parsed.getTime())) {
        setDateValue((prev) => {
          if (prev && prev.getTime() === parsed.getTime()) return prev
          return parsed
        })
      }
    } else {
      setDateValue(undefined)
    }
  }, [bookDate])

  // Auto-validate dateValue whenever enabledDayIndices updates
  useEffect(() => {
    if (dateValue && enabledDayIndices.size > 0 && !enabledDayIndices.has(dateValue.getDay())) {
      setDateValue(undefined)
      setBookDate('')
      setSelectedSlot('')
      setSelectedTimeSlotId('')
    }
  }, [enabledDayIndices, dateValue, setBookDate, setSelectedSlot, setSelectedTimeSlotId])

  // Collect all booked time slot IDs for the selected appointment date from AppointmentDates
  const bookedSlotIdsForSelectedDate = useMemo(() => {
    const targetDate = dateValue || bookDate
    if (!targetDate) return new Set<number>()

    const selectedDDMMYYYY = formatToDDMMYYYY(targetDate)
    if (!selectedDDMMYYYY) return new Set<number>()

    const set = new Set<number>()
    appointmentDatesList.forEach((item: BookedAppointmentDate | Record<string, unknown>) => {
      const rawDateStr = String(
        item.AppointmentDates ||
        (item as any).appointmentDates ||
        (item as any).AppointmentDate ||
        (item as any).appointmentDate ||
        ''
      ).trim()

      const itemDDMMYYYY = formatToDDMMYYYY(rawDateStr)
      if (itemDDMMYYYY === selectedDDMMYYYY) {
        const slotId = Number(
          item.BookedTimeSlotId ??
          (item as any).bookedTimeSlotId ??
          (item as any).TimeSlotID ??
          (item as any).timeSlotId
        )
        if (!isNaN(slotId) && slotId > 0) {
          set.add(slotId)
        }
      }
    })
    return set
  }, [dateValue, bookDate, appointmentDatesList])

  // If currently selected slot is already booked on the selected date, clear it
  useEffect(() => {
    if (selectedTimeSlotId && bookedSlotIdsForSelectedDate.has(Number(selectedTimeSlotId))) {
      setSelectedSlot('')
      setSelectedTimeSlotId('')
    }
  }, [bookedSlotIdsForSelectedDate, selectedTimeSlotId, setSelectedSlot, setSelectedTimeSlotId])

  // API Data: Time Slot Hours from GET /api/timeslothours
  const { data: timeSlotHoursList = [], isLoading: isLoadingTimeSlotHours } = useTimeSlotHoursQuery()


  // Options for Time Slot Hours Dropdown
  const hourRangeOptions = useMemo(() => {
    return timeSlotHoursList.map((item) => {
      const id = String(item.TimeSlotHoursID || item.timeSlotHoursID || item.id || '')
      const label = String(item.TimeSlotHours || item.timeSlotHours || item.SlotHours || item.slotHours || item.name || id)
      return {
        value: id,
        label: label,
      }
    })
  }, [timeSlotHoursList])

  // Find the display label for the selected Time Slot Hours
  const selectedHourItem = useMemo(() => {
    return timeSlotHoursList.find(
      (h) => String(h.TimeSlotHoursID || h.timeSlotHoursID || h.id) === String(selectedTimeSlotHoursId)
    )
  }, [timeSlotHoursList, selectedTimeSlotHoursId])

  const selectedHourRangeLabel = selectedHourItem
    ? String(selectedHourItem.TimeSlotHours || selectedHourItem.timeSlotHours || selectedHourItem.SlotHours || selectedHourItem.slotHours || selectedHourItem.name || '')
    : ''

  // API Data: Available Time Slots from GET /api/timeslot?timeSlotHoursID={id}
  const numericHoursId = selectedTimeSlotHoursId ? Number(selectedTimeSlotHoursId) : undefined
  const {
    data: timeSlotsList = [],
    isLoading: isLoadingTimeSlots,
  } = useTimeSlotsQuery(
    numericHoursId ? { timeSlotHoursID: numericHoursId } : undefined,
    { enabled: !!numericHoursId && !!bookDate }
  )

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedSlot('')
    setSelectedTimeSlotId('')
    if (date) {
      if (!isAppointmentDayAvailable(date)) {
        setLocalErrors((prev) => ({ ...prev, date: 'Appointments are not available on this day' }))
        return
      }
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      setBookDate(`${year}-${month}-${day}`)
      setDateValue(date)
      setLocalErrors((prev) => ({ ...prev, date: '' }))
    } else {
      setBookDate('')
      setDateValue(undefined)
      setLocalErrors((prev) => ({ ...prev, date: 'Please select a date' }))
    }
  }

  // Handle changing Time Slot Hours dropdown
  const handleHourRangeChange = (hoursId: string) => {
    setSelectedTimeSlotHoursId(hoursId)
    setSelectedSlot('')
    setSelectedTimeSlotId('')
    setLocalErrors((prev) => ({ ...prev, slot: '' }))
  }

  // Handle selecting a specific available time slot (prevent selecting booked slots)
  const handleTimeSlotSelect = (slotId: string, slotText: string) => {
    if (bookedSlotIdsForSelectedDate.has(Number(slotId))) {
      return
    }
    setSelectedTimeSlotId(slotId)
    setSelectedSlot(slotText)
    setLocalErrors((prev) => ({ ...prev, slot: '' }))
  }

  const validateAndConfirm = () => {
    if (isConfirming) return

    const errors: Record<string, string> = {}

    if (!bookDate) {
      errors.date = 'Please select an appointment date'
    } else {
      const selectedDate = new Date(bookDate)
      if (!isAppointmentDayAvailable(selectedDate)) {
        errors.date = 'Appointments are not available on this day'
      }
    }

    if (!selectedTimeSlotId && !selectedSlot) {
      errors.slot = 'Please select an available time slot'
    } else if (selectedTimeSlotId && bookedSlotIdsForSelectedDate.has(Number(selectedTimeSlotId))) {
      errors.slot = 'The selected time slot is already booked. Please choose another slot.'
    }

    if (Object.keys(errors).length > 0) {
      setLocalErrors(errors)
      return
    }

    setLocalErrors({})
    onConfirm({
      deptID: effectiveDeptId,
      doctorID: '0',
      timeSlotID: selectedTimeSlotId || '1',
      deptName: defaultDeptName,
    })
  }

  return (
    <div>
      {/* Section header bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-lg px-6 py-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-md flex items-center justify-center bg-blue-50 dark:bg-slate-800">
          <CalendarPlus className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <div className="font-bold text-lg leading-tight">Book Appointment</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Schedule your appointment with ease</div>
        </div>
      </div>

      {/* Form card */}
      <div className="bg-white dark:bg-slate-900 border-x border-b border-slate-200 dark:border-slate-800 rounded-b-lg shadow-sm">
        <div className="p-6 sm:p-8">
          {bookErrors.form && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-400 text-xs font-medium">
              {bookErrors.form}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-5">
            {/* Department */}
            <div>
              <FieldLabel required>Department</FieldLabel>
              <div className="relative">
                {isLoadingDepartments ? (
                  <DropdownSkeleton />
                ) : departmentsList.length > 1 ? (
                  <SelectField
                    options={departmentsList.map((d) => {
                      const id = String(d.DepartmentID || d.DeptID || (d as any).id || '')
                      const name = d.DepartmentName || d.DeptName || (d as any).name || `Department ${id}`
                      return { value: id, label: name }
                    })}
                    placeholder="Select Department"
                    value={selectedDepartmentId || defaultDeptId}
                    onChange={(val) => {
                      setSelectedDepartmentId(val)
                      setBookDate('')
                      setDateValue(undefined)
                      setSelectedSlot('')
                      setSelectedTimeSlotId('')
                    }}
                  />
                ) : (
                  <TextField
                    value={defaultDeptName}
                    disabled={true}
                    placeholder="Department"
                  />
                )}
              </div>
              {(bookErrors.department || localErrors.department) && (
                <p className="text-xs text-rose-600 mt-1">{bookErrors.department || localErrors.department}</p>
              )}
            </div>

            {/* Appointment Date */}
            <div>
              <FieldLabel required>Appointment Date</FieldLabel>
              <DateField
                value={dateValue}
                onChange={handleDateSelect}
                placeholder="Select date"
                defaultLabel="Select date"
                fromMonth={tomorrow}
                toMonth={maxDate}
                disabled={(date) => !isAppointmentDayAvailable(date)}
              />
              {(bookErrors.date || localErrors.date) && (
                <p className="text-xs text-rose-600 mt-1">{bookErrors.date || localErrors.date}</p>
              )}
            </div>

            {/* Time Slot Hours Dropdown (GET /api/timeslothours) */}
            <div>
              <FieldLabel required>Time Slot Hours</FieldLabel>
              <div className="relative">
                {isLoadingTimeSlotHours ? (
                  <DropdownSkeleton />
                ) : (
                  <SelectField
                    options={hourRangeOptions}
                    placeholder="Select Time Slot Hours"
                    value={selectedTimeSlotHoursId}
                    onChange={handleHourRangeChange}
                    disabled={isLoadingTimeSlotHours}
                  />
                )}
                {isLoadingTimeSlotHours && (
                  <span className="absolute right-8 top-2.5 text-blue-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </span>
                )}
              </div>
              {(bookErrors.slot || localErrors.slot) && (
                <p className="text-xs text-rose-600 mt-1">{bookErrors.slot || localErrors.slot}</p>
              )}
            </div>
          </div>

          {/* Available Time Slots Grid (GET /api/timeslot?timeSlotHoursID=...) */}
          {selectedTimeSlotHoursId && (
            <div className="space-y-3 pt-6 mt-6 border-t border-slate-200 dark:border-slate-800 animate-in fade-in-50 duration-300">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <FieldLabel required>Available Time Slots</FieldLabel>
                {selectedHourRangeLabel && (
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-800">
                    {selectedHourRangeLabel}
                  </span>
                )}
              </div>

              {isLoadingTimeSlots ? (
                <div className="py-6 flex flex-col items-center justify-center gap-2 border border-dashed border-blue-200 dark:border-blue-900/50 rounded-lg bg-blue-50/30 dark:bg-blue-950/20">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Loading available time slots...</span>
                </div>
              ) : timeSlotsList.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                    {timeSlotsList.map((slot) => {
                      const slotIdNum = Number(slot.TimeSlotID || (slot as any).timeSlotID || (slot as any).id || 0)
                      const slotId = String(slotIdNum || slot.TimeSlotID || (slot as any).timeSlotID || '')
                      const slotLabel = String(slot.Timeslot || slot.TimeSlot || (slot as any).Slot || (slot as any).slot || '')
                      const isBooked = slotIdNum > 0 && bookedSlotIdsForSelectedDate.has(slotIdNum)
                      const isSelected = !isBooked && (selectedTimeSlotId === slotId || selectedSlot === slotLabel)

                      if (isBooked) {
                        return (
                          <button
                            key={slotId || `booked-${slotLabel}`}
                            type="button"
                            disabled={true}
                            className="px-3 py-2.5 text-center text-xs font-semibold rounded-lg border-2 bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800 cursor-not-allowed select-none opacity-80 flex items-center justify-center"
                            title="This time slot is already booked"
                          >
                            Already Booked !
                          </button>
                        )
                      }

                      return (
                        <button
                          key={slotId}
                          type="button"
                          onClick={() => handleTimeSlotSelect(slotId, slotLabel)}
                          className={`
                            px-3 py-2.5 text-center text-xs font-semibold rounded-lg border-2 
                            transition-all duration-200 cursor-pointer
                            ${isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100 dark:shadow-blue-900/30 scale-105'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800'
                            }
                          `}
                        >
                          {slotLabel}
                        </button>
                      )
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <span className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <span className="w-3.5 h-3.5 rounded border-2 border-slate-300 bg-white dark:bg-slate-900 inline-block" />
                      Available
                    </span>
                    <span className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <span className="w-3.5 h-3.5 rounded bg-blue-600 border-2 border-blue-600 inline-block" />
                      Selected
                    </span>
                    <span className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                      <span className="w-3.5 h-3.5 rounded border-2 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 inline-block" />
                      Already Booked !
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-xs text-slate-500 py-4 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                  No available time slots found for this hour range.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-slate-200 dark:border-slate-800 px-4 sm:px-6 md:px-8 py-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {!bookDate ? (
              <span>Please select an appointment date</span>
            ) : !selectedTimeSlotId || !selectedSlot ? (
              <span>Please select a time slot to enable booking</span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Slot selected: {selectedSlot}</span>
            )}
          </div>

          <Button
            onClick={validateAndConfirm}
            disabled={
              !selectedTimeSlotId ||
              !selectedSlot ||
              !bookDate ||
              isConfirming ||
              isLoadingTimeSlots ||
              bookedSlotIdsForSelectedDate.has(Number(selectedTimeSlotId))
            }
            className="w-full sm:w-auto text-white cursor-pointer font-semibold px-6 py-2.5 flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'var(--blue-btn)', borderRadius: '4px' }}
          >
            {isConfirming ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Booking Appointment...</span>
              </>
            ) : (
              <>
                <CalendarCheck className="w-4 h-4" />
                <span>Book Appointment</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AppointmentBooking