import { useState } from 'react'
import { type Patient, type UserRecord, type RegisterContext } from '@/types/patient.types'
import { nextPatientId, calcAge } from '@/utils/patient.utils'
import { savePatient, type RegisterPatientRequest } from '@/services/apiService'
import { toast } from '@/components/ui/toast'

interface UsePatientRegistrationProps {
  pendingMobile: string
  registerContext: RegisterContext
  setUsersDB: React.Dispatch<React.SetStateAction<Record<string, UserRecord>>>
  setCurrentMobile: (m: string) => void
  setActivePatientId: (id: string) => void
  setScreen: (s: 'login' | 'register' | 'select' | 'app') => void
}

export function usePatientRegistration({
  pendingMobile,
  registerContext,
  setUsersDB,
  setCurrentMobile,
  setActivePatientId,
  setScreen,
}: UsePatientRegistrationProps) {
  const [regName, setRegName] = useState('')
  const [regGender, setRegGender] = useState<'Male' | 'Female' | 'Other'>('Male')
  const [regDob, setRegDob] = useState('')
  const [regAddress, setRegAddress] = useState('')
  const [regCity, setRegCity] = useState('')
  const [regState, setRegState] = useState('')
  const [regPincode, setRegPincode] = useState('')
  const [regErrors, setRegErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetForm = () => {
    setRegName('')
    setRegGender('Male')
    setRegDob('')
    setRegAddress('')
    setRegCity('')
    setRegState('')
    setRegPincode('')
    setRegErrors({})
  }

  const handleRegisterSubmit = async () => {
    if (isSubmitting) return

    const errs: Record<string, string> = {}
    if (!regName.trim()) errs.name = 'Name is required.'
    if (!regDob) errs.dob = 'Date of birth is required.'
    if (!regAddress.trim()) errs.address = 'Address is required.'
    if (!regCity.trim()) errs.city = 'City is required.'
    if (!regState.trim()) errs.state = 'State is required.'
    if (!/^\d{6}$/.test(regPincode)) errs.pincode = 'Enter a valid 6-digit PIN code.'

    const targetMobile = pendingMobile || localStorage.getItem('srm_patient_pending_mobile') || ''
    if (!/^[6-9]\d{9}$/.test(targetMobile)) {
      errs.mobile = 'Enter a valid 10-digit mobile number.'
    }

    if (Object.keys(errs).length > 0) {
      setRegErrors(errs)
      return
    }

    setRegErrors({})
    setIsSubmitting(true)

    const calculatedAge = calcAge(regDob)
    const ageValue = typeof calculatedAge === 'number' ? calculatedAge : 0
    const storedUserId = localStorage.getItem('userID') || localStorage.getItem('srm_patient_user_id')
    const userId = storedUserId ? Number(storedUserId) : 0
    const genderCode = regGender === 'Male' ? 1 : regGender === 'Female' ? 2 : 3

    const payload: RegisterPatientRequest = {
      userID: userId,
      name: regName.trim(),
      gender: genderCode,
      dob: regDob,
      age: ageValue,
      mobileNo: targetMobile,
      address: regAddress.trim(),
      city: regCity.trim(),
      state: regState.trim(),
      pinCode: regPincode.trim(),
      createdBy: userId,
      updatedBy: userId,
    }

    try {
      await savePatient(payload)
      toast.success('Patient registered successfully!')

      const newPId = nextPatientId()
      const newP: Patient = {
        PatientID: Number(userId) || 1,
        PatientName: regName.trim(),
        UHID: null,
        RegisterNo: null,
        AbhaID: null,
        DOB: regDob,
        Age: ageValue,
        GenderID: genderCode,
        Gender: regGender,
        PatientAddress: regAddress.trim(),
        City: regCity.trim(),
        PatientState: regState.trim(),
        PinCode: regPincode.trim(),
        PhoneNo: targetMobile,
        id: newPId,
        mobile: targetMobile,
        name: regName.trim(),
        gender: regGender,
        dob: regDob,
        address: regAddress.trim(),
        city: regCity.trim(),
        state: regState.trim(),
        pincode: regPincode.trim(),
      }

      setUsersDB((prev) => {
        const rec = prev[targetMobile] || { mobile: targetMobile, patients: [], activePatientId: null }
        return {
          ...prev,
          [targetMobile]: {
            ...rec,
            patients: [...rec.patients, newP],
            activePatientId: newPId,
          },
        }
      })

      setCurrentMobile(targetMobile)
      setActivePatientId(newPId)
      resetForm()
      setScreen('app')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; Result?: string } | string }; message?: string }
      const resData = error.response?.data
      let message = 'Failed to register patient. Please try again.'
      if (typeof resData === 'string' && resData.trim()) {
        message = resData
      } else if (resData && typeof resData === 'object') {
        message = resData.message || resData.Result || message
      } else if (error.message) {
        message = error.message
      }
      toast.error(message)
      setRegErrors((prev) => ({ ...prev, form: message }))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    if (registerContext === 'addPatient') {
      setScreen('select')
    } else {
      setScreen('login')
    }
  }

  return {
    regName,
    setRegName,
    regGender,
    setRegGender,
    regDob,
    setRegDob,
    regAddress,
    setRegAddress,
    regCity,
    setRegCity,
    regState,
    setRegState,
    regPincode,
    setRegPincode,
    regErrors,
    isSubmitting,
    handleRegisterSubmit,
    handleBack,
  }
}

