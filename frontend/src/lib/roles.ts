
import { Holiday } from "@/lib/holidays"

export interface Role {
  id: string
  name: string
  department: string
  maxHoursPerWeek: number
  requiresCertification: boolean
  pointsPerShift: {
    morning: number
    evening: number
    night: number
    weekend: number
    holiday: number
  }
}

export interface StaffGroup {
  id: string
  name: string
  roles: Role[]
  members: string[]
  locations: Location[]
  shiftPreferences: {
    preferredShiftLength: number
    maxConsecutiveDays: number
    minRestBetweenShifts: number
  }
}

export interface Session {
  title: string
  type: "AM" | "PM" | "Evening" | "Night"
  startTime: string
  endTime: string
  fteValue: number
}

export interface DateOverride {
  date: Date
  sessions: Session[]
}

export interface Location {
  id: string
  name: string
  department: string
  type: "clinical" | "admin" | "research"
  requiredUsers: {
    userId: string
    count: number
  }[]
  requiredRoles: {
    roleId: string
    count: number
  }[]
  requiredGroups: {
    groupId: string
    count: number
  }[]
  minStaffCount: number
  priority: number
  sessions: {
    type: "Weekday" | "Weekend" | "Weekday & Weekend"
    sessions: {
      title: string
      timings: Session[]
    }[]
  }[]
  dateOverrides: DateOverride[]
}

export const defaultLocations: Location[] = [
  {
    id: "admin",
    name: "Administrative Work",
    department: "Administration",
    type: "admin",
    requiredUsers: [],
    requiredRoles: [],
    requiredGroups: [],
    minStaffCount: 0,
    priority: 999, // Lowest priority
    sessions: [{
      type: "Weekday",
      sessions: [{
        title: "Admin Session",
        timings: [{
          title: "AM Session",
          type: "AM",
          startTime: "09:00",
          endTime: "17:00",
          fteValue: 0.1
        }]
      }]
    }],
    dateOverrides: []
  },
  {
    id: "research",
    name: "Research Activities",
    department: "Research",
    type: "research",
    requiredUsers: [],
    requiredRoles: [],
    requiredGroups: [],
    minStaffCount: 0,
    priority: 998, // Second lowest priority
    sessions: [{
      type: "Weekday",
      sessions: [{
        title: "Research Session",
        timings: [{
          title: "AM Session",
          type: "AM",
          startTime: "09:00",
          endTime: "17:00",
          fteValue: 0.1
        }]
      }]
    }],
    dateOverrides: []
  },
  {
    id: "emergency",
    name: "Emergency Department",
    department: "Medical",
    type: "clinical",
    requiredUsers: [],
    requiredRoles: [
      { roleId: "senior-doctor", count: 2 },
      { roleId: "junior-doctor", count: 3 },
      { roleId: "senior-nurse", count: 2 },
      { roleId: "staff-nurse", count: 4 }
    ],
    requiredGroups: [],
    minStaffCount: 8,
    priority: 1,
    sessions: [
      {
        type: "Weekday & Weekend",
        sessions: [
          {
            title: "Morning Shift",
            timings: [
              {
                title: "AM Shift",
                type: "AM",
                startTime: "07:00",
                endTime: "15:00",
                fteValue: 0.1
              }
            ]
          },
          {
            title: "Evening Shift",
            timings: [
              {
                title: "PM Shift",
                type: "PM",
                startTime: "15:00",
                endTime: "23:00",
                fteValue: 0.1
              }
            ]
          },
          {
            title: "Night Shift",
            timings: [
              {
                title: "Night Shift",
                type: "Night",
                startTime: "23:00",
                endTime: "07:00",
                fteValue: 0.1
              }
            ]
          }
        ]
      }
    ],
    dateOverrides: []
  }
]

export const defaultRoles: Role[] = [
  {
    id: "senior-doctor",
    name: "Senior Doctor",
    department: "Medical",
    maxHoursPerWeek: 40,
    requiresCertification: true,
    pointsPerShift: {
      morning: 10,
      evening: 15,
      night: 20,
      weekend: 25,
      holiday: 30
    }
  },
  {
    id: "junior-doctor",
    name: "Junior Doctor",
    department: "Medical",
    maxHoursPerWeek: 48,
    requiresCertification: true,
    pointsPerShift: {
      morning: 8,
      evening: 12,
      night: 16,
      weekend: 20,
      holiday: 24
    }
  },
  {
    id: "senior-nurse",
    name: "Senior Nurse",
    department: "Nursing",
    maxHoursPerWeek: 40,
    requiresCertification: true,
    pointsPerShift: {
      morning: 8,
      evening: 12,
      night: 16,
      weekend: 20,
      holiday: 24
    }
  },
  {
    id: "staff-nurse",
    name: "Staff Nurse",
    department: "Nursing",
    maxHoursPerWeek: 44,
    requiresCertification: true,
    pointsPerShift: {
      morning: 6,
      evening: 9,
      night: 12,
      weekend: 15,
      holiday: 18
    }
  },
  {
    id: "healthcare-assistant",
    name: "Healthcare Assistant",
    department: "Nursing",
    maxHoursPerWeek: 44,
    requiresCertification: false,
    pointsPerShift: {
      morning: 4,
      evening: 6,
      night: 8,
      weekend: 10,
      holiday: 12
    }
  }
]

export const defaultGroups: StaffGroup[] = [
  {
    id: "medical-team-a",
    name: "Medical Team A",
    roles: defaultRoles.filter(r => r.department === "Medical"),
    members: [],
    locations: [],
    shiftPreferences: {
      preferredShiftLength: 12,
      maxConsecutiveDays: 4,
      minRestBetweenShifts: 11
    }
  },
  {
    id: "nursing-team-a",
    name: "Nursing Team A",
    roles: defaultRoles.filter(r => r.department === "Nursing"),
    members: [],
    locations: [],
    shiftPreferences: {
      preferredShiftLength: 8,
      maxConsecutiveDays: 5,
      minRestBetweenShifts: 10
    }
  }
]
