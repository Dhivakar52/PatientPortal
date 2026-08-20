import React, { useState } from 'react'
import { CalendarPlus, CalendarCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FieldLabel, DateField, SelectField } from '@/components/FormPrimitives'

interface AppointmentBookingProps {
  bookDate: string
  setBookDate: (v: string) => void
  bookDoctor?: string
  setBookDoctor?: (v: string) => void
  bookUnit?: string
  setBookUnit?: (v: string) => void
  selectedSlot: string
  setSelectedSlot: (v: string) => void
  bookErrors: Record<string, string>
  onConfirm: () => void
}

// Department options
const DEPARTMENTS = [
  'Gynecology',
  'Cardiology',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'Dermatology',
  'Ophthalmology',
  'ENT',
  'General Medicine',
  'General Surgery'
]

// Hourly Time Ranges
const TIME_RANGES = [
  '08:00 AM - 09:00 AM',
  '09:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 01:00 PM',
  '01:00 PM - 02:00 PM',
  '02:00 PM - 03:00 PM',
  '03:00 PM - 04:00 PM',
  '04:00 PM - 05:00 PM',
]

const TIME_RANGE_SLOTS: Record<string, string[]> = {
  '08:00 AM - 09:00 AM': ['08:00-08:15', '08:15-08:30', '08:30-08:45', '08:45-09:00'],
  '09:00 AM - 10:00 AM': ['09:00-09:15', '09:15-09:30', '09:30-09:45', '09:45-10:00'],
  '10:00 AM - 11:00 AM': ['10:00-10:15', '10:15-10:30', '10:30-10:45', '10:45-11:00'],
  '11:00 AM - 12:00 PM': ['11:00-11:15', '11:15-11:30', '11:30-11:45', '11:45-12:00'],
  '12:00 PM - 01:00 PM': ['12:00-12:15', '12:15-12:30', '12:30-12:45', '12:45-13:00'],
  '01:00 PM - 02:00 PM': ['13:00-13:15', '13:15-13:30', '13:30-13:45', '13:45-14:00'],
  '02:00 PM - 03:00 PM': ['14:00-14:15', '14:15-14:30', '14:30-14:45', '14:45-15:00'],
  '03:00 PM - 04:00 PM': ['15:00-15:15', '15:15-15:30', '15:30-15:45', '15:45-16:00'],
  '04:00 PM - 05:00 PM': ['16:00-16:15', '16:15-16:30', '16:30-16:45', '16:45-17:00'],
}

const BOOKED_SLOTS_MOCK: string[] = ['08:30-08:45', '10:15-10:30', '14:30-14:45']

