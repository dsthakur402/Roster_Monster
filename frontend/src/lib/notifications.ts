
import { Staff } from "@/lib/roster"

export type NotificationType = "ROSTER_CHANGE" | "LEAVE_REQUEST" | "LEAVE_APPROVED" | "LEAVE_REJECTED" | "SHIFT_ASSIGNED" | "SHIFT_REMOVED"

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  userId: string
  read: boolean
  createdAt: Date
  data?: {
    date?: Date
    locationId?: string
    shiftType?: string
    requestId?: string
  }
}

export interface NotificationPreferences {
  userId: string
  email: boolean
  inApp: boolean
  types: {
    [key in NotificationType]: boolean
  }
}

export const getNotificationMessage = (
  type: NotificationType,
  data: {
    staffName?: string
    date?: Date
    locationName?: string
    shiftType?: string
  }
): string => {
  const dateStr = data.date?.toLocaleDateString()
  
  switch (type) {
    case "ROSTER_CHANGE":
      return `Your roster for ${dateStr} has been updated`
    case "LEAVE_REQUEST":
      return `New leave request from ${data.staffName} for ${dateStr}`
    case "LEAVE_APPROVED":
      return `Your leave request for ${dateStr} has been approved`
    case "LEAVE_REJECTED":
      return `Your leave request for ${dateStr} has been rejected`
    case "SHIFT_ASSIGNED":
      return `You have been assigned to ${data.locationName} (${data.shiftType}) on ${dateStr}`
    case "SHIFT_REMOVED":
      return `You have been removed from ${data.locationName} (${data.shiftType}) on ${dateStr}`
    default:
      return "New notification"
  }
}

export const getNotificationTitle = (type: NotificationType): string => {
  switch (type) {
    case "ROSTER_CHANGE":
      return "Roster Updated"
    case "LEAVE_REQUEST":
      return "New Leave Request"
    case "LEAVE_APPROVED":
      return "Leave Approved"
    case "LEAVE_REJECTED":
      return "Leave Rejected"
    case "SHIFT_ASSIGNED":
      return "New Shift Assignment"
    case "SHIFT_REMOVED":
      return "Shift Removed"
    default:
      return "Notification"
  }
}
