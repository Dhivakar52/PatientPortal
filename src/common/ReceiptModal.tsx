import React from 'react'
import { type Appointment, type Patient } from '@/types/patient.types'
import { capitalizeName, calcAge, formatDateTime, formatDateFull, todayStr } from '@/utils/patient.utils'

interface ReceiptModalProps {
  isOpen: boolean
  onClose: () => void
  appt: Appointment | null
  patient: Patient | null
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  appt,
  patient,
}) => {
  if (!isOpen || !appt || !patient) return null

  const today = todayStr()

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white text-black border-2 border-black max-w-2xl w-full p-7 shadow-2xl relative font-mono text-xs leading-relaxed my-8">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 font-sans text-base font-bold text-black hover:opacity-70 cursor-pointer"
        >
          ✕
        </button>

        <div className="text-center font-bold text-sm tracking-tight uppercase">
          SRM Medical College Hospital and Research Centre
        </div>
        <div className="text-center text-xs mt-0.5">Doctor Appointment Receipt</div>
        <div className="border-t-2 border-black my-3" />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-1">
          <div>
            <b>Patient Name :</b> {capitalizeName(patient.name)}
          </div>
          <div>
            <b>Gender :</b> {patient.gender}
          </div>
          <div>
            <b>Age :</b> {calcAge(patient.dob) || '—'} Yrs
          </div>
          <div>
            <b>Mobile :</b> +91 {patient.mobile}
          </div>
        </div>

        <div className="border-t-2 border-black my-3" />
        <div className="font-bold uppercase tracking-wider mb-1">Appointment Information</div>
        <div className="border-t border-black mb-3" />

        <div className="space-y-1">
          <div>
            <b>Appointment No :</b> {appt.apptNo}
          </div>
          <div>
            <b>Status :</b> {appt.date < today ? 'Visited' : 'Upcoming'}
          </div>
          <div>
            <b>Booked On :</b> {formatDateTime(appt.bookedOn)}
          </div>
          <div>
            <b>Appointment Date :</b> {formatDateFull(appt.date)}
          </div>
          <div>
            <b>Appointment Time :</b> {appt.slot}
          </div>
        </div>

        <div className="border-t-2 border-black my-3" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <b>Doctor Name :</b> {appt.doctor}
          </div>
          <div>
            <b>Department :</b> {appt.department}
          </div>
          <div>
            <b>Room No :</b> {appt.room}
          </div>
        </div>
      </div>
    </div>
  )
}