export const AppointmentBooking: React.FC<AppointmentBookingProps> = ({
  bookDate,
  setBookDate,
  bookDoctor: _bookDoctor,
  setBookDoctor: _setBookDoctor,
  bookUnit: _bookUnit,
  setBookUnit: _setBookUnit,
  selectedSlot,
  setSelectedSlot,
  bookErrors,
  onConfirm,
}) => {
  const dateValue = bookDate ? new Date(bookDate) : undefined
  const [bookDepartment, setBookDepartment] = useState<string>('Gynecology')
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('')
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({})

  // Disable past dates (only allow current date & future dates)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Calculate date 60 days from today
  const maxDate = new Date()
  maxDate.setDate(maxDate.getDate() + 60)
  maxDate.setHours(0, 0, 0, 0)

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      setBookDate(`${year}-${month}-${day}`)
      setLocalErrors(prev => ({ ...prev, date: '' }))
    } else {
      setBookDate('')
      setLocalErrors(prev => ({ ...prev, date: 'Please select a date' }))
    }
    setSelectedSlot('')
  }

  // Get available sub-slots for the selected time range
  const availableSlots = selectedTimeRange ? TIME_RANGE_SLOTS[selectedTimeRange] || [] : []
  const bookedSlots = BOOKED_SLOTS_MOCK

  // Check if time slot is in the past for today's selected date
  const isSlotExpired = (slot: string): boolean => {
    if (!bookDate) return false
    const now = new Date()
    const selectedDate = new Date(bookDate)

    const isToday =
      selectedDate.getFullYear() === now.getFullYear() &&
      selectedDate.getMonth() === now.getMonth() &&
      selectedDate.getDate() === now.getDate()

    if (!isToday) return false

    const startTimeStr = slot.split('-')[0]
    const [slotHour, slotMin] = startTimeStr.split(':').map(Number)

    const slotDateTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      slotHour,
      slotMin,
      0
    )

    return slotDateTime <= now
  }

  const validateAndConfirm = () => {
    const errors: Record<string, string> = {}

    if (!bookDate) {
      errors.date = 'Please select an appointment date'
    }

    if (!selectedTimeRange) {
      errors.timeRange = 'Please select a time range'
    }

    if (!selectedSlot) {
      errors.slot = 'Please select a time slot'
    }

    if (selectedSlot && bookedSlots.includes(selectedSlot)) {
      errors.slot = 'This slot is already booked'
    }

    if (selectedSlot && isSlotExpired(selectedSlot)) {
      errors.slot = 'This time slot has passed'
    }

    if (Object.keys(errors).length > 0) {
      setLocalErrors(errors)
      return
    }

    setLocalErrors({})
    onConfirm()
  }

  return (
    <div className="">
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-5">
            {/* Appointment Date */}
            <div>
              <FieldLabel required>Appointment Date</FieldLabel>
              <DateField
                value={dateValue}
                onChange={handleDateSelect}
                placeholder="Select date"
                defaultLabel="Select date"
                disabled={{
                  before: today,
                  after: maxDate
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
                options={DEPARTMENTS}
                placeholder="Select department"
                value={bookDepartment}
                onChange={setBookDepartment}
                disabled={true}
              />
              {bookErrors.department && <p className="text-xs text-rose-600 mt-1">{bookErrors.department}</p>}
            </div>

            {/* Time Slot Range Select */}
            <div>
              <FieldLabel required>Time Slot Range</FieldLabel>
              <SelectField
                options={TIME_RANGES}
                placeholder="Select a Time Range"
                value={selectedTimeRange}
                onChange={(val) => {
                  setSelectedTimeRange(val)
                  setSelectedSlot('')
                  setLocalErrors(prev => ({ ...prev, timeRange: '', slot: '' }))
                }}
              />
              {(bookErrors.timeRange || localErrors.timeRange) && (
                <p className="text-xs text-rose-600 mt-1">{bookErrors.timeRange || localErrors.timeRange}</p>
              )}
            </div>
          </div>

          {/* Time Slots - Displayed directly when Time Slot Range is selected */}
          {selectedTimeRange && (
            <div className="space-y-3 pt-6 mt-6 border-t border-slate-200 dark:border-slate-800">
              <FieldLabel required>
                Available Time Slots {selectedTimeRange ? `(${selectedTimeRange})` : ''}
              </FieldLabel>

              {availableSlots.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {availableSlots.map((slot) => {
                      const isBooked = bookedSlots.includes(slot)
                      const isExpired = isSlotExpired(slot)
                      const isDisabled = isBooked || isExpired
                      const isSelected = selectedSlot === slot
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => {
                            if (!isDisabled) {
                              setSelectedSlot(slot)
                              setLocalErrors(prev => ({ ...prev, slot: '' }))
                            }
                          }}
                          title={isExpired ? 'Time slot has passed' : isBooked ? 'Slot already booked' : 'Select slot'}
                          className={`
                            px-3 py-2.5 text-center text-sm font-medium rounded-lg border-2 
                            transition-all duration-200
                            ${isDisabled
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 line-through cursor-not-allowed border-slate-200 dark:border-slate-700 opacity-60'
                              : isSelected
                                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100 dark:shadow-blue-900/30 scale-105'
                                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 cursor-pointer'
                            }
                          `}
                        >
                          {slot}
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
                    <span className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <span className="w-3.5 h-3.5 rounded bg-slate-200 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-700 inline-block" />
                      Booked / Passed
                    </span>
                  </div>

                  {(bookErrors.slot || localErrors.slot) && (
                    <p className="text-xs text-rose-600 mt-1">{bookErrors.slot || localErrors.slot}</p>
                  )}
                </>
              ) : (
                <p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                  No time slots available for this time range.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex justify-end items-center gap-3 border-t border-slate-200 dark:border-slate-800 px-6 sm:px-8 py-4">
          <Button
            onClick={validateAndConfirm}
            className="text-white cursor-pointer font-semibold px-6 flex items-center gap-2"
            style={{ background: 'var(--blue-btn)', borderRadius: '4px' }}
          >
            <CalendarCheck className="w-4 h-4" />
            Confirm Appointment
          </Button>
        </div>
      </div>
    </div>
  )
}