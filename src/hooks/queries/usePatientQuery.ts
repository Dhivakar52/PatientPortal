import { useQuery } from '@tanstack/react-query'
import { fetchPatient } from '@/services/apiService'
import { type Patient } from '@/types/patient.types'

export const patientQueryKeys = {
  all: ['patient'] as const,
  user: (userId: string | number | null) => ['patient', userId] as const,
  detail: (userId: string | number | null, patientId: string | number | null) =>
    ['patient', userId, patientId] as const,
}

export function usePatientQuery(
  userId: string | number | null,
  patientId: string | number | null,
  options?: { enabled?: boolean }
) {
  const isEnabled = options?.enabled !== false && (!!patientId || !!userId)

  return useQuery<Patient[]>({
    queryKey: patientQueryKeys.detail(userId, patientId),
    queryFn: async () => {
      const res = await fetchPatient({
        patientID: patientId || undefined,
        userID: userId || undefined,
      })
      return res || []
    },
    enabled: isEnabled,
    staleTime: 1000 * 60 * 5, // 5 min
  })
}
