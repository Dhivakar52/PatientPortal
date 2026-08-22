import { useQuery } from '@tanstack/react-query'
import { getDashboard, type DashboardParams, type DashboardResponse } from '@/services/apiService'

export const dashboardQueryKeys = {
  all: ['dashboard'] as const,
  user: (userId: string | number | null) => ['dashboard', userId] as const,
  patient: (
    userId: string | number | null,
    patientId: string | number | null,
    params?: DashboardParams
  ) => ['dashboard', userId, patientId, params] as const,
}

export function useDashboardQuery(
  userId: string | number | null,
  patientId: string | number | null,
  params?: DashboardParams,
  options?: { enabled?: boolean }
) {
  const numericPatientId = patientId ? Number(patientId) : undefined
  const isEnabled = options?.enabled !== false && !!numericPatientId

  return useQuery<DashboardResponse>({
    queryKey: dashboardQueryKeys.patient(userId, numericPatientId || null, params),
    queryFn: async () => {
      if (!numericPatientId) {
        return { UpcomingAppointments: [], PastVisits: [] }
      }
      return getDashboard({
        patientID: numericPatientId,
        pageNo: params?.pageNo || 1,
        recordCount: params?.recordCount || 10,
        ...params,
      })
    },
    enabled: isEnabled,
    staleTime: 1000 * 60, // 1 min
  })
}
