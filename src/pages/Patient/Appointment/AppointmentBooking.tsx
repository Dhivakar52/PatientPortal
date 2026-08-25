import React, { useState, useEffect } from 'react'
import { CalendarPlus, CalendarCheck, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FieldLabel, DateField, SelectField, TextField } from '@/components/FormPrimitives'
import { getTimeSlots, type TimeSlot } from '@/services/apiService'
import { useDepartmentsQuery } from '@/hooks/queries/useMasterDataQueries'

interface AppointmentBookingProps {
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
  onConfirm: (data?: { deptID: string; doctorID: string; timeSlotID: string }) => void
}

// Day-wise Appointment Availability Configuration (1 = Enabled, 0 = Disabled)
// Mapping: Monday=1, Tuesday=2, Wednesday=3, Thursday=4, Friday=5, Saturday=6
// Sunday is always disabled and excluded from configuration
export const appointmentDayConfig: Record<number, 0 | 1> = {
  1: 0, // Monday
  2: 1, // Tuesday
  3: 0, // Wednesday
  4: 1, // Thursday
  5: 1, // Friday
  6: 1, // Saturday
}

// Helper to verify if an appointment date is available
export const isAppointmentDayEnabled = (date: Date): boolean => {
  const jsDay = date.getDay()

  // Sunday is always disabled
  if (jsDay === 0) {
    return false
  }

  return appointmentDayConfig[jsDay] === 1
}

// Data structure for 1-hour range UI grouping
export interface HourRange {
  label: string
  slots: TimeSlot[]
}

// Dynamically group consecutive 10-minute slots (6 slots = 1 hour) into 1-hour ranges
export const groupSlotsIntoHourRanges = (slots: TimeSlot[]): HourRange[] => {
  const ranges: HourRange[] = []
  const chunkSize = 6
  for (let i = 0; i < slots.length; i += chunkSize) {
    const chunk = slots.slice(i, i + chunkSize)
    if (chunk.length === 0) continue
    const first = chunk[0]
    const last = chunk[chunk.length - 1]

    const firstStart = first.Timeslot.includes('-') ? first.Timeslot.split('-')[0].trim() : first.Timeslot
    const lastEnd = last.Timeslot.includes('-') ? last.Timeslot.split('-')[1].trim() : last.Timeslot

    ranges.push({
      label: `${firstStart} - ${lastEnd}`,
      slots: chunk,
    })
  }
  return ranges
}

