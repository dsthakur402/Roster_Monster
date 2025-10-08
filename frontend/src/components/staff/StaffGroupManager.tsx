import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, X, Trash2 } from "lucide-react"
import { defaultRoles, defaultLocations, StaffGroup, Location } from "@/lib/roles"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { staffService, StaffMember } from "@/services/staff"
import { useToast } from "@/components/ui/use-toast"

interface StaffGroupManagerProps {
  onSave: (group: StaffGroup) => void
  initialGroups?: StaffGroup[]
}

export function StaffGroupManager({ onSave, initialGroups = [] }: StaffGroupManagerProps) {
  const [groups, setGroups] = useState<StaffGroup[]>(initialGroups)
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchStaffMembers = async () => {
      try {
        setIsLoading(true)
        const members = await staffService.getStaffMembers()
        setStaffMembers(members)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch staff members",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStaffMembers()
  }, [toast])

  const handleAddGroup = () => {
    setGroups([...groups, {
      id: `group-${groups.length + 1}`,
      name: "",
      roles: [],
      members: [],
      locations: [],
      shiftPreferences: {
        preferredShiftLength: 12,
        maxConsecutiveDays: 4,
        minRestBetweenShifts: 11
      }
    }])
  }

  const handleGroupChange = (index: number, field: keyof StaffGroup, value: any) => {
    const updatedGroups = [...groups]
    updatedGroups[index] = { ...updatedGroups[index], [field]: value }
    setGroups(updatedGroups)
  }

  const handleAddRole = (groupIndex: number, roleId: string) => {
    if (!roleId || roleId === 'null') return;
    const updatedGroups = [...groups]
    const role = roleId === "not-specified" 
      ? { id: "not-specified", name: "Not Specified", department: "Any", maxHoursPerWeek: 0, requiresCertification: false, pointsPerShift: { morning: 0, evening: 0, night: 0, weekend: 0, holiday: 0 } }
      : defaultRoles.find(r => r.id === roleId)
    if (role && !updatedGroups[groupIndex].roles.find(r => r.id === roleId)) {
      updatedGroups[groupIndex].roles.push(role)
      setGroups(updatedGroups)
    }
  }

  const handleRemoveRole = (groupIndex: number, roleId: string) => {
    const updatedGroups = [...groups]
    updatedGroups[groupIndex].roles = updatedGroups[groupIndex].roles.filter(r => r.id !== roleId)
    setGroups(updatedGroups)
  }

  const handleAddLocation = (groupIndex: number, locationId: string) => {
    if (!locationId || locationId === 'null') return;
    const updatedGroups = [...groups]
    const notSpecificLocation: Location = {
      id: "not-specific",
      name: "Not Specific",
      department: "Any",
      type: "clinical",
      requiredUsers: [],
      requiredRoles: [],
      requiredGroups: [],
      minStaffCount: 0,
      priority: 0,
      sessions: [{
        type: "Weekday",
        sessions: [{
          title: "Default Session",
          timings: [{
            title: "Default Timing",
            type: "AM",
            startTime: "09:00",
            endTime: "17:00",
            fteValue: 0.1
          }]
        }]
      }],
      dateOverrides: []
    }

    const location = locationId === "not-specific"
      ? notSpecificLocation
      : defaultLocations.find(l => l.id === locationId)

    if (location && !updatedGroups[groupIndex].locations.find(l => l.id === locationId)) {
      updatedGroups[groupIndex].locations.push(location)
      setGroups(updatedGroups)
    }
  }

  const handleRemoveLocation = (groupIndex: number, locationId: string) => {
    const updatedGroups = [...groups]
    updatedGroups[groupIndex].locations = updatedGroups[groupIndex].locations.filter(l => l.id !== locationId)
    setGroups(updatedGroups)
  }

  const handleDeleteGroup = (groupIndex: number) => {
    const updatedGroups = groups.filter((_, i) => i !== groupIndex)
    setGroups(updatedGroups)
  }

  const handleStaffMemberSelection = (groupIndex: number, staffId: string, checked: boolean) => {
    const updatedGroups = [...groups]
    if (checked) {
      if (!updatedGroups[groupIndex].members.includes(staffId)) {
        updatedGroups[groupIndex].members.push(staffId)
      }
    } else {
      updatedGroups[groupIndex].members = updatedGroups[groupIndex].members.filter(id => id !== staffId)
    }
    setGroups(updatedGroups)
  }

  const handleSave = () => {
    if (groups.length > 0) {
      onSave(groups[0])
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Groups</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {groups.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-4 p-4 border rounded-lg">
            <div className="flex justify-between items-center">
              <Input
                placeholder="Group Name"
                value={group.name}
                onChange={(e) => handleGroupChange(groupIndex, "name", e.target.value)}
                className="font-medium w-full mr-4"
              />
              <Button
                variant="destructive"
                size="icon"
                onClick={() => handleDeleteGroup(groupIndex)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Staff Members</h4>
              <ScrollArea className="h-[200px] border rounded-md p-4">
                <div className="space-y-2">
                  {staffMembers.map((staff) => (
                    <div key={staff.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${group.id}-${staff.id}`}
                        checked={group.members.includes(staff.id.toString())}
                        onCheckedChange={(checked) => 
                          handleStaffMemberSelection(groupIndex, staff.id.toString(), checked as boolean)
                        }
                        disabled={isLoading}
                      />
                      <label
                        htmlFor={`${group.id}-${staff.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {staff.name} - {typeof staff.department === 'object' ? staff.department.name : staff.department}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Roles</h4>
              <div className="flex flex-wrap gap-2">
                {group.roles.map((role) => (
                  <div key={role.id} className="flex items-center gap-1 bg-secondary p-1 rounded">
                    <span className="text-sm">{role.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleRemoveRole(groupIndex, role.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Select onValueChange={(value) => { if (value && value !== 'null') handleAddRole(groupIndex, value) }}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Add role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not-specified">Not Specified</SelectItem>
                    {defaultRoles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Locations</h4>
              <div className="flex flex-wrap gap-2">
                {group.locations.map((location) => (
                  <div key={location.id} className="flex items-center gap-1 bg-secondary p-1 rounded">
                    <span className="text-sm">{location.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleRemoveLocation(groupIndex, location.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Select onValueChange={(value) => { if (value && value !== 'null') handleAddLocation(groupIndex, value) }}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Add location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not-specific">Not Specific</SelectItem>
                    {defaultLocations.map((location) => (
                      <SelectItem key={location.id} value={location.id.toString()}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-between">
          <span />
          <Button onClick={handleSave}>Save Group</Button>
        </div>
      </CardContent>
    </Card>
  )
}
