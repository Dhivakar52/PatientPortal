import { useState, useEffect } from 'react'
import { type Appointment, type Patient } from '@/types/patient.types'
import { INITIAL_APPOINTMENTS, DOCTORS } from '@/constants/patient.constants'
import { genOtp, genApptNo } from '@/utils/patient.utils'
import { toast } from 'sonner'

export function useAppointmentBooking(currentPatient: Patient | null) {
  const [appointmentsDB, setAppointmentsDB] = useState<Record<string, Appointment[]>>(() => {
    try {
      const saved = localStorage.getItem('srm_patient_appointments_db')
      return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS
    } catch {
      return INITIAL_APPOINTMENTS
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('srm_patient_appointments_db', JSON.stringify(appointmentsDB))
    } catch (e) {
      console.error(e)
    }
  }, [appointmentsDB])

  // Form State
  const [bookDate, setBookDate] = useState('')
  const [bookDoctor, setBookDoctor] = useState('')
  const [bookUnit, setBookUnit] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [bookErrors, setBookErrors] = useState<Record<string, string>>({})

  // Modals State
  const [showBookOtpModal, setShowBookOtpModal] = useState(false)
  const [generatedBookOtp, setGeneratedBookOtp] = useState('')
  const [bookOtpInput, setBookOtpInput] = useState('')
  const [bookOtpErr, setBookOtpErr] = useState('')

  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [lastBookedAppt, setLastBookedAppt] = useState<Appointment | null>(null)

  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [selectedReceiptAppt, setSelectedReceiptAppt] = useState<Appointment | null>(null)

  const handleConfirmBookingClick = () => {
    const errs: Record<string, string> = {}
    if (!bookDate) errs.date = 'Please select an appointment date.'
    if (!bookDoctor) errs.doctor = 'Please select a doctor.'
    if (!bookUnit) errs.unit = 'Please select a unit.'
    if (!selectedSlot) errs.slot = 'Please select a time slot.'

    if (Object.keys(errs).length > 0) {
      setBookErrors(errs)
      return
    }
    setBookErrors({})
    const otp = genOtp()
    setGeneratedBookOtp(otp)
    setBookOtpInput(otp)
    setBookOtpErr('')
    setShowBookOtpModal(true)
  }

  const handleVerifyBookOtp = (onSuccess: () => void) => {
    if (bookOtpInput.length !== 4) {
      setBookOtpErr('Enter the 4-digit OTP to continue.')
      return
    }
    if (bookOtpInput !== generatedBookOtp) {
      setBookOtpErr('Incorrect OTP. Please try again.')
      setBookOtpInput('')
      return
    }
    setBookOtpErr('')
    setShowBookOtpModal(false)

    if (!currentPatient) return

    const roomIndex = DOCTORS.indexOf(bookDoctor) + 1
    const newAppt: Appointment = {
      apptNo: genApptNo(),
      date: bookDate,
      doctor: bookDoctor,
      department: 'Gynecology',
      slot: selectedSlot,
      unit: bookUnit,
      bookedOn: new Date().toISOString(),
      room: `GYN-${200 + (roomIndex > 0 ? roomIndex : 1)}`,
      status: 'Scheduled',
    }

    setAppointmentsDB((prev) => ({
      ...prev,
      [currentPatient.id]: [...(prev[currentPatient.id] || []), newAppt],
    }))

    setLastBookedAppt(newAppt)
    setShowSuccessModal(true)
    onSuccess()
  }

  const handleResendBookOtp = () => {
    const otp = genOtp()
    setGeneratedBookOtp(otp)
    setBookOtpInput(otp)
    setBookOtpErr('')
  }

  const handleSuccessClose = (onClose: () => void) => {
    setShowSuccessModal(false)
    setBookDate('')
    setBookDoctor('')
    setBookUnit('')
    setSelectedSlot('')
    onClose()
  }

  const handleViewReceipt = (appt: Appointment) => {
    setSelectedReceiptAppt(appt)
    setShowReceiptModal(true)
  }

  const handleCancelAppointment = (apptToCancel: Appointment) => {
    if (!currentPatient) return

    setAppointmentsDB((prev) => {
      const list = prev[currentPatient.id] || []
      const updatedList = list.map((item) =>
        item.apptNo === apptToCancel.apptNo
          ? { ...item, status: 'Cancelled' }
          : item
      )
      return {
        ...prev,
        [currentPatient.id]: updatedList,
      }
    })

    toast.success(`Appointment ${apptToCancel.apptNo || ''} cancelled successfully!`)
  }

  return {
    appointmentsDB,
    bookDate,
    setBookDate,
    bookDoctor,
    setBookDoctor,
    bookUnit,
    setBookUnit,
    selectedSlot,
    setSelectedSlot,
    bookErrors,

    showBookOtpModal,
    setShowBookOtpModal,
    bookOtpInput,
    setBookOtpInput,
    bookOtpErr,

    showSuccessModal,
    lastBookedAppt,

    showReceiptModal,
    setShowReceiptModal,
    selectedReceiptAppt,

    handleConfirmBookingClick,
    handleVerifyBookOtp,
    handleResendBookOtp,
    handleSuccessClose,
    handleViewReceipt,
    handleCancelAppointment,
  }
}
