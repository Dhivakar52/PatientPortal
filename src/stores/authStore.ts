import { create } from 'zustand'
import { queryClient } from '@/lib/queryClient'

export interface AuthUser {
  userId: string | number
  name: string
  email?: string
  mobile?: string
  phoneNo?: string
  avatar?: string
  roles?: string[]
  [key: string]: unknown
}

export interface UserAccountSession {
  userId: string | number
  phoneNo: string
  name?: string
  authToken?: string
  refreshToken?: string
  activePatientId?: string | number | null
}

export interface AuthState {
  user: AuthUser | null
  userId: string | number | null
  activePatientId: string | number | null
  activePhone: string | null
  authToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  knownAccounts: UserAccountSession[]

  // Actions
  setAuth: (payload: {
    user?: AuthUser | null
    userId?: string | number | null
    activePatientId?: string | number | null
    activePhone?: string | null
    authToken?: string | null
    refreshToken?: string | null
  }) => void

  switchAccount: (
    accountOrUserId: string | number | UserAccountSession,
    targetPatientId?: string | number | null
  ) => void

  setActivePatient: (patientId: string | number | null) => void

  addKnownAccount: (account: UserAccountSession) => void

  logout: () => void

  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Initialize from localStorage
  const storedToken = localStorage.getItem('authToken') || null
  const storedUserId = localStorage.getItem('userID') || localStorage.getItem('srm_patient_user_id') || null
  const storedActivePhone = localStorage.getItem('srm_patient_current_mobile') || null
  const storedActivePatientId = localStorage.getItem('srm_patient_active_id') || null

  let initialUser: AuthUser | null = null
  try {
    const userStr = localStorage.getItem('user')
    if (userStr) initialUser = JSON.parse(userStr)
  } catch {
    initialUser = null
  }

  let initialAccounts: UserAccountSession[] = []
  try {
    const accStr = localStorage.getItem('srm_known_accounts')
    if (accStr) initialAccounts = JSON.parse(accStr)
  } catch {
    initialAccounts = []
  }

