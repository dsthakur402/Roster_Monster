import axios from 'axios';
import { Location } from '@/lib/roles';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';

export const locationService = {
  async getAllLocations(): Promise<Location[]> {
    const response = await axios.get(`${API_BASE_URL}/api/locations`);
    return response.data;
  },

  async getLocationById(id: number): Promise<Location> {
    const response = await axios.get(`${API_BASE_URL}/api/locations/${id}`);
    return response.data;
  },

  async createLocation(location: Omit<Location, 'id'>): Promise<Location> {
    const response = await axios.post(`${API_BASE_URL}/api/locations`, location);
    return response.data;
  },

  async updateLocation(id: number, location: Partial<Location>): Promise<Location> {
    const response = await axios.put(`${API_BASE_URL}/api/locations/${id}`, location);
    return response.data;
  },

  async deleteLocation(id: number): Promise<void> {
    await axios.delete(`${API_BASE_URL}/api/locations/${id}`);
  }
}; 