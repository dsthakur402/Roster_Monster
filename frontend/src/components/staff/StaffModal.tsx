'use client';

import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff?: {
    id: number;
    user_id: number;
    role_id: number;
    group_id: number | null;
    fte_clinical: number;
    fte_research: number;
    fte_admin: number;
    role_name: string;
    group_name: string | null;
    user_name: string;
  };
  onSave: (data: any) => Promise<void>;
}

const StaffModal: React.FC<StaffModalProps> = ({ isOpen, onClose, staff, onSave }) => {
  const [formData, setFormData] = useState({
    user_name: '',
    role_id: '',
    group_id: '',
    fte_clinical: 0,
    fte_research: 0,
    fte_admin: 0,
  });
  const [roles, setRoles] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchRolesAndGroups();
      if (staff) {
        setFormData({
          user_name: staff.user_name,
          role_id: staff.role_id.toString(),
          group_id: staff.group_id?.toString() || '',
          fte_clinical: staff.fte_clinical,
          fte_research: staff.fte_research,
          fte_admin: staff.fte_admin,
        });
      } else {
        setFormData({
          user_name: '',
          role_id: '',
          group_id: '',
          fte_clinical: 0,
          fte_research: 0,
          fte_admin: 0,
        });
      }
    }
  }, [isOpen, staff]);

  const fetchRolesAndGroups = async () => {
    try {
      const [rolesResponse, groupsResponse] = await Promise.all([
        fetch('/api/roster/roles'),
        fetch('/api/roster/groups'),
      ]);
      const rolesData = await rolesResponse.json();
      const groupsData = await groupsResponse.json();
      setRoles(rolesData);
      setGroups(groupsData);
    } catch (error) {
      console.error('Error fetching roles and groups:', error);
      setError('Failed to load roles and groups');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await onSave({
        ...formData,
        role_id: parseInt(formData.role_id),
        group_id: formData.group_id ? parseInt(formData.group_id) : null,
      });
      onClose();
    } catch (error) {
      console.error('Error saving staff:', error);
      setError('Failed to save staff member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={staff ? 'Edit Staff Member' : 'Add Staff Member'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <div>
          <label htmlFor="user_name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            name="user_name"
            id="user_name"
            value={formData.user_name}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="role_id" className="block text-sm font-medium text-gray-700">
            Role
          </label>
          <select
            id="role_id"
            name="role_id"
            value={formData.role_id}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          >
            <option value="">Select a role</option>
            {roles.map((role: any) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="group_id" className="block text-sm font-medium text-gray-700">
            Group
          </label>
          <select
            id="group_id"
            name="group_id"
            value={formData.group_id}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">No group</option>
            {groups.map((group: any) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="fte_clinical" className="block text-sm font-medium text-gray-700">
              Clinical FTE
            </label>
            <input
              type="number"
              name="fte_clinical"
              id="fte_clinical"
              min="0"
              max="1"
              step="0.1"
              value={formData.fte_clinical}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="fte_research" className="block text-sm font-medium text-gray-700">
              Research FTE
            </label>
            <input
              type="number"
              name="fte_research"
              id="fte_research"
              min="0"
              max="1"
              step="0.1"
              value={formData.fte_research}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="fte_admin" className="block text-sm font-medium text-gray-700">
              Admin FTE
            </label>
            <input
              type="number"
              name="fte_admin"
              id="fte_admin"
              min="0"
              max="1"
              step="0.1"
              value={formData.fte_admin}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
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

export default StaffModal; 