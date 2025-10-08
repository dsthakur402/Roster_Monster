 
import { availabilityApi, Availability } from '@/services/api'

interface AvailabilityParams {
  user_id?: string
  day_of_week?: number
  is_available?: boolean
}

export function useAvailability(params?: AvailabilityParams) {
  return useQuery({
    queryKey: ['availability', params],
    queryFn: () => availabilityApi.getAll(params),
  })
}

export function useAvailabilityById(id: string) {
  return useQuery({
    queryKey: ['availability', id],
    queryFn: () => availabilityApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateAvailability() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: availabilityApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] })
    },
  })
}

export function useUpdateAvailability() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Availability> }) =>
      availabilityApi.update(id, data),
    onSuccess: (_: unknown, variables: { id: string; data: Partial<Availability> }) => {
      queryClient.invalidateQueries({ queryKey: ['availability'] })
      queryClient.invalidateQueries({ queryKey: ['availability', variables.id] })
    },
  })
}

export function useDeleteAvailability() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: availabilityApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] })
    },
  })
} 