import axios from 'axios'
import { Staff } from '@/lib/roster'
import { Role } from '@/lib/roles'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'

// Backend API interfaces
export interface APIRole {
  id?: number
  name: string
  description: string
}

export interface StaffMember {
  id: number
  name: string
  department: {
    id: number
    name: string
    description: string
  }
  email: string
  roles: {
    id: number
    name: string
    description: string
  }[]
  is_active: boolean
}

export interface StaffGroup {
  id: number
  name: string
  description?: string
  members: number[]
  roles: number[]
  locations: number[]
  createDate?: string
  updateDate?: string
}

export interface Department {
  id: number
  name: string
  description: string
}

export const staffService = {
  getStaffMembers: async (): Promise<StaffMember[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/staff`)
      return response.data || []
    } catch (error) {
      console.error('Error fetching staff members:', error)
      return []
    }
  },

  getStaffMember: async (id: number): Promise<StaffMember> => {
    const response = await axios.get(`${API_BASE_URL}/api/staff/${id}`)
    return response.data
  },

  createStaffMember: async (staff: Omit<StaffMember, 'id'>): Promise<StaffMember> => {
    const response = await axios.post(`${API_BASE_URL}/api/staff`, staff)
    return response.data
  },

  updateStaffMember: async (id: number, staff: Partial<StaffMember>): Promise<StaffMember> => {
    const response = await axios.put(`${API_BASE_URL}/api/staff/${id}`, staff)
    return response.data
  },

  deleteStaffMember: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/api/staff/${id}`)
  },

  getStaffGroups: async (): Promise<StaffGroup[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/staff/groups`)
      return response.data || []
    } catch (error) {
      console.error('Error fetching staff groups:', error)
      return []
    }
  },

  createStaffGroup: async (group: Omit<StaffGroup, 'id'>): Promise<StaffGroup> => {
    const response = await axios.post(`${API_BASE_URL}/api/staff/groups`, group)
    return response.data
  },

  updateStaffGroup: async (id: number, group: Partial<StaffGroup>): Promise<StaffGroup> => {
    const response = await axios.put(`${API_BASE_URL}/api/staff/groups/${id}`, group)
    return response.data
  },

  deleteStaffGroup: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/api/staff/groups/${id}`)
  },

  getRoles: async (): Promise<Role[]> => {
    try {
      const response = await axios.get<APIRole[]>(`${API_BASE_URL}/api/staff/roles`)
      // Convert API roles to frontend roles
      return response.data.map(role => ({
        id: role.id?.toString() || '',
        name: role.name,
        department: role.description || '',
        maxHoursPerWeek: 40,
        requiresCertification: false,
        pointsPerShift: {
          morning: 10,
          evening: 15,
          night: 20,
          weekend: 25,
          holiday: 30
        }
      })) || []
    } catch (error) {
      console.error('Error fetching roles:', error)
      return []
    }
  },

  getDepartments: async (): Promise<Department[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/staff/departments`)
      return response.data || []
    } catch (error) {
      console.error('Error fetching departments:', error)
      return []
    }
  },

  createRole: async (role: Omit<APIRole, 'id'>): Promise<Role> => {
    try {
      const response = await axios.post<APIRole>(`${API_BASE_URL}/api/staff/roles`, role)
      // Convert API role to frontend role
      return {
        id: response.data.id?.toString() || '',
        name: response.data.name,
        department: response.data.description || '',
        maxHoursPerWeek: 40,
        requiresCertification: false,
        pointsPerShift: {
          morning: 10,
          evening: 15,
          night: 20,
          weekend: 25,
          holiday: 30
        }
      }
    } catch (error) {
      console.error('Error creating role:', error)
      throw error
    }
  },

  updateRole: async (id: number | string, role: Partial<APIRole>): Promise<Role> => {
    try {
      const response = await axios.put<APIRole>(`${API_BASE_URL}/api/staff/roles/${id}`, role)
      // Convert API role to frontend role
      return {
        id: response.data.id?.toString() || '',
        name: response.data.name,
        department: response.data.description || '',
        maxHoursPerWeek: 40,
        requiresCertification: false,
        pointsPerShift: {
          morning: 10,
          evening: 15,
          night: 20,
          weekend: 25,
          holiday: 30
        }
      }
    } catch (error) {
      console.error('Error updating role:', error)
      throw error
    }
  },

  deleteRole: async (id: number | string): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/api/staff/roles/${id}`)
    } catch (error) {
      console.error('Error deleting role:', error)
      throw error
    }
  }
}