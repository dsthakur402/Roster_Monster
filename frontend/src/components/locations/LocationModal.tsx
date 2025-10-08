'use client';

import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  location?: {
    id: number;
    name: string;
    description: string | null;
    location_type: 'clinical' | 'research' | 'admin';
    priority: number;
    priority_group: string | null;
    min_staff_required: number;
    fte_points: number;
    allows_double_station: boolean;
  };
  onSave: (data: any) => Promise<void>;
}

const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose, location, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location_type: 'clinical',
    priority: 1,
    priority_group: '',
    min_staff_required: 1,
    fte_points: 1,
    allows_double_station: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && location) {
      setFormData({
        name: location.name,
        description: location.description || '',
        location_type: location.location_type,
        priority: location.priority,
        priority_group: location.priority_group || '',
        min_staff_required: location.min_staff_required,
        fte_points: location.fte_points,
        allows_double_station: location.allows_double_station,
      });
    } else if (isOpen) {
      setFormData({
        name: '',
        description: '',
        location_type: 'clinical',
        priority: 1,
        priority_group: '',
        min_staff_required: 1,
        fte_points: 1,
        allows_double_station: false,
      });
    }
  }, [isOpen, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await onSave({
        ...formData,
        priority: parseInt(formData.priority.toString()),
        min_staff_required: parseInt(formData.min_staff_required.toString()),
        fte_points: parseFloat(formData.fte_points.toString()),
      });
      onClose();
    } catch (error) {
      console.error('Error saving location:', error);
      setError('Failed to save location');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={location ? 'Edit Location' : 'Add Location'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            id="description"
            rows={3}
            value={formData.description}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="location_type" className="block text-sm font-medium text-gray-700">
            Type
          </label>
          <select
            id="location_type"
            name="location_type"
            value={formData.location_type}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          >
            <option value="clinical">Clinical</option>
            <option value="research">Research</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
              Priority
            </label>
            <input
              type="number"
              name="priority"
              id="priority"
              min="1"
              value={formData.priority}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="priority_group" className="block text-sm font-medium text-gray-700">
              Priority Group
            </label>
            <input
              type="text"
              name="priority_group"
              id="priority_group"
              value={formData.priority_group}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="min_staff_required" className="block text-sm font-medium text-gray-700">
              Minimum Staff Required
            </label>
            <input
              type="number"
              name="min_staff_required"
              id="min_staff_required"
              min="1"
              value={formData.min_staff_required}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="fte_points" className="block text-sm font-medium text-gray-700">
              FTE Points
            </label>
            <input
              type="number"
              name="fte_points"
              id="fte_points"
              min="0"
              step="0.1"
              value={formData.fte_points}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="allows_double_station"
            id="allows_double_station"
            checked={formData.allows_double_station}
            onChange={handleInputChange}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="allows_double_station" className="ml-2 block text-sm text-gray-900">
            Allows Double Station
          </label>
        </div>

        <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default LocationModal; 