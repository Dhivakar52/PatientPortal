import React, { useState, useEffect } from 'react'
import { CalendarPlus, CalendarCheck, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FieldLabel, DateField, SelectField } from '@/components/FormPrimitives'
import { getTimeSlots, type TimeSlot } from '@/services/apiService'

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

// Departments with IDs
const DEPARTMENTS = [
  { id: 1, name: 'Gynecology' },
  { id: 2, name: 'Cardiology' },
  { id: 3, name: 'Neurology' },
  { id: 4, name: 'Orthopedics' },
  { id: 5, name: 'Pediatrics' },
  { id: 6, name: 'Dermatology' },
  { id: 7, name: 'Ophthalmology' },
  { id: 8, name: 'ENT' },
  { id: 9, name: 'General Medicine' },
  { id: 10, name: 'General Surgery' },
  { id: 11, name: 'Pulmonary Medicine' },
]

// Skeleton Loader Component for Time Slots
const TimeSlotsSkeleton: React.FC = () => {
  const skeletonItems = Array(8).fill(null)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
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

// Skeleton Loader for Dropdown
const DropdownSkeleton: React.FC = () => {
  return (
    <div className="relative">
      <div className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 animate-pulse px-3 py-2">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
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

  // Calculate date 60 days from tomorrow
  const maxDate = new Date(tomorrow)
  maxDate.setDate(maxDate.getDate() + 60)
  maxDate.setHours(23, 59, 59, 999)

  // Initialize date with tomorrow if not already set or invalid
  const [dateValue, setDateValue] = useState<Date | undefined>(() => {
    if (bookDate) {
      const date = new Date(bookDate)
      if (!isNaN(date.getTime()) && date >= tomorrow) {
        return date
      }
    }
    return tomorrow
  })

  const [internalDeptId, setInternalDeptId] = useState<string>('')
  const [internalTimeSlotId, setInternalTimeSlotId] = useState<string>('')

  const selectedDepartmentId = parentDeptId !== undefined ? parentDeptId : internalDeptId
  const setSelectedDepartmentId = setParentDeptId || setInternalDeptId

  const selectedTimeSlotId = parentSlotId !== undefined ? parentSlotId : internalTimeSlotId
  const setSelectedTimeSlotId = setParentSlotId || setInternalTimeSlotId

  // API Data States
  const [timeSlotsList, setTimeSlotsList] = useState<TimeSlot[]>([])
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState<boolean>(true)
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({})

  // 1. Fetch Time Slots on mount with 1 second delay
  useEffect(() => {
    let isMounted = true
    setIsLoadingTimeSlots(true)

    // Add artificial delay to show skeleton (1 second)
    const delay = setTimeout(() => {
      getTimeSlots()
        .then((slots) => {
          if (isMounted) {
            if (Array.isArray(slots) && slots.length > 0) {
              setTimeSlotsList(slots)
            } else {
              // Default fallback slots
              setTimeSlotsList([
                { TotalCount: 1, TimeSlotID: 1, Timeslot: '08:00 AM-08:10 AM' },
                { TotalCount: 2, TimeSlotID: 2, Timeslot: '08:10 AM-08:20 AM' },
                { TotalCount: 3, TimeSlotID: 3, Timeslot: '08:20 AM-08:30 AM' },
                { TotalCount: 4, TimeSlotID: 4, Timeslot: '08:30 AM-08:40 AM' },
                { TotalCount: 5, TimeSlotID: 5, Timeslot: '09:00 AM-09:10 AM' },
                { TotalCount: 6, TimeSlotID: 6, Timeslot: '09:10 AM-09:20 AM' },
                { TotalCount: 7, TimeSlotID: 7, Timeslot: '10:00 AM-10:10 AM' },
                { TotalCount: 8, TimeSlotID: 8, Timeslot: '10:10 AM-10:20 AM' },
                { TotalCount: 9, TimeSlotID: 9, Timeslot: '11:00 AM-11:10 AM' },
                { TotalCount: 10, TimeSlotID: 10, Timeslot: '11:10 AM-11:20 AM' },
              ])
            }
          }
        })
        .catch((err) => {
          console.error('Failed to fetch time slots:', err)
          if (isMounted) {
            setTimeSlotsList([
              { TotalCount: 1, TimeSlotID: 1, Timeslot: '08:00 AM-08:10 AM' },
              { TotalCount: 2, TimeSlotID: 2, Timeslot: '08:10 AM-08:20 AM' },
              { TotalCount: 3, TimeSlotID: 3, Timeslot: '08:20 AM-08:30 AM' },
              { TotalCount: 4, TimeSlotID: 4, Timeslot: '08:30 AM-08:40 AM' },
              { TotalCount: 5, TimeSlotID: 5, Timeslot: '09:00 AM-09:10 AM' },
              { TotalCount: 6, TimeSlotID: 6, Timeslot: '09:10 AM-09:20 AM' },
              { TotalCount: 7, TimeSlotID: 7, Timeslot: '10:00 AM-10:10 AM' },
              { TotalCount: 8, TimeSlotID: 8, Timeslot: '10:10 AM-10:20 AM' },
            ])
          }
        })
        .finally(() => {
          if (isMounted) setIsLoadingTimeSlots(false)
        })
    }, 1000) // 1 second delay

    return () => {
      isMounted = false
      clearTimeout(delay)
    }
  }, [])

  // 2. Set default date to tomorrow on mount
  useEffect(() => {
    if (!bookDate) {
      const tomorrowDate = getTomorrowDate()
      const year = tomorrowDate.getFullYear()
      const month = String(tomorrowDate.getMonth() + 1).padStart(2, '0')
      const day = String(tomorrowDate.getDate()).padStart(2, '0')
      setBookDate(`${year}-${month}-${day}`)
    }
  }, [])

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
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

  const handleDepartmentChange = (val: string) => {
    setSelectedDepartmentId(val)
    setLocalErrors((prev) => ({ ...prev, department: '' }))
  }

  const handleTimeSlotChange = (val: string) => {
    setSelectedTimeSlotId(val)
    const slot = timeSlotsList.find((s) => String(s.TimeSlotID) === val)
    if (slot) {
      setSelectedSlot(slot.Timeslot)
    } else {
      setSelectedSlot(val)
    }
    setLocalErrors((prev) => ({ ...prev, slot: '' }))
  }

  const validateAndConfirm = () => {
    if (isConfirming) return

    const errors: Record<string, string> = {}

    if (!bookDate) {
      errors.date = 'Please select an appointment date'
    }

    if (!selectedDepartmentId) {
      errors.department = 'Please select a department'
    }

    if (!selectedTimeSlotId && !selectedSlot) {
      errors.slot = 'Please select a time slot'
    }

    if (Object.keys(errors).length > 0) {
      setLocalErrors(errors)
      return
    }

    setLocalErrors({})
    onConfirm({
      deptID: selectedDepartmentId,
      doctorID: '0',
      timeSlotID: selectedTimeSlotId || (timeSlotsList.length > 0 ? timeSlotsList[0]?.TimeSlotID?.toString() : '1'),
    })
  }

  const departmentOptions = DEPARTMENTS.map((d) => ({
    value: String(d.id),
    label: d.name,
  }))

  const timeSlotOptions = timeSlotsList.map((slot) => ({
    value: String(slot.TimeSlotID),
    label: slot.Timeslot,
  }))

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
            {/* Appointment Date - Disabled today & before tomorrow */}
            <div>
              <FieldLabel required>Appointment Date</FieldLabel>
              <DateField
                value={dateValue}
                onChange={handleDateSelect}
                placeholder="Select date"
                defaultLabel="Select date"
                disabled={{
                  before: tomorrow,
                  after: maxDate,
                }}
              />
              {(bookErrors.date || localErrors.date) && (
                <p className="text-xs text-rose-600 mt-1">{bookErrors.date || localErrors.date}</p>
              )}
            </div>

            {/* Department */}
            <div>
              <FieldLabel required>Department</FieldLabel>
              <SelectField
                options={departmentOptions}
                placeholder="Select Department"
                value={selectedDepartmentId}
                onChange={handleDepartmentChange}
              />
              {(bookErrors.department || localErrors.department) && (
                <p className="text-xs text-rose-600 mt-1">{bookErrors.department || localErrors.department}</p>
              )}
            </div>

            {/* Time Slot Dropdown with Skeleton */}
            <div>
              <FieldLabel required>Time Slot</FieldLabel>
              <div className="relative">
                {isLoadingTimeSlots ? (
                  <DropdownSkeleton />
                ) : (
                  <SelectField
                    options={timeSlotOptions}
                    placeholder="Select Time Slot"
                    value={selectedTimeSlotId}
                    onChange={handleTimeSlotChange}
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

          {/* Time Slot Grid Selection with Skeleton */}
          <div className="space-y-3 pt-6 mt-6 border-t border-slate-200 dark:border-slate-800">
            <FieldLabel required>Available Time Slots</FieldLabel>

            {isLoadingTimeSlots ? (
              <TimeSlotsSkeleton />
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                  {timeSlotsList.map((slot) => {
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
        </div>

        {/* Footer actions */}
        <div className="flex justify-end items-center gap-3 border-t border-slate-200 dark:border-slate-800 px-6 sm:px-8 py-4">
          <Button
            onClick={validateAndConfirm}
            disabled={isConfirming || isLoadingTimeSlots}
            className="text-white cursor-pointer font-semibold px-6 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'var(--blue-btn)', borderRadius: '4px' }}
          >
            {isConfirming ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Confirming Appointment...
              </>
            ) : (
              <>
                <CalendarCheck className="w-4 h-4" />
                Confirmation Appointment
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}