// Fallback 36 slots (08:00 AM - 02:00 PM) for offline / fallback state
const DEFAULT_36_TIMESLOTS: TimeSlot[] = [
  // 08:00 AM - 09:00 AM
  { TotalCount: 36, TimeSlotID: 1, Timeslot: '08:00 AM-08:10 AM' },
  { TotalCount: 36, TimeSlotID: 2, Timeslot: '08:10 AM-08:20 AM' },
  { TotalCount: 36, TimeSlotID: 3, Timeslot: '08:20 AM-08:30 AM' },
  { TotalCount: 36, TimeSlotID: 4, Timeslot: '08:30 AM-08:40 AM' },
  { TotalCount: 36, TimeSlotID: 5, Timeslot: '08:40 AM-08:50 AM' },
  { TotalCount: 36, TimeSlotID: 6, Timeslot: '08:50 AM-09:00 AM' },
  // 09:00 AM - 10:00 AM
  { TotalCount: 36, TimeSlotID: 7, Timeslot: '09:00 AM-09:10 AM' },
  { TotalCount: 36, TimeSlotID: 8, Timeslot: '09:10 AM-09:20 AM' },
  { TotalCount: 36, TimeSlotID: 9, Timeslot: '09:20 AM-09:30 AM' },
  { TotalCount: 36, TimeSlotID: 10, Timeslot: '09:30 AM-09:40 AM' },
  { TotalCount: 36, TimeSlotID: 11, Timeslot: '09:40 AM-09:50 AM' },
  { TotalCount: 36, TimeSlotID: 12, Timeslot: '09:50 AM-10:00 AM' },
  // 10:00 AM - 11:00 AM
  { TotalCount: 36, TimeSlotID: 13, Timeslot: '10:00 AM-10:10 AM' },
  { TotalCount: 36, TimeSlotID: 14, Timeslot: '10:10 AM-10:20 AM' },
  { TotalCount: 36, TimeSlotID: 15, Timeslot: '10:20 AM-10:30 AM' },
  { TotalCount: 36, TimeSlotID: 16, Timeslot: '10:30 AM-10:40 AM' },
  { TotalCount: 36, TimeSlotID: 17, Timeslot: '10:40 AM-10:50 AM' },
  { TotalCount: 36, TimeSlotID: 18, Timeslot: '10:50 AM-11:00 AM' },
  // 11:00 AM - 12:00 PM
  { TotalCount: 36, TimeSlotID: 19, Timeslot: '11:00 AM-11:10 AM' },
  { TotalCount: 36, TimeSlotID: 20, Timeslot: '11:10 AM-11:20 AM' },
  { TotalCount: 36, TimeSlotID: 21, Timeslot: '11:20 AM-11:30 AM' },
  { TotalCount: 36, TimeSlotID: 22, Timeslot: '11:30 AM-11:40 AM' },
  { TotalCount: 36, TimeSlotID: 23, Timeslot: '11:40 AM-11:50 AM' },
  { TotalCount: 36, TimeSlotID: 24, Timeslot: '11:50 AM-12:00 PM' },
  // 12:00 PM - 01:00 PM
  { TotalCount: 36, TimeSlotID: 25, Timeslot: '12:00 PM-12:10 PM' },
  { TotalCount: 36, TimeSlotID: 26, Timeslot: '12:10 PM-12:20 PM' },
  { TotalCount: 36, TimeSlotID: 27, Timeslot: '12:20 PM-12:30 PM' },
  { TotalCount: 36, TimeSlotID: 28, Timeslot: '12:30 PM-12:40 PM' },
  { TotalCount: 36, TimeSlotID: 29, Timeslot: '12:40 PM-12:50 PM' },
  { TotalCount: 36, TimeSlotID: 30, Timeslot: '12:50 PM-01:00 PM' },
  // 01:00 PM - 02:00 PM
  { TotalCount: 36, TimeSlotID: 31, Timeslot: '01:00 PM-01:10 PM' },
  { TotalCount: 36, TimeSlotID: 32, Timeslot: '01:10 PM-01:20 PM' },
  { TotalCount: 36, TimeSlotID: 33, Timeslot: '01:20 PM-01:30 PM' },
  { TotalCount: 36, TimeSlotID: 34, Timeslot: '01:30 PM-01:40 PM' },
  { TotalCount: 36, TimeSlotID: 35, Timeslot: '01:40 PM-01:50 PM' },
  { TotalCount: 36, TimeSlotID: 36, Timeslot: '01:50 PM-02:00 PM' },
]

