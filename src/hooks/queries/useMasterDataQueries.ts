import { useQuery } from '@tanstack/react-query'
import { getDepartments, getDoctors, getTimeSlots, type Department, type Doctor, type TimeSlot } from '@/services/apiService'

export const masterDataQueryKeys = {
  departments: ['departments'] as const,
  doctors: (deptId?: number, docId?: number) => ['doctors', deptId, docId] as const,
  timeSlots: (slotId?: number) => ['timeSlots', slotId] as const,
}

export function useDepartmentsQuery(options?: { enabled?: boolean }) {
  return useQuery<Department[]>({
    queryKey: masterDataQueryKeys.departments,
    queryFn: async () => {
      return getDepartments()
    },
    enabled: options?.enabled !== false,
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}

export function useDoctorsQuery(deptId?: number, docId?: number, options?: { enabled?: boolean }) {
  return useQuery<Doctor[]>({
    queryKey: masterDataQueryKeys.doctors(deptId, docId),
    queryFn: async () => {
      return getDoctors(deptId, docId)
    },
    enabled: options?.enabled !== false,
    staleTime: 1000 * 60 * 15, // 15 minutes
  })
}

export function useTimeSlotsQuery(slotId?: number, options?: { enabled?: boolean }) {
  return useQuery<TimeSlot[]>({
    queryKey: masterDataQueryKeys.timeSlots(slotId),
    queryFn: async () => {
      return getTimeSlots(slotId)
    },
    enabled: options?.enabled !== false,
    staleTime: 1000 * 60 * 15, // 15 minutes
  })
}
