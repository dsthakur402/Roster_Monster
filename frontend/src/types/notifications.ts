export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  slack: boolean;
  roster_published: boolean;
  shift_assigned: boolean;
  shift_changed: boolean;
  shift_removed: boolean;
}

export interface NotificationHistory {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'roster_published' | 'shift_assigned' | 'shift_changed' | 'shift_removed';
  data?: Record<string, any>;
  read: boolean;
  created_at: string;
  channels: ('email' | 'push' | 'sms' | 'slack')[];
}

export interface ShiftResponse {
  shift_id: number;
  staff_id: number;
  response: 'confirmed' | 'declined';
  reason?: string;
  responded_at: string;
} 