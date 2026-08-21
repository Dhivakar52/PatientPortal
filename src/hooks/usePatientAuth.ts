import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import type { UserRecord, Patient, FlowScreen, RegisterContext } from '@/types/patient.types'
import { generateOtp, validateOtp, fetchPatient, getUsers, type UserData } from '@/services/apiService'

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
            const city = String(p.City || p.city || '')
            const state = String(p.State || p.PatientState || p.state || '')
            const pinCode = String(p.PinCode || p.pinCode || p.pincode || '')
            const phoneNo = String(p.PhoneNo || p.phoneNo || matchedUser.phoneNo || targetMobile)

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

  // Fetch patient from GET /api/fetchpatient
  const fetchCurrentPatient = async (id?: number | string) => {
    const storedUid = Number(localStorage.getItem('userID') || localStorage.getItem('srm_patient_user_id')) || undefined
    const targetId = id ?? activePatientId ?? currentUserId ?? storedUid

    if (!targetId) return null

    setIsLoadingPatient(true)
    setPatientError(null)
    try {
      const list = await fetchPatient({ patientID: targetId })

      if (Array.isArray(list) && list.length > 0) {
        const matched = list.find((p) => String(p.PatientID) === String(targetId)) || list[0]
        setApiPatient(matched)
        return matched
      } else {
        setApiPatient(null)
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
    navigate('/patient/home')
    setScreenState('app')
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

    // Clear ALL local storage completely
    localStorage.clear()

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
    handleLogout,
  }
}

