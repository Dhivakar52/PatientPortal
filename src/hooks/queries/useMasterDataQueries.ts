import { useQuery } from '@tanstack/react-query'
import {
  getDepartments,
  getDoctors,
  getTimeSlotHours,
  getTimeSlots,
  getStates,
  getCities,
  getAreas,
  type Department,
  type Doctor,
  type TimeSlotHour,
  type TimeSlot,
  type GetTimeSlotsParams,
  type StateOption,
  type CityOption,
  type AreaOption,
  type GetAreasParams,
} from '@/services/apiService'

export const masterDataQueryKeys = {
  departments: ['departments'] as const,
  doctors: (deptId?: number, docId?: number) => ['doctors', deptId, docId] as const,
  timeSlotHours: (timeSlotHoursId?: number | string) => ['timeSlotHours', timeSlotHoursId] as const,
  timeSlots: (params?: GetTimeSlotsParams | number) => ['timeSlots', params] as const,
  states: ['states'] as const,
  cities: (stateId?: number | string) => ['cities', stateId] as const,
  areas: (cityId?: number | string, searchText?: string, areaid?: number | string) => ['areas', cityId, searchText, areaid] as const,
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

export function useTimeSlotHoursQuery(timeSlotHoursId?: number | string, options?: { enabled?: boolean }) {
  return useQuery<TimeSlotHour[]>({
    queryKey: masterDataQueryKeys.timeSlotHours(timeSlotHoursId),
    queryFn: async () => {
      return getTimeSlotHours(timeSlotHoursId)
    },
    enabled: options?.enabled !== false,
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}

export function useTimeSlotsQuery(params?: GetTimeSlotsParams | number, options?: { enabled?: boolean }) {
  return useQuery<TimeSlot[]>({
    queryKey: masterDataQueryKeys.timeSlots(params),
    queryFn: async () => {
      return getTimeSlots(params)
    },
    enabled: options?.enabled !== false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useStatesQuery(options?: { enabled?: boolean }) {
  return useQuery<StateOption[]>({
    queryKey: masterDataQueryKeys.states,
    queryFn: async () => {
      const res = await getStates()
      return Array.isArray(res) ? res : []
    },
    enabled: options?.enabled !== false,
    staleTime: 1000 * 60 * 60, // 1 hour
  })
}

export function useCitiesQuery(stateId?: number | string, options?: { enabled?: boolean }) {
  return useQuery<CityOption[]>({
    queryKey: masterDataQueryKeys.cities(stateId),
    queryFn: async () => {
      const res = await getCities(stateId)
      return Array.isArray(res) ? res : []
    },
    enabled: options?.enabled !== false,
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}

export function useAreasQuery(
  params?: GetAreasParams | number | string,
  options?: { enabled?: boolean }
) {
  const cityId = typeof params === 'object' && params !== null ? (params.cityId ?? params.CityID) : params
  const searchText = typeof params === 'object' && params !== null ? params.searchText : undefined
  const areaid = typeof params === 'object' && params !== null ? (params.areaid ?? params.AreaID) : undefined

  return useQuery<AreaOption[]>({
    queryKey: masterDataQueryKeys.areas(cityId, searchText, areaid),
    queryFn: async () => {
      const res = await getAreas(params)
      return Array.isArray(res) ? res : []
    },
    enabled: options?.enabled !== false,
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}
