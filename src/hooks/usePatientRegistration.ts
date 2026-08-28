import { useState } from 'react'
import { type Patient, type UserRecord, type RegisterContext } from '@/types/patient.types'
import { calcAge } from '@/utils/patient.utils'
import { savePatient, fetchPatient, getUsers, type RegisterPatientRequest } from '@/services/apiService'
import { toast } from '@/components/ui/toast'

interface UsePatientRegistrationProps {
  pendingMobile: string
  registerContext: RegisterContext
  authUserId?: number | null
  setUsersDB: React.Dispatch<React.SetStateAction<Record<string, UserRecord>>>
  setCurrentMobile: (m: string) => void
  setActivePatientId: (id: string) => void
  setScreen: (s: 'login' | 'register' | 'select' | 'app') => void
  fetchCurrentPatient?: (patientId?: number | string, searchPhone?: string) => Promise<Patient | null>
  setApiPatient?: React.Dispatch<React.SetStateAction<Patient | null>>
  setApiPatientsList?: React.Dispatch<React.SetStateAction<Patient[]>>
}

export function usePatientRegistration({
  pendingMobile,
  registerContext,
  authUserId,
  setUsersDB,
  setCurrentMobile,
  setActivePatientId,
  setScreen,
  setApiPatient,
  setApiPatientsList,
}: UsePatientRegistrationProps) {
  const [regName, setRegName] = useState('')
  const [regGender, setRegGender] = useState<'Male' | 'Female' | 'Other'>('Male')
  const [regDob, setRegDob] = useState('')
  const [regAddress, setRegAddress] = useState('')
  const [regCity, setRegCity] = useState('')
  const [regState, setRegState] = useState('')
  const [regPincode, setRegPincode] = useState('')
  const [regEmail, setRegEmail] = useState('')
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
    setRegEmail('')
    setRegErrors({})
  }

  const handleRegisterSubmit = async () => {
    if (isSubmitting) return

    // Validation
    const errs: Record<string, string> = {}
    if (!regName.trim()) errs.name = 'Name is required.'
    if (!regDob) errs.dob = 'Date of birth is required.'

    // Optional Email: validate format only when a value is entered
    if (regEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim())) {
      errs.email = 'Please enter a valid email address.'
    }

    // Optional PIN Code: only validate if a value is entered
    if (regPincode.trim() && !/^\d{6}$/.test(regPincode.trim())) {
      errs.pincode = 'Enter a valid 6-digit PIN code.'
    }

    const targetMobile = pendingMobile || localStorage.getItem('srm_patient_pending_mobile') || localStorage.getItem('srm_patient_current_mobile') || ''
    if (!/^[6-9]\d{9}$/.test(targetMobile)) {
      errs.mobile = 'Enter a valid 10-digit mobile number.'
    }

    if (Object.keys(errs).length > 0) {
      setRegErrors(errs)
      return
    }

    setRegErrors({})
    setIsSubmitting(true)

    // Calculate age and gender code
    const calculatedAge = calcAge(regDob)
    const ageValue = typeof calculatedAge === 'number' ? calculatedAge : 0
    const genderCode = regGender === 'Male' ? 1 : regGender === 'Female' ? 2 : 3

    // Get logged-in user ID
    const loggedInUserId = authUserId ?? (Number(localStorage.getItem('userID') || localStorage.getItem('srm_patient_user_id')) || 0)

    // IMPORTANT: For new patient creation, userID should be the logged-in user ID
    // This links the new patient to the existing user account
    const emailVal = regEmail.trim() || undefined
    const stateIdNum = regState ? Number(regState) : undefined
    const cityIdNum = regCity ? Number(regCity) : undefined

    const payload: RegisterPatientRequest = {
      userID: loggedInUserId || 0,  // Link to existing user
      name: regName.trim(),
      email: emailVal,
      gender: genderCode,
      dob: regDob,
      age: ageValue,
      mobileNo: targetMobile,
      address: regAddress.trim(),
      pinCode: regPincode.trim(),
      createdBy: loggedInUserId || 0,
      updatedBy: loggedInUserId || 0,
      countryID: 1,
      stateID: stateIdNum,
      cityID: cityIdNum,
      StateID: stateIdNum,
      CityID: cityIdNum,
      state: regState.trim(),
      city: regCity.trim(),
      Email: emailVal,
      EmailID: emailVal,
      emailID: emailVal,
    }

    console.log('📤 Registering new patient with payload:', payload)

    try {
      const response = await savePatient(payload)
      console.log('📥 Save patient response:', response)

      toast.success('Patient registered successfully!')

      // 1. Fetch the user's updated patients list from GET /api/getusers to find the real auto-incremented PatientID
      let createdPatientId: number | null = null
      let backendPatient: Patient | null = null

      try {
        const userList = await getUsers({ phoneNo: targetMobile })
        console.log('📋 Updated users list from backend:', userList)

        if (Array.isArray(userList) && userList.length > 0) {
          const matchedUser = userList[0]
          if (Array.isArray(matchedUser.Patients) && matchedUser.Patients.length > 0) {
            // Find the patient matching the registered name, or the latest patient record
            const found = matchedUser.Patients.find(
              (p) => p.PatientName?.toLowerCase().trim() === regName.toLowerCase().trim()
            ) || matchedUser.Patients[matchedUser.Patients.length - 1]

            if (found && found.PatientID) {
              createdPatientId = Number(found.PatientID)
              console.log('🆔 Real auto-incremented PatientID found from getusers:', createdPatientId)
            }
          }
        }
      } catch (getUsersErr) {
        console.error('❌ Failed to fetch user after registration:', getUsersErr)
      }

      // 2. Fetch full patient profile for that real PatientID from GET /api/fetchpatient
      if (createdPatientId && createdPatientId > 0) {
        try {
          const list = await fetchPatient({ patientID: createdPatientId })
          console.log('📋 Fetch by patient ID response:', list)

          if (Array.isArray(list) && list.length > 0) {
            backendPatient = list.find((p) => Number(p.PatientID) === createdPatientId) || list[0]
          }
        } catch (fetchErr) {
          console.error('❌ Failed to fetch patient from backend:', fetchErr)
        }
      }

      // Active ID: Use actual ID from backend
      const finalPatientId = backendPatient?.PatientID || createdPatientId || 0
      const activePatientId = finalPatientId > 0 ? String(finalPatientId) : ''

      console.log('🎯 Active patient ID to set:', activePatientId)

      // Create patient object
      // Merge email from registration form since API may not return it yet
      const registeredEmail = regEmail.trim() || null
      const newP: Patient = backendPatient
        ? {
            ...backendPatient,
            Email: backendPatient.Email || backendPatient.email || registeredEmail,
            email: backendPatient.email || backendPatient.Email || registeredEmail,
            StateID: backendPatient.StateID ?? backendPatient.stateID ?? stateIdNum,
            stateID: backendPatient.stateID ?? backendPatient.StateID ?? stateIdNum,
            State: backendPatient.State || backendPatient.PatientState || regState.trim(),
            PatientState: backendPatient.PatientState || backendPatient.State || regState.trim(),
            CityID: backendPatient.CityID ?? backendPatient.cityID ?? cityIdNum,
            cityID: backendPatient.cityID ?? backendPatient.CityID ?? cityIdNum,
            City: backendPatient.City || regCity.trim(),
          }
        : {
        PatientID: finalPatientId,
        PatientName: regName.trim(),
        UHID: null,
        RegisterNo: null,
        AbhaID: null,
        DOB: regDob,
        Age: ageValue,
        GenderID: genderCode,
        Gender: regGender,
        PatientAddress: regAddress.trim(),
        Address: regAddress.trim(),
        CityID: cityIdNum,
        cityID: cityIdNum,
        City: regCity.trim(),
        StateID: stateIdNum,
        stateID: stateIdNum,
        PatientState: regState.trim(),
        State: regState.trim(),
        PinCode: regPincode.trim(),
        PhoneNo: targetMobile,
        phoneNo: targetMobile,
        Email: registeredEmail,
        email: registeredEmail,
        id: activePatientId || undefined,
        mobile: targetMobile,
        name: regName.trim(),
        gender: regGender,
        dob: regDob,
        address: regAddress.trim(),
        city: regCity.trim(),
        state: regState.trim(),
        pincode: regPincode.trim(),
      }

      console.log('👤 New patient object:', newP)

      // Set API patient if callback provided
      if (setApiPatient) {
        setApiPatient(newP)
      }

      // Update usersDB
      setUsersDB((prev) => {
        const userKey = targetMobile
        const existingUserData = prev[userKey] || {
          mobile: targetMobile,
          patients: [],
          activePatientId: null,
        }

        const existingPatients = Array.isArray(existingUserData.patients) ? existingUserData.patients : []
        const isDuplicate = existingPatients.some((p) => Number(p.PatientID) === Number(newP.PatientID))

        let updatedPatients: Patient[]
        if (isDuplicate) {
          updatedPatients = existingPatients.map((p) =>
            Number(p.PatientID) === Number(newP.PatientID) ? newP : p
          )
        } else {
          updatedPatients = [...existingPatients, newP]
        }

        if (setApiPatientsList) {
          setApiPatientsList(updatedPatients)
        }

        return {
          ...prev,
          [userKey]: {
            ...existingUserData,
            patients: updatedPatients,
            activePatientId: activePatientId || existingUserData.activePatientId,
          },
        }
      })

      // Update state
      setCurrentMobile(targetMobile)
      if (activePatientId) {
        setActivePatientId(activePatientId)
      }

      resetForm()
      setScreen('app')

      console.log('✅ Patient registration completed successfully')

    } catch (err: unknown) {
      console.error('❌ Registration error:', err)

      const error = err as {
        response?: { data?: { message?: string; Result?: string } | string }
        message?: string
      }

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
    regEmail,
    setRegEmail,
    regErrors,
    isSubmitting,
    handleRegisterSubmit,
    handleBack,
  }
}