// Skeleton Loader Component for Time Slots
const TimeSlotsSkeleton: React.FC = () => {
  const skeletonItems = Array(6).fill(null)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
      {skeletonItems.map((_, index) => (
        <div
          key={index}
          className="px-3 py-2.5 rounded-lg border-2 border-slate-200 dark:border-slate-700 animate-pulse"
        >
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16 mx-auto"></div>
        </div>
      ))}
    </div>
  )
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

  // Initialize date as undefined (no auto-selection on page load)
  const [dateValue, setDateValue] = useState<Date | undefined>(() => {
    if (bookDate) {
      const date = new Date(bookDate)
      if (!isNaN(date.getTime()) && date >= tomorrow && date <= maxDate && isAppointmentDayEnabled(date)) {
        return date
      }
    }
    return undefined
  })

  const [internalDeptId, setInternalDeptId] = useState<string>('')
  const [internalTimeSlotId, setInternalTimeSlotId] = useState<string>('')
  const [selectedHourRangeLabel, setSelectedHourRangeLabel] = useState<string>('')

  const selectedDepartmentId = parentDeptId !== undefined ? parentDeptId : internalDeptId
  const setSelectedDepartmentId = setParentDeptId || setInternalDeptId

  const selectedTimeSlotId = parentSlotId !== undefined ? parentSlotId : internalTimeSlotId
  const setSelectedTimeSlotId = setParentSlotId || setInternalTimeSlotId

  // API Data States: Departments & Time Slots
  const { data: departmentsList = [], isLoading: isLoadingDepartments } = useDepartmentsQuery()
  const [timeSlotsList, setTimeSlotsList] = useState<TimeSlot[]>([])
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState<boolean>(false)
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({})

  // Compute dynamic 1-hour ranges from time slots list
  const hourRanges = React.useMemo(() => groupSlotsIntoHourRanges(timeSlotsList), [timeSlotsList])

  // Synchronize selectedHourRangeLabel if a timeSlot is already selected
  useEffect(() => {
    if (hourRanges.length > 0 && selectedTimeSlotId) {
      const matchingRange = hourRanges.find((r) =>
        r.slots.some((s) => String(s.TimeSlotID) === selectedTimeSlotId)
      )
      if (matchingRange) {
        setSelectedHourRangeLabel(matchingRange.label)
      }
    }
  }, [hourRanges, selectedTimeSlotId])

  // Auto-select the first available department from API list
  useEffect(() => {
    if (departmentsList.length > 0) {
      const firstDept = departmentsList[0]
      const firstDeptId = String(firstDept.DepartmentID || firstDept.DeptID || (firstDept as any).id || '1')
      if (!selectedDepartmentId || selectedDepartmentId !== firstDeptId) {
        setSelectedDepartmentId(firstDeptId)
      }
    }
  }, [departmentsList, selectedDepartmentId, setSelectedDepartmentId])

  // Fetch Time Slots ONLY after user selects an appointment date
  useEffect(() => {
    if (!bookDate) {
      setTimeSlotsList([])
      setIsLoadingTimeSlots(false)
      return
    }

    let isMounted = true
    setIsLoadingTimeSlots(true)

    getTimeSlots()
      .then((slots) => {
        if (isMounted) {
          if (Array.isArray(slots) && slots.length > 0) {
            setTimeSlotsList(slots)
          } else {
            setTimeSlotsList(DEFAULT_36_TIMESLOTS)
          }
        }
      })
      .catch((err) => {
        console.error('Failed to fetch time slots:', err)
        if (isMounted) {
          setTimeSlotsList(DEFAULT_36_TIMESLOTS)
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingTimeSlots(false)
      })

    return () => {
      isMounted = false
    }
  }, [bookDate])

  const handleDateSelect = (date: Date | undefined) => {
    // Clear previously selected slot when changing date
    setSelectedSlot('')
    setSelectedTimeSlotId('')
    if (date) {
      if (!isAppointmentDayEnabled(date)) {
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

  // Handle selecting a specific 10-minute time slot
  const handleTimeSlotChange = (val: string) => {
    setSelectedTimeSlotId(val)
    const slot = timeSlotsList.find((s) => String(s.TimeSlotID) === val)
    if (slot) {
      setSelectedSlot(slot.Timeslot)
      // Keep dropdown in sync with selected slot's hour range
      const matchingRange = hourRanges.find((r) =>
        r.slots.some((s) => String(s.TimeSlotID) === val)
      )
      if (matchingRange) {
        setSelectedHourRangeLabel(matchingRange.label)
      }
    } else {
      setSelectedSlot(val)
    }
    setLocalErrors((prev) => ({ ...prev, slot: '' }))
  }

  // Handle changing the 1-hour range dropdown
  const handleHourRangeChange = (rangeLabel: string) => {
    setSelectedHourRangeLabel(rangeLabel)
    const matchingRange = hourRanges.find((r) => r.label === rangeLabel)
    if (matchingRange && matchingRange.slots.length > 0) {
      const isCurrentSlotInRange = matchingRange.slots.some(
        (s) => String(s.TimeSlotID) === selectedTimeSlotId
      )
      // Automatically select the first 10-minute slot of the new hour range
      if (!isCurrentSlotInRange) {
        handleTimeSlotChange(String(matchingRange.slots[0].TimeSlotID))
      }
    }
  }

  const firstDept = departmentsList.length > 0 ? departmentsList[0] : null
  const defaultFirstDeptId = firstDept
    ? String(firstDept.DepartmentID || firstDept.DeptID || (firstDept as any).id || '1')
    : '1'
  const firstDeptName = firstDept
    ? (firstDept.DepartmentName || firstDept.DeptName || (firstDept as any).name || 'Gynecology')
    : 'Gynecology'

  const validateAndConfirm = () => {
    if (isConfirming) return

    const errors: Record<string, string> = {}

    if (!bookDate) {
      errors.date = 'Please select an appointment date'
    } else {
      const selectedDate = new Date(bookDate)
      if (!isAppointmentDayEnabled(selectedDate)) {
        errors.date = 'Appointments are not available on this day'
      }
    }

    const effectiveDeptId = selectedDepartmentId || defaultFirstDeptId

    if (!selectedTimeSlotId && !selectedSlot) {
      errors.slot = 'Please select a time slot'
    }

    if (Object.keys(errors).length > 0) {
      setLocalErrors(errors)
      return
    }

    setLocalErrors({})
    onConfirm({
      deptID: effectiveDeptId,
      doctorID: '0',
      timeSlotID: selectedTimeSlotId || (timeSlotsList.length > 0 ? timeSlotsList[0]?.TimeSlotID?.toString() : '1'),
    })
  }

  // 1-Hour Range options for Dropdown UI
  const hourRangeOptions = hourRanges.map((range) => ({
    value: range.label,
    label: range.label,
  }))

  // Currently displayed 10-minute slots for the selected 1-hour range
  const currentHourRange = hourRanges.find((r) => r.label === selectedHourRangeLabel) || hourRanges[0]
  const currentAvailableSlots = currentHourRange ? currentHourRange.slots : timeSlotsList

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
            {/* Appointment Date - Disabled today, past dates, Sundays, and configured disabled days */}
            <div>
              <FieldLabel required>Appointment Date</FieldLabel>
              <DateField
                value={dateValue}
                onChange={handleDateSelect}
                placeholder="Select date"
                defaultLabel="Select date"
                fromMonth={tomorrow}
                toMonth={maxDate}
                disabled={(date) => {
                  if (date < tomorrow || date > maxDate) return true
                  return !isAppointmentDayEnabled(date)
                }}
              />
              {(bookErrors.date || localErrors.date) && (
                <p className="text-xs text-rose-600 mt-1">{bookErrors.date || localErrors.date}</p>
              )}
            </div>

            {/* Department - Auto-selected First Available & Disabled / Read-only */}
            <div>
              <FieldLabel required>Department</FieldLabel>
              <div className="relative">
                {isLoadingDepartments ? (
                  <DropdownSkeleton />
                ) : (
                  <TextField
                    value={firstDeptName}
                    disabled={true}
                    placeholder="Department"
                  />
                )}
              </div>
              {(bookErrors.department || localErrors.department) && (
                <p className="text-xs text-rose-600 mt-1">{bookErrors.department || localErrors.department}</p>
              )}
            </div>

            {/* 1-Hour Range Dropdown with Skeleton */}
            <div>
              <FieldLabel required>Time Slot</FieldLabel>
              <div className="relative">
                {isLoadingTimeSlots ? (
                  <DropdownSkeleton />
                ) : (
                  <SelectField
                    options={hourRangeOptions}
                    placeholder="Select Time Slot"
                    value={selectedHourRangeLabel}
                    onChange={handleHourRangeChange}
                    disabled={isLoadingTimeSlots}
                  />
                )}
                {isLoadingTimeSlots && (
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

          {/* Time Slot Grid Selection: Render ONLY when a Time Slot hour range has been selected */}
          {selectedHourRangeLabel && (
            <div className="space-y-3 pt-6 mt-6 border-t border-slate-200 dark:border-slate-800 animate-in fade-in-50 duration-300">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <FieldLabel required>Available Time Slots</FieldLabel>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-800">
                  {selectedHourRangeLabel}
                </span>
              </div>

              {isLoadingTimeSlots ? (
                <TimeSlotsSkeleton />
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                    {currentAvailableSlots.map((slot) => {
                      const isSelected =
                        selectedTimeSlotId === String(slot.TimeSlotID) || selectedSlot === slot.Timeslot
                      return (
                        <button
                          key={slot.TimeSlotID}
                          type="button"
                          onClick={() => handleTimeSlotChange(String(slot.TimeSlotID))}
                          className={`
                            px-3 py-2.5 text-center text-xs font-semibold rounded-lg border-2 
                            transition-all duration-200 cursor-pointer
                            ${isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100 dark:shadow-blue-900/30 scale-105'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800'
                            }
                          `}
                        >
                          {slot.Timeslot}
                        </button>
                      )
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <span className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <span className="w-3.5 h-3.5 rounded border-2 border-slate-300 bg-white inline-block" />
                      Available
                    </span>
                    <span className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <span className="w-3.5 h-3.5 rounded bg-blue-600 border-2 border-blue-600 inline-block" />
                      Selected
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex justify-end items-center gap-3 border-t border-slate-200 dark:border-slate-800 px-4 sm:px-6 md:px-8 py-4">
          <Button
            onClick={validateAndConfirm}
            disabled={isConfirming || isLoadingTimeSlots}
            className="w-full sm:w-auto text-white cursor-pointer font-semibold px-6 py-2.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'var(--blue-btn)', borderRadius: '4px' }}
          >
            {isConfirming ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Confirming Appointment...</span>
              </>
            ) : (
              <>
                <CalendarCheck className="w-4 h-4" />
                <span>Confirmation Appointment</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}