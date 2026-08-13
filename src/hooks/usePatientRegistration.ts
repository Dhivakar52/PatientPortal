import { useState } from 'react'
import { type Patient, type UserRecord, type RegisterContext } from '@/types/patient.types'
import { nextPatientId } from '@/utils/patient.utils'

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

  const handleRegisterSubmit = () => {
    const errs: Record<string, string> = {}
    if (!regName.trim()) errs.name = 'Name is required.'
    if (!regDob) errs.dob = 'Date of birth is required.'
    if (!regAddress.trim()) errs.address = 'Address is required.'
    if (!regCity.trim()) errs.city = 'City is required.'
    if (!regState.trim()) errs.state = 'State is required.'
    if (!/^\d{6}$/.test(regPincode)) errs.pincode = 'Enter a valid 6-digit PIN code.'

    if (Object.keys(errs).length > 0) {
      setRegErrors(errs)
      return
    }

    const targetMobile = pendingMobile || '9876543210'

    const newP: Patient = {
      id: nextPatientId(),
      mobile: targetMobile,
      name: regName.trim(),
      gender: regGender,
      dob: regDob,
      address: regAddress.trim(),
      city: regCity.trim(),
      state: regState.trim(),
      pincode: regPincode,
    }

    setUsersDB((prev) => {
      const rec = prev[targetMobile] || { mobile: targetMobile, patients: [], activePatientId: null }
      return {
        ...prev,
        [targetMobile]: {
          ...rec,
          patients: [...rec.patients, newP],
          activePatientId: newP.id,
        },
      }
    })

    setCurrentMobile(targetMobile)
    setActivePatientId(newP.id)
    resetForm()
    setScreen('app')
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
    handleRegisterSubmit,
    handleBack,
  }
}
