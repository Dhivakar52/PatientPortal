import { useQuery } from '@tanstack/react-query'
import { getUsers, type UserData } from '@/services/apiService'

export const usersQueryKeys = {
  all: ['users'] as const,
  user: (userId: string | number | null) => ['users', userId] as const,
  byPhone: (userId: string | number | null, phoneNo: string | null) =>
    ['users', userId, phoneNo] as const,
}

export function useUsersQuery(
  userId: string | number | null,
  phoneNo: string | null,
  options?: { enabled?: boolean }
) {
  const isEnabled = options?.enabled !== false && !!phoneNo

  return useQuery<UserData[]>({
    queryKey: usersQueryKeys.byPhone(userId, phoneNo),
    queryFn: async () => {
      if (!phoneNo) return []
      return getUsers({ phoneNo })
    },
    enabled: isEnabled,
    staleTime: 1000 * 60 * 5, // 5 mins
  })
}
