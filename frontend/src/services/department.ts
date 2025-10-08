import { fetchWithAuth } from '@/utils/fetchWithAuth';
import { Department } from '@/lib/roster';

export const departmentService = {
  async getDepartments(): Promise<Department[]> {
    const response = await fetchWithAuth('/api/staff/departments');
    if (!response.ok) {
      throw new Error('Failed to fetch departments');
    }
    return response.json();
  },

  async createDepartment(department: Omit<Department, 'id' | 'createDate' | 'updateDate'>): Promise<Department> {
    const response = await fetchWithAuth('/api/staff/departments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(department),
    });
    if (!response.ok) {
      throw new Error('Failed to create department');
    }
    return response.json();
  },

  async updateDepartment(id: string, department: Partial<Department>): Promise<Department> {
    const response = await fetchWithAuth(`/api/staff/departments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(department),
    });
    if (!response.ok) {
      throw new Error('Failed to update department');
    }
    return response.json();
  },

  async deleteDepartment(id: string): Promise<void> {
    const response = await fetchWithAuth(`/api/staff/departments/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete department');
    }
  },
}; 