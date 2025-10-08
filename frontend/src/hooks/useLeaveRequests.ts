 
import { leaveRequestsApi, LeaveRequest } from '@/services/api'

interface LeaveRequestParams {
  start_date?: string
  end_date?: string
  user_id?: string
  status?: string
  type?: string
}

export function useLeaveRequests(params?: LeaveRequestParams) {
  return useQuery({
    queryKey: ['leave-requests', params],
    queryFn: () => leaveRequestsApi.getAll(params),
  })
}

export function useLeaveRequest(id: string) {
  return useQuery({
    queryKey: ['leave-requests', id],
    queryFn: () => leaveRequestsApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateLeaveRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: leaveRequestsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] })
    },
  })
}

export function useUpdateLeaveRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LeaveRequest> }) =>
      leaveRequestsApi.update(id, data),
    onSuccess: (_: unknown, variables: { id: string; data: Partial<LeaveRequest> }) => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] })
      queryClient.invalidateQueries({ queryKey: ['leave-requests', variables.id] })
    },
  })
}

export function useDeleteLeaveRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: leaveRequestsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] })
    },
  })
}