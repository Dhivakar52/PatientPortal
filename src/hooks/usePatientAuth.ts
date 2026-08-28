import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import type { UserRecord, Patient, FlowScreen, RegisterContext } from '@/types/patient.types'
import { generateOtp, validateOtp, fetchPatient, getUsers, type UserData } from '@/services/apiService'
import { useAuthStore } from '@/stores/authStore'
import { queryClient } from '@/lib/queryClient'
import { appointmentsQueryKeys } from './queries/useAppointmentsQuery'
import { dashboardQueryKeys } from './queries/useDashboardQuery'

const getScreenFromPath = (path: string): FlowScreen => {
  if (path === '/patient/register') return 'register'
  if (path === '/patient/select') return 'select'
  if (
    path === '/patient/dashboard' ||
    path === '/home' ||
    path === '/patient/home' ||
    path === '/profile' ||
    path === '/patient/profile' ||
    path === '/visit' ||
    path === '/visits' ||
    path === '/patient/visits' ||
    path === '/lab' ||
    path === '/patient/lab' ||
    path === '/bills' ||
    path === '/patient/bills' ||
    path === '/book' ||
    path === '/patient/book'
  ) return 'app'
  return 'login'
}

export function usePatientAuth() {
  const navigate = useNavigate()
  const location = useLocation()

  // Load usersDB from localStorage (only API/real data, no hardcoded mock data)
  const [usersDB, setUsersDB] = useState<Record<string, UserRecord>>(() => {
    try {
      const saved = localStorage.getItem('srm_patient_users_db')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed && typeof parsed === 'object') {
          Object.keys(parsed).forEach((k) => {
            if (parsed[k] && !Array.isArray(parsed[k].patients)) {
              parsed[k].patients = []
            }
          })
          // Purge mock dummy user if previously stored
          if (parsed['9876543210']) {
            delete parsed['9876543210']
            localStorage.setItem('srm_patient_users_db', JSON.stringify(parsed))
          }
          return parsed
        }
      }
      return {}
    } catch {
      return {}
    }
  })

  const [currentMobile, setCurrentMobile] = useState<string>(() => {
    const saved = localStorage.getItem('srm_patient_current_mobile')
    return saved === '9876543210' ? '' : (saved || '')
  })

  const [pendingMobile, setPendingMobile] = useState<string>(() => {
    const saved = localStorage.getItem('srm_patient_pending_mobile')
    return saved === '9876543210' ? '' : (saved || '')
  })

  const [activePatientId, setActivePatientId] = useState<string | null>(() => {
    const saved = localStorage.getItem('srm_patient_active_id')
    return saved === 'p1' || saved === 'p2' ? null : (saved || null)
  })

  const [spSelectedId, setSpSelectedId] = useState<string | null>(() => {
    const saved = localStorage.getItem('srm_patient_active_id')
    return saved === 'p1' || saved === 'p2' ? null : (saved || null)
  })

  const [currentUserId, setCurrentUserId] = useState<number | null>(() => {
    const saved = localStorage.getItem('userID') || localStorage.getItem('srm_patient_user_id')
    return saved ? Number(saved) : null
  })

  // Full User Data returned from GET /api/getusers
  const [currentUserData, setCurrentUserData] = useState<UserData | null>(() => {
    try {
      const saved = localStorage.getItem('srm_patient_user_data')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // API Patient Data State
  const [apiPatient, setApiPatient] = useState<Patient | null>(null)
  const [apiPatientsList, setApiPatientsList] = useState<Patient[]>(() => {
    try {
      const saved = localStorage.getItem('srm_patient_user_data')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed.Patients) && parsed.Patients.length > 0) {
          return parsed.Patients
        }
      }
    } catch {
      // fallback
    }
    return []
  })
  const [isLoadingPatient, setIsLoadingPatient] = useState<boolean>(false)
  const [patientError, setPatientError] = useState<string | null>(null)

  // Helper to fetch and sync all user patients from GET /api/getusers
  const refreshUserPatients = async (phone?: string) => {
    const targetMobile = phone || currentMobile || localStorage.getItem('srm_patient_current_mobile')
    if (!targetMobile) return []
    try {
      const userList = await getUsers({ phoneNo: targetMobile })
      if (Array.isArray(userList) && userList.length > 0) {
        const matchedUser = userList[0]
        setCurrentUserData(matchedUser)
        const userPatients: Patient[] = []
        if (Array.isArray(matchedUser.Patients)) {
          matchedUser.Patients.forEach((rawP) => {
            const p = (rawP as unknown) as Record<string, unknown>
            const patientId = Number(p.PatientID || p.id || 0)
            const patientName = String(p.PatientName || p.name || '')
            const dob = String(p.DOB || p.dob || '')
            const age = typeof p.Age === 'number' ? p.Age : 0
            const gender = String(p.Gender || p.gender || 'Male')
            const genderId = Number(p.GenderID || p.genderID || (gender.toLowerCase() === 'female' ? 2 : 1))
            const address = String(p.Address || p.PatientAddress || p.address || '')
            const stateRaw = p.StateID ?? p.stateID ?? p.State ?? p.PatientState ?? p.state ?? ''
            const state = String(stateRaw)
            const stateId = typeof p.StateID === 'number' ? p.StateID : (typeof p.stateID === 'number' ? p.stateID : (Number(stateRaw) || undefined))

            const cityRaw = p.CityID ?? p.cityID ?? p.City ?? p.PatientCity ?? p.city ?? ''
            const city = String(cityRaw)
            const cityId = typeof p.CityID === 'number' ? p.CityID : (typeof p.cityID === 'number' ? p.cityID : (Number(cityRaw) || undefined))

            const pinCode = String(p.PinCode || p.pinCode || p.pincode || '')
            const phoneNo = String(p.PhoneNo || p.phoneNo || matchedUser.phoneNo || targetMobile)
            const emailRaw = p.Email ?? p.email ?? p.EmailID ?? p.emailID ?? null
            const email = emailRaw != null && String(emailRaw).trim() !== '' ? String(emailRaw).trim() : null

            userPatients.push({
              ...p,
              PatientID: patientId,
              PatientName: patientName,
              UHID: p.UHID != null ? String(p.UHID) : null,
              RegisterNo: p.RegisterNo != null ? String(p.RegisterNo) : null,
              AbhaID: p.AbhaID != null ? String(p.AbhaID) : null,
              DOB: dob,
              Age: age,
              GenderID: genderId,
              Gender: gender,
              Address: address,
              PatientAddress: address,
              StateID: stateId,
              stateID: stateId,
              CityID: cityId,
              cityID: cityId,
              City: city,
              State: state,
              PatientState: state,
              PinCode: pinCode,
              PhoneNo: phoneNo,
              Email: email,
              email: email,
              id: String(patientId),
              name: patientName,
              mobile: phoneNo,
              gender: gender,
              dob: dob,
              address: address,
              city: city,
              state: state,
              pincode: pinCode,
            })
          })
        }
        setApiPatientsList(userPatients)
        return userPatients
      }
    } catch (e) {
      console.error('Failed to fetch user patients:', e)
    }
    return []
  }

  const fetchPatientReqRef = useRef<string | number | null>(null)

  // Fetch patient from GET /api/fetchpatient
  const fetchCurrentPatient = async (id?: number | string) => {
    const storedUid = Number(localStorage.getItem('userID') || localStorage.getItem('srm_patient_user_id')) || undefined
    const targetId = id ?? activePatientId ?? currentUserId ?? storedUid

    if (!targetId) return null

    fetchPatientReqRef.current = targetId
    setIsLoadingPatient(true)
    setPatientError(null)
    try {
      const list = await fetchPatient({ patientID: targetId })

      // Discard stale responses if active target changed while request was in-flight
      if (fetchPatientReqRef.current !== targetId) {
        return null
      }

      if (Array.isArray(list) && list.length > 0) {
        const rawMatched = list.find((p) => String(p.PatientID) === String(targetId)) || list[0]
        const existingEmail = rawMatched.Email || rawMatched.email ||
          apiPatientsList.find((p) => String(p.PatientID || p.id) === String(targetId))?.Email ||
          apiPatientsList.find((p) => String(p.PatientID || p.id) === String(targetId))?.email ||
          currentUserRecord?.patients?.find((p) => String(p.PatientID || p.id) === String(targetId))?.Email ||
          currentUserRecord?.patients?.find((p) => String(p.PatientID || p.id) === String(targetId))?.email ||
          (apiPatient && String(apiPatient.PatientID || apiPatient.id) === String(targetId) ? (apiPatient.Email || apiPatient.email) : null) ||
          null

        const existingState = rawMatched.State || rawMatched.PatientState ||
          apiPatientsList.find((p) => String(p.PatientID || p.id) === String(targetId))?.State ||
          currentUserRecord?.patients?.find((p) => String(p.PatientID || p.id) === String(targetId))?.State ||
          null
        const existingStateId = rawMatched.StateID ?? rawMatched.stateID ??
          apiPatientsList.find((p) => String(p.PatientID || p.id) === String(targetId))?.StateID ??
          currentUserRecord?.patients?.find((p) => String(p.PatientID || p.id) === String(targetId))?.StateID ??
          undefined

        const existingCity = rawMatched.City || rawMatched.city ||
          apiPatientsList.find((p) => String(p.PatientID || p.id) === String(targetId))?.City ||
          currentUserRecord?.patients?.find((p) => String(p.PatientID || p.id) === String(targetId))?.City ||
          null
        const existingCityId = rawMatched.CityID ?? rawMatched.cityID ??
          apiPatientsList.find((p) => String(p.PatientID || p.id) === String(targetId))?.CityID ??
          currentUserRecord?.patients?.find((p) => String(p.PatientID || p.id) === String(targetId))?.CityID ??
          undefined

        const matched: Patient = {
          ...rawMatched,
          Email: existingEmail,
          email: existingEmail,
          State: rawMatched.State || existingState || '',
          PatientState: rawMatched.PatientState || rawMatched.State || existingState || '',
          StateID: rawMatched.StateID ?? rawMatched.stateID ?? existingStateId,
          stateID: rawMatched.stateID ?? rawMatched.StateID ?? existingStateId,
          City: rawMatched.City || existingCity || '',
          CityID: rawMatched.CityID ?? rawMatched.cityID ?? existingCityId,
          cityID: rawMatched.cityID ?? rawMatched.CityID ?? existingCityId,
        }
        if (fetchPatientReqRef.current === targetId) {
          setApiPatient(matched)
        }
        return matched
      } else {
        const fallback = apiPatientsList.find((p) => String(p.PatientID || p.id) === String(targetId)) ||
          currentUserRecord?.patients?.find((p) => String(p.PatientID || p.id) === String(targetId)) || null
        if (fetchPatientReqRef.current === targetId) {
          setApiPatient(fallback || null)
        }
        return fallback || null
      }
    } catch (err: unknown) {
      if (fetchPatientReqRef.current === targetId) {
        console.error('Fetch Patient Error:', err)
        setPatientError('Failed to fetch patient data.')
        const fallback = apiPatientsList.find((p) => String(p.PatientID || p.id) === String(targetId)) || null
        setApiPatient(fallback)
      }
      return null
    } finally {
      if (fetchPatientReqRef.current === targetId) {
        setIsLoadingPatient(false)
      }
    }
  }

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('srm_patient_users_db', JSON.stringify(usersDB))
    } catch (e) {
      console.error(e)
    }
  }, [usersDB])

  useEffect(() => {
    if (currentUserData) {
      localStorage.setItem('srm_patient_user_data', JSON.stringify(currentUserData))
    } else {
      localStorage.removeItem('srm_patient_user_data')
    }
  }, [currentUserData])

  useEffect(() => {
    localStorage.setItem('srm_patient_current_mobile', currentMobile)
  }, [currentMobile])

  useEffect(() => {
    localStorage.setItem('srm_patient_pending_mobile', pendingMobile)
  }, [pendingMobile])

  useEffect(() => {
    if (activePatientId) {
      localStorage.setItem('srm_patient_active_id', activePatientId)
    }
  }, [activePatientId])

  useEffect(() => {
    if (currentUserId !== null) {
      localStorage.setItem('userID', String(currentUserId))
      localStorage.setItem('srm_patient_user_id', String(currentUserId))
    }
  }, [currentUserId])

  // Sync user patients on mobile change
  useEffect(() => {
    if (currentMobile) {
      refreshUserPatients(currentMobile)
    }
  }, [currentMobile])

  // Fetch active patient profile details on ID change
  useEffect(() => {
    if (activePatientId) {
      fetchCurrentPatient(activePatientId)
    }
  }, [activePatientId])

  const [screen, setScreenState] = useState<FlowScreen>(() => getScreenFromPath(location.pathname))

  const setScreen = (newScreen: FlowScreen) => {
    setScreenState(newScreen)
    if (newScreen === 'login' && location.pathname !== '/patient/login' && location.pathname !== '/') {
      navigate('/patient/login')
    } else if (newScreen === 'register' && location.pathname !== '/patient/register') {
      navigate('/patient/register', { state: currentUserId != null ? { userID: currentUserId } : undefined })
    } else if (newScreen === 'select' && location.pathname !== '/patient/select') {
      navigate('/patient/select', { state: currentUserId != null ? { userID: currentUserId } : undefined })
    } else if (newScreen === 'app' && location.pathname !== '/patient/dashboard') {
      navigate('/patient/dashboard')
    }
  }

  useEffect(() => {
    const s = getScreenFromPath(location.pathname)
    if (s !== screen) {
      setScreenState(s)
    }
  }, [location.pathname])

  const [registerContext, setRegisterContext] = useState<RegisterContext>('newAccount')

  // Login OTP State
  const [loginMobileInput, setLoginMobileInput] = useState('')
  const [loginMobileErr, setLoginMobileErr] = useState('')
  const [showLoginOtpBlock, setShowLoginOtpBlock] = useState(false)
  const [loginOtpInput, setLoginOtpInput] = useState('')
  const [loginOtpErr, setLoginOtpErr] = useState('')
  const [isGeneratingOtp, setIsGeneratingOtp] = useState(false)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)

  // Derived active record & patient
  const currentUserRecord = usersDB[currentMobile] || null
  const currentPatient: Patient | null = useMemo(() => {
    const targetActiveId = String(activePatientId || currentUserRecord?.activePatientId || '')

    // 1. If apiPatient is loaded and matches the active patient ID, return it
    if (apiPatient && (!targetActiveId || String(apiPatient.PatientID || apiPatient.id) === targetActiveId)) {
      const email = apiPatient.Email || apiPatient.email || null
      return {
        ...apiPatient,
        id: String(apiPatient.PatientID || apiPatient.id),
        name: apiPatient.PatientName || apiPatient.name,
        mobile: apiPatient.PhoneNo || apiPatient.mobile,
        gender: apiPatient.Gender || apiPatient.gender,
        dob: apiPatient.DOB || apiPatient.dob,
        address: apiPatient.PatientAddress || apiPatient.address,
        city: apiPatient.City || apiPatient.city,
        state: apiPatient.PatientState || apiPatient.state,
        StateID: apiPatient.StateID ?? apiPatient.stateID,
        stateID: apiPatient.stateID ?? apiPatient.StateID,
        CityID: apiPatient.CityID ?? apiPatient.cityID,
        cityID: apiPatient.cityID ?? apiPatient.CityID,
        pincode: apiPatient.PinCode || apiPatient.pincode,
        Email: email,
        email: email,
      }
    }

    // 2. Look in apiPatientsList (from GET /api/getusers)
    if (apiPatientsList && apiPatientsList.length > 0) {
      const matched = targetActiveId
        ? apiPatientsList.find((p) => String(p.PatientID || p.id) === targetActiveId) || apiPatientsList[0]
        : apiPatientsList[0]
      if (matched) {
        const email = matched.Email || matched.email || null
        return {
          ...matched,
          id: String(matched.PatientID || matched.id),
          name: matched.PatientName || matched.name,
          mobile: matched.PhoneNo || matched.mobile || matched.phoneNo,
          gender: matched.Gender || matched.gender,
          dob: matched.DOB || matched.dob,
          address: matched.PatientAddress || matched.address,
          city: matched.City || matched.city,
          state: matched.PatientState || matched.state,
          StateID: matched.StateID ?? matched.stateID,
          stateID: matched.stateID ?? matched.StateID,
          CityID: matched.CityID ?? matched.cityID,
          cityID: matched.cityID ?? matched.CityID,
          pincode: matched.PinCode || matched.pincode,
          Email: email,
          email: email,
        }
      }
    }

    // 3. Fallback to currentUserRecord from usersDB
    if (currentUserRecord && Array.isArray(currentUserRecord.patients) && currentUserRecord.patients.length > 0) {
      const matched = targetActiveId
        ? currentUserRecord.patients.find((p) => String(p.PatientID || p.id) === targetActiveId) || currentUserRecord.patients[0]
        : currentUserRecord.patients[0]
      if (matched) {
        const email = matched.Email || matched.email || null
        return {
          ...matched,
          id: String(matched.PatientID || matched.id),
          name: matched.PatientName || matched.name,
          mobile: matched.PhoneNo || matched.mobile || matched.phoneNo,
          gender: matched.Gender || matched.gender,
          dob: matched.DOB || matched.dob,
          address: matched.PatientAddress || matched.address,
          city: matched.City || matched.city,
          state: matched.PatientState || matched.state,
          StateID: matched.StateID ?? matched.stateID,
          stateID: matched.stateID ?? matched.StateID,
          CityID: matched.CityID ?? matched.cityID,
          cityID: matched.cityID ?? matched.CityID,
          pincode: matched.PinCode || matched.pincode,
          Email: email,
          email: email,
        }
      }
    }

    if (apiPatient) {
      const email = apiPatient.Email || apiPatient.email || null
      return {
        ...apiPatient,
        id: String(apiPatient.PatientID || apiPatient.id),
        name: apiPatient.PatientName || apiPatient.name,
        mobile: apiPatient.PhoneNo || apiPatient.mobile,
        gender: apiPatient.Gender || apiPatient.gender,
        dob: apiPatient.DOB || apiPatient.dob,
        address: apiPatient.PatientAddress || apiPatient.address,
        city: apiPatient.City || apiPatient.city,
        state: apiPatient.PatientState || apiPatient.state,
        StateID: apiPatient.StateID ?? apiPatient.stateID,
        stateID: apiPatient.stateID ?? apiPatient.StateID,
        CityID: apiPatient.CityID ?? apiPatient.cityID,
        cityID: apiPatient.cityID ?? apiPatient.CityID,
        pincode: apiPatient.PinCode || apiPatient.pincode,
        Email: email,
        email: email,
      }
    }

    return null
  }, [apiPatient, apiPatientsList, currentUserRecord, activePatientId])

  const patientsList: Patient[] = useMemo(() => {
    if (apiPatientsList && apiPatientsList.length > 0) {
      return apiPatientsList
    }
    if (currentUserData && Array.isArray(currentUserData.Patients) && currentUserData.Patients.length > 0) {
      return currentUserData.Patients
    }
    if (currentUserRecord && Array.isArray(currentUserRecord.patients) && currentUserRecord.patients.length > 0) {
      return currentUserRecord.patients
    }
    if (apiPatient) {
      return [apiPatient]
    }
    return []
  }, [apiPatientsList, currentUserData, currentUserRecord, apiPatient])


  const handleGenerateLoginOtp = async () => {
    if (isGeneratingOtp) return
    setLoginMobileErr('')
    setLoginOtpErr('')

    if (!loginMobileInput || !/^[6-9]\d{9}$/.test(loginMobileInput)) {
      setLoginMobileErr('Enter a valid 10-digit mobile number.')
      return
    }

    setIsGeneratingOtp(true)
    try {
      await generateOtp(loginMobileInput)
      setPendingMobile(loginMobileInput)
      setShowLoginOtpBlock(true)
      setLoginOtpInput('')
      setLoginOtpErr('')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; Result?: string } | string }; message?: string }
      const resData = error.response?.data
      let message = 'Failed to generate OTP. Please try again.'
      if (typeof resData === 'string' && resData.trim()) {
        message = resData
      } else if (resData && typeof resData === 'object') {
        message = resData.message || resData.Result || message
      } else if (error.message) {
        message = error.message
      }
      setLoginMobileErr(message)
    } finally {
      setIsGeneratingOtp(false)
    }
  }

  const handleResendLoginOtp = async () => {
    const targetMobile = pendingMobile || loginMobileInput
    if (!targetMobile || !/^[6-9]\d{9}$/.test(targetMobile)) {
      setLoginMobileErr('Enter a valid 10-digit mobile number.')
      return
    }
    if (isGeneratingOtp) return

    setIsGeneratingOtp(true)
    setLoginOtpErr('')
    try {
      await generateOtp(targetMobile)
      setLoginOtpInput('')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; Result?: string } | string }; message?: string }
      const resData = error.response?.data
      let message = 'Failed to resend OTP. Please try again.'
      if (typeof resData === 'string' && resData.trim()) {
        message = resData
      } else if (resData && typeof resData === 'object') {
        message = resData.message || resData.Result || message
      } else if (error.message) {
        message = error.message
      }
      setLoginOtpErr(message)
    } finally {
      setIsGeneratingOtp(false)
    }
  }

  const handleVerifyLoginOtp = async () => {
    const targetMobile = pendingMobile || loginMobileInput
    if (!loginOtpInput || loginOtpInput.trim().length === 0) {
      setLoginOtpErr('Please enter the OTP.')
      return
    }
    if (loginOtpInput.length !== 4) {
      setLoginOtpErr('Enter the 4-digit OTP to continue.')
      return
    }
    if (isVerifyingOtp) return

    setIsVerifyingOtp(true)
    setLoginOtpErr('')

    try {
      const response = await validateOtp(targetMobile, loginOtpInput)
      const isSuccess =
        response?.Result &&
        response.Result.toLowerCase().trim() === 'otp successfully validated'

      if (isSuccess) {
        setLoginOtpErr('')
        const { UserID, ExistUser } = response

        // Store UserID as the ONLY ID carried forward from OTP validation
        if (UserID != null) {
          setCurrentUserId(UserID)
          localStorage.setItem('userID', String(UserID))
          localStorage.setItem('srm_patient_user_id', String(UserID))
        }

        setShowLoginOtpBlock(false)
        setLoginMobileInput('')
        setLoginOtpInput('')

        if (ExistUser === true) {
          // Existing User Flow: Call GET /api/getusers?phoneNo=<verifiedPhoneNumber>
          try {
            const userList = await getUsers({ phoneNo: targetMobile })
            console.log('Fetched existing users:', userList)

            if (!Array.isArray(userList) || userList.length === 0) {
              setLoginOtpErr('No existing user found for this mobile number.')
              return
            }

            const matchedUser = userList[0]
            const userPatients: Patient[] = []

            if (Array.isArray(matchedUser.Patients) && matchedUser.Patients.length > 0) {
              matchedUser.Patients.forEach((rawP) => {
                const p = (rawP as unknown) as Record<string, unknown>
                const patientId = Number(p.PatientID || p.id || 0)
                const patientName = String(p.PatientName || p.name || '')
                const dob = String(p.DOB || p.dob || '')
                const age = typeof p.Age === 'number' ? p.Age : 0
                const gender = String(p.Gender || p.gender || 'Male')
                const genderId = Number(p.GenderID || p.genderID || (gender.toLowerCase() === 'female' ? 2 : 1))
                const address = String(p.Address || p.PatientAddress || p.address || '')
                const city = String(p.City || p.city || '')
                const state = String(p.State || p.PatientState || p.state || '')
                const pinCode = String(p.PinCode || p.pinCode || p.pincode || '')
                const phoneNo = String(p.PhoneNo || p.phoneNo || matchedUser.phoneNo || targetMobile)
                const emailRaw = p.Email ?? p.email ?? p.EmailID ?? p.emailID ?? null
                const email = emailRaw != null && String(emailRaw).trim() !== '' ? String(emailRaw).trim() : null

                userPatients.push({
                  ...p,
                  PatientID: patientId,
                  PatientName: patientName,
                  UHID: p.UHID != null ? String(p.UHID) : null,
                  RegisterNo: p.RegisterNo != null ? String(p.RegisterNo) : null,
                  AbhaID: p.AbhaID != null ? String(p.AbhaID) : null,
                  DOB: dob,
                  Age: age,
                  GenderID: genderId,
                  Gender: gender,
                  Address: address,
                  PatientAddress: address,
                  City: city,
                  State: state,
                  PatientState: state,
                  PinCode: pinCode,
                  PhoneNo: phoneNo,
                  Email: email,
                  email: email,
                  id: String(patientId),
                  name: patientName,
                  mobile: phoneNo,
                  gender: gender,
                  dob: dob,
                  address: address,
                  city: city,
                  state: state,
                  pincode: pinCode,
                })
              })
            }

            const effectiveUserId = matchedUser.UserID || UserID
            setCurrentUserId(effectiveUserId)
            setCurrentUserData(matchedUser)
            localStorage.setItem('userID', String(effectiveUserId))
            localStorage.setItem('srm_patient_user_id', String(effectiveUserId))

            setCurrentMobile(targetMobile)
            setApiPatientsList(userPatients)

            // Extract PatientID and fetch FULL patient data from /api/fetchpatient
            if (userPatients.length > 0) {
              const initialPatientId = userPatients[0].PatientID
              setActivePatientId(String(initialPatientId))
              setSpSelectedId(String(initialPatientId))

              try {
                const fullPatientList = await fetchPatient({ patientID: initialPatientId })
                if (Array.isArray(fullPatientList) && fullPatientList.length > 0) {
                  setApiPatient(fullPatientList[0])
                } else {
                  setApiPatient(userPatients[0])
                }
              } catch (fetchErr) {
                console.error('Failed to fetch full patient record:', fetchErr)
                setApiPatient(userPatients[0])
              }
            }

            const primaryPatient = userPatients[0]
            useAuthStore.getState().setAuth({
              user: {
                userId: effectiveUserId,
                name: primaryPatient?.name || primaryPatient?.PatientName || `User ${targetMobile}`,
                mobile: targetMobile,
                phoneNo: targetMobile,
              },
              userId: effectiveUserId,
              activePhone: targetMobile,
              activePatientId: primaryPatient?.PatientID ? String(primaryPatient.PatientID) : null,
            })

            setUsersDB((prev) => ({
              ...prev,
              [targetMobile]: {
                mobile: targetMobile,
                patients: userPatients,
                activePatientId: userPatients.length > 0 ? String(userPatients[0].PatientID) : null,
              },
            }))

            setShowLoginOtpBlock(false)
            setLoginMobileInput('')
            setLoginOtpInput('')

            navigate('/patient/select', {
              state: {
                userID: effectiveUserId,
              },
            })
            setScreenState('select')
          } catch (getUsersErr) {
            console.error('getUsers failed:', getUsersErr)
            setLoginOtpErr('Failed to fetch existing user data. Please try again.')
            return
          }
        } else {
          // New User Flow: UserID -> Registration Screen (Do NOT call /api/getusers)
          if (UserID != null) {
            setCurrentUserId(UserID)
            localStorage.setItem('userID', String(UserID))
            localStorage.setItem('srm_patient_user_id', String(UserID))
          }
          setShowLoginOtpBlock(false)
          setLoginMobileInput('')
          setLoginOtpInput('')
          setPendingMobile(targetMobile)
          setRegisterContext('newAccount')
          navigate('/patient/register', {
            state: {
              userID: UserID,
            },
          })
          setScreenState('register')
        }
      } else {
        const errorMsg = response?.Result || 'Incorrect OTP. Please try again.'
        setLoginOtpErr(errorMsg)
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; Result?: string } | string }; message?: string }
      const resData = error.response?.data
      let message = 'OTP validation failed. Please try again.'
      if (typeof resData === 'string' && resData.trim()) {
        message = resData
      } else if (resData && typeof resData === 'object') {
        message = resData.Result || resData.message || message
      } else if (error.message) {
        message = error.message
      }
      setLoginOtpErr(message)
    } finally {
      setIsVerifyingOtp(false)
    }
  }

  const openRegisterForm = (mobile: string, context: RegisterContext) => {
    setRegisterContext(context)
    setPendingMobile(mobile)
    navigate('/patient/register', {
      state: currentUserId != null ? { userID: currentUserId } : undefined,
    })
    setScreenState('register')
  }

  const handleSelectPatientContinue = async () => {
    if (!spSelectedId) return
    const targetPatientId = Number(spSelectedId)
    setActivePatientId(String(targetPatientId))

    // Call GET /api/fetchpatient?patientID=<PatientID>
    try {
      const fullPatientList = await fetchPatient({ patientID: targetPatientId })
      if (Array.isArray(fullPatientList) && fullPatientList.length > 0) {
        const matched = fullPatientList.find((p) => Number(p.PatientID) === targetPatientId) || fullPatientList[0]
        setApiPatient(matched)
      } else {
        const fallback = apiPatientsList.find((p) => Number(p.PatientID) === targetPatientId)
        if (fallback) setApiPatient(fallback)
      }
    } catch (err) {
      console.error('Failed to fetch patient on selection continue:', err)
      const fallback = apiPatientsList.find((p) => Number(p.PatientID) === targetPatientId)
      if (fallback) setApiPatient(fallback)
    }

    setUsersDB((prev) => ({
      ...prev,
      [currentMobile]: {
        ...prev[currentMobile],
        activePatientId: String(targetPatientId),
      },
    }))

    useAuthStore.getState().setActivePatient(String(targetPatientId))

    navigate('/patient/home')
    setScreenState('app')
  }

  const selectPatientProfile = async (id: string | number) => {
    const stringId = String(id)
    setActivePatientId(stringId)
    setSpSelectedId(stringId)
    useAuthStore.getState().setActivePatient(stringId)

    // Clear previous patient details to avoid showing stale patient info
    setApiPatient(null)

    // Invalidate TanStack query cache for appointments & dashboard so fresh data loads for the new patient
    queryClient.invalidateQueries({ queryKey: appointmentsQueryKeys.all })
    queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all })

    const matched = await fetchCurrentPatient(stringId)

    setUsersDB((prev) => ({
      ...prev,
      [currentMobile]: {
        ...prev[currentMobile],
        activePatientId: stringId,
      },
    }))

    return matched
  }

  const switchAccount = async (targetPhone: string, targetPatientId?: string | number) => {
    useAuthStore.getState().switchAccount(targetPhone, targetPatientId)
    setCurrentMobile(targetPhone)
    if (targetPatientId) {
      setActivePatientId(String(targetPatientId))
      setSpSelectedId(String(targetPatientId))
    }
    const patients = await refreshUserPatients(targetPhone)
    if (patients.length > 0) {
      const pid = targetPatientId ? String(targetPatientId) : String(patients[0].PatientID)
      setActivePatientId(pid)
      setSpSelectedId(pid)
      await fetchCurrentPatient(pid)
    }
  }

  const handleLogout = () => {
    setCurrentMobile('')
    setPendingMobile('')
    setActivePatientId(null)
    setSpSelectedId(null)
    setCurrentUserId(null)
    setCurrentUserData(null)
    setApiPatient(null)
    setApiPatientsList([])
    setUsersDB({})
    setLoginMobileInput('')
    setShowLoginOtpBlock(false)
    setLoginOtpErr('')
    setLoginMobileErr('')

    // Reset Zustand auth store and clear storage
    useAuthStore.getState().logout()

    navigate('/patient/login')
    setScreenState('login')
  }

  return {
    usersDB,
    setUsersDB,
    screen,
    setScreen,
    registerContext,
    currentMobile,
    setCurrentMobile,
    pendingMobile,
    setPendingMobile,
    activePatientId,
    setActivePatientId,
    spSelectedId,
    setSpSelectedId,
    currentUserRecord,
    currentUserData,
    setCurrentUserData,
    currentPatient,
    apiPatient,
    setApiPatient,
    apiPatientsList,
    setApiPatientsList,
    patientsList,
    isLoadingPatient,
    patientError,
    fetchCurrentPatient,
    currentUserId,

    // Login state & handlers
    loginMobileInput,
    setLoginMobileInput,
    loginMobileErr,
    showLoginOtpBlock,
    loginOtpInput,
    setLoginOtpInput,
    loginOtpErr,
    isGeneratingOtp,
    isVerifyingOtp,
    handleGenerateLoginOtp,
    handleResendLoginOtp,
    handleVerifyLoginOtp,

    // Actions
    openRegisterForm,
    handleSelectPatientContinue,
    selectPatientProfile,
    handleLogout,
    switchAccount,
  }
}

