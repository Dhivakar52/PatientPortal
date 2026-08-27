import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  saveAppointment,
  cancelAppointment,
  savePatient,
  type SaveAppointmentRequest,
  type RegisterPatientRequest,
} from '@/services/apiService'
import { appointmentsQueryKeys } from '../queries/useAppointmentsQuery'
import { dashboardQueryKeys } from '../queries/useDashboardQuery'
import { patientQueryKeys } from '../queries/usePatientQuery'
import { usersQueryKeys } from '../queries/useUsersQuery'
import { useAuthStore } from '@/stores/authStore'

export function useSaveAppointmentMutation() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.userId)

  return useMutation({
    mutationFn: async (payload: SaveAppointmentRequest) => {
      return saveAppointment(payload)
    },
    onSuccess: (_, variables) => {
      // Invalidate appointment list and dashboard for this user/patient
      queryClient.invalidateQueries({
        queryKey: appointmentsQueryKeys.user(userId),
      })
      queryClient.invalidateQueries({
        queryKey: dashboardQueryKeys.user(userId),
      })
      if (variables.patientID) {
        queryClient.invalidateQueries({
          queryKey: ['appointments', userId, variables.patientID],
        })
        queryClient.invalidateQueries({
          queryKey: ['dashboard', userId, variables.patientID],
        })
      }
    },
  })
}

export function useCancelAppointmentMutation() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.userId)

  return useMutation({
    mutationFn: async ({
      appointmentId,
      patientId,
      cancelledReason,
    }: {
      appointmentId: number
      patientId: number
      cancelledReason?: string
    }) => {
      return cancelAppointment(appointmentId, patientId, cancelledReason)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: appointmentsQueryKeys.user(userId),
      })
      queryClient.invalidateQueries({
        queryKey: dashboardQueryKeys.user(userId),
      })
      if (variables.patientId) {
        queryClient.invalidateQueries({
          queryKey: ['appointments', userId, variables.patientId],
        })
        queryClient.invalidateQueries({
          queryKey: ['dashboard', userId, variables.patientId],
        })
      }
    },
  })
}

export function useSavePatientMutation() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.userId)

  return useMutation({
    mutationFn: async (payload: RegisterPatientRequest) => {
      return savePatient(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: usersQueryKeys.user(userId),
      })
      queryClient.invalidateQueries({
        queryKey: patientQueryKeys.user(userId),
      })
    },
  })
}
