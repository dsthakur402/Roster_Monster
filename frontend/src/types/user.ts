export interface User {
  id: number;
  name: string;
  email: string;
  userType: 'RADIOLOGIST' | 'ADMIN' | 'OTHER';
  createDate: string;
  updateDate?: string;
  lastActivateTime: string;
} 