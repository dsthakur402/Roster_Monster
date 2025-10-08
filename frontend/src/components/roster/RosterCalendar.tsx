import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getNextSixMonths, isWeekendOrHoliday, getSingaporeHolidays } from "@/lib/holidays"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAuth } from '@/contexts/AuthContext'
import { createNotification } from '@/services/notifications'
import { getRosterAssignments, generateRoster, updateRosterAssignment } from '@/services/roster'
import { RosterShift, RosterStaff } from '@/types/roster'
import { format, addDays } from 'date-fns'
import { Settings, Plus } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { defaultGroups, defaultRoles } from "@/lib/roles"

// Dummy staff data
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
    },
    constraints: {
      leave_dates: ["2025-04-28"]
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
    },
    constraints: {
      leave_dates: []
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
    },
    constraints: {
      leave_dates: []
    }
  }
]

const dummyLocations = [
  {
    id: 1,
    name: "Emergency Department",
    type: "clinical",
    priority: 1,
    min_staff_required: 2
  },
  {
    id: 2,
    name: "General Ward",
    type: "clinical",
    priority: 2,
    min_staff_required: 1
  },
  {
    id: 3,
    name: "Research Lab",
    type: "research",
    priority: 3,
    min_staff_required: 1
  }
]

const HOURS = Array.from({ length: 24 }, (_, i) => i) // 0-23

interface Roster {
  id: string
  name: string
  permissions: {
    userId: string
    canEdit: boolean
  }[]
}

interface RosterPermissionDialogProps {
  roster: Roster
  onSave: (roster: Roster) => void
}

function RosterPermissionDialog({ roster, onSave }: RosterPermissionDialogProps) {
  const [permissions, setPermissions] = useState(roster.permissions)

  const handleTogglePermission = (userId: string) => {
    setPermissions(perms => 
      perms.map(p => 
        p.userId === userId ? { ...p, canEdit: !p.canEdit } : p
      )
    )
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit Roster Permissions - {roster.name}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        {permissions.map((permission) => (
          <div key={permission.userId} className="flex items-center justify-between">
            <Label>User {permission.userId}</Label>
            <Switch
              checked={permission.canEdit}
              onCheckedChange={() => handleTogglePermission(permission.userId)}
            />
          </div>
        ))}
        <Button onClick={() => onSave({ ...roster, permissions })}>
          Save Permissions
        </Button>
      </div>
    </DialogContent>
  )
}

