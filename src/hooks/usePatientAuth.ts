import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import type { UserRecord, Patient, FlowScreen, RegisterContext } from '@/types/patient.types'
import { INITIAL_USERS } from '@/constants/patient.constants'
import { genOtp } from '@/utils/patient.utils'

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

  // Load usersDB from localStorage or INITIAL_USERS
  const [usersDB, setUsersDB] = useState<Record<string, UserRecord>>(() => {
    try {
      const saved = localStorage.getItem('srm_patient_users_db')
      return saved ? JSON.parse(saved) : INITIAL_USERS
    } catch {
      return INITIAL_USERS
    }
  })

  const [currentMobile, setCurrentMobile] = useState<string>(() => {
    return localStorage.getItem('srm_patient_current_mobile') || ''
  })

  const [pendingMobile, setPendingMobile] = useState<string>(() => {
    return localStorage.getItem('srm_patient_pending_mobile') || ''
  })

  const [activePatientId, setActivePatientId] = useState<string | null>(() => {
    return localStorage.getItem('srm_patient_active_id') || null
  })

  const [spSelectedId, setSpSelectedId] = useState<string | null>(() => {
    return localStorage.getItem('srm_patient_active_id') || null
  })

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

  const [screen, setScreenState] = useState<FlowScreen>(() => getScreenFromPath(location.pathname))

  const setScreen = (newScreen: FlowScreen) => {
    setScreenState(newScreen)
    if (newScreen === 'login' && location.pathname !== '/patient/login' && location.pathname !== '/') {
      navigate('/patient/login')
    } else if (newScreen === 'register' && location.pathname !== '/patient/register') {
      navigate('/patient/register')
    } else if (newScreen === 'select' && location.pathname !== '/patient/select') {
      navigate('/patient/select')
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
  const [generatedLoginOtp, setGeneratedLoginOtp] = useState('')
  const [loginOtpInput, setLoginOtpInput] = useState('')
  const [loginOtpErr, setLoginOtpErr] = useState('')

  // Derived active record & patient
  const currentUserRecord = usersDB[currentMobile] || null
  const currentPatient: Patient | null = useMemo(() => {
    if (!currentUserRecord || !currentUserRecord.patients.length) return null
    return (
      currentUserRecord.patients.find((p) => p.id === (activePatientId || currentUserRecord.activePatientId)) ||
      currentUserRecord.patients[0]
    )
  }, [currentUserRecord, activePatientId])

  const handleGenerateLoginOtp = () => {
    setLoginMobileErr('')
    if (!/^[6-9]\d{9}$/.test(loginMobileInput)) {
      setLoginMobileErr('Enter a valid 10-digit mobile number.')
      return
    }
    const otp = genOtp()
    setPendingMobile(loginMobileInput)
    setGeneratedLoginOtp(otp)
    setLoginOtpInput(otp)
    setShowLoginOtpBlock(true)
    setLoginOtpErr('')
  }

  const handleResendLoginOtp = () => {
    const otp = genOtp()
    setGeneratedLoginOtp(otp)
    setLoginOtpInput(otp)
    setLoginOtpErr('')
  }

  const handleVerifyLoginOtp = () => {
    if (loginOtpInput.length !== 4) {
      setLoginOtpErr('Enter the 4-digit OTP to continue.')
      return
    }
    if (loginOtpInput !== generatedLoginOtp) {
      setLoginOtpErr('Incorrect OTP. Please try again.')
      setLoginOtpInput('')
      return
    }
    setLoginOtpErr('')
    const existing = usersDB[pendingMobile]
    if (existing) {
      setCurrentMobile(existing.mobile)
      setActivePatientId(existing.activePatientId || (existing.patients[0] ? existing.patients[0].id : null))
      setSpSelectedId(existing.activePatientId || (existing.patients[0] ? existing.patients[0].id : null))
      setShowLoginOtpBlock(false)
      setLoginMobileInput('')
      setScreen('select')
    } else {
      openRegisterForm(pendingMobile, 'newAccount')
    }
  }

  const openRegisterForm = (mobile: string, context: RegisterContext) => {
    setRegisterContext(context)
    setPendingMobile(mobile)
    setScreen('register')
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
    setLoginMobileInput('')
    setShowLoginOtpBlock(false)
    setLoginOtpErr('')
    setLoginMobileErr('')
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

    // Login state & handlers
    loginMobileInput,
    setLoginMobileInput,
    loginMobileErr,
    showLoginOtpBlock,
    loginOtpInput,
    setLoginOtpInput,
    loginOtpErr,
    handleGenerateLoginOtp,
    handleResendLoginOtp,
    handleVerifyLoginOtp,

    // Actions
    openRegisterForm,
    handleSelectPatientContinue,
    handleLogout,
  }
}
