 
import { shiftsApi, Shift } from '@/services/api'

export function useShifts(params?: any) {
  return useQuery({
    queryKey: ['shifts', params],
    queryFn: () => shiftsApi.getAll(params),
  })
}

export function useShift(id: string) {
  return useQuery({
    queryKey: ['shifts', id],
    queryFn: () => shiftsApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateShift() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: shiftsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] })
    },
  })
}

export function useUpdateShift() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Shift> }) =>
      shiftsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] })
      queryClient.invalidateQueries({ queryKey: ['shifts', variables.id] })
    },
  })
}

export function useDeleteShift() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: shiftsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] })
    },
  })
}
  return useMutation({
    mutationFn: shiftsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] })
    },
  })
}