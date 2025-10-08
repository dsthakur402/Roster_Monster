export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
}

export interface RegistrationData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface RolePermissions {
  admin: string[];
  manager: string[];
  staff: string[];
}

export const DEFAULT_ROLE_PERMISSIONS: RolePermissions = {
  admin: ['*'], // All permissions
  manager: [
    'view_roster',
    'edit_roster',
    'view_staff',
    'edit_staff',
    'view_locations',
    'edit_locations',
    'approve_leave',
  ],
  staff: [
    'view_roster',
    'view_staff',
    'view_locations',
    'request_leave',
  ],
}; 