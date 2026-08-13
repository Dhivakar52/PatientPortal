import React from 'react'
import { Button } from '@/components/ui/button'
import { FieldLabel, DateField } from '@/components/FormPrimitives'
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

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <h3 className="text-lg font-bold text-white">Book Appointment</h3>
        <p className="text-sm text-blue-100 mt-0.5">Schedule your appointment with ease</p>
      </div>

      {/* Form Body */}
      <div className="p-6 space-y-5">
        {/* Appointment Date */}
        <div>
          <FieldLabel required>Appointment Date</FieldLabel>
          <DateField
            value={dateValue}
            onChange={handleDateSelect}
            placeholder="Select date"
            defaultLabel="Select date"
          />
          {bookErrors.date && <p className="text-xs text-rose-600 mt-1">{bookErrors.date}</p>}
        </div>

        {/* Department - Readonly */}
        <div>
          <FieldLabel>Department</FieldLabel>
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium">
            Gynecology
          </div>
        </div>

        {/* Select Doctor */}
        <div>
          <FieldLabel required>Select Doctor</FieldLabel>
          <select
            value={bookDoctor}
            onChange={(e) => setBookDoctor(e.target.value)}
            className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 transition-all"
          >
            <option value="">Choose a doctor</option>
            {DOCTORS.map((doc) => (
              <option key={doc} value={doc}>
                {doc}
              </option>
            ))}
          </select>
          {bookErrors.doctor && <p className="text-xs text-rose-600 mt-1">{bookErrors.doctor}</p>}
        </div>

        {/* Unit */}
        <div>
          <FieldLabel required>Unit</FieldLabel>
          <select
            value={bookUnit}
            onChange={(e) => {
              setBookUnit(e.target.value)
              setSelectedSlot('')
            }}
            className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 transition-all"
          >
            <option value="">Choose a unit</option>
            <option value="Unit 1">Unit 1</option>
            <option value="Unit 2">Unit 2</option>
            <option value="Unit 3">Unit 3</option>
            <option value="Unit 4">Unit 4</option>
          </select>
          {bookErrors.unit && <p className="text-xs text-rose-600 mt-1">{bookErrors.unit}</p>}
        </div>

        {/* Time Slots */}
        {bookUnit && (
          <div className="space-y-3 pt-2">
            <FieldLabel required>Available Time Slots</FieldLabel>

            {/* Time Slots Grid */}
            {availableSlots.length > 0 ? (
              <>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {availableSlots.map((slot) => {
                    const isBooked = bookedSlots.includes(slot)
                    const isSelected = selectedSlot === slot
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={isBooked}
                        onClick={() => !isBooked && setSelectedSlot(slot)}
                        className={`
                          px-3 py-2.5 text-center text-sm font-medium rounded-lg border-2 
                          transition-all duration-200
                          ${isBooked
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 line-through cursor-not-allowed border-slate-200 dark:border-slate-700 opacity-70'
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
                    Booked/Full
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

        {/* Confirm Button */}
        <Button
          onClick={onConfirm}
          className="w-full text-white font-semibold py-2.5 mt-2 rounded-lg transition-all hover:shadow-lg"
          style={{ background: 'var(--blue-btn)' }}
        >
          Confirm Appointment
        </Button>
      </div>
    </div>
  )
}