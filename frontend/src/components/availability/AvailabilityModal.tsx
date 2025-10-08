import React, { useState } from 'react';
import { format } from 'date-fns';
import { FiX } from 'react-icons/fi';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import type { AvailabilityFormData, ShiftType } from '../../types/availability';

interface AvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AvailabilityFormData) => Promise<void>;
  date: Date;
  shiftType: ShiftType;
  initialData?: AvailabilityFormData;
}

export default function AvailabilityModal({
  isOpen,
  onClose,
  onSubmit,
  date,
  shiftType,
  initialData,
}: AvailabilityModalProps) {
  const [formData, setFormData] = useState<AvailabilityFormData>(
    initialData || {
      date: format(date, 'yyyy-MM-dd'),
      shift_type: shiftType,
      is_available: true,
      note: '',
    }
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting availability:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <span className="sr-only">Close</span>
              <FiX className="h-6 w-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Set Availability
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  {format(date, 'EEEE, MMMM d, yyyy')} - {shiftType} shift
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      className="form-radio h-4 w-4 text-blue-600"
                      checked={formData.is_available}
                      onChange={() => setFormData(prev => ({ ...prev, is_available: true }))}
                    />
                    <span className="ml-2 text-gray-700">Available</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      className="form-radio h-4 w-4 text-blue-600"
                      checked={!formData.is_available}
                      onChange={() => setFormData(prev => ({ ...prev, is_available: false }))}
                    />
                    <span className="ml-2 text-gray-700">Unavailable</span>
                  </label>
                </div>

                <div>
                  <label htmlFor="note" className="block text-sm font-medium text-gray-700">
                    Note (optional)
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="note"
                      name="note"
                      rows={3}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                      value={formData.note}
                      onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                      placeholder="Add any additional information..."
                    />
                  </div>
                </div>

                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isLoading}
                    className="w-full sm:ml-3 sm:w-auto"
                  >
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={onClose}
                    className="mt-3 w-full sm:mt-0 sm:w-auto"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 