
import { addDays, differenceInDays } from "date-fns"

export type LeaveType = "Annual" | "Medical" | "Emergency" | "Maternity" | "Paternity"

export interface LeaveBalance {
  staffId: string
  type: LeaveType
  total: number
  used: number
  pending: number
}

export interface LeaveRequest {
  id: string
  staffId: string
  type: LeaveType
  startDate: Date
  endDate: Date
  status: "Pending" | "Approved" | "Rejected"
  reason: string
  approvedBy?: string
  createdAt: Date
}

export const calculateLeaveDuration = (startDate: Date, endDate: Date, holidays: Date[]): number => {
  let duration = 0
  let currentDate = startDate

  while (currentDate <= endDate) {
    const isHoliday = holidays.some(
      holiday => 
        holiday.getDate() === currentDate.getDate() &&
        holiday.getMonth() === currentDate.getMonth() &&
        holiday.getFullYear() === currentDate.getFullYear()
    )
    
    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6

    if (!isHoliday && !isWeekend) {
      duration++
    }
    
    currentDate = addDays(currentDate, 1)
  }

  return duration
}

export const getDefaultLeaveBalance = (staffId: string): LeaveBalance[] => [
  {
    staffId,
    type: "Annual",
    total: 14,
    used: 0,
    pending: 0
  },
  {
    staffId,
    type: "Medical",
    total: 14,
    used: 0,
    pending: 0
  },
  {
    staffId,
    type: "Emergency",
    total: 7,
    used: 0,
    pending: 0
  },
  {
    staffId,
    type: "Maternity",
    total: 112,
    used: 0,
    pending: 0
  },
  {
    staffId,
    type: "Paternity",
    total: 14,
    used: 0,
    pending: 0
  }
]
