import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'

export interface FTEScale {
  id: string
  name: string
  type: "shifts" | "hours" | "days"
  baseValue: number
  equivalentFTE: number
}

export interface FTEAssignment {
  id: string
  scaleId: string
  targetType: "role" | "staff" | "group"
  targetId: string
  value: number
}

export interface FTEPagination {
  items: FTEAssignment[]
  total: number
  page: number
  size: number
  pages: number
}

export interface CreateFTEScale {
  name: string
  type: "shifts" | "hours" | "days"
  baseValue: number
  equivalentFTE: number
}

export interface CreateFTEAssignment {
  scaleId: string
  targetType: "role" | "staff" | "group"
  targetId: string
  value: number
}

export const fteService = {
  // FTE Scale endpoints
  async getFTEScales(): Promise<FTEScale[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/fte/scales`)
      return response.data || []
    } catch (error) {
      console.error('Error fetching FTE scales:', error)
      return []
    }
  },

  async createFTEScale(data: CreateFTEScale): Promise<FTEScale> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/fte/scales`, data)
      return response.data
    } catch (error) {
      console.error('Error creating FTE scale:', error)
      throw error
    }
  },

  async updateFTEScale(id: string, data: CreateFTEScale): Promise<FTEScale> {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/fte/scales/${id}`, data)
      return response.data
    } catch (error) {
      console.error('Error updating FTE scale:', error)
      throw error
    }
  },

  async deleteFTEScale(id: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/api/fte/scales/${id}`)
    } catch (error) {
      console.error('Error deleting FTE scale:', error)
      throw error
    }
  },

  // FTE Assignment endpoints
  async getFTEAssignments(page: number = 1, size: number = 10): Promise<FTEPagination> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/fte/assignments`, {
        params: { page, size }
      })
      return response.data || { items: [], total: 0, page, size, pages: 0 }
    } catch (error) {
      console.error('Error fetching FTE assignments:', error)
      return { items: [], total: 0, page, size, pages: 0 }
    }
  },

  async createFTEAssignment(data: CreateFTEAssignment): Promise<FTEAssignment> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/fte/assignments`, data)
      return response.data
    } catch (error) {
      console.error('Error creating FTE assignment:', error)
      throw error
    }
  },

  async updateFTEAssignment(id: string, data: CreateFTEAssignment): Promise<FTEAssignment> {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/fte/assignments/${id}`, data)
      return response.data
    } catch (error) {
      console.error('Error updating FTE assignment:', error)
      throw error
    }
  },

  async deleteFTEAssignment(id: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/api/fte/assignments/${id}`)
    } catch (error) {
      console.error('Error deleting FTE assignment:', error)
      throw error
    }
  }
} 