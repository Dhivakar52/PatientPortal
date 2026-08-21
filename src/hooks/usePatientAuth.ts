import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import type { UserRecord, Patient, FlowScreen, RegisterContext } from '@/types/patient.types'
import { generateOtp, validateOtp, fetchPatient } from '@/services/apiService'

const getScreenFromPath = (path: string): FlowScreen => {
  if (path === '/patient/register') return 'register'
  if (path === '/patient/select') return 'select'
  if (
    path === '/patient/dashboard' ||
    path === '/home' ||
    path === '/patient/home' ||
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

  // API Patient Data State
  const [apiPatient, setApiPatient] = useState<Patient | null>(null)
  const [apiPatientsList, setApiPatientsList] = useState<Patient[]>([])
  const [isLoadingPatient, setIsLoadingPatient] = useState<boolean>(false)
  const [patientError, setPatientError] = useState<string | null>(null)

  // Fetch patient from GET /api/fetchpatient
  const fetchCurrentPatient = async (patientId?: number | string) => {
    const targetId = patientId ?? (activePatientId ? Number(String(activePatientId).replace(/\D/g, '')) || activePatientId : currentUserId)
    if (!targetId) return null

    setIsLoadingPatient(true)
    setPatientError(null)
    try {
      const list = await fetchPatient({ patientID: targetId })
      if (Array.isArray(list) && list.length > 0) {
        setApiPatientsList(list)
        const matched = list.find((p) => String(p.PatientID) === String(targetId)) || list[0]
        setApiPatient(matched)
        return matched
      } else {
        setApiPatient(null)
        setApiPatientsList([])
        return null
      }
    } catch (err: unknown) {
      console.error('Fetch Patient Error:', err)
      setPatientError('Failed to fetch patient data.')
      return null
    } finally {
      setIsLoadingPatient(false)
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

  // Single effect to fetch patient on ID change
  useEffect(() => {
    const targetId = activePatientId ? Number(String(activePatientId).replace(/\D/g, '')) || activePatientId : currentUserId
    if (targetId) {
      fetchCurrentPatient(targetId)
    } else {
      setApiPatient(null)
      setApiPatientsList([])
    }
  }, [activePatientId, currentUserId])

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
    if (apiPatient) {
      return {
        ...apiPatient,
        id: String(apiPatient.PatientID),
        name: apiPatient.PatientName,
        mobile: apiPatient.PhoneNo,
        gender: apiPatient.Gender,
        dob: apiPatient.DOB,
        address: apiPatient.PatientAddress,
        city: apiPatient.City,
        state: apiPatient.PatientState,
        pincode: apiPatient.PinCode,
      }
    }
    if (!currentUserRecord || !Array.isArray(currentUserRecord.patients) || currentUserRecord.patients.length === 0) {
      return null
    }
    return (
      currentUserRecord.patients.find((p) => String(p.id) === String(activePatientId || currentUserRecord.activePatientId)) ||
      currentUserRecord.patients[0] ||
      null
    )
  }, [apiPatient, currentUserRecord, activePatientId])

  const patientsList: Patient[] = useMemo(() => {
    if (apiPatientsList && apiPatientsList.length > 0) {
      return apiPatientsList
    }
    if (apiPatient) {
      return [apiPatient]
    }
    if (currentUserRecord && Array.isArray(currentUserRecord.patients) && currentUserRecord.patients.length > 0) {
      return currentUserRecord.patients
    }
    return []
  }, [apiPatientsList, apiPatient, currentUserRecord])


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
          // Existing User Flow: UserID -> Patient Select
          setCurrentMobile(targetMobile)
          if (UserID != null) {
            await fetchCurrentPatient(UserID)
          }
          navigate('/patient/select', {
            state: {
              userID: UserID,
            },
          })
          setScreenState('select')
        } else {
          // New User Flow: UserID -> Registration Screen
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

  const handleSelectPatientContinue = () => {
    if (!spSelectedId) return
    setActivePatientId(spSelectedId)
    setUsersDB((prev) => ({
      ...prev,
      [currentMobile]: {
        ...prev[currentMobile],
        activePatientId: spSelectedId,
      },
    }))
    setScreen('app')
  }

  const handleLogout = () => {
    setCurrentMobile('')
    setPendingMobile('')
    setActivePatientId(null)
    setSpSelectedId(null)
    setCurrentUserId(null)
    setLoginMobileInput('')
    setShowLoginOtpBlock(false)
    setLoginOtpErr('')
    setLoginMobileErr('')
    localStorage.removeItem('srm_patient_user_id')
    setScreen('login')
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
    currentPatient,
    apiPatient,
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
    handleLogout,
  }
}