  return {
    user: initialUser,
    userId: storedUserId,
    activePatientId: storedActivePatientId,
    activePhone: storedActivePhone,
    authToken: storedToken,
    refreshToken: localStorage.getItem('refreshToken') || null,
    isAuthenticated: !!storedToken || localStorage.getItem('isAuthenticated') === 'true' || !!storedUserId,
    knownAccounts: initialAccounts,

    setAuth: ({ user, userId, activePatientId, activePhone, authToken, refreshToken }) => {
      set((state) => {
        const nextUserId = userId !== undefined ? userId : state.userId
        const nextUser = user !== undefined ? user : state.user
        const nextActivePhone = activePhone !== undefined ? activePhone : (nextUser?.mobile || nextUser?.phoneNo || state.activePhone)
        const nextActivePatientId = activePatientId !== undefined ? activePatientId : state.activePatientId
        const nextToken = authToken !== undefined ? authToken : state.authToken
        const nextRefreshToken = refreshToken !== undefined ? refreshToken : state.refreshToken
        const isAuth = !!nextToken || !!nextUserId

        // Sync with localStorage
        if (nextToken) localStorage.setItem('authToken', nextToken)
        if (nextRefreshToken) localStorage.setItem('refreshToken', nextRefreshToken)
        if (nextUserId != null) {
          localStorage.setItem('userID', String(nextUserId))
          localStorage.setItem('srm_patient_user_id', String(nextUserId))
        }
        if (nextActivePhone) localStorage.setItem('srm_patient_current_mobile', String(nextActivePhone))
        if (nextActivePatientId != null) localStorage.setItem('srm_patient_active_id', String(nextActivePatientId))
        if (nextUser) localStorage.setItem('user', JSON.stringify(nextUser))
        localStorage.setItem('isAuthenticated', isAuth ? 'true' : 'false')

        // Register in knownAccounts if phoneNo/userId provided
        let updatedAccounts = [...state.knownAccounts]
        if (nextActivePhone) {
          const existingIdx = updatedAccounts.findIndex(
            (a) => a.phoneNo === nextActivePhone || (nextUserId != null && a.userId === nextUserId)
          )
          const newSession: UserAccountSession = {
            userId: nextUserId || '',
            phoneNo: nextActivePhone,
            name: nextUser?.name,
            authToken: nextToken || undefined,
            refreshToken: nextRefreshToken || undefined,
            activePatientId: nextActivePatientId,
          }
          if (existingIdx !== -1) {
            updatedAccounts[existingIdx] = { ...updatedAccounts[existingIdx], ...newSession }
          } else {
            updatedAccounts.push(newSession)
          }
          localStorage.setItem('srm_known_accounts', JSON.stringify(updatedAccounts))
        }

        return {
          user: nextUser,
          userId: nextUserId,
          activePatientId: nextActivePatientId,
          activePhone: nextActivePhone,
          authToken: nextToken,
          refreshToken: nextRefreshToken,
          isAuthenticated: isAuth,
          knownAccounts: updatedAccounts,
        }
      })
    },

    switchAccount: (accountOrUserId, targetPatientId) => {
      const state = get()
      let targetAccount: UserAccountSession | undefined

      if (typeof accountOrUserId === 'object') {
        targetAccount = accountOrUserId
      } else {
        targetAccount = state.knownAccounts.find(
          (a) => String(a.userId) === String(accountOrUserId) || String(a.phoneNo) === String(accountOrUserId)
        )
      }

      const previousUserId = state.userId
      const previousPatientId = state.activePatientId

      // Cancel previous user & patient's active queries so they don't complete into state
      if (previousUserId) {
        queryClient.cancelQueries({ queryKey: ['appointments', previousUserId] })
        queryClient.cancelQueries({ queryKey: ['dashboard', previousUserId] })
        queryClient.cancelQueries({ queryKey: ['patient', previousUserId] })
      }
      if (previousPatientId) {
        queryClient.cancelQueries({ queryKey: ['appointments', previousUserId, previousPatientId] })
        queryClient.cancelQueries({ queryKey: ['dashboard', previousUserId, previousPatientId] })
      }

      if (targetAccount) {
        const nextUserId = targetAccount.userId
        const nextPhone = targetAccount.phoneNo
        const nextToken = targetAccount.authToken || state.authToken
        const nextPatientId = targetPatientId !== undefined ? targetPatientId : targetAccount.activePatientId

        const nextUser: AuthUser = {
          userId: nextUserId,
          name: targetAccount.name || (state.user?.name || `User ${nextPhone}`),
          mobile: nextPhone,
          phoneNo: nextPhone,
        }

        get().setAuth({
          user: nextUser,
          userId: nextUserId,
          activePhone: nextPhone,
          activePatientId: nextPatientId,
          authToken: nextToken,
          refreshToken: targetAccount.refreshToken,
        })
      } else if (typeof accountOrUserId === 'string' || typeof accountOrUserId === 'number') {
        get().setAuth({
          userId: accountOrUserId,
          activePatientId: targetPatientId !== undefined ? targetPatientId : null,
        })
      }
    },

    setActivePatient: (patientId) => {
      set({ activePatientId: patientId })
      if (patientId != null) {
        localStorage.setItem('srm_patient_active_id', String(patientId))
      } else {
        localStorage.removeItem('srm_patient_active_id')
      }
    },

    addKnownAccount: (account) => {
      set((state) => {
        const existingIdx = state.knownAccounts.findIndex(
          (a) => a.phoneNo === account.phoneNo || a.userId === account.userId
        )
        const updated = [...state.knownAccounts]
        if (existingIdx !== -1) {
          updated[existingIdx] = { ...updated[existingIdx], ...account }
        } else {
          updated.push(account)
        }
        localStorage.setItem('srm_known_accounts', JSON.stringify(updated))
        return { knownAccounts: updated }
      })
    },

    logout: () => {
      // Clear TanStack Query Cache
      queryClient.clear()

      // Clear LocalStorage
      localStorage.clear()

      // Reset state
      set({
        user: null,
        userId: null,
        activePatientId: null,
        activePhone: null,
        authToken: null,
        refreshToken: null,
        isAuthenticated: false,
        knownAccounts: [],
      })
    },

    clearAuth: () => {
      set({
        user: null,
        userId: null,
        activePatientId: null,
        activePhone: null,
        authToken: null,
        refreshToken: null,
        isAuthenticated: false,
      })
    },
  }
})
