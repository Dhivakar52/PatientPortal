import { useState, useEffect } from 'react'
import { type Appointment, type Patient } from '@/types/patient.types'
import { DOCTORS } from '@/constants/patient.constants'
import { genApptNo } from '@/utils/patient.utils'
import { saveAppointment, generateOtp, cancelAppointment, fetchAppointments, type SaveAppointmentRequest } from '@/services/apiService'
import { toast } from '@/components/ui/toast'
import { todayStr } from '@/utils/patient.utils'
import { queryClient } from '@/lib/queryClient'
import { useAuthStore } from '@/stores/authStore'
import { appointmentsQueryKeys } from './queries/useAppointmentsQuery'
import { dashboardQueryKeys } from './queries/useDashboardQuery'

export function useAppointmentBooking(currentPatient: Patient | null) {
  const [appointmentsDB, setAppointmentsDB] = useState<Record<string, Appointment[]>>(() => {
    try {
      const saved = localStorage.getItem('srm_patient_appointments_db')
      if (saved) {
        const parsed = JSON.parse(saved)
        // Purge mock dummy patient p1 if previously stored
        if (parsed['p1']) {
          delete parsed['p1']
          localStorage.setItem('srm_patient_appointments_db', JSON.stringify(parsed))
        }
        return parsed
      }
      return {}
    } catch {
      return {}
    }
  })

  // Re-fetch patient appointments helper
  const refreshAppointments = async (patientId?: number) => {
    const pId = patientId || (currentPatient?.PatientID ? Number(currentPatient.PatientID) : (currentPatient?.id ? Number(String(currentPatient.id).replace(/\D/g, '')) : undefined))
    if (!pId) return []
    try {
      const res = await fetchAppointments({
        PatientID: pId,
        pageNo: 1,
        recordCount: 50,
      })
      if (Array.isArray(res)) {
        const mapped: Appointment[] = res.map((item: Record<string, unknown>, idx: number) => {
          const apptStatus = String(item.AppointmentStatus || item.Status || item.status || 'Scheduled')
          const apptNo = item.AppointmentNo && String(item.AppointmentNo).trim() !== '' ? String(item.AppointmentNo) : `APT-${item.AppointmentID || idx + 1}`
          const apptDate = String(item.AppointmentDate || item.date || item.Date || todayStr())
          const deptName = String(item.DeptName || item.Department || item.DepartmentName || item.department || 'General')
          const rawDoctor = String(item.DoctorName || item.Doctor_Name || item.doctor || '')
          const cleanDoctor = (rawDoctor === '--Select--' || !rawDoctor.trim() || item.DoctorID === 0) ? `${deptName} Specialist` : rawDoctor
          const timeSlot = String(item.TimeSlot || item.Timeslot || item.timeslot || item.slot || '08:00 AM - 08:10 AM')
          const bookedOn = String(item.CreatedAt || item.BookedOn || item.bookedOn || new Date().toISOString())

          return {
            AppointmentID: Number(item.AppointmentID || idx + 1),
            PatientID: Number(item.PatientID || pId),
            PatientName: String(item.PatientName || ''),
            AppointmentStatus: apptStatus,
            AppointmentDate: apptDate,
            AppointmentType: String(item.AppointmentType || 'Online'),
            DeptID: Number(item.DeptID || 0),
            DeptName: deptName,
            Department: deptName,
            department: deptName,
            DoctorID: Number(item.DoctorID || 0),
            DoctorName: cleanDoctor,
            Doctor_Name: cleanDoctor,
            doctor: cleanDoctor,
            TimeSlotID: Number(item.TimeSlotID || 1),
            TimeSlot: timeSlot,
            Timeslot: timeSlot,
            slot: timeSlot,
            UnitID: Number(item.UnitID || 0),
            Unit: String(item.Unit || item.unit || 'Unit 1'),
            unit: String(item.Unit || item.unit || 'Unit 1'),
            StatusID: Number(item.StatusID || 0),
            Status: apptStatus,
            status: apptStatus,
            AppointmentNo: apptNo,
            apptNo: apptNo,
            bookedOn: bookedOn,
            BookedOn: bookedOn,
            date: apptDate,
            room: String(item.Room || item.room || 'OPD-101'),
          }
        })
        const patientKey = String(pId)
        setAppointmentsDB((prev) => ({
          ...prev,
          [patientKey]: mapped,
        }))
        return mapped
      }
    } catch (err) {
      console.error('Failed to refresh appointments:', err)
    }
    return []
  }

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
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('1')
  const [selectedDoctorId, setSelectedDoctorId] = useState('')
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState('')
  const [bookErrors, setBookErrors] = useState<Record<string, string>>({})
  const [isConfirming, setIsConfirming] = useState(false)

  // Modals State
  const [showBookOtpModal, setShowBookOtpModal] = useState(false)
  const [bookOtpInput, setBookOtpInput] = useState('')
  const [bookOtpErr, setBookOtpErr] = useState('')

  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [lastBookedAppt, setLastBookedAppt] = useState<Appointment | null>(null)

  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [selectedReceiptAppt, setSelectedReceiptAppt] = useState<Appointment | null>(null)

  const handleConfirmBookingClick = async (bookingData?: {
    deptID: string
    doctorID: string
    timeSlotID: string
  }) => {
    if (isConfirming) return

    const deptID = bookingData?.deptID || selectedDepartmentId || '1'
    const doctorID = bookingData?.doctorID || selectedDoctorId || '0'
    const timeSlotID = bookingData?.timeSlotID || selectedTimeSlotId

    const errs: Record<string, string> = {}
    if (!currentPatient?.id && !currentPatient?.PatientID) errs.patient = 'No active patient selected.'
    if (!bookDate) errs.date = 'Please select an appointment date.'
    if (!deptID) errs.department = 'Please select a department.'
    // Doctor field is commented out in UI
    // if (!doctorID) errs.doctor = 'Please select a doctor.'
    if (!timeSlotID && !selectedSlot) errs.slot = 'Please select a time slot.'

    if (Object.keys(errs).length > 0) {
      setBookErrors(errs)
      return
    }

    setBookErrors({})
    setIsConfirming(true)

    const numericPatientId = currentPatient?.PatientID
      ? Number(currentPatient.PatientID)
      : (currentPatient?.id ? Number(String(currentPatient.id).replace(/\D/g, '')) || 1 : 1)
    const storedUserId = localStorage.getItem('userID') || localStorage.getItem('srm_patient_user_id')
    const userId = storedUserId ? Number(storedUserId) : 0

    const payload: SaveAppointmentRequest = {
      patientID: numericPatientId,
      appointmentDate: bookDate,
      deptID: Number(deptID),
      doctorID: Number(doctorID),
      timeSlotID: Number(timeSlotID) || 1,
      unitID: 0,
      typeID: 4,  // 4 . Online, 5. Phone , 6. Reception.
      statusID: 0,
      createdBy: userId,
      updatedBy: userId,
    }

    try {
      // 1. Call POST /api/saveappointment
      await saveAppointment(payload)

      // 2. Immediately call POST /api/generateotp on success
      try {
        const targetMobile = currentPatient?.mobile || localStorage.getItem('srm_patient_current_mobile') || ''
        await generateOtp(targetMobile, numericPatientId)
        setBookOtpInput('')
        setBookOtpErr('')
        setShowBookOtpModal(true)
      } catch (otpErr: unknown) {
        const error = otpErr as { response?: { data?: { message?: string; Result?: string } | string }; message?: string }
        const resData = error.response?.data
        let message = 'Appointment saved, but failed to generate OTP. Please click Resend OTP.'
        if (typeof resData === 'string' && resData.trim()) {
          message = resData
        } else if (resData && typeof resData === 'object') {
          message = resData.message || resData.Result || message
        } else if (error.message) {
          message = error.message
        }
        toast.error(message)
        setBookOtpErr(message)
        setShowBookOtpModal(true)
      }
    } catch (saveErr: unknown) {
      const error = saveErr as { response?: { data?: { message?: string; Result?: string } | string }; message?: string }
      const resData = error.response?.data
      let message = 'Failed to save appointment. Please try again.'
      if (typeof resData === 'string' && resData.trim()) {
        message = resData
      } else if (resData && typeof resData === 'object') {
        message = resData.message || resData.Result || message
      } else if (error.message) {
        message = error.message
      }
      toast.error(message)
      setBookErrors((prev) => ({ ...prev, form: message }))
    } finally {
      setIsConfirming(false)
    }
  }

  const handleVerifyBookOtp = (onSuccess: () => void) => {
    if (bookOtpInput.length !== 4) {
      setBookOtpErr('Enter the 4-digit OTP to continue.')
      return
    }
    setBookOtpErr('')
    setShowBookOtpModal(false)

    if (!currentPatient) return

    const selectedDoctorName = bookDoctor || 'Dr. Madhumitha'
    const roomIndex = DOCTORS.indexOf(selectedDoctorName) + 1
    const newAppt: Appointment = {
      apptNo: genApptNo(),
      date: bookDate,
      doctor: selectedDoctorName,
      department: 'Gynecology',
      slot: selectedSlot || '08:00 AM-08:10 AM',
      unit: bookUnit || 'Unit 1',
      bookedOn: new Date().toISOString(),
      room: `GYN-${200 + (roomIndex > 0 ? roomIndex : 1)}`,
      status: 'Scheduled',
    }

    const numericPatientId = currentPatient.PatientID
      ? Number(currentPatient.PatientID)
      : (currentPatient.id ? Number(String(currentPatient.id).replace(/\D/g, '')) || 0 : 0)

    const patientKey = String(numericPatientId || 'current')
    setAppointmentsDB((prev) => ({
      ...prev,
      [patientKey]: [...(prev[patientKey] || []), newAppt],
    }))

    // Immediately re-fetch real appointments from backend API & invalidate query cache
    if (numericPatientId > 0) {
      refreshAppointments(numericPatientId)
      const userId = useAuthStore.getState().userId
      queryClient.invalidateQueries({ queryKey: appointmentsQueryKeys.user(userId) })
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.user(userId) })
      queryClient.invalidateQueries({ queryKey: ['appointments', userId, numericPatientId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', userId, numericPatientId] })
    }

    setLastBookedAppt(newAppt)
    setShowSuccessModal(true)
    onSuccess()
  }

  const handleResendBookOtp = async () => {
    if (!currentPatient) return
    const numericPatientId = currentPatient.PatientID || (currentPatient.id
      ? Number(String(currentPatient.id).replace(/\D/g, '')) || 1
      : 1)
    const targetMobile = currentPatient.PhoneNo || currentPatient.mobile || localStorage.getItem('srm_patient_current_mobile') || ''

    try {
      await generateOtp(targetMobile, numericPatientId)
      setBookOtpErr('')
      toast.success('OTP resent successfully!')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; Result?: string } | string }; message?: string }
      const resData = error.response?.data
      let message = 'Failed to resend OTP.'
      if (typeof resData === 'string' && resData.trim()) {
        message = resData
      } else if (resData && typeof resData === 'object') {
        message = resData.message || resData.Result || message
      } else if (error.message) {
        message = error.message
      }
      setBookOtpErr(message)
    }
  }

  const handleSuccessClose = (onClose: () => void) => {
    setShowSuccessModal(false)
    setBookDate('')
    setBookDoctor('')
    setBookUnit('')
    setSelectedSlot('')
    setSelectedDoctorId('')
    setSelectedTimeSlotId('')
    onClose()
  }

  const handleViewReceipt = (appt: Appointment) => {
    setSelectedReceiptAppt(appt)
    setShowReceiptModal(true)
  }

  const handleCancelAppointment = async (apptToCancel: Appointment) => {
    const appointmentId = Number(
      apptToCancel.AppointmentID ??
      (apptToCancel as unknown as Record<string, unknown>).appointmentId ??
      (apptToCancel as unknown as Record<string, unknown>).id ??
      (typeof apptToCancel.apptNo === 'string' && apptToCancel.apptNo.startsWith('APT-')
        ? Number(apptToCancel.apptNo.replace(/\D/g, '')) || 0
        : Number(apptToCancel.apptNo) || 0)
    )

    const patientId = Number(
      apptToCancel.PatientID ??
      (apptToCancel as unknown as Record<string, unknown>).patientId ??
      currentPatient?.PatientID ??
      (currentPatient?.id ? Number(String(currentPatient.id).replace(/\D/g, '')) || 0 : 0)
    )

    if (!appointmentId || !patientId) {
      toast.error('Cannot cancel: Invalid AppointmentID or PatientID.')
      return
    }

    try {
      console.log(`🗑️ Cancelling appointment: DELETE /api/cancelappointment/${appointmentId}?updatedBy=${patientId}`)
      await cancelAppointment(appointmentId, patientId)

      const patientKey = String(patientId)
      setAppointmentsDB((prev) => {
        const list = prev[patientKey] || []
        const updatedList = list.map((item: Appointment) =>
          Number(item.AppointmentID) === appointmentId || item.apptNo === apptToCancel.apptNo
            ? { ...item, status: 'Cancelled', Status: 'Cancelled', AppointmentStatus: 'Cancelled' }
            : item
        )
        return {
          ...prev,
          [patientKey]: updatedList,
        }
      })

      // Invalidate TanStack Query user-specific cache
      const userId = useAuthStore.getState().userId
      queryClient.invalidateQueries({ queryKey: appointmentsQueryKeys.user(userId) })
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.user(userId) })
      if (patientId) {
        queryClient.invalidateQueries({ queryKey: ['appointments', userId, patientId] })
        queryClient.invalidateQueries({ queryKey: ['dashboard', userId, patientId] })
      }

      toast.success(`Appointment ${apptToCancel.apptNo || `#${appointmentId}`} cancelled successfully!`)
    } catch (err: unknown) {
      console.error('Cancel appointment API error:', err)
      const error = err as { response?: { data?: { message?: string; Result?: string } | string }; message?: string }
      const resData = error.response?.data
      let message = 'Failed to cancel appointment. Please try again.'
      if (typeof resData === 'string' && resData.trim()) {
        message = resData
      } else if (resData && typeof resData === 'object') {
        message = resData.message || resData.Result || message
      } else if (error.message) {
        message = error.message
      }
      toast.error(message)
    }
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
    selectedDepartmentId,
    setSelectedDepartmentId,
    selectedDoctorId,
    setSelectedDoctorId,
    selectedTimeSlotId,
    setSelectedTimeSlotId,
    bookErrors,
    isConfirming,

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
    refreshAppointments,
  }
}

