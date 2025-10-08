export type ShiftType = 'morning' | 'afternoon' | 'night';

export interface TimeSlot {
  id: number;
  start: string;
  end: string;
  label: string;
}

export interface AvailabilitySlot {
  id: number;
  staff_id: number;
  date: string;
  shift_type: string;
  is_available: boolean;
  note?: string;
  date_created: string;
  date_modified: string;
  active: boolean;
}

export interface AvailabilityFormData {
  date: string;
  shift_type: string;
  is_available: boolean;
  note?: string;
}

export const DEFAULT_TIME_SLOTS: TimeSlot[] = [
  { id: 1, start: '07:00', end: '15:00', label: 'Morning' },
  { id: 2, start: '15:00', end: '23:00', label: 'Evening' },
  { id: 3, start: '23:00', end: '07:00', label: 'Night' },
]; 