export function RosterCalendar() {
  const { user, canEditRoster } = useAuth()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const holidays = getSingaporeHolidays(new Date().getFullYear())
  const [roster, setRoster] = useState<RosterShift[]>([])
  const [rosterDuration, setRosterDuration] = useState<"2w" | "1m" | "2m" | "3m" | "6m">("2w")
  const [editingShift, setEditingShift] = useState<{
    id: number
    staffId: number
  } | null>(null)
  const [rosters, setRosters] = useState<Roster[]>([])
  const [selectedRoster, setSelectedRoster] = useState<string>("")
  const [showNewRosterDialog, setShowNewRosterDialog] = useState(false)
  const [newRosterName, setNewRosterName] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState<string>("")
  const [selectedRole, setSelectedRole] = useState<string>("")

  const getDurationInDays = (duration: string): number => {
    switch (duration) {
      case "2w": return 14
      case "1m": return 30
      case "2m": return 60
      case "3m": return 90
      case "6m": return 180
      default: return 14
    }
  }

  useEffect(() => {
    const fetchRoster = async () => {
      if (selectedDate) {
        const startDate = format(selectedDate, 'yyyy-MM-dd')
        const endDate = format(addDays(selectedDate, 1), 'yyyy-MM-dd')
        const assignments = await getRosterAssignments(startDate, endDate)
        setRoster(assignments)
      }
    }
    fetchRoster()
  }, [selectedDate])

  const handleGenerateRoster = async () => {
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + getDurationInDays(rosterDuration))
    
    const config = {
      start_date: format(startDate, 'yyyy-MM-dd'),
      end_date: format(endDate, 'yyyy-MM-dd'),
      shift_patterns: {
        morning: { start: '08:00', end: '16:00' },
        afternoon: { start: '16:00', end: '00:00' },
        night: { start: '00:00', end: '08:00' }
      },
      rules: {
        max_consecutive_days: 5,
        min_rest_between_shifts: 8,
        max_shifts_per_week: 5,
        preferred_staff_level: 1,
        allow_overtime: false
      },
      weights: {
        staff_preference: 0.3,
        location_priority: 0.2,
        skill_match: 0.2,
        fairness: 0.2,
        continuity: 0.1
      }
    }

    const generatedRoster = await generateRoster(config)
    setRoster(generatedRoster)
  }

  const getShiftsForDate = (date: Date): RosterShift[] => {
    return roster.filter(shift => 
      new Date(shift.date).getDate() === date.getDate() &&
      new Date(shift.date).getMonth() === date.getMonth() &&
      new Date(shift.date).getFullYear() === date.getFullYear()
    )
  }

  const groupShiftsByLocation = (shifts: RosterShift[]) => {
    return shifts.reduce((acc, shift) => {
      if (!acc[shift.location_id]) {
        acc[shift.location_id] = []
      }
      acc[shift.location_id].push(shift)
      return acc
    }, {} as Record<number, RosterShift[]>)
  }

  const handleStaffReassignment = async (
    shiftId: number,
    currentStaffId: number,
    newStaffId: number
  ) => {
    if (!canEditRoster) return

    try {
      await updateRosterAssignment(shiftId, {
        staff_id: newStaffId
      })

      // Create notifications for affected staff
      if (user) {
        const shift = roster.find(s => s.id === shiftId)
        if (shift) {
          // Notify removed staff
          await createNotification(currentStaffId.toString(), 'SHIFT_REMOVED', {
            date: new Date(shift.date),
            locationId: shift.location_id.toString(),
            shiftType: shift.shift_type
          })

          // Notify assigned staff
          await createNotification(newStaffId.toString(), 'SHIFT_ASSIGNED', {
            date: new Date(shift.date),
            locationId: shift.location_id.toString(),
            shiftType: shift.shift_type
          })
        }
      }

      // Refresh roster data
      const startDate = format(selectedDate!, 'yyyy-MM-dd')
      const endDate = format(addDays(selectedDate!, 1), 'yyyy-MM-dd')
      const assignments = await getRosterAssignments(startDate, endDate)
      setRoster(assignments)
      setEditingShift(null)
    } catch (error) {
      console.error('Failed to update roster assignment:', error)
    }
  }

  const selectedDateShifts = selectedDate ? getShiftsForDate(selectedDate) : []
  const groupedShifts = groupShiftsByLocation(selectedDateShifts)

  // Dummy: get people on leave for the selected day
  const leavePeople = dummyStaff.filter(s => s.constraints?.leave_dates?.includes(format(selectedDate || new Date(), 'yyyy-MM-dd')))

  // Matrix: location x hour
  function getStaffForLocationHour(locationId: number, hour: number) {
    // For demo, assign staff to shifts based on shift_type and hour
    // Morning: 8-16, Afternoon: 16-24, Night: 0-8
    let shiftType: 'morning' | 'afternoon' | 'night' = 'morning'
    if (hour >= 0 && hour < 8) shiftType = 'night'
    else if (hour >= 8 && hour < 16) shiftType = 'morning'
    else if (hour >= 16 && hour < 24) shiftType = 'afternoon'
    return roster.filter(
      s => s.location_id === locationId && s.shift_type === shiftType
    )
  }

  function getStaffingStatus(locationId: number, hour: number) {
    const location = dummyLocations.find(l => l.id === locationId)
    const staffCount = getStaffForLocationHour(locationId, hour).length
    if (!location) return 'unstaffed'
    if (staffCount === 0) return 'unstaffed'
    if (staffCount < location.min_staff_required) return 'understaffed'
    return 'sufficient'
  }

  function getStatusColor(status: string) {
    if (status === 'unstaffed') return 'bg-red-200 border-red-400'
    if (status === 'understaffed') return 'bg-yellow-100 border-yellow-400'
    if (status === 'sufficient') return 'bg-green-100 border-green-400'
    return ''
  }

  const handleCreateRoster = () => {
    const newRoster: Roster = {
      id: `roster-${rosters.length + 1}`,
      name: newRosterName,
      permissions: [
        { userId: (user?.id?.toString() || '1'), canEdit: true }
      ]
    }
    setRosters([...rosters, newRoster])
    setNewRosterName("")
    setShowNewRosterDialog(false)
  }

  const handleUpdatePermissions = (updatedRoster: Roster) => {
    setRosters(rosters.map(r => 
      r.id === updatedRoster.id ? updatedRoster : r
    ))
  }

  return (
    <div>
      {/* Top bar: All controls */}
      <div className="flex items-center gap-4 mb-4 p-4 bg-muted rounded-md">
        {user && (
          <Button
            variant="outline"
            onClick={() => setShowNewRosterDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Roster
          </Button>
        )}

        <Select value={selectedRoster} onValueChange={setSelectedRoster}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select roster" />
          </SelectTrigger>
          <SelectContent>
            {rosters.map((roster) => (
              <SelectItem key={roster.id} value={roster.id}>
                <div className="flex items-center justify-between w-full">
                  <span>{roster.name}</span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <RosterPermissionDialog
                      roster={roster}
                      onSave={handleUpdatePermissions}
                    />
                  </Dialog>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            {defaultGroups.map((group) => (
              <SelectItem key={group.id} value={group.id.toString()}>
                {group.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {defaultRoles.map((role) => (
              <SelectItem key={role.id} value={role.id.toString()}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={rosterDuration} onValueChange={(value: "2w" | "1m" | "2m" | "3m" | "6m") => setRosterDuration(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2w">2 Weeks</SelectItem>
            <SelectItem value="1m">1 Month</SelectItem>
            <SelectItem value="2m">2 Months</SelectItem>
            <SelectItem value="3m">3 Months</SelectItem>
            <SelectItem value="6m">6 Months</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={handleGenerateRoster}>Generate General Roster</Button>

        <Dialog open={showNewRosterDialog} onOpenChange={setShowNewRosterDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Roster</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Roster Name</Label>
                <Input
                  value={newRosterName}
                  onChange={(e) => setNewRosterName(e.target.value)}
                  placeholder="Enter roster name"
                />
              </div>
              <Button onClick={handleCreateRoster} disabled={!newRosterName}>
                Create Roster
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main grid layout */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left: Calendar */}
        <div className="col-span-12 sm:col-span-4 md:col-span-5 lg:col-span-3 flex justify-center">
          <Card className="w-full max-w-xs">
            <CardContent className="p-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                modifiers={{
                  weekend: (date: Date) => isWeekendOrHoliday(date, holidays),
                  hasShifts: (date: Date) => roster.some(r => r.date === format(date, 'yyyy-MM-dd'))
                }}
                modifiersClassNames={{
                  selected: "calendar-selected-day"
                }}
                modifiersStyles={{
                  weekend: {
                    color: "var(--destructive)",
                    fontWeight: "500"
                  },
                  hasShifts: {
                    backgroundColor: "var(--primary)",
                    fontWeight: "500"
                  },
                  selected: {
                    backgroundColor: "var(--primary)",
                    color: "#1a202c", // dark text for visibility
                    fontWeight: "700"
                  }
                }}
                className="rounded-md border w-full"
              />
            </CardContent>
          </Card>
        </div>

        {/* Center: Matrix */}
        <div className="col-span-7 overflow-x-auto">
          <Card>
            <CardHeader>
              <CardTitle>Location x Hours Matrix ({selectedDate?.toLocaleDateString()})</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="min-w-full border text-xs">
                <thead>
                  <tr>
                    <th className="border px-2 py-1 bg-muted">Location</th>
                    {HOURS.map(hour => (
                      <th key={hour} className="border px-2 py-1 text-center">{hour.toString().padStart(2, '0')}:00</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dummyLocations.map(location => (
                    <tr key={location.id}>
                      <td className="border px-2 py-1 font-semibold bg-muted whitespace-nowrap">{location.name}</td>
                      {HOURS.map(hour => {
                        const staff = getStaffForLocationHour(location.id, hour)
                        const status = getStaffingStatus(location.id, hour)
                        return (
                          <td
                            key={hour}
                            className={`border px-1 py-1 min-w-[60px] ${getStatusColor(status)}`}
                          >
                            {staff.length === 0 ? (
                              <span className="text-xs text-muted-foreground">-</span>
                            ) : (
                              <div className="flex flex-col gap-0.5">
                                {staff.map(s => (
                                  <span key={s.staff_id} className="block text-xs font-medium">
                                    {dummyStaff.find(st => st.id === s.staff_id)?.user_name || `Staff ${s.staff_id}`}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Right: Important Updates */}
        <div className="col-span-2 sm:col-span-2 md:col-span-2 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Important Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="font-semibold mb-1">People on Leave</div>
                {leavePeople.length === 0 ? (
                  <div className="text-xs text-muted-foreground">No one on leave today.</div>
                ) : (
                  <ul className="list-disc ml-4">
                    {leavePeople.map(staff => (
                      <li key={staff.id} className="text-xs">
                        {staff.user_name} ({staff.role_name})
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {/* Add more important updates here as needed */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
