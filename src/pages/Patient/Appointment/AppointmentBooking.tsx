import React, { useState } from 'react'
import { CalendarPlus, CalendarCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FieldLabel, DateField, SelectField } from '@/components/FormPrimitives'
import { DOCTORS, UNIT_SLOTS, UNIT_BOOKED } from '@/constants/patient.constants'

interface AppointmentBookingProps {
  bookDate: string
  setBookDate: (v: string) => void
  bookDoctor: string
  setBookDoctor: (v: string) => void
  bookUnit: string
  setBookUnit: (v: string) => void
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

export const AppointmentBooking: React.FC<AppointmentBookingProps> = ({
  bookDate,
  setBookDate,
  bookDoctor,
  setBookDoctor,
  bookUnit,
  setBookUnit,
  selectedSlot,
  setSelectedSlot,
  bookErrors,
  onConfirm,
}) => {
  const dateValue = bookDate ? new Date(bookDate) : undefined
  const [bookDepartment, setBookDepartment] = useState<string>('')

  // Disable past dates (only allow current date & future dates)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      setBookDate(`${year}-${month}-${day}`)
    } else {
      setBookDate('')
    }
  }

  // Get available slots for selected unit
  const availableSlots = bookUnit ? UNIT_SLOTS[bookUnit] || [] : []
  const bookedSlots = bookUnit ? UNIT_BOOKED[bookUnit] || [] : []

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

  return (
    <div className="p-4 sm:p-6">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">
            {/* Appointment Date */}
            <div>
              <FieldLabel required>Appointment Date</FieldLabel>
              <DateField
                value={dateValue}
                onChange={handleDateSelect}
                placeholder="Select date"
                defaultLabel="Select date"
                disabled={{ before: today }}
              />
              {bookErrors.date && <p className="text-xs text-rose-600 mt-1">{bookErrors.date}</p>}
            </div>

            {/* Department - Fixed with proper state */}
            <div>
              <FieldLabel required>Department</FieldLabel>
              <SelectField
                options={DEPARTMENTS}
                placeholder="Select department"
                value={bookDepartment}
                onChange={setBookDepartment}
              />
              {bookErrors.department && <p className="text-xs text-rose-600 mt-1">{bookErrors.department}</p>}
            </div>

            {/* Select Doctor */}
            <div>
              <FieldLabel required>Select Doctor</FieldLabel>
              <SelectField
                options={DOCTORS}
                placeholder="Choose a doctor"
                value={bookDoctor}
                onChange={setBookDoctor}
              />
              {bookErrors.doctor && <p className="text-xs text-rose-600 mt-1">{bookErrors.doctor}</p>}
            </div>

            {/* Unit */}
            <div>
              <FieldLabel required>Unit</FieldLabel>
              <SelectField
                options={['Unit 1', 'Unit 2', 'Unit 3', 'Unit 4']}
                placeholder="Choose a unit"
                value={bookUnit}
                onChange={(v) => {
                  setBookUnit(v)
                  setSelectedSlot('')
                }}
              />
              {bookErrors.unit && <p className="text-xs text-rose-600 mt-1">{bookErrors.unit}</p>}
            </div>
          </div>

          {/* Time Slots */}
          {bookUnit && (
            <div className="space-y-3 pt-6 mt-6 border-t border-slate-200 dark:border-slate-800">
              <FieldLabel required>Available Time Slots</FieldLabel>

              {availableSlots.length > 0 ? (
                <>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
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
                          onClick={() => !isDisabled && setSelectedSlot(slot)}
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

                  {bookErrors.slot && <p className="text-xs text-rose-600 mt-1">{bookErrors.slot}</p>}
                </>
              ) : (
                <p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                  No time slots available for this unit. Please select a different unit.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex justify-end items-center gap-3 border-t border-slate-200 dark:border-slate-800 px-6 sm:px-8 py-4">
          <Button
            onClick={onConfirm}
            className="text-white cursor-pointer font-semibold px-6 flex items-center gap-2"
            style={{ background: 'var(--blue-btn)' }}
          >
            <CalendarCheck className="w-4 h-4" />
            Confirm Appointment
          </Button>
        </div>
      </div>
    </div>
  )
}