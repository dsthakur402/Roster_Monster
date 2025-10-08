import { RosterShift, RosterStaff, RosterGenerationConfig } from '@/types/roster'
import { format, addDays } from 'date-fns'

// Dummy data
const dummyStaff: RosterStaff[] = [
  {
    id: 1,
    user_id: 101,
    user_name: "Dr. Smith",
    role_id: 1,
    role_name: "Senior Doctor",
    group_id: 1,
    group_name: "Medical",
    fte_clinical: 0.8,
    fte_research: 0.1,
    fte_admin: 0.1,
    preferences: {
      preferred_locations: [1, 2],
      preferred_shifts: ["morning", "afternoon"],
      max_consecutive_days: 5
    }
  },
  {
    id: 2,
    user_id: 102,
    user_name: "Dr. Johnson",
    role_id: 1,
    role_name: "Senior Doctor",
    group_id: 1,
    group_name: "Medical",
    fte_clinical: 0.7,
    fte_research: 0.2,
    fte_admin: 0.1,
    preferences: {
      preferred_locations: [2, 3],
      preferred_shifts: ["afternoon", "night"],
      max_consecutive_days: 4
    }
  },
  {
    id: 3,
    user_id: 103,
    user_name: "Dr. Williams",
    role_id: 2,
    role_name: "Junior Doctor",
    group_id: 1,
    group_name: "Medical",
    fte_clinical: 0.9,
    fte_research: 0.1,
    fte_admin: 0,
    preferences: {
      preferred_locations: [1, 3],
      preferred_shifts: ["morning", "night"],
      max_consecutive_days: 6
    }
  }
]

const dummyLocations = [
  {
    id: 1,
    name: "Emergency Department",
    type: "clinical",
    priority: 1
  },
  {
    id: 2,
    name: "General Ward",
    type: "clinical",
    priority: 2
  },
  {
    id: 3,
    name: "Research Lab",
    type: "research",
    priority: 3
  }
]

function generateDummyShifts(startDate: string, endDate: string): RosterShift[] {
  const shifts: RosterShift[] = []
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  for (let date = start; date <= end; date = addDays(date, 1)) {
    // Generate shifts for each location
    dummyLocations.forEach(location => {
      const shiftTypes = ['morning', 'afternoon', 'night']
      shiftTypes.forEach((shiftType, index) => {
        const staffId = dummyStaff[index % dummyStaff.length].id
        shifts.push({
          id: shifts.length + 1,
          date: format(date, 'yyyy-MM-dd'),
          location_id: location.id,
          location: location,
          staff_id: staffId,
          shift_type: shiftType as 'morning' | 'afternoon' | 'night',
          status: 'scheduled'
        })
      })
    })
  }
  
  return shifts
}

export async function getRosterAssignments(
  startDate: string,
  endDate: string,
  locationId?: number,
  staffId?: number
): Promise<RosterShift[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  let shifts = generateDummyShifts(startDate, endDate)
  
  if (locationId) {
    shifts = shifts.filter(shift => shift.location_id === locationId)
  }
  
  if (staffId) {
    shifts = shifts.filter(shift => shift.staff_id === staffId)
  }
  
  return shifts
}

export async function generateRoster(config: RosterGenerationConfig): Promise<RosterShift[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return generateDummyShifts(config.start_date, config.end_date)
}

export async function updateRosterAssignment(
  assignmentId: number,
  data: {
    staff_id?: number
    is_double_stationed?: boolean
    double_station_pair_id?: number
    fte_contribution?: number
  }
): Promise<RosterShift> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))
  
  // In a real implementation, this would update the backend
  // For dummy data, we'll just return the updated shift
  const shifts = generateDummyShifts(
    format(new Date(), 'yyyy-MM-dd'),
    format(addDays(new Date(), 1), 'yyyy-MM-dd')
  )
  
  const shift = shifts.find(s => s.id === assignmentId)
  if (!shift) {
    throw new Error('Shift not found')
  }
  
  if (data.staff_id) {
    shift.staff_id = data.staff_id
  }
  
  return shift
}

export async function getStaffFteContribution(
  staffId: number,
  startDate: string,
  endDate: string,
  locationType?: string
): Promise<number> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))
  
  const staff = dummyStaff.find(s => s.id === staffId)
  if (!staff) {
    return 0
  }
  
  // Return a random FTE contribution between 0.5 and 1.0
  return 0.5 + Math.random() * 0.5
} 