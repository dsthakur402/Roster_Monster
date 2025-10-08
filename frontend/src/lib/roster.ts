import { Role, StaffGroup, Location } from "@/lib/roles"
import { Holiday, isWeekendOrHoliday } from "@/lib/holidays"

export interface StaffRole {
  roleId: string
  fte: number
  sessions: {
    type: "clinical" | "admin" | "research"
    fte: number
  }[]
}

export interface Staff {
  id: string
  name: string
  department: {
    id: number
    name: string
    description: string
  }
  roles: {
    id: number
    name: string
    description: string
  }[]
  points: {
    monthly: number
    total: number
  }
  availability: {
    startDate: Date
    endDate: Date
    availableShifts: ("morning" | "evening" | "night")[]
  }[]
  email?: string
}

export interface LocationPoints {
  locationId: string
  points: {
    clinical: number
    admin: number
    research: number
    emergency: number
  }
}

export interface Shift {
  date: Date
  type: "morning" | "evening" | "night"
  staffIds: string[]
  roleId: string
  locationId: string
  department: string
  points: number
}

export interface RosterEntry {
  date: Date
  shifts: Shift[]
}

export function calculateStaffPoints(
  staff: Staff[],
  roster: RosterEntry[],
  locationPoints: LocationPoints[],
  locations: Location[]
): Staff[] {
  const updatedStaff = staff.map(member => {
    let monthlyPoints = 0
    let totalPoints = member.points?.total || 0

    roster.forEach(entry => {
      entry.shifts.forEach(shift => {
        if (shift.staffIds.includes(member.id)) {
          const locationPoint = locationPoints.find(lp => lp.locationId === shift.locationId)
          const location = locations.find(l => l.id === shift.locationId)
          if (locationPoint && location) {
            const priorityMultiplier = 1 + (location.priority / 10)
            monthlyPoints += shift.points * priorityMultiplier
          }
        }
      })
    })

    return {
      ...member,
      points: {
        monthly: monthlyPoints,
        total: totalPoints + monthlyPoints
      }
    }
  })

  return updatedStaff
}

const assignStaffToLocation = (
  location: Location,
  date: Date,
  availableStaff: Staff[],
  locationPoints: LocationPoints[],
  isHoliday: boolean
): Shift[] => {
  const shifts: Shift[] = []
  const sessionType = isHoliday ? "Weekend" : "Weekday"
  const applicableSessions = location.sessions.filter(s => 
    s.type === sessionType || s.type === "Weekday & Weekend"
  )

  applicableSessions.forEach(sessionBlock => {
    sessionBlock.sessions.forEach(session => {
      session.timings.forEach(timing => {
        location.requiredRoles.forEach(requirement => {
          const eligibleStaff = availableStaff.filter(s => 
            s.roles.some(r => r.roleId === requirement.roleId) &&
            s.availability.some(a => 
              a.startDate <= date && 
              a.endDate >= date &&
              a.availableShifts.includes(timing.type.toLowerCase() as "morning" | "evening" | "night")
            )
          ).sort((a, b) => (a.points?.monthly || 0) - (b.points?.monthly || 0))

          const locationPoint = locationPoints.find(lp => lp.locationId === location.id)
          const basePoints = locationPoint?.points.clinical || 0
          const priorityMultiplier = 1 + (location.priority / 10)
          const shiftPoints = basePoints * priorityMultiplier

          shifts.push({
            date: new Date(date),
            type: timing.type.toLowerCase() as "morning" | "evening" | "night",
            staffIds: eligibleStaff.slice(0, requirement.count).map(s => s.id),
            roleId: requirement.roleId,
            locationId: location.id,
            department: location.department,
            points: shiftPoints
          })
        })
      })
    })
  })

  return shifts
}

export const generateRoster = (
  startDate: Date,
  endDate: Date,
  staff: Staff[],
  roles: Role[],
  groups: StaffGroup[],
  locations: Location[],
  locationPoints: LocationPoints[],
  holidays: Holiday[]
): { roster: RosterEntry[]; updatedStaff: Staff[] } => {
  const roster: RosterEntry[] = []
  let currentDate = new Date(startDate)

  const prioritizedLocations = [...locations].sort((a, b) => b.priority - a.priority)

  while (currentDate <= endDate) {
    const isOffDay = isWeekendOrHoliday(currentDate, holidays)
    const shifts: Shift[] = []

    let availableStaff = [...staff]

    prioritizedLocations.forEach(location => {
      const locationShifts = assignStaffToLocation(
        location,
        currentDate,
        availableStaff,
        locationPoints,
        isOffDay
      )

      shifts.push(...locationShifts)

      availableStaff = availableStaff.filter(s => 
        !locationShifts.some(shift => shift.staffIds.includes(s.id))
      )
    })

    roster.push({
      date: new Date(currentDate),
      shifts
    })

    currentDate.setDate(currentDate.getDate() + 1)
  }

  const updatedStaff = calculateStaffPoints(staff, roster, locationPoints, locations)

  return { roster, updatedStaff }
}