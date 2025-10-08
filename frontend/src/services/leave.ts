import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'

export interface LeaveRequest {
  id: number
  staff_id: number
  leave_type: 'forecast' | 'non_urgent' | 'urgent'
  start_date: string
  end_date: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
}

export interface CreateLeaveRequest {
  staff_id: number
  leave_type: 'forecast' | 'non_urgent' | 'urgent'
  start_date: string
  end_date: string
}

export interface UpdateLeaveRequest {
  staff_id?: number
  leave_type?: 'forecast' | 'non_urgent' | 'urgent'
  start_date?: string
  end_date?: string
}

export const leaveService = {
  getLeaveRequests: async (skip: number = 0, limit: number = 100): Promise<LeaveRequest[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/leaves`, {
        params: { skip, limit }
      })
      return response.data || []
    } catch (error) {
      console.error('Error fetching leave requests:', error)
      return []
    }
  },

  getLeaveRequest: async (id: number): Promise<LeaveRequest | null> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/leaves/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching leave request:', error)
      return null
    }
  },

  createLeaveRequest: async (request: CreateLeaveRequest): Promise<LeaveRequest> => {
    const response = await axios.post(`${API_BASE_URL}/api/leaves`, request)
    return response.data
  },

  updateLeaveRequest: async (id: number, request: UpdateLeaveRequest): Promise<LeaveRequest> => {
    const response = await axios.put(`${API_BASE_URL}/api/leaves/${id}`, request)
    return response.data
  },

  deleteLeaveRequest: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/api/leaves/${id}`)
  },

  approveLeaveRequest: async (id: string): Promise<LeaveRequest> => {
    const response = await axios.post(`${API_BASE_URL}/api/leave/requests/${id}/approve`)
    return response.data
  },

  rejectLeaveRequest: async (id: string): Promise<LeaveRequest> => {
    const response = await axios.post(`${API_BASE_URL}/api/leave/requests/${id}/reject`)
    return response.data
  }
} 