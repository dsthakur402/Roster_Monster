export interface RosterShift {
  id: number;
  date: string;
  location_id: number;
  location: {
    id: number;
    name: string;
    type: string;
  };
  staff_id: number;
  shift_type: 'morning' | 'afternoon' | 'night';
  status: 'scheduled' | 'confirmed' | 'declined';
}

export interface RosterStaff {
  id: number;
  user_id: number;
  user_name: string;
  role_id: number;
  role_name: string;
  group_id: number | null;
  group_name: string | null;
  fte_clinical: number;
  fte_research: number;
  fte_admin: number;
  preferences?: {
    preferred_locations?: number[];
    preferred_shifts?: string[];
    max_consecutive_days?: number;
  };
  constraints?: {
    leave_dates?: string[];
    cannot_work_with?: number[];
    required_breaks?: number;
  };
}

export interface RosterLocation {
  id: number;
  name: string;
  description: string | null;
  location_type: 'clinical' | 'research' | 'admin';
  priority: number;
  priority_group: string | null;
  min_staff_required: number;
  fte_points: number;
  allows_double_station: boolean;
  constraints?: {
    required_roles?: number[];
    required_skills?: string[];
    max_staff?: number;
  };
}

export interface RosterPeriod {
  start_date: string;
  end_date: string;
  locations: RosterLocation[];
  staff: RosterStaff[];
  shifts: RosterShift[];
}

export interface RosterGenerationConfig {
  start_date: string;
  end_date: string;
  shift_patterns: {
    morning: { start: string; end: string };
    afternoon: { start: string; end: string };
    night: { start: string; end: string };
  };
  rules: {
    max_consecutive_days: number;
    min_rest_between_shifts: number;
    max_shifts_per_week: number;
    preferred_staff_level: number;
    allow_overtime: boolean;
  };
  weights: {
    staff_preference: number;
    location_priority: number;
    skill_match: number;
    fairness: number;
    continuity: number;
  };
}

export interface RosterSolution {
  shifts: RosterShift[];
  metrics: {
    staff_satisfaction: number;
    coverage: number;
    fairness_score: number;
    constraint_violations: number;
  };
} 